import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  db, 
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  User
} from '../firebaseConfig';
import { UserProfile, UserRole } from '../types';

export interface DemoAccountConfig {
  id: 'miguel_owner' | 'alejandro_staff';
  label: string;
  sublabel: string;
  email: string;
  role: UserRole;
  restaurantId: string;
  documentId: string;
  name: string;
  position: string;
  targetUrl: string;
}

export const DEMO_USERS: Record<'miguel_owner' | 'alejandro_staff', DemoAccountConfig> = {
  miguel_owner: {
    id: 'miguel_owner',
    label: 'Miguel Ángel (Owner / Propietario)',
    sublabel: 'Restaurante 5 (Mar & Fuego Caribe) • Admin Global',
    email: 'miguel.owner@milenia.co',
    role: 'owner',
    restaurantId: '5',
    documentId: '80992314',
    name: 'Miguel Ángel Valderrama',
    position: 'Propietario & Director General',
    targetUrl: '/5/admin'
  },
  alejandro_staff: {
    id: 'alejandro_staff',
    label: 'Alejandro Restrepo (Cajero / Staff)',
    sublabel: 'Restaurante 3 (Sabor del Valle) • Cédula: 12345',
    email: 'alejandro.cajero@milenia.co',
    role: 'staff',
    restaurantId: '3',
    documentId: '12345',
    name: 'Alejandro Restrepo V.',
    position: 'Cajero Principal & Atención POS',
    targetUrl: '/3/dashboard/12345'
  }
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithEmail: (email: string, pass: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, pass: string, profile: Omit<UserProfile, 'uid' | 'createdAt'>) => Promise<UserProfile>;
  signInWithGoogle: () => Promise<UserProfile>;
  loginAsDemo: (demoType: 'miguel_owner' | 'alejandro_staff') => Promise<string>;
  logout: () => Promise<void>;
  saveUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getRedirectPath: (profile?: UserProfile | null) => string;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    // Initial local persistence fallback
    try {
      const saved = localStorage.getItem('milenia_active_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computes dynamic redirection rule based on user role, restaurantId, and documentId
  const getRedirectPath = (profileToEval?: UserProfile | null): string => {
    const profile = profileToEval || userProfile;
    if (!profile) return '/';

    // CASO 1: Owner (Ej: Miguel en Restaurante 5 -> /5/admin)
    if (profile.role === 'owner') {
      const rId = profile.restaurantId || '5';
      return `/${rId}/admin`;
    }

    // CASO 2: Staff / Cajero (Ej: Alejandro en Restaurante 3, Cédula 12345 -> /3/dashboard/12345)
    if (profile.role === 'staff') {
      const rId = profile.restaurantId || '3';
      const docId = profile.documentId || '12345';
      return `/${rId}/dashboard/${docId}`;
    }

    return '/';
  };

  // Helper to fetch user document from Firestore `/users/{uid}`
  const fetchUserProfileFromFirestore = async (uid: string, fallbackEmail?: string): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        const completeProfile: UserProfile = {
          uid,
          role: data.role || 'staff',
          restaurantId: String(data.restaurantId || '3'),
          documentId: String(data.documentId || '12345'),
          name: data.name || (fallbackEmail?.split('@')[0] ?? 'Usuario Milenia'),
          email: data.email || fallbackEmail || '',
          position: data.position,
          phone: data.phone,
          createdAt: data.createdAt || new Date().toISOString()
        };
        setUserProfile(completeProfile);
        localStorage.setItem('milenia_active_user_profile', JSON.stringify(completeProfile));
        return completeProfile;
      }
    } catch (err) {
      console.warn('Firestore fetch error or offline fallback:', err);
    }
    return null;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setLoading(true);
        const profile = await fetchUserProfileFromFirestore(firebaseUser.uid, firebaseUser.email || undefined);
        if (!profile) {
          // If authenticated but document doesn't exist yet in Firestore (e.g. initial Google login)
          // Look up if email matches any demo or default to staff
          let defaultRole: UserRole = 'staff';
          let defaultRestaurantId = '3';
          let defaultDocId = '12345';
          let defaultName = firebaseUser.displayName || 'Colaborador Milenia';

          if (firebaseUser.email?.includes('owner') || firebaseUser.email?.includes('miguel')) {
            defaultRole = 'owner';
            defaultRestaurantId = '5';
            defaultDocId = '80992314';
            defaultName = 'Miguel Ángel (Owner)';
          }

          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            role: defaultRole,
            restaurantId: defaultRestaurantId,
            documentId: defaultDocId,
            name: defaultName,
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date().toISOString()
          };

          try {
            await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
          } catch (writeErr) {
            console.warn('Could not auto-create /users/ doc in Firestore:', writeErr);
          }

          setUserProfile(newProfile);
          localStorage.setItem('milenia_active_user_profile', JSON.stringify(newProfile));
        }
      } else {
        // Keep local demo profile if active, or clear
        const localSaved = localStorage.getItem('milenia_active_user_profile');
        if (!localSaved) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Sign In With Email & Password
  const signInWithEmail = async (email: string, pass: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await fetchUserProfileFromFirestore(cred.user.uid, cred.user.email || undefined);
      
      if (profile) {
        setLoading(false);
        return profile;
      }

      // Fallback create default if missing
      const isOwner = email.toLowerCase().includes('owner') || email.toLowerCase().includes('miguel');
      const fallbackProfile: UserProfile = {
        uid: cred.user.uid,
        role: isOwner ? 'owner' : 'staff',
        restaurantId: isOwner ? '5' : '3',
        documentId: isOwner ? '80992314' : '12345',
        name: isOwner ? 'Miguel Ángel (Owner)' : 'Alejandro Restrepo (Cajero)',
        email: cred.user.email || email,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', cred.user.uid), fallbackProfile);
      } catch (e) {
        console.warn('SetDoc fallback warning:', e);
      }

      setUserProfile(fallbackProfile);
      localStorage.setItem('milenia_active_user_profile', JSON.stringify(fallbackProfile));
      setLoading(false);
      return fallbackProfile;
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Error al iniciar sesión con Firebase Auth.';
      setError(msg);
      throw err;
    }
  };

  // 2. Sign Up With Email & Password and create `/users/{uid}` document
  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    profileData: Omit<UserProfile, 'uid' | 'createdAt'>
  ): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        ...profileData,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
      localStorage.setItem('milenia_active_user_profile', JSON.stringify(newProfile));
      setLoading(false);
      return newProfile;
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Error al registrar usuario en Firebase.';
      setError(msg);
      throw err;
    }
  };

  // 3. Sign In With Google
  const signInWithGoogle = async (): Promise<UserProfile> => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const existing = await fetchUserProfileFromFirestore(result.user.uid, result.user.email || undefined);
      if (existing) {
        setLoading(false);
        return existing;
      }

      // Create new profile for Google user
      const isOwner = (result.user.email || '').toLowerCase().includes('owner') || 
                      (result.user.email || '').toLowerCase().includes('miguel');
      const googleProfile: UserProfile = {
        uid: result.user.uid,
        role: isOwner ? 'owner' : 'staff',
        restaurantId: isOwner ? '5' : '3',
        documentId: isOwner ? '80992314' : '12345',
        name: result.user.displayName || (isOwner ? 'Miguel Ángel (Owner)' : 'Alejandro Restrepo'),
        email: result.user.email || '',
        photoURL: result.user.photoURL || undefined,
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', result.user.uid), googleProfile);
      } catch (err) {
        console.warn('Google user setDoc warning:', err);
      }

      setUserProfile(googleProfile);
      localStorage.setItem('milenia_active_user_profile', JSON.stringify(googleProfile));
      setLoading(false);
      return googleProfile;
    } catch (err: any) {
      setLoading(false);
      const msg = err?.message || 'Error en autenticación con Google.';
      setError(msg);
      throw err;
    }
  };

  // 4. Demo 1-Click Login (Preconfigured for Miguel and Alejandro)
  const loginAsDemo = async (demoKey: 'miguel_owner' | 'alejandro_staff'): Promise<string> => {
    setError(null);
    const demo = DEMO_USERS[demoKey];
    
    const demoProfile: UserProfile = {
      uid: `demo-${demo.role}-${demo.restaurantId}-${demo.documentId}`,
      role: demo.role,
      restaurantId: demo.restaurantId,
      documentId: demo.documentId,
      name: demo.name,
      email: demo.email,
      position: demo.position,
      createdAt: new Date().toISOString()
    };

    // Store in state & localStorage
    setUserProfile(demoProfile);
    localStorage.setItem('milenia_active_user_profile', JSON.stringify(demoProfile));

    // Also attempt to sync to Firestore if permitted
    try {
      await setDoc(doc(db, 'users', demoProfile.uid), demoProfile, { merge: true });
    } catch (e) {
      // Non-blocking for instant demo testing
    }

    return demo.targetUrl;
  };

  // 5. Logout
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Firebase signOut error:', err);
    }
    setUser(null);
    setUserProfile(null);
    localStorage.removeItem('milenia_active_user_profile');
  };

  // 6. Save/Update profile in Firestore
  const saveUserProfile = async (partial: Partial<UserProfile>) => {
    if (!userProfile) return;
    const updated: UserProfile = { ...userProfile, ...partial };
    setUserProfile(updated);
    localStorage.setItem('milenia_active_user_profile', JSON.stringify(updated));

    if (userProfile.uid) {
      try {
        await setDoc(doc(db, 'users', userProfile.uid), updated, { merge: true });
      } catch (err) {
        console.warn('Error saving user profile to Firestore:', err);
      }
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        loginAsDemo,
        logout,
        saveUserProfile,
        getRedirectPath,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
