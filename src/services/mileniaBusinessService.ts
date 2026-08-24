import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from '../firebaseConfig';

export interface DigitalWalletKeys {
  nequiKey: string;
  daviplataKey: string;
  bancolombiaKey: string;
  checkingAccountKey?: string;
  daleKey?: string;
  moviiKey?: string;
  transfiyaKey?: string;
  qrBreveInteroperableKey?: string;
}

export interface BankAccountInfo {
  bankName: string;
  accountType: 'Ahorros' | 'Corriente' | 'Ahorro para la Vivienda' | 'Ahorro Programado';
  accountNumber: string;
  accountKey?: string; // Llave de la cuenta / Llave Breve / Transferencia
  accountHolder: string;
  holderDocument: string;
}

export interface MileniaBusinessProfile {
  id?: string;
  legalName: string;          // Ej: Milenia SaaS Tecnologías Gastronómicas S.A.S.
  brandName: string;          // Ej: Milenia Cloud POS & KDS
  nit: string;                // Ej: 901.450.888-1
  city: string;               // Ej: Bogotá D.C., Colombia
  address: string;            // Ej: Calle 93 # 12-45, Chicó Empresarial
  phone: string;              // Ej: +57 304 347 0984
  email: string;              // Ej: contacto@mileniapos.co / camilovidal.1704@gmail.com
  website: string;            // Ej: https://mileniapos.co
  industry: string;           // Ej: Software Gastronómico & Facturación Electrónica DIAN
  description: string;        // Descripción oficial de Milenia

  // Códigos QR para pagos y transferencias (Data URLs o URLs en base64)
  qrNequiUrl: string;
  qrDaviplataUrl: string;
  qrBancolombiaUrl: string;
  qrBreveUrl: string;

  // Cuentas Bancarias
  bankAccount: BankAccountInfo; // Cuenta principal / Ahorros / Vivienda
  savingsAccount?: BankAccountInfo; // Cuenta de Ahorro para la Vivienda
  checkingAccount?: BankAccountInfo; // Cuenta Corriente (Checking Account)

  // Llaves de Breve y Billeteras Digitales
  digitalKeys: DigitalWalletKeys;

  updatedAt: string;
}

export const DEFAULT_BUSINESS_PROFILE: MileniaBusinessProfile = {
  legalName: 'Milenia SaaS Tecnologías Gastronómicas S.A.S.',
  brandName: 'Milenia Cloud POS & KDS',
  nit: '901.450.888-1',
  city: 'Bogotá D.C., Colombia',
  address: 'Calle 93 # 12-45, Chicó Empresarial Piso 6',
  phone: '+57 304 347 0984',
  email: 'camilovidal.1704@gmail.com',
  website: 'https://mileniapos.co',
  industry: 'Software SaaS POS, KDS y Facturación Electrónica DIAN',
  description: 'Plataforma líder en Colombia para la gestión integral gastronómica de restaurantes, bares, cafeterías y cadenas franquicias.',
  
  // QRs por defecto
  qrNequiUrl: '',
  qrDaviplataUrl: '',
  qrBancolombiaUrl: '',
  qrBreveUrl: '',

  bankAccount: {
    bankName: 'Bancolombia',
    accountType: 'Ahorro para la Vivienda',
    accountNumber: '488432227616',
    accountKey: '488432227616',
    accountHolder: 'Andrés Camilo Vidal Canchón / Milenia S.A.S.',
    holderDocument: '1085312034'
  },

  savingsAccount: {
    bankName: 'Bancolombia',
    accountType: 'Ahorro para la Vivienda',
    accountNumber: '488432227616',
    accountKey: '488432227616',
    accountHolder: 'Andrés Camilo Vidal Canchón / Milenia S.A.S.',
    holderDocument: '1085312034'
  },

  checkingAccount: {
    bankName: 'Bancolombia',
    accountType: 'Corriente',
    accountNumber: '488432227616',
    accountKey: 'CC-MILENIA-488432227616',
    accountHolder: 'Andrés Camilo Vidal Canchón / Milenia S.A.S.',
    holderDocument: '1085312034'
  },

  digitalKeys: {
    nequiKey: '3043470984',
    daviplataKey: '3043470984',
    bancolombiaKey: '488432227616',
    checkingAccountKey: 'CC-MILENIA-488432227616',
    transfiyaKey: '3043470984',
    qrBreveInteroperableKey: 'BREVE-MILENIA-901450888-COL',
    daleKey: '3043470984'
  },

  updatedAt: new Date().toISOString()
};

const LOCAL_STORAGE_KEY = 'milenia_business_profile_v1';

/**
 * Obtiene el perfil de negocio de la tabla 'negocio' en Firestore (doc 'perfil_milenia')
 */
export async function getBusinessProfile(): Promise<MileniaBusinessProfile> {
  try {
    const docRef = doc(db, 'negocio', 'perfil_milenia');
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as MileniaBusinessProfile;
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return data;
    }

    // Inicializar perfil en la tabla negocio
    await setDoc(docRef, DEFAULT_BUSINESS_PROFILE, { merge: true });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BUSINESS_PROFILE));
    return DEFAULT_BUSINESS_PROFILE;
  } catch (e) {
    console.warn('Error en getBusinessProfile de Firestore:', e);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return DEFAULT_BUSINESS_PROFILE;
  }
}

/**
 * Guarda o actualiza el perfil del negocio en Firestore tabla 'negocio'
 */
export async function saveBusinessProfile(profile: Partial<MileniaBusinessProfile>): Promise<MileniaBusinessProfile> {
  const updatedPayload: MileniaBusinessProfile = {
    ...DEFAULT_BUSINESS_PROFILE,
    ...profile,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, 'negocio', 'perfil_milenia');
    await setDoc(docRef, updatedPayload, { merge: true });
  } catch (e) {
    console.warn('Error en saveBusinessProfile a Firestore:', e);
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPayload));
  } catch (_) {}

  return updatedPayload;
}

/**
 * Listener en tiempo real para cambios en la tabla 'negocio'
 */
export function subscribeToBusinessProfile(onUpdate: (profile: MileniaBusinessProfile) => void) {
  try {
    const docRef = doc(db, 'negocio', 'perfil_milenia');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as MileniaBusinessProfile;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
        onUpdate(data);
      }
    }, (err) => {
      console.warn('Snapshot listener en negocio:', err);
    });
  } catch (e) {
    console.warn('No se pudo iniciar listener en negocio:', e);
    return () => {};
  }
}
