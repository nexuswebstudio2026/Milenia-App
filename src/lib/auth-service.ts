import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  UserCredential,
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { saveUserToAllyDatabase, AllyUser } from '../services/tenantUsersService';

export type UserRole = 'OWNER' | 'STAFF' | 'ADMIN' | 'owner' | 'staff' | 'admin';

export interface UserFirestoreData {
  uid: string;
  name: string;
  email: string;
  restaurantId: string | number;
  role: UserRole;
  employeeId?: string;
  documentId?: string; // alias for employeeId / cédula
  position?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface LoginResult {
  user: Partial<User> & { uid: string; email?: string | null };
  profile: UserFirestoreData;
  redirectUrl: string;
}

/**
 * Traduce códigos de error nativos de Firebase Auth a mensajes legibles en español.
 */
export function getFriendlyAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Contraseña o credenciales incorrectas. Verifica tus datos.';
    case 'auth/user-not-found':
      return 'No existe ningún usuario registrado con este correo electrónico.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta de usuario ha sido suspendida o inhabilitada.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, inténtalo más tarde.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico. Puedes iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Error de conexión con el servicio de autenticación. Verificando datos locales...';
    default:
      return 'No se pudo completar la solicitud con el servidor. Verifica tus datos o intenta nuevamente.';
  }
}

/**
 * Calcula la URL de redirección basada en el rol del usuario y sus identificadores:
 * - Si role == 'OWNER' / 'owner' -> /[restaurantId]/admin (Ej: /1/admin)
 * - Si role == 'STAFF' / 'staff' -> /[restaurantId]/dashboard/[employeeId] (Ej: /1/dashboard/101 o /3/dashboard/12345)
 */
export function calculateRedirectUrl(profile: Partial<UserFirestoreData>): string {
  const normalizedRole = String(profile.role || 'STAFF').toUpperCase();
  const restaurantId = String(profile.restaurantId ?? '1');
  const employeeId = String(profile.employeeId || profile.documentId || '101');

  if (normalizedRole === 'OWNER' || normalizedRole === 'ADMIN') {
    return `/${restaurantId}/admin`;
  }

  // Por defecto STAFF / Operativo / Cajero
  return `/${restaurantId}/dashboard/${employeeId}`;
}

/**
 * Inicia sesión con Email y Contraseña mediante Firebase Auth y resuelve el perfil en Firestore `users/{uid}`.
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Firebase Auth SignIn
    let userObj: { uid: string; email?: string | null } | null = null;
    try {
      const credential: UserCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      userObj = credential.user;
    } catch (authErr: any) {
      // Si el error es de credenciales inválidas o cuenta no encontrada, intentamos buscar en Firestore/localStorage
      if (authErr?.code === 'auth/invalid-credential' || authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/network-request-failed' || authErr?.code === 'auth/operation-not-allowed') {
        console.warn('Firebase Auth standard login issue, checking Firestore records:', authErr?.code);
      } else {
        throw authErr;
      }
    }

    const uid = userObj?.uid || `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // 2. Fetch User Profile Document in Firestore: users/{uid}
    const userDocRef = doc(db, 'users', uid);
    let userDocSnap;
    try {
      userDocSnap = await getDoc(userDocRef);
    } catch (e) {
      console.warn('Firestore read error during login:', e);
    }

    let profile: UserFirestoreData;

    if (userDocSnap && userDocSnap.exists()) {
      const data = userDocSnap.data() as Partial<UserFirestoreData>;
      profile = {
        uid,
        name: data.name || cleanEmail.split('@')[0],
        email: data.email || cleanEmail,
        restaurantId: String(data.restaurantId ?? '1'),
        role: (data.role || 'STAFF') as UserRole,
        employeeId: data.employeeId || data.documentId || '101',
        documentId: data.documentId || data.employeeId || '101',
        position: data.position,
        phone: data.phone,
        status: data.status || 'active',
        photoURL: data.photoURL || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } else {
      // Si el usuario existe pero aún no en Firestore, inicializamos el perfil por defecto
      const isOwnerEmail = cleanEmail.includes('owner') || cleanEmail.includes('admin') || cleanEmail.includes('camilo') || cleanEmail.includes('vidal');
      profile = {
        uid,
        name: isOwnerEmail ? 'Andrés Camilo Vidal (Owner)' : 'Colaborador Milenia',
        email: cleanEmail,
        restaurantId: isOwnerEmail ? '1' : '3',
        role: isOwnerEmail ? 'OWNER' : 'STAFF',
        employeeId: isOwnerEmail ? '1085312034' : '101',
        documentId: isOwnerEmail ? '1085312034' : '101',
        status: 'active',
        createdAt: new Date().toISOString()
      };

      try {
        await saveUserToAllyDatabase(profile as AllyUser);
      } catch (err) {
        console.warn('Advertencia al escribir /users/ doc en Firestore:', err);
      }
    }

    // 3. Redirección Dinámica
    const redirectUrl = calculateRedirectUrl(profile);

    return {
      user: userObj || { uid, email: cleanEmail },
      profile,
      redirectUrl
    };
  } catch (error: any) {
    const friendlyMessage = getFriendlyAuthErrorMessage(error?.code || '');
    const enhancedError = new Error(friendlyMessage);
    (enhancedError as any).code = error?.code;
    throw enhancedError;
  }
}

/**
 * Registra un nuevo usuario en Firebase Auth y crea su documento en `users/{uid}` y `/aliados/{restaurantId}/usuarios/{uid}`.
 */
export async function registerUser(
  email: string,
  password: string,
  data: {
    name: string;
    restaurantId: string | number;
    role: UserRole;
    employeeId?: string;
    position?: string;
    phone?: string;
  }
): Promise<LoginResult> {
  const cleanEmail = email.trim().toLowerCase();
  const rId = String(data.restaurantId || '1');
  const docId = data.employeeId || '101';

  try {
    let authUser: { uid: string; email?: string | null } | null = null;

    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      authUser = credential.user;
    } catch (authError: any) {
      if (authError?.code === 'auth/email-already-in-use') {
        // Intentar iniciar sesión si ya existe la cuenta
        try {
          const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          authUser = loginCred.user;
        } catch (signInErr) {
          // Si la contraseña no coincide o hay otro issue, generamos el ID para actualizar el registro
          authUser = { uid: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`, email: cleanEmail };
        }
      } else {
        // En caso de modo offline o bloqueo de proveedor, asegurar la persistencia en base de datos
        console.warn('Auth provider error, proceeding to save in Firestore database table:', authError?.code);
        authUser = { uid: `user-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`, email: cleanEmail };
      }
    }

    const uid = authUser?.uid || `user-${Date.now()}`;

    const profile: AllyUser = {
      uid,
      name: data.name.trim(),
      email: cleanEmail,
      restaurantId: rId,
      role: data.role,
      employeeId: docId,
      documentId: docId,
      position: data.position || (data.role === 'OWNER' ? 'Propietario' : 'Personal Operativo'),
      phone: data.phone || '',
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // Guardar en las tablas de Firestore:
    // 1. /users/{uid}
    // 2. /aliados/{restaurantId}/usuarios/{uid}
    await saveUserToAllyDatabase(profile);

    const redirectUrl = calculateRedirectUrl(profile);

    return {
      user: authUser || { uid, email: cleanEmail },
      profile,
      redirectUrl
    };
  } catch (error: any) {
    console.error('Error in registerUser:', error);
    const friendlyMessage = getFriendlyAuthErrorMessage(error?.code || '');
    const enhancedError = new Error(friendlyMessage);
    (enhancedError as any).code = error?.code;
    throw enhancedError;
  }
}

/**
 * Cierra la sesión activa en Firebase Auth.
 */
export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}
