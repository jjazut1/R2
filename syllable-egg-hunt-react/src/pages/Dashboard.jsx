// src/pages/Dashboard.jsx
import { Box, Heading, Text, Button, VStack, Grid, SimpleGrid } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import Egg from '../components/egg.jsx';
import Basket from '../components/Basket';
import { useDisclosure } from '@chakra-ui/react';
import GameConfigModal from '../components/GameConfigModal';
import AuthStatus from '../components/Auth/AuthStatus.jsx';
import { auth } from '../services/firebase';

const Dashboard = () => {
    // Game state
    const [score, setScore] = useState(0);
    const [totalEggs, setTotalEggs] = useState(0);
    const [crackedEggs, setCrackedEggs] = useState(0);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [gameConfig, setGameConfig] = useState(null);
    const [eggs, setEggs] = useState([]);
    const [baskets, setBaskets] = useState([]);
    const [basketItems, setBasketItems] = useState({});
    const [gameComplete, setGameComplete] = useState(false);
    const [configToStart, setConfigToStart] = useState(null);

    // Add new state for ghost tracker
    const [ghostWord, setGhostWord] = useState(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Audio setup
    useEffect(() => {
        const crackSound = new Audio('https://github.com/jjazut1/sound-hosting/raw/refs/heads/main/break.mp3');
        const correctSound = new Audio('https://github.com/jjazut1/sound-hosting/raw/refs/heads/main/short-success-sound-glockenspiel-treasure-video-game-6346 (1).mp3');
        const incorrectSound = new Audio('https://github.com/jjazut1/sound-hosting/raw/refs/heads/main/failure-drum-sound-effect-2-7184.mp3');
        
        // Preload the sounds
        crackSound.load();
        correctSound.load();
        incorrectSound.load();
        
        // Make sounds available globally
        window.gameSounds = {
            crack: crackSound,
            correct: correctSound,
            incorrect: incorrectSound
        };
    }, []);

    // Track mouse movement when word is selected
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (ghostWord) {
                setMousePosition({ x: e.clientX, y: e.clientY });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [ghostWord]);

    // Sample categories - later this will come from Firebase
    const sampleCategories = [
        {
            name: "One Syllable",
            items: ["cat", "dog", "bird", "fish"]
        },
        {
            name: "Two Syllables",
            items: ["rabbit", "turtle", "tiger", "lion"]
        },
        {
            name: "Three Syllables",
            items: ["butterfly", "elephant", "kangaroo"]
        }
    ];

    const { isOpen, onOpen, onClose } = useDisclosure();

    const startGame = () => {
        // Add debug logging
        console.log('Starting game with baskets:', baskets);
        
        // Guard clause
        if (!baskets || baskets.length === 0) {
            console.error('No baskets available - waiting for baskets to be set');
            return;
        }
        
        // Reset game state
        setBasketItems({});
        setGameComplete(false);
        
        // Make sure we have valid baskets data
        if (!baskets || baskets.length === 0) {
            console.error('No baskets available');
            return;
        }

        // Create array of all available items with their categories
        const allItems = baskets.flatMap(category => {
            console.log('Processing category:', category.name, 'items:', category.items); // Debug log
            return category.items.map(item => ({
                item,
                category: category.name
            }));
        });
        
        console.log('All available items:', allItems); // Debug log
        
        if (allItems.length === 0) {
            console.error('No items available');
            return;
        }

        // Shuffle and select items
        const shuffledItems = allItems.sort(() => Math.random() - 0.5);
        const selectedItems = shuffledItems.slice(0, totalEggs);
        
        console.log('Selected items for eggs:', selectedItems); // Debug log

        const initialEggs = selectedItems.map((itemData, index) => ({
            id: index,
            cracked: false,
            ...itemData
        }));

        console.log('Initial eggs:', initialEggs); // Debug log

        setEggs(initialEggs);
        setCrackedEggs(0);
        setScore(0);
    };

    const handleEggCrack = (eggId, item, category) => {
        setCrackedEggs(prev => prev + 1);
        setSelectedItem(item);
        setSelectedCategory(category);
        
        setEggs(prevEggs => prevEggs.map(egg => 
            egg.id === eggId 
                ? { ...egg, cracked: true, item, category }
                : egg
        ));
    };

    const handleItemDrop = (item, categoryName) => {
        setBasketItems(prev => ({
            ...prev,
            [categoryName]: [...(prev[categoryName] || []), item]
        }));
        
        setSelectedItem(null);
        setSelectedCategory(null);
        setScore(prev => prev + 10);

        // Check if game is complete
        const totalPlacedItems = Object.values(basketItems).flat().length + 1;
        if (totalPlacedItems === totalEggs) {
            setGameComplete(true);
        }
    };

    useEffect(() => {
        if (configToStart && baskets.length > 0) {
            startGame();
            setConfigToStart(null);
        }
    }, [baskets, configToStart]);

    const handleConfigSelect = (config) => {
        // Format categories
        const formattedCategories = config.categories.map(category => ({
            name: category.name,
            items: Array.isArray(category.items) ? category.items : category.items.split(',').map(item => item.trim())
        }));
        
        // Set all the state
        setBaskets(formattedCategories);
        setTotalEggs(config.eggCount);
        setScore(0);
        setCrackedEggs(0);
        setSelectedItem(null);
        setSelectedCategory(null);
        setConfigToStart(config); // Set the config to start
        onClose();
    };

    const handleWordClick = (word, category, event) => {
        // Update initial position to click location
        setMousePosition({ x: event.clientX, y: event.clientY });
        setSelectedItem(word);
        setSelectedCategory(category);
        setGhostWord({ word, category });
    };

    const handleBasketClick = (basketCategory) => {
        if (ghostWord && ghostWord.category === basketCategory) {
            // Correct basket
            if (window.gameSounds?.correct) {
                window.gameSounds.correct.currentTime = 0;
                window.gameSounds.correct.play();
            }
            handleItemDrop(ghostWord.word, basketCategory);
            setGhostWord(null);
        } else if (ghostWord) {
            // Wrong basket
            if (window.gameSounds?.incorrect) {
                window.gameSounds.incorrect.currentTime = 0;
                window.gameSounds.incorrect.play();
            }
        }
    };

    return (
        <Box 
            p={8} 
            minH="100vh"
            bg="lightblue"
            position="relative"
        >
            {/* Ghost tracker */}
            {ghostWord && (
                <Box
                    position="fixed"
                    top={0}
                    left={0}
                    style={{
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        pointerEvents: 'none',
                    }}
                    zIndex={9999}
                >
                    <Text
                        fontSize="md"
                        color="gray.600"
                        bg="white"
                        px={2}
                        py={1}
                        borderRadius="md"
                        boxShadow="lg"
                        opacity={0.9}
                    >
                        {ghostWord.word}
                    </Text>
                </Box>
            )}

            <VStack spacing={6} align="stretch">
                <Box alignSelf="flex-end">
                    <AuthStatus />
                </Box>

                <Heading>Categorize Content - Egg Reveal</Heading>
                
                
                <Box>
                    <Text fontSize="xl">Score: {score}</Text>
                    <Text fontSize="md">Eggs Cracked: {crackedEggs}/{totalEggs}</Text>
                    <Button
                        colorScheme="blue"
                        onClick={startGame}
                        isDisabled={gameComplete}
                        mt={2}
                        width="200px"
                    >
                        {gameComplete ? "Game Complete!" : "Start Game"}
                    </Button>
                    <Button
                        colorScheme="teal"
                        onClick={onOpen}
                        ml={4}
                        mt={2}
                        width="200px"
                    >
                        Configure Game
                    </Button>
                </Box>

                <GameConfigModal
                    isOpen={isOpen}
                    onClose={onClose}
                    onConfigSelect={handleConfigSelect}
                />

                {/* Modified Eggs Grid */}
                <Grid
                    templateColumns="repeat(auto-fit, minmax(100px, 1fr))"
                    gap={6}
                    maxW="600px"
                    mx="auto"
                >
                    {eggs.map((egg) => (
                        <Egg
                            key={egg.id}
                            onClick={(item, category) => handleEggCrack(egg.id, item, category)}
                            onWordClick={(word, category, event) => handleWordClick(word, category, event)}
                            item={egg.item}
                            category={egg.category}
                            cracked={egg.cracked}
                        />
                    ))}
                </Grid>

                {/* Modified Baskets Grid */}
                <SimpleGrid columns={[1, null, 3]} spacing={6} mt={8}>
                    {baskets.map((category) => (
                        <Basket
                            key={category.name}
                            category={category}
                            items={basketItems[category.name] || []}
                            onClick={() => handleBasketClick(category.name)}
                            selectedItem={selectedItem}
                            selectedCategory={selectedCategory}
                        />
                    ))}
                </SimpleGrid>
            </VStack>
        </Box>
    );
};

export default Dashboard;