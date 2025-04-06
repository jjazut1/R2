// src/pages/GamePlay.jsx
import { Box, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const GamePlay = () => {
    const { configId } = useParams();

    return (
        <Box p={8}>
            <Text fontSize="2xl">Game Play</Text>
            <Text>Configuration ID: {configId}</Text>
            {/* Game components will go here */}
        </Box>
    );
};

export default GamePlay;