import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  where,
  serverTimestamp
} from '../firebaseConfig';
import { UserRole } from '../lib/auth-service';

export interface AllyUser {
  uid: string;
  name: string;
  email: string;
  restaurantId: string;
  role: UserRole;
  employeeId: string;
  documentId: string; // Cédula de ciudadanía / Documento de identidad
  position: string;
  phone?: string;
  status: 'active' | 'inactive';
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export const INITIAL_ALLY_USERS: AllyUser[] = [
  {
    uid: 'camilo-owner-1',
    name: 'Andrés Camilo Vidal Canchón',
    email: 'camilovidal.1704@gmail.com',
    restaurantId: '1',
    role: 'OWNER',
    employeeId: '1085312034',
    documentId: '1085312034',
    position: 'Propietario & Gerente General',
    phone: '+57 304 347 0984',
    status: 'active',
    createdAt: '2025-01-10T08:00:00.000Z'
  },
  {
    uid: 'miguel-owner-5',
    name: 'Miguel Ángel Narváez',
    email: 'miguel.owner@milenia.co',
    restaurantId: '5',
    role: 'OWNER',
    employeeId: '80992314',
    documentId: '80992314',
    position: 'Propietario & Chef Ejecutivo',
    phone: '+57 318 450 1192',
    status: 'active',
    createdAt: '2025-02-01T09:00:00.000Z'
  },
  {
    uid: 'alejandro-staff-3',
    name: 'Alejandro Restrepo',
    email: 'alejandro.cajero@milenia.co',
    restaurantId: '3',
    role: 'STAFF',
    employeeId: '12345',
    documentId: '12345',
    position: 'Cajero Principal & Atención',
    phone: '+57 312 908 4411',
    status: 'active',
    createdAt: '2025-02-15T14:30:00.000Z'
  },
  {
    uid: 'daniela-staff-1',
    name: 'Daniela Morales Pantoja',
    email: 'daniela.mesera@milenia.co',
    restaurantId: '1',
    role: 'STAFF',
    employeeId: '1085201',
    documentId: '1085201',
    position: 'Capitana de Meseros',
    phone: '+57 315 220 8910',
    status: 'active',
    createdAt: '2025-02-20T10:15:00.000Z'
  },
  {
    uid: 'esteban-staff-2',
    name: 'Esteban Caicedo',
    email: 'esteban.cocina@milenia.co',
    restaurantId: '2',
    role: 'STAFF',
    employeeId: '98402',
    documentId: '98402',
    position: 'Jefe de Cocina (KDS)',
    phone: '+57 301 776 5432',
    status: 'active',
    createdAt: '2025-03-01T11:00:00.000Z'
  }
];

/**
 * Guarda o registra un usuario en las tablas de Firestore:
 * 1. Colección global: `/users/{uid}`
 * 2. Subcolección del Aliado: `/aliados/{restaurantId}/usuarios/{uid}`
 */
export async function saveUserToAllyDatabase(user: AllyUser): Promise<void> {
  const restId = String(user.restaurantId);
  const userUid = user.uid;

  const payload = {
    ...user,
    restaurantId: restId,
    updatedAt: new Date().toISOString()
  };

  try {
    // 1. Guardar en /users/{uid}
    const globalUserDocRef = doc(db, 'users', userUid);
    await setDoc(globalUserDocRef, payload, { merge: true });

    // 2. Guardar en /aliados/{restaurantId}/usuarios/{uid}
    const allyUserDocRef = doc(db, 'aliados', restId, 'usuarios', userUid);
    await setDoc(allyUserDocRef, payload, { merge: true });

    // Guardar también en localStorage para caché inmediata
    const stored = getLocalAllyUsers(restId);
    const existingIdx = stored.findIndex(u => u.uid === userUid || u.email === user.email);
    if (existingIdx >= 0) {
      stored[existingIdx] = payload;
    } else {
      stored.push(payload);
    }
    localStorage.setItem(`milenia_ally_users_${restId}`, JSON.stringify(stored));
  } catch (error) {
    console.warn('Error saving user to Firestore collections:', error);
    // Fallback local storage
    const stored = getLocalAllyUsers(restId);
    const existingIdx = stored.findIndex(u => u.uid === userUid || u.email === user.email);
    if (existingIdx >= 0) {
      stored[existingIdx] = payload;
    } else {
      stored.push(payload);
    }
    localStorage.setItem(`milenia_ally_users_${restId}`, JSON.stringify(stored));
  }
}

/**
 * Helper para obtener usuarios cacheados localmente por aliado
 */
function getLocalAllyUsers(restaurantId: string): AllyUser[] {
  try {
    const raw = localStorage.getItem(`milenia_ally_users_${restaurantId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return INITIAL_ALLY_USERS.filter(u => String(u.restaurantId) === String(restaurantId));
}

/**
 * Obtiene la lista de usuarios registrados para un Aliado específico desde Firestore
 */
export async function getAllyUsers(restaurantId: string | number): Promise<AllyUser[]> {
  const rId = String(restaurantId);
  try {
    // Intentar leer desde la subcolección /aliados/{restaurantId}/usuarios
    const colRef = collection(db, 'aliados', rId, 'usuarios');
    const snap = await getDocs(colRef);

    if (!snap.empty) {
      const list = snap.docs.map(d => d.data() as AllyUser);
      localStorage.setItem(`milenia_ally_users_${rId}`, JSON.stringify(list));
      return list;
    }

    // Si la subcolección está vacía, consultar la colección global /users filtrando por restaurantId
    const globalUsersRef = collection(db, 'users');
    const q = query(globalUsersRef, where('restaurantId', '==', rId));
    const globalSnap = await getDocs(q);

    if (!globalSnap.empty) {
      const list = globalSnap.docs.map(d => d.data() as AllyUser);
      // Auto poblar la subcolección
      for (const u of list) {
        await setDoc(doc(db, 'aliados', rId, 'usuarios', u.uid), u, { merge: true });
      }
      localStorage.setItem(`milenia_ally_users_${rId}`, JSON.stringify(list));
      return list;
    }

    // Poblar usuarios iniciales para este aliado si está vacío
    const initialForTenant = INITIAL_ALLY_USERS.filter(u => String(u.restaurantId) === rId);
    if (initialForTenant.length > 0) {
      for (const u of initialForTenant) {
        await saveUserToAllyDatabase(u);
      }
      return initialForTenant;
    }

    return getLocalAllyUsers(rId);
  } catch (err) {
    console.warn(`Error fetching users for ally ${rId}:`, err);
    return getLocalAllyUsers(rId);
  }
}

/**
 * Suscripción en tiempo real a los usuarios de un aliado
 */
export function subscribeToAllyUsers(
  restaurantId: string | number,
  onUpdate: (users: AllyUser[]) => void
) {
  const rId = String(restaurantId);
  try {
    const colRef = collection(db, 'aliados', rId, 'usuarios');
    return onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const list = snap.docs.map(d => d.data() as AllyUser);
        onUpdate(list);
      }
    }, (err) => {
      console.warn('Snapshot listener error on ally users:', err);
    });
  } catch (e) {
    console.warn('Could not attach snapshot to ally users:', e);
    return () => {};
  }
}

/**
 * Elimina un usuario de un aliado en Firestore
 */
export async function deleteAllyUser(restaurantId: string | number, uid: string): Promise<void> {
  const rId = String(restaurantId);
  try {
    await deleteDoc(doc(db, 'aliados', rId, 'usuarios', uid));
    await deleteDoc(doc(db, 'users', uid));
  } catch (e) {
    console.warn('Error deleting user from Firestore:', e);
  }

  const stored = getLocalAllyUsers(rId).filter(u => u.uid !== uid);
  localStorage.setItem(`milenia_ally_users_${rId}`, JSON.stringify(stored));
}

/**
 * Inicializa la tabla de usuarios en Firestore para todos los aliados
 */
export async function seedAllAllyUsersInFirestore(): Promise<void> {
  try {
    for (const u of INITIAL_ALLY_USERS) {
      await saveUserToAllyDatabase(u);
    }
  } catch (e) {
    console.warn('Seed ally users error:', e);
  }
}
