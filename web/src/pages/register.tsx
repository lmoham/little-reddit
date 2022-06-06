import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useRegisterMutation } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'
import { toErrorMap } from '../utils/toErrorMap'

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [,register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
        <Formik initialValues={{username: "", password: ""}} 
        onSubmit={async (values, {setErrors}) => {
            const response = await register(values);
            if (response.data?.register.errors) {
              // GraphQL returns errors in the form of an array
              // We need am object, NOT an array
              setErrors(toErrorMap(response.data.register.errors))
            } else if (response.data?.register.user) {
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
                        colorScheme="teal">Register</Button>

                    </Form>
                )}
        </Formik>
        </Wrapper>
    );
}

export default withUrqlClient(createUrqlClient)(Register);