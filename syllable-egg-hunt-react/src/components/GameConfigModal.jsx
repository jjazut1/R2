import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Input,
    FormControl,
    FormLabel,
    Switch,
    useToast,
    Textarea,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    SimpleGrid,
    Box,
    Text
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { auth } from '../services/firebase.js';
import { saveGameConfig, getUserConfigs, getPublicConfigs } from '../services/firestore';

const GameConfigModal = ({ isOpen, onClose, onConfigSelect }) => {
    const [configTitle, setConfigTitle] = useState('');
    const [eggCount, setEggCount] = useState(6);
    const [categories, setCategories] = useState([
        { name: '', items: '' }
    ]);
    const [isPublic, setIsPublic] = useState(false);
    const [userConfigs, setUserConfigs] = useState([]);
    const [publicConfigs, setPublicConfigs] = useState([]);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            loadConfigs();
        }
    }, [isOpen]);

    const loadConfigs = async () => {
        try {
            if (auth.currentUser) {
                const userCfgs = await getUserConfigs(auth.currentUser.uid);
                console.log('Loaded user configs:', userCfgs);
                setUserConfigs(userCfgs);
            }
            const publicCfgs = await getPublicConfigs();
            console.log('Loaded public configs:', publicCfgs);
            setPublicConfigs(publicCfgs);
        } catch (error) {
            console.error('Error loading configurations:', error);
            toast({
                title: 'Error loading configurations',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleAddCategory = () => {
        setCategories([...categories, { name: '', items: '' }]);
    };

    const handleCategoryChange = (index, field, value) => {
        const newCategories = [...categories];
        newCategories[index][field] = value;
        setCategories(newCategories);
    };

    const handleSave = async () => {
        try {
            if (!auth.currentUser) {
                throw new Error('Please login to save configurations');
            }

            const config = {
                title: configTitle,
                eggCount,
                categories: categories.map(cat => ({
                    name: cat.name,
                    items: cat.items.split(',').map(item => item.trim())
                })),
                isPublic
            };

            await saveGameConfig(config, auth.currentUser.uid);
            toast({
                title: 'Success',
                description: 'Configuration saved successfully',
                status: 'success',
                duration: 3000,
            });
            loadConfigs();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
            });
        }
    };

    const ConfigCard = ({ config, onClick }) => (
        <Box 
            p={4} 
            border="1px" 
            borderColor="gray.200" 
            borderRadius="md"
            cursor="pointer"
            onClick={() => {
                console.log('Selected config:', config);
                onClick(config);
            }}
            _hover={{ bg: 'gray.50' }}
        >
            <Text fontWeight="bold">{config.title}</Text>
            <Text fontSize="sm">Categories: {config.categories.length}</Text>
            <Text fontSize="sm">Eggs: {config.eggCount}</Text>
        </Box>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Game Configuration</ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={6}>
                    <Tabs>
                        <TabList>
                            <Tab>Create New</Tab>
                            <Tab>Load Saved</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel>Configuration Title</FormLabel>
                                        <Input
                                            value={configTitle}
                                            onChange={(e) => setConfigTitle(e.target.value)}
                                            placeholder="Enter a title"
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel>Number of Eggs</FormLabel>
                                        <Input
                                            type="number"
                                            value={eggCount}
                                            onChange={(e) => setEggCount(Number(e.target.value))}
                                            min={1}
                                        />
                                    </FormControl>

                                    {categories.map((category, index) => (
                                        <VStack key={index} w="100%" spacing={2}>
                                            <FormControl>
                                                <FormLabel>Category {index + 1}</FormLabel>
                                                <Input
                                                    value={category.name}
                                                    onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                                                    placeholder="Category name"
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel>Items (comma-separated)</FormLabel>
                                                <Textarea
                                                    value={category.items}
                                                    onChange={(e) => handleCategoryChange(index, 'items', e.target.value)}
                                                    placeholder="Item1, Item2, Item3"
                                                />
                                            </FormControl>
                                        </VStack>
                                    ))}

                                    <Button onClick={handleAddCategory}>
                                        Add Category
                                    </Button>

                                    <FormControl display="flex" alignItems="center">
                                        <FormLabel mb="0">Make Public</FormLabel>
                                        <Switch
                                            isChecked={isPublic}
                                            onChange={(e) => setIsPublic(e.target.checked)}
                                        />
                                    </FormControl>

                                    <Button colorScheme="blue" onClick={handleSave} width="100%">
                                        Save Configuration
                                    </Button>
                                </VStack>
                            </TabPanel>

                            <TabPanel>
                                <VStack spacing={4}>
                                    <Text fontWeight="bold">Your Configurations</Text>
                                    <SimpleGrid columns={2} spacing={4} width="100%">
                                        {userConfigs.map(config => (
                                            <ConfigCard
                                                key={config.id}
                                                config={config}
                                                onClick={onConfigSelect}
                                            />
                                        ))}
                                    </SimpleGrid>

                                    <Text fontWeight="bold" mt={4}>Public Configurations</Text>
                                    <SimpleGrid columns={2} spacing={4} width="100%">
                                        {publicConfigs.map(config => (
                                            <ConfigCard
                                                key={config.id}
                                                config={config}
                                                onClick={onConfigSelect}
                                            />
                                        ))}
                                    </SimpleGrid>
                                </VStack>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default GameConfigModal;