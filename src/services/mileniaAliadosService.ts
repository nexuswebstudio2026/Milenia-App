import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from '../firebaseConfig';

export type AllyPlan = 'Básico' | 'Pro' | 'Enterprise';
export type AllyStatus = 'Activo' | 'Inactivo' | 'Pendiente';

export interface MileniaAlly {
  id: string;
  name: string;
  nit: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  plan: AllyPlan;
  status: AllyStatus;
  monthlyFeeCop: number;
  tablesCount: number;
  contactName?: string;
  createdAt: string;
  updatedAt?: string;
}

export const INITIAL_ALIADOS: MileniaAlly[] = [
  {
    id: 'aliado-1',
    name: 'Parrilla & Fuego Camilo',
    nit: '901.450.888-1',
    city: 'Bogotá D.C.',
    address: 'Calle 93 # 12-45, Chicó',
    phone: '+57 304 347 0984',
    email: 'camilovidal.1704@gmail.com',
    plan: 'Enterprise',
    status: 'Activo',
    monthlyFeeCop: 499000,
    tablesCount: 24,
    contactName: 'Andrés Camilo Vidal',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'aliado-2',
    name: 'Bella Italia Ristorante',
    nit: '900.872.101-3',
    city: 'Medellín',
    address: 'Carrera 35 # 8A-20, El Poblado',
    phone: '+57 315 889 0011',
    email: 'admin@bellaitalia.co',
    plan: 'Pro',
    status: 'Activo',
    monthlyFeeCop: 289000,
    tablesCount: 18,
    contactName: 'Marco Bellini',
    createdAt: '2026-02-10T10:30:00.000Z'
  },
  {
    id: 'aliado-3',
    name: 'Burgers & Beers Craft',
    nit: '901.223.456-7',
    city: 'Cali',
    address: 'Av 9N # 14-32, Granada',
    phone: '+57 312 400 9988',
    email: 'gerencia@burgersbeers.co',
    plan: 'Pro',
    status: 'Activo',
    monthlyFeeCop: 289000,
    tablesCount: 16,
    contactName: 'Alejandro Restrepo',
    createdAt: '2026-03-01T14:15:00.000Z'
  },
  {
    id: 'aliado-4',
    name: 'Café & Bistro Macondo',
    nit: '900.654.321-9',
    city: 'Cartagena',
    address: 'Calle de la Mantilla # 3-18',
    phone: '+57 300 765 4321',
    email: 'hola@macondobistro.co',
    plan: 'Básico',
    status: 'Activo',
    monthlyFeeCop: 149000,
    tablesCount: 10,
    contactName: 'Sofía Montoya',
    createdAt: '2026-03-20T09:00:00.000Z'
  },
  {
    id: 'aliado-5',
    name: 'La Fogata Campestre',
    nit: '901.987.654-2',
    city: 'Bucaramanga',
    address: 'Km 7 Vía Ruitoque Alto',
    phone: '+57 318 450 1192',
    email: 'info@lafogatacampestre.co',
    plan: 'Pro',
    status: 'Activo',
    monthlyFeeCop: 289000,
    tablesCount: 22,
    contactName: 'Miguel Ángel Narváez',
    createdAt: '2026-04-05T16:20:00.000Z'
  }
];

const LOCAL_STORAGE_KEY = 'milenia_aliados_cache_v1';

/**
 * Obtiene todos los aliados desde Firestore colección 'aliados'
 */
export async function getAliados(): Promise<MileniaAlly[]> {
  try {
    const colRef = collection(db, 'aliados');
    const snap = await getDocs(colRef);

    const list = snap.docs.map(d => ({
      ...d.data(),
      id: d.id
    })) as MileniaAlly[];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.warn('Error en getAliados desde Firestore:', e);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return [];
  }
}

/**
 * Crea un nuevo aliado en Firestore colección 'aliados' (addDoc / setDoc)
 */
export async function addAliado(allyData: Omit<MileniaAlly, 'id' | 'createdAt'>): Promise<MileniaAlly> {
  const newAlly: MileniaAlly = {
    ...allyData,
    id: `aliado-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'aliados', newAlly.id), newAlly);
  } catch (e) {
    console.warn('Error en addAliado en Firestore:', e);
  }

  try {
    const current = await getAliados();
    current.unshift(newAlly);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (_) {}

  return newAlly;
}

/**
 * Actualiza un aliado existente en Firestore colección 'aliados' (updateDoc / setDoc)
 */
export async function updateAliado(id: string, updates: Partial<MileniaAlly>): Promise<void> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    const allyDocRef = doc(db, 'aliados', id);
    await updateDoc(allyDocRef, payload);
  } catch (e) {
    // Si no existe con updateDoc, intenta con setDoc merge
    try {
      const allyDocRef = doc(db, 'aliados', id);
      await setDoc(allyDocRef, payload, { merge: true });
    } catch (err) {
      console.warn('Error en updateAliado en Firestore:', err);
    }
  }

  try {
    const current = await getAliados();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...payload };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (_) {}
}

/**
 * Elimina un aliado de Firestore colección 'aliados' (deleteDoc)
 */
export async function deleteAliado(id: string): Promise<void> {
  try {
    const allyDocRef = doc(db, 'aliados', id);
    await deleteDoc(allyDocRef);
  } catch (e) {
    console.warn('Error en deleteAliado en Firestore:', e);
  }

  try {
    const current = await getAliados();
    const filtered = current.filter(a => a.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

/**
 * Suscripción en tiempo real a la colección 'aliados' de Firestore
 */
export function subscribeToAliados(onUpdate: (aliados: MileniaAlly[]) => void) {
  try {
    const colRef = collection(db, 'aliados');
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({
        ...d.data(),
        id: d.id
      })) as MileniaAlly[];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      onUpdate(list);
    }, (err) => {
      console.warn('Snapshot listener en aliados:', err);
    });
  } catch (e) {
    console.warn('No se pudo iniciar listener en aliados:', e);
    return () => {};
  }
}
