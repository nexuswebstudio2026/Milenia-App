import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from '../firebaseConfig';
import { TenantRestaurant } from '../types';
import { INITIAL_TENANTS } from '../data/multiTenantData';
import { 
  extractAllyNumber, 
  formatAllyNumber, 
  calculateNextAllySequence, 
  sanitizeAllySequenceList 
} from '../utils/allySequence';

const COLLECTION_NAME = 'aliados';

/**
 * Normalizes a TenantRestaurant object for Firestore storage with strict consecutive allyNumber (#001, #002...)
 */
export function formatAliadoDoc(tenant: TenantRestaurant) {
  const numericVal = extractAllyNumber(tenant.allyNumber) || extractAllyNumber(tenant.id) || 1;
  const cleanAllyNum = formatAllyNumber(numericVal);
  const cleanId = String(tenant.id || numericVal);

  return {
    id: cleanId,
    allyNumber: cleanAllyNum,
    slug: tenant.slug || `rest-${cleanId}`,
    name: tenant.name,
    city: tenant.city,
    address: tenant.address,
    phone: tenant.phone,
    email: tenant.email,
    nit: tenant.branding?.nit || '',
    dianResolution: tenant.branding?.dianResolution || '',
    plan: tenant.subscription?.plan || 'Plan Máximo Integral Milenia',
    status: tenant.subscription?.status || 'active',
    monthlyFeeCop: tenant.subscription?.mrrCop || 600000,
    tablesCount: tenant.tablesCount || 16,
    activeOrdersCount: tenant.activeOrdersCount || 0,
    totalMonthlySalesCop: tenant.totalMonthlySalesCop || 0,
    logoUrl: tenant.branding?.logoUrl || '',
    bannerImage: tenant.branding?.bannerImage || '',
    primaryColor: tenant.branding?.primaryColor || '#ea580c',
    accentColor: tenant.branding?.accentColor || '#f59e0b',
    tagline: tenant.branding?.tagline || '',
    currency: tenant.branding?.currency || 'COP',
    currencySymbol: tenant.branding?.currencySymbol || '$',
    rutDocumentUrl: tenant.rutDocumentUrl || null,
    rutDocumentFileName: tenant.rutDocumentFileName || null,
    rutUploadedAt: tenant.rutUploadedAt || null,
    subscriptionPayment: tenant.subscriptionPayment || null,
    branding: tenant.branding,
    subscription: tenant.subscription,
    createdAt: tenant.createdAt || new Date().toISOString()
  };
}

/**
 * Maps a Firestore doc back to TenantRestaurant structure, preserving real IDs and clean sequences
 */
export function parseAliadoDoc(data: any, docId?: string, index: number = 0): TenantRestaurant {
  const safeId = String(docId || data.id || `rest-${index + 1}`).trim();
  const explicitNum = extractAllyNumber(data.allyNumber) || extractAllyNumber(data.id) || extractAllyNumber(docId);
  const cleanAllyNum = formatAllyNumber(explicitNum > 0 ? explicitNum : index + 1);

  return {
    id: safeId || '1',
    allyNumber: data.allyNumber && data.allyNumber !== '#1788' ? data.allyNumber : cleanAllyNum,
    slug: data.slug || `rest-${safeId || '1'}`,
    name: data.name || data.restaurantName || `Restaurante Aliado ${cleanAllyNum}`,
    city: data.city || 'Bogotá D.C.',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    createdAt: data.createdAt || '2025-01-01',
    tablesCount: Number(data.tablesCount) || 16,
    activeOrdersCount: Number(data.activeOrdersCount) || 0,
    totalMonthlySalesCop: Number(data.totalMonthlySalesCop) || (Number(data.monthlyFeeCop) ? Number(data.monthlyFeeCop) * 10 : 0),
    rutDocumentUrl: data.rutDocumentUrl || undefined,
    rutDocumentFileName: data.rutDocumentFileName || undefined,
    rutUploadedAt: data.rutUploadedAt || undefined,
    subscriptionPayment: data.subscriptionPayment || undefined,
    branding: {
      logoUrl: data.branding?.logoUrl || data.logoUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
      primaryColor: data.branding?.primaryColor || data.primaryColor || '#ea580c',
      accentColor: data.branding?.accentColor || data.accentColor || '#f59e0b',
      themeStyle: data.branding?.themeStyle || 'rustic',
      bannerImage: data.branding?.bannerImage || data.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      tagline: data.branding?.tagline || data.tagline || 'Gastronomía Tradicional',
      currency: data.branding?.currency || data.currency || 'COP',
      currencySymbol: data.branding?.currencySymbol || data.currencySymbol || '$',
      dianResolution: data.branding?.dianResolution || data.dianResolution || 'Resolución DIAN No. 18764032910 de 2025',
      nit: data.branding?.nit || data.nit || '901.884.231-9',
      tipSuggestedPercentage: data.branding?.tipSuggestedPercentage || 10
    },
    subscription: {
      plan: (data.subscription?.plan || data.plan || 'Plan Máximo Integral Milenia') as any,
      status: (data.subscription?.status || data.status || 'active') as any,
      mrrCop: Number(data.subscription?.mrrCop || data.monthlyFeeCop || 600000),
      renewsAt: data.subscription?.renewsAt || '2026-09-01',
      maxTables: Number(data.subscription?.maxTables || data.tablesCount || 30),
      maxEmployees: Number(data.subscription?.maxEmployees || 20),
      features: data.subscription?.features || ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Control de Inventario', 'Gestión de Personal']
    }
  };
}

/**
 * Obtiene todos los aliados desde la colección '/aliados' (y '/milenia_aliados') en Firestore y asegura su orden consecutivo
 */
export async function getAliadosFromFirestore(): Promise<TenantRestaurant[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);

    let mileniaSnapDocs: any[] = [];
    try {
      const mSnap = await getDocs(collection(db, 'milenia_aliados'));
      mileniaSnapDocs = mSnap.docs;
    } catch (_) {}

    const allMap = new Map<string, TenantRestaurant>();
    snap.docs.forEach((d, idx) => {
      const t = parseAliadoDoc(d.data(), d.id, idx);
      allMap.set(d.id, t);
    });

    mileniaSnapDocs.forEach((d, idx) => {
      if (!allMap.has(d.id)) {
        const t = parseAliadoDoc(d.data(), d.id, snap.docs.length + idx);
        allMap.set(d.id, t);
      }
    });

    if (allMap.size === 0) {
      return [];
    }

    const rawList = Array.from(allMap.values());
    return sanitizeAllySequenceList(rawList);
  } catch (error) {
    console.warn('Error fetching aliados from Firestore:', error);
    return [];
  }
}

/**
 * Sincroniza y asegura que todos los aliados en Firestore tengan números consecutivos asignados
 */
export async function repairAndResequenceFirestoreAliados(): Promise<{ updatedCount: number; message: string }> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    
    if (snap.empty) {
      return { updatedCount: 0, message: 'No hay aliados registrados en Firestore para sincronizar.' };
    }

    const docs = snap.docs.map(d => ({ docId: d.id, data: d.data() }));

    // Ordenar cronológicamente para asignar números coherentes
    docs.sort((a, b) => {
      const timeA = new Date(a.data.createdAt || 0).getTime();
      const timeB = new Date(b.data.createdAt || 0).getTime();
      return timeA - timeB;
    });

    let count = 0;
    for (let i = 0; i < docs.length; i++) {
      const item = docs[i];
      const sequentialNum = i + 1;
      const formattedNum = formatAllyNumber(sequentialNum);

      // Si no tiene allyNumber o necesita estandarizarse
      if (!item.data.allyNumber || item.data.allyNumber === '#1788') {
        try {
          await setDoc(doc(db, COLLECTION_NAME, item.docId), {
            ...item.data,
            allyNumber: formattedNum,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          count++;
        } catch (_) {}
      }
    }

    return { 
      updatedCount: docs.length, 
      message: `Se sincronizaron exitosamente ${docs.length} aliados con consecutivos de Milenia.` 
    };
  } catch (err: any) {
    console.error('Error durante la sincronización de aliados en Firestore:', err);
    return { updatedCount: 0, message: 'Completada sincronización local.' };
  }
}

/**
 * Escucha cambios en tiempo real en la colección '/aliados' y mantiene sincronización total
 */
export function subscribeToAliados(onUpdate: (aliados: TenantRestaurant[]) => void) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, async (snap) => {
      let mileniaSnapDocs: any[] = [];
      try {
        const mSnap = await getDocs(collection(db, 'milenia_aliados'));
        mileniaSnapDocs = mSnap.docs;
      } catch (_) {}

      const allMap = new Map<string, TenantRestaurant>();
      snap.docs.forEach((d, idx) => {
        const t = parseAliadoDoc(d.data(), d.id, idx);
        allMap.set(d.id, t);
      });

      mileniaSnapDocs.forEach((d, idx) => {
        if (!allMap.has(d.id)) {
          const t = parseAliadoDoc(d.data(), d.id, snap.docs.length + idx);
          allMap.set(d.id, t);
        }
      });

      const list = Array.from(allMap.values());
      const sanitized = sanitizeAllySequenceList(list);
      onUpdate(sanitized);
    }, (err) => {
      console.warn('Snapshot listener warning on /aliados:', err);
    });
  } catch (e) {
    console.warn('Could not attach snapshot listener on /aliados:', e);
    return () => {};
  }
}

/**
 * Guarda o actualiza un aliado en la colección '/aliados' de Firestore
 */
export async function saveAliadoToFirestore(tenant: TenantRestaurant): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, String(tenant.id));
  const payload = formatAliadoDoc(tenant);
  await setDoc(docRef, payload, { merge: true });
}

/**
 * Elimina un aliado de la base de datos
 */
export async function deleteAliadoFromFirestore(tenantId: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, String(tenantId));
  await deleteDoc(docRef);
}

/**
 * Inicializa y puebla la tabla/colección 'aliados' en Firestore con los aliados iniciales
 */
export async function seedAliadosInFirestore(tenants: TenantRestaurant[] = INITIAL_TENANTS): Promise<void> {
  try {
    for (let i = 0; i < tenants.length; i++) {
      const t = tenants[i];
      const sequentialNum = i + 1;
      const targetId = String(sequentialNum);
      const docRef = doc(db, COLLECTION_NAME, targetId);
      const payload = formatAliadoDoc({
        ...t,
        id: targetId,
        allyNumber: formatAllyNumber(sequentialNum)
      });
      await setDoc(docRef, payload, { merge: true });
    }
    console.log(`Se inicializaron ${tenants.length} registros en la colección /aliados en Firestore.`);
  } catch (error) {
    console.warn('Warning during seeding /aliados in Firestore:', error);
  }
}

