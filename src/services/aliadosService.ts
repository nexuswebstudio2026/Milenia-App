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
 * Maps a Firestore doc back to TenantRestaurant structure, normalizing any old timestamp IDs (like 1788)
 */
export function parseAliadoDoc(data: any): TenantRestaurant {
  const rawId = String(data.id || '');
  const numeric = extractAllyNumber(data.allyNumber) || extractAllyNumber(rawId) || 1;
  const cleanAllyNum = formatAllyNumber(numeric);
  const safeId = numeric > 0 && numeric < 1000 ? String(numeric) : (rawId && !rawId.startsWith('aliado-17') && rawId !== '1788' ? rawId : String(numeric));

  return {
    id: safeId || '1',
    allyNumber: cleanAllyNum,
    slug: data.slug || `rest-${safeId || '1'}`,
    name: data.name || 'Restaurante Aliado',
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
 * Obtiene todos los aliados desde la colección '/aliados' en Firestore y asegura su orden consecutivo
 */
export async function getAliadosFromFirestore(): Promise<TenantRestaurant[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }
    const rawList = snap.docs.map(d => parseAliadoDoc({ ...d.data(), id: d.id }));
    return sanitizeAllySequenceList(rawList);
  } catch (error) {
    console.warn('Error fetching aliados from Firestore:', error);
    return [];
  }
}

/**
 * Corrige y re-indexa la colección '/aliados' en Firestore para que todos los aliados
 * tengan números consecutivos reales (1, 2, 3...) sin identificadores residuales o timestamps.
 */
export async function repairAndResequenceFirestoreAliados(): Promise<{ updatedCount: number; message: string }> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    
    if (snap.empty) {
      return { updatedCount: 0, message: 'No hay aliados registrados en Firestore para re-indexar.' };
    }

    const docs = snap.docs.map(d => ({ docId: d.id, data: d.data() }));
    
    // Si solo hay 1 aliado registrado, forzarlo a ser el Aliado #001
    if (docs.length === 1) {
      const single = docs[0];
      const fixedData = {
        ...single.data,
        id: '1',
        allyNumber: '#001',
        updatedAt: new Date().toISOString()
      };
      
      // Guardar en doc '1'
      await setDoc(doc(db, COLLECTION_NAME, '1'), fixedData, { merge: true });
      
      // Si el id del doc original no era '1' (ej: '1788' o 'aliado-1788...'), eliminar el documento antiguo
      if (single.docId !== '1') {
        try {
          await deleteDoc(doc(db, COLLECTION_NAME, single.docId));
        } catch (_) {}
      }
      
      return { updatedCount: 1, message: 'Se corrigió el aliado a Aliado #001 en la base de datos Firestore exitosamente.' };
    }

    // Si hay múltiples aliados, ordenarlos cronológicamente y asignar consecutivos 1, 2, 3...
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
      const targetId = String(sequentialNum);

      const fixedPayload = {
        ...item.data,
        id: targetId,
        allyNumber: formattedNum,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, COLLECTION_NAME, targetId), fixedPayload, { merge: true });
      
      if (item.docId !== targetId) {
        try {
          await deleteDoc(doc(db, COLLECTION_NAME, item.docId));
        } catch (_) {}
      }
      count++;
    }

    return { updatedCount: count, message: `Se re-indexaron exitosamente ${count} aliados con consecutivos estrictos (1, 2, 3...).` };
  } catch (err: any) {
    console.error('Error durante la reparación de consecutivos en Firestore:', err);
    throw new Error(`Fallo al corregir consecutivos en base de datos: ${err.message || err}`);
  }
}

/**
 * Escucha cambios en tiempo real en la colección '/aliados'
 */
export function subscribeToAliados(onUpdate: (aliados: TenantRestaurant[]) => void) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => parseAliadoDoc({ ...d.data(), id: d.id }));
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

