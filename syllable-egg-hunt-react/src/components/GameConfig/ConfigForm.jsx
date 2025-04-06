// src/components/GameConfig/ConfigForm.jsx
import { useState, useEffect } from 'react';
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
    Textarea,
    FormControl,
    FormLabel,
    Switch,
    Select,
    useToast
} from '@chakra-ui/react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const GameConfig = ({ isOpen, onClose, onConfigSelect }) => {
    const [title, setTitle] = useState('');
    const [eggQty, setEggQty] = useState(6);
    const [categories, setCategories] = useState([
        { name: '', items: '' }
    ]);
    const [shareConfig, setShareConfig] = useState(false);
    const [savedConfigs, setSavedConfigs] = useState([]);
    const toast = useToast();

    useEffect(() => {
        loadSavedConfigs();
    }, []);

    const loadSavedConfigs = async () => {
        try {
            const q = query(
                collection(db, 'sortCategoriesEgg'),
                where('share', '==', true)
            );
            const querySnapshot = await getDocs(q);
            const configs = [];
            querySnapshot.forEach((doc) => {
                configs.push({ id: doc.id, ...doc.data() });
            });
            setSavedConfigs(configs);
        } catch (error) {
            console.error('Error loading configurations:', error);
            toast({
                title: 'Error',
                description: 'Failed to load saved configurations',
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

    const handleSaveConfig = async () => {
        try {
            const configData = {
                title,
                eggQty: Number(eggQty),
                categories: categories.map(cat => ({
                    name: cat.name,
                    items: cat.items.split(',').map(item => item.trim())
                })),
                share: shareConfig,
                email: auth.currentUser?.email,
                createdAt: new Date()
            };

            await addDoc(collection(db, 'sortCategoriesEgg'), configData);
            toast({
                title: 'Success',
                description: 'Configuration saved successfully',
                status: 'success',
                duration: 3000,
            });
            loadSavedConfigs();
        } catch (error) {
            console.error('Error saving configuration:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
                status: 'error',
                duration: 3000,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Game Configuration</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} pb={6}>
                        <Select
                            placeholder="Load saved configuration"
                            onChange={(e) => {
                                const config = savedConfigs.find(c => c.id === e.target.value);
                                if (config) onConfigSelect(config);
                            }}
                        >
                            {savedConfigs.map(config => (
                                <option key={config.id} value={config.id}>
                                    {config.title} (by {config.email})
                                </option>
                            ))}
                        </Select>

                        <FormControl>
                            <FormLabel>Configuration Title</FormLabel>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter configuration title"
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Number of Eggs</FormLabel>
                            <Input
                                type="number"
                                value={eggQty}
                                onChange={(e) => setEggQty(e.target.value)}
                                min={1}
                            />
                        </FormControl>

                        {categories.map((category, index) => (
                            <VStack key={index} w="100%" spacing={2}>
                                <FormControl>
                                    <FormLabel>Category {index + 1} Name</FormLabel>
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

                        <Button onClick={handleAddCategory} colorScheme="blue">
                            Add Category
                        </Button>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel mb="0">Share Configuration</FormLabel>
                            <Switch
                                isChecked={shareConfig}
                                onChange={(e) => setShareConfig(e.target.checked)}
                            />
                        </FormControl>

                        <Button onClick={handleSaveConfig} colorScheme="green" w="100%">
                            Save Configuration
                        </Button>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default GameConfig;