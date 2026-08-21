import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json';

// Initialize Firebase App singleton
export const firebaseApp = !getApps().length ? initializeApp(firebaseConfigData) : getApp();

// Target Firestore Database instance
export const db = getFirestore(firebaseApp, firebaseConfigData.firestoreDatabaseId);

// Target Firebase Auth instance
export const auth = getAuth(firebaseApp);

// Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default firebaseApp;

export {
  firebaseConfigData as firebaseConfig,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp
};

export type { User };
