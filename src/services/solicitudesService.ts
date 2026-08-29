import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  onSnapshot 
} from '../firebaseConfig';

export interface SolicitudAfiliacion {
  id?: string;
  name: string;
  restaurantName: string;
  city: string;
  phone: string;
  email: string;
  tablesCount: string;
  systemType: string;
  planInterest: string;
  message: string;
  status: 'pendiente_registro' | 'registrado' | 'contactado' | 'completado';
  source: string;
  createdAt: string;
  updatedAt?: string;
  aiSuggestedData?: {
    legalName?: string;
    cuisine?: string;
    estimatedTables?: number;
    ownerName?: string;
    ownerEmail?: string;
    ownerPhone?: string;
  };
}

const COLLECTION_NAME = 'solicitudes_afiliacion';

/**
 * Guarda una nueva solicitud de demostración o afiliación en Firestore
 */
export async function saveSolicitudAfiliacionToFirestore(data: Omit<SolicitudAfiliacion, 'id' | 'createdAt' | 'status'> & { id?: string }): Promise<string> {
  const docId = data.id || `solicitud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload: SolicitudAfiliacion = {
    id: docId,
    name: data.name.trim(),
    restaurantName: data.restaurantName.trim(),
    city: data.city.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    tablesCount: data.tablesCount || '10-20',
    systemType: data.systemType || 'Sistema Plus',
    planInterest: data.planInterest || 'Plan Máximo Integral Milenia ($600.000 COP/mes)',
    message: data.message ? data.message.trim() : '',
    status: 'pendiente_registro',
    source: 'web_formulario_afiliacion',
    createdAt: now,
    aiSuggestedData: {
      legalName: data.restaurantName.trim(),
      cuisine: 'Parrilla & Gastronomía Tradicional',
      estimatedTables: parseInt(data.tablesCount) || 12,
      ownerName: data.name.trim(),
      ownerEmail: data.email.trim(),
      ownerPhone: data.phone.trim()
    }
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, docId);
    await setDoc(docRef, payload, { merge: true });
    console.log('✅ Solicitud de demostración y afiliación guardada en Firestore:', docId);
    return docId;
  } catch (error) {
    console.error('⚠️ Error al guardar solicitud de afiliación en Firestore:', error);
    // Fallback local persistence si Firestore está temporalmente inaccesible
    try {
      const localKey = 'milenia_solicitudes_backup';
      const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
      existing.unshift(payload);
      localStorage.setItem(localKey, JSON.stringify(existing));
    } catch (e) {
      // ignore
    }
    return docId;
  }
}

/**
 * Obtiene todas las solicitudes de afiliación desde Firestore
 */
export async function getSolicitudesAfiliacionFromFirestore(): Promise<SolicitudAfiliacion[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const results: SolicitudAfiliacion[] = [];
    snap.forEach((d) => {
      results.push(d.data() as SolicitudAfiliacion);
    });
    // Ordenar de más reciente a más antiguo
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return results;
  } catch (error) {
    console.error('Error al obtener solicitudes de afiliación:', error);
    try {
      const localKey = 'milenia_solicitudes_backup';
      return JSON.parse(localStorage.getItem(localKey) || '[]');
    } catch {
      return [];
    }
  }
}

/**
 * Suscripción en tiempo real a las solicitudes de afiliación
 */
export function subscribeToSolicitudesAfiliacion(
  callback: (solicitudes: SolicitudAfiliacion[]) => void
): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const unsubscribe = onSnapshot(
      colRef,
      (snap) => {
        const results: SolicitudAfiliacion[] = [];
        snap.forEach((d) => {
          results.push(d.data() as SolicitudAfiliacion);
        });
        results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(results);
      },
      (err) => {
        console.warn('Snapshot error on solicitudes_afiliacion:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error suscribiendo a solicitudes_afiliacion:', error);
    return () => {};
  }
}
