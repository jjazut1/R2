import { Box, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React from 'react';

const Basket = ({ category, items, onClick }) => {
    return (
        <VStack spacing={2} align="center">
            <Text 
                fontSize="xl" 
                fontWeight="bold"
                color="gray.700"
                textAlign="center"
                mb={2}
            >
                {category.name}
            </Text>
            
            <Box
                as={motion.div}
                whileHover={{ scale: 1.02 }}
                position="relative"
                width="220px"
                height="140px"
                cursor="pointer"
                onClick={onClick}
                sx={{
                    // Main basket shape
                    position: 'relative',
                    borderRadius: '40% 40% 35% 35% / 40% 40% 60% 60%',
                    background: '#E3B778',
                    overflow: 'visible',
                    transform: 'perspective(1000px) rotateX(10deg)',
                    boxShadow: 'inset 0 -10px 20px rgba(139, 69, 19, 0.2)',
                    transition: 'all 0.3s ease',
                    
                    // Horizontal weave pattern
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        right: '0',
                        bottom: '0',
                        background: `
                            repeating-linear-gradient(
                                0deg,
                                transparent 0px,
                                transparent 8px,
                                rgba(139, 69, 19, 0.1) 8px,
                                rgba(139, 69, 19, 0.1) 16px
                            ),
                            repeating-linear-gradient(
                                90deg,
                                transparent 0px,
                                transparent 8px,
                                rgba(139, 69, 19, 0.1) 8px,
                                rgba(139, 69, 19, 0.1) 16px
                            ),
                            linear-gradient(
                                45deg,
                                rgba(210, 180, 140, 0.4) 25%,
                                transparent 25%,
                                transparent 75%,
                                rgba(210, 180, 140, 0.4) 75%
                            )
                        `,
                        backgroundSize: '16px 16px, 16px 16px, 32px 32px',
                        borderRadius: 'inherit',
                        opacity: 0.8,
                    }
                }}
            >
                {/* Items display */}
                <VStack
                    position="absolute"
                    top="20px"
                    left="0"
                    right="0"
                    bottom="0"
                    p={4}
                    spacing={1}
                    overflowY="auto"
                    zIndex={3}
                >
                    {items.map((item, index) => (
                        <Text
                            key={index}
                            color="gray.800"
                            fontSize="sm"
                            fontWeight="medium"
                            textShadow="1px 1px 0px rgba(255,255,255,0.5)"
                        >
                            {item}
                        </Text>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

export default Basket;