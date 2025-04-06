import { Box, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';

const CrackLines = ({ color = 'rgba(70, 40, 0, 0.7)' }) => {
    // Generate random crack patterns
    const generateCrackPath = () => {
        const startX = 40 + Math.random() * 20; // 40-60%
        const startY = 30 + Math.random() * 40; // 30-70%
        let d = `M ${startX} ${startY}`;
        
        // Create 2-4 segments for each crack
        const segments = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < segments; j++) {
            const length = 10 + Math.random() * 20;
            const angle = Math.random() * 360;
            const rad = angle * Math.PI / 180;
            
            const endX = startX + length * Math.cos(rad);
            const endY = startY + length * Math.sin(rad);
            d += ` L ${endX} ${endY}`;
        }
        return d;
    };

    const mainCracks = Array(3).fill(null).map((_, i) => (
        <path
            key={`main-crack-${i}`}
            d={generateCrackPath()}
            stroke={color}
            strokeWidth="1.5"
            fill="none"
        />
    ));

    const smallCracks = Array(6).fill(null).map((_, i) => {
        const startX = 20 + Math.random() * 60;
        const startY = 20 + Math.random() * 60;
        const length = 5 + Math.random() * 10;
        const angle = Math.random() * 360;
        const rad = angle * Math.PI / 180;
        
        const midX = startX + length/2 * Math.cos(rad + Math.PI/8);
        const midY = startY + length/2 * Math.sin(rad + Math.PI/8);
        const endX = startX + length * Math.cos(rad);
        const endY = startY + length * Math.sin(rad);
        
        return (
            <path
                key={`small-crack-${i}`}
                d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
                stroke={color}
                strokeWidth="0.8"
                fill="none"
            />
        );
    });

    return (
        <svg
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            {mainCracks}
            {smallCracks}
        </svg>
    );
};

const wobbleAnimation = {
    initial: { rotate: 0 },
    hover: { 
        rotate: [0, -2, 2, -2, 0],
        transition: {
            duration: 0.5,
            repeat: Infinity,
            repeatType: "reverse"
        }
    }
};

const crackAnimation = {
    initial: { scale: 1 },
    cracked: {
        scale: [1, 1.1, 0.95],
        transition: { duration: 0.3 }
    }
};

const Egg = ({ onClick, item, category, cracked, onWordClick }) => {
    const [showCracks, setShowCracks] = useState(false);

    // Generate random pastel color
    const pastelColor = React.useMemo(() => {
        // Generate random hue (0-360)
        const hue = Math.floor(Math.random() * 360);
        // Use high lightness and medium saturation for pastel effect
        const saturation = 65 + Math.random() * 15; // 65-80%
        const lightness = 80 + Math.random() * 10;  // 80-90%
        
        // Create variations for gradient
        const baseColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        const darkerColor = `hsl(${hue}, ${saturation}%, ${lightness - 10}%)`;
        const lighterColor = `hsl(${hue}, ${saturation - 10}%, ${lightness + 5}%)`;
        
        return {
            base: baseColor,
            darker: darkerColor,
            lighter: lighterColor
        };
    }, []);

    useEffect(() => {
        if (cracked) {
            if (window.gameSounds?.crack) {
                window.gameSounds.crack.currentTime = 0;
                window.gameSounds.crack.play();
            }
            setShowCracks(true);
            const timer = setTimeout(() => {
                setShowCracks(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [cracked]);

    const getCrackPattern = () => {
        const numCracks = 1 + Math.floor(Math.random() * 2);
        const cracks = [];
        
        for (let i = 0; i < numCracks; i++) {
            const startX = 30 + Math.random() * 40;
            const startY = 20 + Math.random() * 60;
            const endX = startX + (Math.random() * 30 - 15);
            const endY = startY + (20 + Math.random() * 30);
            
            const cp1x = startX + (Math.random() * 20 - 10);
            const cp1y = startY + (Math.random() * 20);
            
            cracks.push(`M ${startX} ${startY} Q ${cp1x} ${cp1y} ${endX} ${endY}`);
        }
        
        return cracks;
    };

    const crackPaths = React.useMemo(getCrackPattern, []);

    return (
        <Box
            as={motion.div}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            position="relative"
            width="100px"
            height="140px"
            cursor={!cracked ? "pointer" : "default"}
            onClick={() => !cracked && onClick(item, category)}
            sx={{
                background: `linear-gradient(135deg, 
                    ${pastelColor.lighter} 0%, 
                    ${pastelColor.base} 50%, 
                    ${pastelColor.darker} 100%
                )`,
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: `
                    inset -8px -8px 12px rgba(0,0,0,0.1),
                    inset 8px 8px 12px rgba(255,255,255,0.8),
                    4px 4px 8px rgba(0,0,0,0.1)
                `,
                transition: 'all 0.3s ease'
            }}
        >
            {/* Highlight effect */}
            <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                borderRadius="inherit"
                sx={{
                    background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)',
                    pointerEvents: 'none'
                }}
            />

            {/* Modified Word display */}
            {cracked && (
                <Box
                    as={motion.div}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    position="absolute"
                    top="50%"
                    left="55%"
                    transform="translate(-50%, -50%)"
                    textAlign="center"
                    zIndex="2"
                    onClick={(e) => {
                        e.stopPropagation();
                        onWordClick(item, category, e);
                    }}
                    cursor="pointer"
                    sx={{
                        '&:hover': {
                            transform: 'translate(-50%, -50%) scale(1.1)',
                        }
                    }}
                >
                    <Text
                        fontSize="md"
                        color="gray.700"
                        letterSpacing="0.5px"
                        fontWeight="medium"
                        bg="rgba(255,255,255,0.8)"
                        px={2}
                        py={1}
                        borderRadius="md"
                    >
                        {item}
                    </Text>
                </Box>
            )}

            {/* Cracks with AnimatePresence */}
            <AnimatePresence>
                {showCracks && (
                    <Box
                        as={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        pointerEvents="none"
                        zIndex="1"
                    >
                        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                            {crackPaths.map((path, index) => (
                                <React.Fragment key={index}>
                                    <path
                                        d={path}
                                        stroke="#999"
                                        strokeWidth="1.5"
                                        fill="none"
                                        style={{
                                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))'
                                        }}
                                    />
                                </React.Fragment>
                            ))}
                        </svg>
                    </Box>
                )}
            </AnimatePresence>

            {/* Subtle speckles */}
            <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                opacity="0.05"
                borderRadius="inherit"
                sx={{
                    background: `
                        radial-gradient(circle at 70% 20%, #666 1px, transparent 1px),
                        radial-gradient(circle at 30% 50%, #666 1px, transparent 1px),
                        radial-gradient(circle at 60% 80%, #666 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%',
                    pointerEvents: 'none'
                }}
            />
        </Box>
    );
};

export default Egg;