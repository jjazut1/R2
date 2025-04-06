// src/components/Auth/Login.jsx
import { Box, Button, VStack, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    return (
        <Box p={8}>
            <VStack spacing={4}>
                <Text fontSize="xl">Welcome to Syllable Egg Hunt</Text>
                <Button
                    colorScheme="blue"
                    onClick={() => console.log('Login clicked')}
                >
                    Sign in with Google
                </Button>
            </VStack>
        </Box>
    );
};

export default Login;