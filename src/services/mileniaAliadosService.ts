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
import { 
  extractAllyNumber, 
  formatAllyNumber, 
  calculateNextAllySequence, 
  sanitizeAllySequenceList 
} from '../utils/allySequence';

export type AllyPlan = 'Plan Máximo Integral Milenia' | 'Máximo Integral' | 'Pro' | 'Básico' | 'Enterprise';
export type AllyStatus = 'Activo' | 'Inactivo' | 'Pendiente';

export interface MileniaAlly {
  id: string;
  allyNumber?: string;
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
    id: '1',
    allyNumber: '#001',
    name: 'Parrilla & Fuego Camilo',
    nit: '901.450.888-1',
    city: 'Bogotá D.C.',
    address: 'Calle 93 # 12-45, Chicó',
    phone: '+57 304 347 0984',
    email: 'camilovidal.1704@gmail.com',
    plan: 'Plan Máximo Integral Milenia',
    status: 'Activo',
    monthlyFeeCop: 600000,
    tablesCount: 24,
    contactName: 'Andrés Camilo Vidal',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: '2',
    allyNumber: '#002',
    name: 'Bella Italia Ristorante',
    nit: '900.872.101-3',
    city: 'Medellín',
    address: 'Carrera 35 # 8A-20, El Poblado',
    phone: '+57 315 889 0011',
    email: 'admin@bellaitalia.co',
    plan: 'Plan Máximo Integral Milenia',
    status: 'Activo',
    monthlyFeeCop: 600000,
    tablesCount: 18,
    contactName: 'Marco Bellini',
    createdAt: '2026-02-10T10:30:00.000Z'
  },
  {
    id: '3',
    allyNumber: '#003',
    name: 'Burgers & Beers Craft',
    nit: '901.223.456-7',
    city: 'Cali',
    address: 'Av 9N # 14-32, Granada',
    phone: '+57 312 400 9988',
    email: 'gerencia@burgersbeers.co',
    plan: 'Plan Máximo Integral Milenia',
    status: 'Activo',
    monthlyFeeCop: 600000,
    tablesCount: 16,
    contactName: 'Alejandro Restrepo',
    createdAt: '2026-03-01T14:15:00.000Z'
  },
  {
    id: '4',
    allyNumber: '#004',
    name: 'Café & Bistro Macondo',
    nit: '900.654.321-9',
    city: 'Cartagena',
    address: 'Calle de la Mantilla # 3-18',
    phone: '+57 300 765 4321',
    email: 'hola@macondobistro.co',
    plan: 'Plan Máximo Integral Milenia',
    status: 'Activo',
    monthlyFeeCop: 600000,
    tablesCount: 10,
    contactName: 'Sofía Montoya',
    createdAt: '2026-03-20T09:00:00.000Z'
  },
  {
    id: '5',
    allyNumber: '#005',
    name: 'La Fogata Campestre',
    nit: '901.987.654-2',
    city: 'Bucaramanga',
    address: 'Km 7 Vía Ruitoque Alto',
    phone: '+57 318 450 1192',
    email: 'info@lafogatacampestre.co',
    plan: 'Plan Máximo Integral Milenia',
    status: 'Activo',
    monthlyFeeCop: 600000,
    tablesCount: 22,
    contactName: 'Miguel Ángel Narváez',
    createdAt: '2026-04-05T16:20:00.000Z'
  }
];

const LOCAL_STORAGE_KEY = 'milenia_aliados_cache_v1';

/**
 * Normaliza un documento Firestore a la interfaz MileniaAlly con consecutivo estricto (#001, #002...)
 */
export function parseMileniaAllyDoc(id: string, data: any): MileniaAlly {
  const rawId = String(id || data.id || '');
  const numeric = extractAllyNumber(data.allyNumber) || extractAllyNumber(rawId) || 1;
  const cleanAllyNum = formatAllyNumber(numeric);
  const safeId = numeric > 0 && numeric < 1000 ? String(numeric) : (rawId && !rawId.startsWith('aliado-17') && rawId !== '1788' ? rawId : String(numeric));

  return {
    id: safeId,
    allyNumber: cleanAllyNum,
    name: data.name || 'Restaurante Aliado',
    nit: data.nit || data.branding?.nit || '901.000.000-1',
    city: data.city || 'Bogotá D.C.',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    plan: data.plan || data.subscription?.plan || 'Plan Máximo Integral Milenia',
    status: data.status || data.subscription?.status || 'Activo',
    monthlyFeeCop: Number(data.monthlyFeeCop || data.subscription?.mrrCop || 600000),
    tablesCount: Number(data.tablesCount || 16),
    contactName: data.contactName || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt
  };
}

/**
 * Obtiene todos los aliados desde Firestore colección 'aliados' garantizando consecutivos
 */
export async function getAliados(): Promise<MileniaAlly[]> {
  try {
    const colRef = collection(db, 'aliados');
    const snap = await getDocs(colRef);

    if (snap.empty) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const list = snap.docs.map(d => parseMileniaAllyDoc(d.id, d.data()));
    const sanitized = sanitizeAllySequenceList(list);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    return sanitized;
  } catch (e) {
    console.warn('Error en getAliados desde Firestore:', e);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return sanitizeAllySequenceList(JSON.parse(cached));
    } catch (_) {}
    return [];
  }
}

/**
 * Crea un nuevo aliado en Firestore colección 'aliados' con número consecutivo calculado (1, 2, 3...)
 */
export async function addAliado(allyData: Omit<MileniaAlly, 'id' | 'createdAt'> & { id?: string }): Promise<MileniaAlly> {
  // Obtener aliados actuales para calcular el siguiente consecutivo real
  const currentList = await getAliados();
  const sequenceInfo = calculateNextAllySequence(currentList);

  const finalId = allyData.id && !allyData.id.startsWith('aliado-17') && allyData.id !== '1788' 
    ? allyData.id.trim() 
    : sequenceInfo.nextId;
    
  const allyNum = allyData.allyNumber && allyData.allyNumber !== '#1788' && extractAllyNumber(allyData.allyNumber) > 0
    ? formatAllyNumber(extractAllyNumber(allyData.allyNumber))
    : sequenceInfo.nextAllyNumber;

  const newAlly: MileniaAlly = {
    ...allyData,
    id: finalId,
    allyNumber: allyNum,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'aliados', newAlly.id), {
      ...newAlly,
      branding: {
        nit: newAlly.nit,
        tagline: 'Gastronomía Tradicional',
        currency: 'COP',
        currencySymbol: '$',
        primaryColor: '#ea580c',
        accentColor: '#f59e0b',
        themeStyle: 'rustic',
        logoUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        dianResolution: 'Resolución DIAN No. 18764032910 de 2025'
      },
      subscription: {
        plan: newAlly.plan,
        status: newAlly.status === 'Activo' ? 'active' : 'suspended',
        mrrCop: newAlly.monthlyFeeCop,
        renewsAt: '2026-09-01',
        maxTables: newAlly.tablesCount || 30,
        maxEmployees: 20
      }
    }, { merge: true });
  } catch (e) {
    console.warn('Error en addAliado en Firestore:', e);
  }

  try {
    const updated = await getAliados();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}

  return newAlly;
}

/**
 * Actualiza un aliado existente en Firestore colección 'aliados' (updateDoc / setDoc)
 */
export async function updateAliado(id: string, updates: Partial<MileniaAlly>): Promise<void> {
  const numeric = extractAllyNumber(updates.allyNumber) || extractAllyNumber(id) || 1;
  const cleanNumber = formatAllyNumber(numeric);

  const payload: any = {
    ...updates,
    allyNumber: cleanNumber,
    updatedAt: new Date().toISOString()
  };

  if (updates.nit) {
    payload['branding.nit'] = updates.nit;
  }
  if (updates.monthlyFeeCop) {
    payload['subscription.mrrCop'] = updates.monthlyFeeCop;
  }
  if (updates.plan) {
    payload['subscription.plan'] = updates.plan;
  }
  if (updates.tablesCount) {
    payload['tablesCount'] = updates.tablesCount;
    payload['subscription.maxTables'] = updates.tablesCount;
  }

  try {
    const allyDocRef = doc(db, 'aliados', id);
    await setDoc(allyDocRef, payload, { merge: true });
  } catch (e) {
    console.warn('Error en updateAliado en Firestore:', e);
  }

  try {
    const current = await getAliados();
    const idx = current.findIndex(a => a.id === id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...updates, allyNumber: cleanNumber, updatedAt: payload.updatedAt };
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
      const list = snap.docs.map(d => parseMileniaAllyDoc(d.id, d.data()));
      const sanitized = sanitizeAllySequenceList(list);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
      onUpdate(sanitized);
    }, (err) => {
      console.warn('Snapshot listener en aliados:', err);
    });
  } catch (e) {
    console.warn('No se pudo iniciar listener en aliados:', e);
    return () => {};
  }
}

