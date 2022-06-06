import React from 'react'
import { Form, Formik } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utils/createUrqlClient'

export const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Wrapper variant="small">
        <Formik initialValues={{username: "", password: ""}} 
        onSubmit={async (values, {setErrors}) => {
            const response = await login({options: values,
            });
            if (response.data?.login.errors) {
              // GraphQL returns errors in the form of an array
              // We need am object, NOT an array
              setErrors(toErrorMap(response.data.login.errors))
            } else if (response.data?.login.user) {
              // Login success
              router.push("/")
            }
        }}>
                {(  {isSubmitting} /*values, handleChange*/) => (
                    <Form>
                        
                        {/* <FormControl>
                            <FormLabel htmlFor='username'>Username</FormLabel>
                            <Input value={values.username}
                            onChange={handleChange} 
                            id='username' 
                            placeholder='username' 
                            />
                             <FormErrorMessage>{form.errors.name}</FormErrorMessage> 
                        </FormControl> */}

                        <InputField name="username" 
                        placeholder="username" 
                        label="Username"
                        />
                        <Box mt={4}>
                        <InputField name="password" 
                        placeholder="password" 
                        label="Password"
                        type="password"
                        />
                        </Box>
                        <Button mt={4} 
                        type="submit" 
                        isLoading={isSubmitting} 
                        colorScheme="teal">Login</Button>

                    </Form>
                )}
        </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Login);