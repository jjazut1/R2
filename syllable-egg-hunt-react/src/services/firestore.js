import { db } from './firebase.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    serverTimestamp 
} from 'firebase/firestore';

export const gameConfigsCollection = 'gameConfigs';

export const saveGameConfig = async (config, userId) => {
    try {
        const docRef = await addDoc(collection(db, gameConfigsCollection), {
            ...config,
            userId,
            createdAt: serverTimestamp(),
            isPublic: config.isPublic || false
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving game config:', error);
        throw error;
    }
};

export const getUserConfigs = async (userId) => {
    try {
        const q = query(
            collection(db, gameConfigsCollection),
            where('userId', '==', userId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user configs:', error);
        throw error;
    }
};

export const getPublicConfigs = async () => {
    try {
        const q = query(
            collection(db, gameConfigsCollection),
            where('isPublic', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting public configs:', error);
        throw error;
    }
};