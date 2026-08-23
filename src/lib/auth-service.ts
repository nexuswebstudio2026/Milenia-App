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
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface LoginResult {
  user: User;
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
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'Error de conexión a internet. Comprueba tu red.';
    default:
      return 'Ocurrió un error en la autenticación. Por favor, intenta de nuevo.';
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
  try {
    // 1. Firebase Auth SignIn
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    // 2. Fetch User Profile Document in Firestore: users/{uid}
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let profile: UserFirestoreData;

    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as Partial<UserFirestoreData>;
      profile = {
        uid: user.uid,
        name: data.name || user.displayName || email.split('@')[0],
        email: data.email || user.email || email,
        restaurantId: String(data.restaurantId ?? '1'),
        role: (data.role || 'STAFF') as UserRole,
        employeeId: data.employeeId || data.documentId || '101',
        documentId: data.documentId || data.employeeId || '101',
        position: data.position,
        phone: data.phone,
        photoURL: data.photoURL || user.photoURL || undefined,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      };
    } else {
      // Si el usuario existe en Auth pero aún no en Firestore, inicializamos el perfil por defecto
      const isOwnerEmail = email.toLowerCase().includes('owner') || email.toLowerCase().includes('admin') || email.toLowerCase().includes('camilo');
      profile = {
        uid: user.uid,
        name: user.displayName || (isOwnerEmail ? 'Propietario Restaurante' : 'Colaborador Milenia'),
        email: user.email || email,
        restaurantId: '1',
        role: isOwnerEmail ? 'OWNER' : 'STAFF',
        employeeId: isOwnerEmail ? undefined : '101',
        documentId: isOwnerEmail ? undefined : '101',
        createdAt: new Date().toISOString()
      };

      try {
        await setDoc(userDocRef, {
          ...profile,
          createdAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.warn('Advertencia al escribir /users/ doc en Firestore:', err);
      }
    }

    // 3. Redirección Dinámica
    const redirectUrl = calculateRedirectUrl(profile);

    return {
      user,
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
 * Registra un nuevo usuario en Firebase Auth y crea su documento en `users/{uid}`.
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
  }
): Promise<LoginResult> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = credential.user;

    const profile: UserFirestoreData = {
      uid: user.uid,
      name: data.name,
      email: user.email || email,
      restaurantId: String(data.restaurantId),
      role: data.role,
      employeeId: data.employeeId || '101',
      documentId: data.employeeId || '101',
      position: data.position || (data.role === 'OWNER' ? 'Propietario' : 'Personal Operativo'),
      createdAt: new Date().toISOString()
    };

    // Guardar en Firestore: users/{uid}
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      ...profile,
      createdAt: serverTimestamp()
    });

    const redirectUrl = calculateRedirectUrl(profile);

    return {
      user,
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
 * Cierra la sesión activa en Firebase Auth.
 */
export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}
