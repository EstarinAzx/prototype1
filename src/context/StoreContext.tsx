import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Item, items as initialItems } from '../data/items';
import { soundManager } from '../utils/soundManager';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, addDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface Loadout {
    primary: Item | null;
    secondary: Item | null;
    armor: Item | null;
    implant: Item | null;
    gear: Item | null;
}

interface User {
    uid: string;
    username: string;
    credits: number;
    inventory: Item[];
    loadout: Loadout;
    isAdmin: boolean;
    profile: {
        avatar: string;
        bio: string;
        level: number;
        xp: number;
        achievements: string[];
        joinedDate: number;
    };
}

interface Transaction {
    id: string;
    items: Item[];
    total: number;
    timestamp: number;
}

interface StoreContextType {
    items: Item[];
    cart: Item[];
    credits: number;
    user: User | null;
    transactions: Transaction[];
    favorites: (number | string)[];
    loading: boolean;
    addToCart: (item: Item) => void;
    removeFromCart: (index: number) => void;
    clearCart: () => void;
    checkout: () => Promise<{ success: boolean; message: string }>;
    toggleFavorite: (id: number | string) => void;
    login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    signup: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: 'price-asc' | 'price-desc' | 'name' | null;
    setSortBy: (sort: 'price-asc' | 'price-desc' | 'name' | null) => void;
    filteredItems: Item[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    equipItem: (item: Item, slot: keyof Loadout) => void;
    unequipItem: (slot: keyof Loadout) => void;
    updateProfile: (avatar: string, bio: string) => Promise<void>;
    unlockAchievement: (achievementId: string) => void;
    addXP: (amount: number) => void;
    addProduct: (product: Omit<Item, 'id'>) => Promise<string>;
    deleteProduct: (id: number | string) => Promise<void>;
    updateProduct: (id: number | string, updates: Partial<Item>) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [cart, setCart] = useState<Item[]>([]);
    const [credits, setCredits] = useState<number>(50000);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [favorites, setFavorites] = useState<(number | string)[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const defaultLoadout: Loadout = {
        primary: null,
        secondary: null,
        armor: null,
        implant: null,
        gear: null
    };

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Load user data from Firestore
                await loadUserData(firebaseUser.uid);
            } else {
                setUser(null);
                setCredits(50000);
                setCart([]);
                setTransactions([]);
                setFavorites([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Fetch products from Firestore
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productsCollection = collection(db, 'products');
                const productsSnapshot = await getDocs(productsCollection);

                if (productsSnapshot.empty) {
                    // Seed initial data if empty
                    console.log('Seeding initial products...');
                    const seededItems: Item[] = [];
                    for (const item of initialItems) {
                        const docRef = await addDoc(productsCollection, item);
                        seededItems.push({ ...item, id: parseInt(docRef.id) }); // Temporary ID handling
                    }
                    setItems(initialItems); // Use initial items for now to avoid ID issues
                } else {
                    const loadedItems = productsSnapshot.docs.map(doc => ({
                        id: doc.id, // Use Firestore ID
                        ...doc.data()
                    })) as any[]; // Type assertion needed due to ID mismatch (number vs string)

                    // Normalize IDs to handle legacy number IDs and new string IDs
                    const normalizedItems = loadedItems.map(item => ({
                        ...item,
                        id: typeof item.id === 'string' && !isNaN(Number(item.id)) ? Number(item.id) : item.id
                    }));

                    setItems(normalizedItems);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setItems(initialItems); // Fallback
            }
        };

        fetchProducts();
    }, []);

    const loadUserData = async (uid: string) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const loadedUser: User = {
                    uid,
                    username: userData.username,
                    credits: userData.credits,
                    inventory: userData.inventory || [],
                    loadout: userData.loadout || defaultLoadout,
                    isAdmin: userData.isAdmin || false,
                    profile: userData.profile || {
                        avatar: 'netrunner',
                        bio: '',
                        level: 1,
                        xp: 0,
                        achievements: [],
                        joinedDate: userData.createdAt || Date.now()
                    }
                };
                setUser(loadedUser);
                setCredits(userData.credits);
                setCart(userData.cart || []);
                setTransactions(userData.transactions || []);
                setFavorites(userData.favorites || []);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const saveUserData = async () => {
        if (!user) return;

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                credits,
                cart,
                transactions,
                favorites,
                inventory: user.inventory,
                loadout: user.loadout
            });
        } catch (error) {
            console.error('Error saving user data:', error);
        }
    };

    // Auto-save user data when it changes
    useEffect(() => {
        if (user && !loading) {
            saveUserData();
        }
    }, [cart, credits, transactions, favorites, user?.inventory, user?.loadout]);

    const addToCart = (item: Item) => {
        setCart([...cart, item]);
        soundManager.playClick();
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
    };

    const checkout = async () => {
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        if (credits >= total) {
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                items: [...cart],
                total,
                timestamp: Date.now()
            };

            // Add items to inventory
            if (user) {
                const updatedInventory = [...user.inventory, ...cart];
                setUser({ ...user, inventory: updatedInventory });
            }

            setTransactions(prev => [newTransaction, ...prev]);
            setCredits(prev => prev - total);
            setCart([]);
            soundManager.playPurchase();
            return { success: true, message: 'TRANSACTION COMPLETE. ITEMS TRANSFERRED TO INVENTORY.' };
        } else {
            soundManager.playError();
            return { success: false, message: 'INSUFFICIENT FUNDS. TRANSACTION DENIED.' };
        }
    };

    const equipItem = (item: Item, slot: keyof Loadout) => {
        if (!user) return;

        // Check if item is already equipped in another slot
        const currentlyEquippedSlots = Object.entries(user.loadout)
            .filter(([key, value]) => value?.id === item.id && key !== slot);

        // Count total quantity of this item in inventory
        const totalQuantity = user.inventory.filter(i => i.id === item.id).length;

        // If it's already equipped somewhere else, we need to check if we have enough quantity
        if (currentlyEquippedSlots.length > 0) {
            const alreadyEquippedCount = currentlyEquippedSlots.length;
            
            // If we don't have more items than what's already equipped, we can't equip another one
            if (totalQuantity <= alreadyEquippedCount) {
                soundManager.playError();
                // Ideally we'd show a notification here, but for now the error sound indicates failure
                console.log('Not enough quantity to equip another instance');
                return;
            }
        }

        const updatedLoadout = { ...user.loadout, [slot]: item };
        setUser({ ...user, loadout: updatedLoadout });
        soundManager.playClick();
    };

    const unequipItem = (slot: keyof Loadout) => {
        if (!user) return;
        const updatedLoadout = { ...user.loadout, [slot]: null };
        setUser({ ...user, loadout: updatedLoadout });
        soundManager.playClick();
    };

    const toggleFavorite = (id: number | string) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
        );
        soundManager.playClick();
    };

    const updateProfile = async (avatar: string, bio: string) => {
        if (!user) return;
        const updatedProfile = { ...user.profile, avatar, bio };
        setUser({ ...user, profile: updatedProfile });
        soundManager.playClick();
    };

    const unlockAchievement = (achievementId: string) => {
        if (!user) return;
        if (user.profile.achievements.includes(achievementId)) return;

        const updatedAchievements = [...user.profile.achievements, achievementId];
        const updatedProfile = { ...user.profile, achievements: updatedAchievements };
        setUser({ ...user, profile: updatedProfile });
        soundManager.playClick();
    };

    const addXP = (amount: number) => {
        if (!user) return;

        const newXP = user.profile.xp + amount;
        const XP_PER_LEVEL = 1000;
        const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

        const updatedProfile = {
            ...user.profile,
            xp: newXP,
            level: newLevel
        };

        setUser({ ...user, profile: updatedProfile });

        // Level up notification
        if (newLevel > user.profile.level) {
            soundManager.playPurchase();
        }
    };

    const addProduct = async (product: Omit<Item, 'id'>): Promise<string> => {
        try {
            const productsCollection = collection(db, 'products');
            const docRef = await addDoc(productsCollection, product);

            // Add to local state immediately
            const newItem: Item = { ...product, id: docRef.id };
            setItems(prev => [...prev, newItem]);

            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    };

    const deleteProduct = async (id: number | string): Promise<void> => {
        try {
            // Delete from Firestore if it's a string ID (new items)
            // For legacy number IDs, we can't delete from Firestore easily unless we migrate them all
            // But since we migrated everything to Firestore, all items should have a Firestore doc

            // Note: In a real app, we'd ensure all items have string IDs.
            // For now, we'll try to delete by ID if it's a string.
            if (typeof id === 'string') {
                await deleteDoc(doc(db, 'products', id));
            } else {
                // For number IDs (legacy), we might need to find the doc first
                // But since we seeded them, they might have new string IDs in Firestore
                // This is a simplification.
                console.warn('Deleting legacy item with number ID might not sync with Firestore');
            }

            // Update local state
            setItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    };

    const updateProduct = async (id: number | string, updates: Partial<Item>): Promise<void> => {
        try {
            if (typeof id === 'string') {
                const productRef = doc(db, 'products', id);
                await updateDoc(productRef, updates);
            }

            // Update local state
            setItems(prev => prev.map(item =>
                item.id === id ? { ...item, ...updates } : item
            ));
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const login = async (username: string, password: string) => {
        try {
            // Use username as email (username@cybermarket.local)
            const email = `${username}@cybermarket.local`;
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true, message: 'LOGIN SUCCESSFUL' };
        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, message: 'ACCESS DENIED: INVALID CREDENTIALS' };
        }
    };

    const signup = async (username: string, password: string) => {
        try {
            // Use username as email (username@cybermarket.local)
            const email = `${username}@cybermarket.local`;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Check if username is in admin list
            const ADMIN_USERNAMES = ['admin', 'superadmin', 'root'];
            const isAdmin = ADMIN_USERNAMES.includes(username.toLowerCase());

            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username,
                credits: 50000,
                cart: [],
                transactions: [],
                favorites: [],
                inventory: [],
                loadout: {
                    primary: null,
                    secondary: null,
                    armor: null,
                    implant: null,
                    gear: null
                },
                isAdmin,
                profile: {
                    avatar: 'netrunner',
                    bio: '',
                    level: 1,
                    xp: 0,
                    achievements: [],
                    joinedDate: Date.now()
                },
                createdAt: Date.now()
            });

            return { success: true, message: isAdmin ? 'ADMIN ACCOUNT CREATED' : 'ACCOUNT CREATED SUCCESSFULLY' };
        } catch (error: any) {
            console.error('Signup error:', error);

            // Better error messages
            if (error.code === 'auth/email-already-in-use') {
                return { success: false, message: 'IDENTITY ALREADY REGISTERED' };
            } else if (error.code === 'auth/configuration-not-found') {
                return { success: false, message: 'FIREBASE AUTH NOT ENABLED. ENABLE EMAIL/PASSWORD IN FIREBASE CONSOLE.' };
            } else if (error.code === 'auth/weak-password') {
                return { success: false, message: 'PASSWORD TOO WEAK. USE 6+ CHARACTERS.' };
            } else if (error.code === 'auth/network-request-failed') {
                return { success: false, message: 'NETWORK ERROR. CHECK CONNECTION.' };
            }

            return { success: false, message: error.message || 'REGISTRATION FAILED' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const filteredItems = initialItems
        .filter(item => {
            const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            if (sortBy === 'price-asc') return a.price - b.price;
            if (sortBy === 'price-desc') return b.price - a.price;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

    return (
        <StoreContext.Provider value={{
            items,
            cart,
            credits,
            user,
            transactions,
            favorites,
            loading,
            addToCart,
            removeFromCart,
            clearCart,
            checkout,
            toggleFavorite,
            login,
            signup,
            logout,
            searchQuery,
            setSearchQuery,
            sortBy,
            setSortBy,
            filteredItems,
            selectedCategory,
            setSelectedCategory,
            equipItem,
            unequipItem,
            updateProfile,
            unlockAchievement,
            addXP,
            addProduct,
            deleteProduct,
            updateProduct
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
