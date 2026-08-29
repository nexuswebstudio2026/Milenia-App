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

const PRIMARY_COLLECTION = 'solicitudes_afiliados';
const SECONDARY_COLLECTION = 'solicitudes_afiliacion';

/**
 * Inicializa la tabla solicitudes_afiliados en Firebase si aún no existe
 */
export async function ensureSolicitudesAfiliadosTableInitialized(): Promise<void> {
  try {
    const colRef = collection(db, PRIMARY_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const demoId = 'solicitud_demo_inicial';
      const initialDoc: SolicitudAfiliacion = {
        id: demoId,
        name: 'Carlos Mendoza (Demo)',
        restaurantName: 'Asador Campestre San Juan',
        city: 'Pasto (Nariño)',
        phone: '+57 304 347 0984',
        email: 'nexuswebstudio2026@gmail.com',
        tablesCount: '10-20',
        systemType: 'Sistema Plus',
        planInterest: 'Plan Máximo Integral Milenia ($600.000 COP/mes)',
        message: 'Solicitud de demostración y activación para restaurante campestre',
        status: 'pendiente_registro',
        source: 'web_formulario_afiliacion',
        createdAt: new Date().toISOString(),
        aiSuggestedData: {
          legalName: 'Asador Campestre San Juan S.A.S.',
          cuisine: 'Parrilla & Carnes Finas',
          estimatedTables: 16,
          ownerName: 'Carlos Mendoza',
          ownerEmail: 'nexuswebstudio2026@gmail.com',
          ownerPhone: '+57 304 347 0984'
        }
      };
      await setDoc(doc(db, PRIMARY_COLLECTION, demoId), initialDoc, { merge: true });
      await setDoc(doc(db, SECONDARY_COLLECTION, demoId), initialDoc, { merge: true });
      console.log('✅ Tabla solicitudes_afiliados inicializada exitosamente en Firestore');
    }
  } catch (err) {
    console.warn('Advertencia inicializando tabla solicitudes_afiliados:', err);
  }
}

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
      legalName: data.restaurantName.trim().includes('S.A.S') ? data.restaurantName.trim() : `${data.restaurantName.trim()} S.A.S.`,
      cuisine: 'Gastronomía & Restaurante Aliado',
      estimatedTables: parseInt(data.tablesCount) || 12,
      ownerName: data.name.trim(),
      ownerEmail: data.email.trim(),
      ownerPhone: data.phone.trim()
    }
  };

  try {
    // Escribir en la tabla principal solicitudes_afiliados
    const docRef = doc(db, PRIMARY_COLLECTION, docId);
    await setDoc(docRef, payload, { merge: true });

    // También sincronizar en solicitudes_afiliacion
    const secRef = doc(db, SECONDARY_COLLECTION, docId);
    await setDoc(secRef, payload, { merge: true });

    console.log('✅ Solicitud guardada en Firestore en la tabla solicitudes_afiliados:', docId);
    return docId;
  } catch (error) {
    console.error('⚠️ Error al guardar solicitud de afiliación en Firestore:', error);
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
    let colRef = collection(db, PRIMARY_COLLECTION);
    let snap = await getDocs(colRef);
    if (snap.empty) {
      colRef = collection(db, SECONDARY_COLLECTION);
      snap = await getDocs(colRef);
    }
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
    const colRef = collection(db, PRIMARY_COLLECTION);
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
        console.warn('Snapshot error on solicitudes_afiliados, falling back:', err);
      }
    );
    return unsubscribe;
  } catch (error) {
    console.error('Error suscribiendo a solicitudes_afiliados:', error);
    return () => {};
  }
}
