import { Button, Text, VStack, useToast } from '@chakra-ui/react';
import { auth } from '../../services/firebase.js';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';

const Auth = () => {
    const [user, setUser] = useState(null);
    const toast = useToast();
    const provider = new GoogleAuthProvider();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            toast({
                title: 'Success!',
                description: 'You have successfully logged in.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({
                title: 'Logged out',
                description: 'You have been logged out successfully.',
                status: 'info',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={4} align="stretch">
            {user ? (
                <VStack>
                    <Text>Welcome, {user.email}!</Text>
                    <Button colorScheme="red" onClick={handleLogout}>
                        Logout
                    </Button>
                </VStack>
            ) : (
                <Button colorScheme="blue" onClick={handleLogin}>
                    Login with Google
                </Button>
            )}
        </VStack>
    );
};

export default Auth;