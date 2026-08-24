import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  setDoc 
} from '../firebaseConfig';

export interface MileniaSystemConfig {
  dianResolutionNumber: string;
  dianPrefix: string;
  dianStartRange: number;
  dianEndRange: number;
  dianValidUntil: string;
  wompiPublicKey: string;
  wompiEnvironment: 'sandbox' | 'production';
  pseEnabled: boolean;
  cloudBackupFrequency: 'daily' | 'hourly' | 'weekly';
  cloudRegion: string;
  supportPhone: string;
  supportEmail: string;
  mrrTargetCop: number;
}

export interface MileniaOwnerProfile {
  name: string;
  documentId: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  companyName: string;
  nit: string;
  avatarUrl?: string;
  bio?: string;
}

export const DEFAULT_SYSTEM_CONFIG: MileniaSystemConfig = {
  dianResolutionNumber: '1876400000 de 2026',
  dianPrefix: 'FE-2026',
  dianStartRange: 1,
  dianEndRange: 15000,
  dianValidUntil: '2027-08-20',
  wompiPublicKey: 'pub_prod_milenia_pos_2026_x89a',
  wompiEnvironment: 'production',
  pseEnabled: true,
  cloudBackupFrequency: 'daily',
  cloudRegion: 'us-east1 (Google Cloud)',
  supportPhone: '+57 304 347 0984',
  supportEmail: 'camilovidal.1704@gmail.com',
  mrrTargetCop: 5000000
};

export const DEFAULT_OWNER_PROFILE: MileniaOwnerProfile = {
  name: 'Andrés Camilo Vidal Canchón',
  documentId: '1085312034',
  email: 'camilovidal.1704@gmail.com',
  phone: '+57 304 347 0984',
  role: 'SuperAdministrador & Fundador Propietario',
  city: 'Bogotá D.C., Colombia',
  companyName: 'Milenia SaaS Tecnologías Gastronómicas S.A.S.',
  nit: '901.450.888-1',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  bio: 'Fundador y Arquitecto de Software de la plataforma Milenia POS & KDS Cloud para restaurantes y cadenas gastronómicas en Colombia.'
};

export async function getSystemConfig(): Promise<MileniaSystemConfig> {
  try {
    const docRef = doc(db, 'system_config', 'global_settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MileniaSystemConfig;
    }
    await setDoc(docRef, DEFAULT_SYSTEM_CONFIG, { merge: true });
    return DEFAULT_SYSTEM_CONFIG;
  } catch (e) {
    console.warn('Error fetching system config:', e);
    return DEFAULT_SYSTEM_CONFIG;
  }
}

export async function saveSystemConfig(config: MileniaSystemConfig): Promise<void> {
  try {
    const docRef = doc(db, 'system_config', 'global_settings');
    await setDoc(docRef, config, { merge: true });
  } catch (e) {
    console.warn('Error saving system config to Firestore:', e);
  }
}

export async function getOwnerProfile(): Promise<MileniaOwnerProfile> {
  try {
    const docRef = doc(db, 'system_config', 'owner_profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MileniaOwnerProfile;
    }
    await setDoc(docRef, DEFAULT_OWNER_PROFILE, { merge: true });
    return DEFAULT_OWNER_PROFILE;
  } catch (e) {
    console.warn('Error fetching owner profile:', e);
    return DEFAULT_OWNER_PROFILE;
  }
}

export async function saveOwnerProfile(profile: MileniaOwnerProfile): Promise<void> {
  try {
    const docRef = doc(db, 'system_config', 'owner_profile');
    await setDoc(docRef, profile, { merge: true });
    // Guardar también en /users
    const userDocRef = doc(db, 'users', 'owner_camilovidal_1704_gmail_com');
    await setDoc(userDocRef, {
      ...profile,
      role: 'OWNER',
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.warn('Error saving owner profile to Firestore:', e);
  }
}
