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
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
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

// Set Firestore log level to error to avoid benign offline-retry console noise
try {
  setLogLevel('error');
} catch (e) {
  // Ignore if already configured
}

// Target Firestore Database instance with resilient multi-tab offline cache
let dbInstance;
try {
  dbInstance = initializeFirestore(firebaseApp, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  }, firebaseConfigData.firestoreDatabaseId);
} catch (e) {
  dbInstance = getFirestore(firebaseApp, firebaseConfigData.firestoreDatabaseId);
}

export const db = dbInstance;

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
