// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Initializes Firebase services for the application
// Services used:
// - Firebase Authentication (user login/signup)
// - Firestore Database (user data storage)
// ============================================

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ============================================
// FIREBASE PROJECT CONFIGURATION
// Credentials loaded from .env file
// ============================================
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase app with config
const app = initializeApp(firebaseConfig);

// ============================================
// EXPORT FIREBASE SERVICES
// Import these in components/contexts to use Firebase
// ============================================
export const auth = getAuth(app);        // Authentication service
export const db = getFirestore(app);     // Firestore database service
export const storage = getStorage(app);  // Storage service