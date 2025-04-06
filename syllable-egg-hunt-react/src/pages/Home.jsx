// src/pages/Home.jsx
import { Box, Button, Heading, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Box p={8}>
            <VStack spacing={6}>
                <Heading>Welcome to Syllable Egg Hunt</Heading>
                <Button 
                    colorScheme="blue" 
                    onClick={() => navigate('/login')}
                >
                    Login to Start
                </Button>
            </VStack>
        </Box>
    );
};

export default Home;