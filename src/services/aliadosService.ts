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

const COLLECTION_NAME = 'aliados';

/**
 * Normalizes a TenantRestaurant object for Firestore storage
 */
export function formatAliadoDoc(tenant: TenantRestaurant) {
  return {
    id: String(tenant.id),
    slug: tenant.slug || `rest-${tenant.id}`,
    name: tenant.name,
    city: tenant.city,
    address: tenant.address,
    phone: tenant.phone,
    email: tenant.email,
    nit: tenant.branding?.nit || '',
    dianResolution: tenant.branding?.dianResolution || '',
    plan: tenant.subscription?.plan || 'pro',
    status: tenant.subscription?.status || 'active',
    tablesCount: tenant.tablesCount || 8,
    activeOrdersCount: tenant.activeOrdersCount || 0,
    totalMonthlySalesCop: tenant.totalMonthlySalesCop || 0,
    logoUrl: tenant.branding?.logoUrl || '',
    bannerImage: tenant.branding?.bannerImage || '',
    primaryColor: tenant.branding?.primaryColor || '#ea580c',
    accentColor: tenant.branding?.accentColor || '#f59e0b',
    tagline: tenant.branding?.tagline || '',
    currency: tenant.branding?.currency || 'COP',
    currencySymbol: tenant.branding?.currencySymbol || '$',
    branding: tenant.branding,
    subscription: tenant.subscription,
    createdAt: tenant.createdAt || new Date().toISOString()
  };
}

/**
 * Maps a Firestore doc back to TenantRestaurant structure
 */
export function parseAliadoDoc(data: any): TenantRestaurant {
  return {
    id: String(data.id),
    slug: data.slug || `rest-${data.id}`,
    name: data.name || 'Restaurante Aliado',
    city: data.city || 'Colombia',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    createdAt: data.createdAt || '2025-01-01',
    tablesCount: Number(data.tablesCount) || 8,
    activeOrdersCount: Number(data.activeOrdersCount) || 0,
    totalMonthlySalesCop: Number(data.totalMonthlySalesCop) || 0,
    branding: data.branding || {
      logoUrl: data.logoUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=200&q=80',
      primaryColor: data.primaryColor || '#ea580c',
      accentColor: data.accentColor || '#f59e0b',
      themeStyle: 'rustic',
      bannerImage: data.bannerImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      tagline: data.tagline || 'Gastronomía Tradicional',
      currency: 'COP',
      currencySymbol: '$',
      dianResolution: data.dianResolution || 'Resolución DIAN No. 18764032910 de 2025',
      nit: data.nit || '901.884.231-9',
      tipSuggestedPercentage: 10
    },
    subscription: data.subscription || {
      plan: data.plan || 'pro',
      status: data.status || 'active',
      mrrCop: 289000,
      renewsAt: '2026-09-01',
      maxTables: 20,
      maxEmployees: 10,
      features: ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR']
    }
  };
}

/**
 * Obtiene todos los aliados desde la colección '/aliados' en Firestore
 */
export async function getAliadosFromFirestore(): Promise<TenantRestaurant[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Auto seed initial tenants if collection is empty
      await seedAliadosInFirestore(INITIAL_TENANTS);
      return INITIAL_TENANTS;
    }
    return snap.docs.map(d => parseAliadoDoc(d.data()));
  } catch (error) {
    console.warn('Error fetching aliados from Firestore, using initial fallback:', error);
    return INITIAL_TENANTS;
  }
}

/**
 * Escucha cambios en tiempo real en la colección '/aliados'
 */
export function subscribeToAliados(onUpdate: (aliados: TenantRestaurant[]) => void) {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => parseAliadoDoc(d.data()));
        onUpdate(list);
      }
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
    for (const t of tenants) {
      const docRef = doc(db, COLLECTION_NAME, String(t.id));
      const payload = formatAliadoDoc(t);
      await setDoc(docRef, payload, { merge: true });
    }
    console.log(`Se inicializaron ${tenants.length} registros en la colección /aliados en Firestore.`);
  } catch (error) {
    console.warn('Warning during seeding /aliados in Firestore:', error);
  }
}
