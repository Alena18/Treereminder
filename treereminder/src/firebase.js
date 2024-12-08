// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Firestore import

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
// Firebase configuration (use your own credentials from Firebase console)
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDbxlc7REvsmwU7OE-v0xxfzUpvaebmmWk",
  authDomain: "reminder-8a77f.firebaseapp.com",
  projectId: "reminder-8a77f",
  storageBucket: "reminder-8a77f.firebasestorage.app",
  messagingSenderId: "232681110246",
  appId: "1:232681110246:web:54de53354bddac9716d927",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const firestore = getFirestore(app);

// Initialize Firebase Authentication
const auth = getAuth();

// Export Firestore and Auth
export {
  auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  firestore,
};
