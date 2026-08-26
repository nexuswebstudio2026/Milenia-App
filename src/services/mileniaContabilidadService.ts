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

export type TransactionType = 'INGRESO' | 'GASTO';

export type TransactionCategory = 
  | 'SUSCRIPCION_SAAS' 
  | 'COMISION_VENTAS' 
  | 'INSTALACION_HARDWARE' 
  | 'SERVIDORES_CLOUD' 
  | 'SOPORTE_DIAN' 
  | 'NOMINA_EQUIPO' 
  | 'MARKETING_PAUTA' 
  | 'OTRO';

export interface MileniaTransaction {
  id: string;
  type: TransactionType;
  description: string;
  category: TransactionCategory;
  amountCop: number;
  date: string;
  restaurantId?: string;
  restaurantName?: string;
  paymentMethod: 'TRANSFERENCIA_BANCARIA' | 'PSE' | 'TARJETA_CREDITO' | 'EFECTIVO' | 'WOMPI';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export const INITIAL_TRANSACTIONS: MileniaTransaction[] = [
  {
    id: 'tx-001',
    type: 'INGRESO',
    description: 'Suscripción Mensual Plan Enterprise - Parrilla & Fuego Camilo',
    category: 'SUSCRIPCION_SAAS',
    amountCop: 499000,
    date: '2026-08-01',
    restaurantId: 'aliado-1',
    restaurantName: 'Parrilla & Fuego Camilo',
    paymentMethod: 'PSE',
    referenceNumber: 'REF-2026-0801-01',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'tx-002',
    type: 'INGRESO',
    description: 'Suscripción Mensual Plan Pro - Bella Italia Ristorante',
    category: 'SUSCRIPCION_SAAS',
    amountCop: 289000,
    date: '2026-08-03',
    restaurantId: 'aliado-2',
    restaurantName: 'Bella Italia Ristorante',
    paymentMethod: 'TRANSFERENCIA_BANCARIA',
    referenceNumber: 'REF-2026-0803-02',
    createdAt: '2026-08-03T11:20:00.000Z'
  },
  {
    id: 'tx-003',
    type: 'INGRESO',
    description: 'Suscripción Mensual Plan Pro - Burgers & Beers Craft',
    category: 'SUSCRIPCION_SAAS',
    amountCop: 289000,
    date: '2026-08-05',
    restaurantId: 'aliado-3',
    restaurantName: 'Burgers & Beers Craft',
    paymentMethod: 'WOMPI',
    referenceNumber: 'REF-2026-0805-03',
    createdAt: '2026-08-05T14:30:00.000Z'
  },
  {
    id: 'tx-004',
    type: 'GASTO',
    description: 'Infraestructura Cloud Firestore & Cloud Run Containers Google Cloud',
    category: 'SERVIDORES_CLOUD',
    amountCop: 380000,
    date: '2026-08-10',
    paymentMethod: 'TARJETA_CREDITO',
    referenceNumber: 'GCP-INV-89210',
    notes: 'Base de datos Firestore multi-tenant y microservicios POS en alta disponibilidad.',
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'tx-005',
    type: 'INGRESO',
    description: 'Suscripción Mensual Plan Pro - La Fogata Campestre',
    category: 'SUSCRIPCION_SAAS',
    amountCop: 289000,
    date: '2026-08-12',
    restaurantId: 'aliado-5',
    restaurantName: 'La Fogata Campestre',
    paymentMethod: 'PSE',
    referenceNumber: 'REF-2026-0812-05',
    createdAt: '2026-08-12T08:45:00.000Z'
  },
  {
    id: 'tx-006',
    type: 'GASTO',
    description: 'Proveedor de Certificados Digitales y Timbrado DIAN UBL 2.1',
    category: 'SOPORTE_DIAN',
    amountCop: 195000,
    date: '2026-08-15',
    paymentMethod: 'TRANSFERENCIA_BANCARIA',
    referenceNumber: 'DIAN-CERT-2026',
    notes: 'Paquete de 20,000 folios electrónicos y firma criptográfica.',
    createdAt: '2026-08-15T15:00:00.000Z'
  },
  {
    id: 'tx-007',
    type: 'INGRESO',
    description: 'Suscripción Mensual Plan Básico - Café & Bistro Macondo',
    category: 'SUSCRIPCION_SAAS',
    amountCop: 149000,
    date: '2026-08-18',
    restaurantId: 'aliado-4',
    restaurantName: 'Café & Bistro Macondo',
    paymentMethod: 'WOMPI',
    referenceNumber: 'REF-2026-0818-07',
    createdAt: '2026-08-18T16:10:00.000Z'
  },
  {
    id: 'tx-008',
    type: 'GASTO',
    description: 'Campaña de Adquisición Gastronómica Meta Ads Colombia',
    category: 'MARKETING_PAUTA',
    amountCop: 250000,
    date: '2026-08-20',
    paymentMethod: 'TARJETA_CREDITO',
    referenceNumber: 'FB-ADS-202608',
    notes: 'Generación de leads para nuevos restaurantes en Bogotá y Medellín.',
    createdAt: '2026-08-20T12:00:00.000Z'
  }
];

const LOCAL_STORAGE_KEY = 'milenia_contabilidad_cache_v1';

/**
 * Obtiene todas las transacciones de contabilidad desde Firestore
 */
export async function getContabilidad(): Promise<MileniaTransaction[]> {
  try {
    const colRef = collection(db, 'contabilidad');
    const snap = await getDocs(colRef);

    if (snap.empty) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
      return [];
    }

    const list = snap.docs.map(d => ({
      ...d.data(),
      id: d.id
    })) as MileniaTransaction[];
    // Ordenar por fecha descendente
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.warn('Error en getContabilidad desde Firestore:', e);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return [];
  }
}

/**
 * Registra una nueva transacción en Firestore colección 'contabilidad'
 */
export async function addTransaction(data: Omit<MileniaTransaction, 'id' | 'createdAt'>): Promise<MileniaTransaction> {
  const newTx: MileniaTransaction = {
    ...data,
    id: `tx-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, 'contabilidad', newTx.id), newTx);
  } catch (e) {
    console.warn('Error en addTransaction en Firestore:', e);
  }

  try {
    const current = await getContabilidad();
    current.unshift(newTx);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (_) {}

  return newTx;
}

/**
 * Actualiza una transacción en Firestore
 */
export async function updateTransaction(id: string, updates: Partial<MileniaTransaction>): Promise<void> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString()
  };

  try {
    const txDocRef = doc(db, 'contabilidad', id);
    await setDoc(txDocRef, payload, { merge: true });
  } catch (e) {
    console.warn('Error en updateTransaction en Firestore:', e);
  }

  try {
    const current = await getContabilidad();
    const idx = current.findIndex(t => t.id === id);
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...payload };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (_) {}
}

/**
 * Elimina una transacción de Firestore
 */
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const txDocRef = doc(db, 'contabilidad', id);
    await deleteDoc(txDocRef);
  } catch (e) {
    console.warn('Error en deleteTransaction en Firestore:', e);
  }

  try {
    const current = await getContabilidad();
    const filtered = current.filter(t => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  } catch (_) {}
}

/**
 * Suscripción en tiempo real a la colección 'contabilidad' de Firestore
 */
export function subscribeToContabilidad(onUpdate: (transactions: MileniaTransaction[]) => void) {
  try {
    const colRef = collection(db, 'contabilidad');
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({
        ...d.data(),
        id: d.id
      })) as MileniaTransaction[];
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      onUpdate(list);
    }, (err) => {
      console.warn('Snapshot listener en contabilidad:', err);
    });
  } catch (e) {
    console.warn('No se pudo iniciar listener en contabilidad:', e);
    return () => {};
  }
}
