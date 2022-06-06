import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavBarProps {

}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{fetching: logoutFetching}, logout] = useLogoutMutation();
    const [{data, fetching}] = useMeQuery({
        // Prevent NavBar from making a request to get user from NextJS server
        pause: isServer(),
    }
    );
    let body = null;

    // Data is loading
    if (fetching){

    // User not logged in
    } else if (!data?.me) {
        body = (
            // <></> = fragment syntax
            <>
            <NextLink href="/login">
            <Link  mr={2}>Login</Link>
            </NextLink>
            <NextLink href="/register">
            <Link  >Register</Link>
            </NextLink>
            </>
        )

    // User is logged in
    } else {
        body = (
            <Flex>
                <Box mr={2}>{data.me.username}</Box>
                <Button onClick={() => {
                    logout();
                }} 
                isLoading={logoutFetching}
                variant="link">Logout</Button>
            </Flex>
        )
    }


    return (
        <Flex bg='tan' p={4}>
            <Box ml={"auto"}>
                {body}
            </Box>
        </Flex>
    );

}