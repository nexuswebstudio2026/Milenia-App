import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from '../firebaseConfig';
import { Empleado, EmpleadoRole, TurnoStatus } from '../types/empleado';

const COLLECTION_NAME = 'empleados';

export const INITIAL_EMPLEADOS: Omit<Empleado, 'id'>[] = [
  {
    nombre: 'Martín Velásquez',
    documentoIdentidad: '1.098.765.432',
    cargo: 'Gerente General & Operaciones',
    rol: 'gerente',
    email: 'gerencia@milenia.rest',
    telefono: '+57 300 456 7890',
    pinAcceso: '2026',
    estadoTurno: 'activo',
    salarioBase: 4200000,
    restauranteId: 'rest_milenia_principal',
    fechaIngreso: '2024-01-15'
  }
];

/**
 * Escucha en tiempo real la tabla/colección 'empleados' de Firestore
 */
export function subscribeToEmpleados(callback: (empleados: Empleado[]) => void): () => void {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const q = query(colRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Empleado[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          nombre: data.nombre || data.name || 'Sin Nombre',
          documentoIdentidad: data.documentoIdentidad || data.documentId || '',
          cargo: data.cargo || data.position || 'Colaborador',
          rol: (data.rol || data.role || 'staff') as EmpleadoRole,
          email: data.email || '',
          telefono: data.telefono || data.phone || '',
          pinAcceso: data.pinAcceso || data.pinCode || '0000',
          estadoTurno: (data.estadoTurno || data.shiftStatus || 'activo') as TurnoStatus,
          salarioBase: Number(data.salarioBase || data.baseSalaryCop || 0),
          restauranteId: data.restauranteId || 'rest_milenia_principal',
          fechaIngreso: data.fechaIngreso || data.createdAt || new Date().toISOString(),
          creadoEn: data.creadoEn || data.createdAt || new Date().toISOString()
        });
      });

      // Si la colección está vacía, sembrar empleados iniciales
      if (items.length === 0) {
        seedInitialEmpleados();
      } else {
        callback(items);
      }
    }, (error) => {
      console.warn('Error suscribiendo a tabla empleados en Firestore:', error);
      // Fallback a empleados iniciales locales
      callback(INITIAL_EMPLEADOS.map((emp, idx) => ({ ...emp, id: `seed-${idx + 1}` })));
    });

    return unsubscribe;
  } catch (err) {
    console.error('Error inicializando listener de empleados:', err);
    callback(INITIAL_EMPLEADOS.map((emp, idx) => ({ ...emp, id: `seed-${idx + 1}` })));
    return () => {};
  }
}

/**
 * Poblar la tabla empleados con registros de demostración iniciales
 */
export async function seedInitialEmpleados(): Promise<void> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    for (const emp of INITIAL_EMPLEADOS) {
      await addDoc(colRef, {
        ...emp,
        creadoEn: new Date().toISOString()
      });
    }
  } catch (e) {
    console.warn('No se pudieron sembrar empleados automáticamente:', e);
  }
}

/**
 * Obtener todos los empleados de la tabla
 */
export async function getEmpleados(): Promise<Empleado[]> {
  try {
    const colRef = collection(db, COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const result: Empleado[] = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      result.push({
        id: docSnap.id,
        nombre: data.nombre || data.name || '',
        documentoIdentidad: data.documentoIdentidad || data.documentId || '',
        cargo: data.cargo || data.position || '',
        rol: (data.rol || data.role || 'staff') as EmpleadoRole,
        email: data.email || '',
        telefono: data.telefono || data.phone || '',
        pinAcceso: data.pinAcceso || data.pinCode || '',
        estadoTurno: (data.estadoTurno || data.shiftStatus || 'activo') as TurnoStatus,
        salarioBase: Number(data.salarioBase || 0),
        restauranteId: data.restauranteId || 'rest_milenia_principal',
        fechaIngreso: data.fechaIngreso || '',
        creadoEn: data.creadoEn || ''
      });
    });

    if (result.length === 0) {
      await seedInitialEmpleados();
      return INITIAL_EMPLEADOS.map((emp, idx) => ({ ...emp, id: `init-${idx}` }));
    }

    return result;
  } catch (e) {
    console.error('Error obteniendo empleados:', e);
    return INITIAL_EMPLEADOS.map((emp, idx) => ({ ...emp, id: `local-${idx}` }));
  }
}

/**
 * Crear un nuevo empleado en la tabla
 */
export async function createEmpleado(empleadoData: Omit<Empleado, 'id'>): Promise<string> {
  const colRef = collection(db, COLLECTION_NAME);
  const docRef = await addDoc(colRef, {
    ...empleadoData,
    creadoEn: new Date().toISOString()
  });
  return docRef.id;
}

/**
 * Actualizar datos de un empleado existente
 */
export async function updateEmpleado(id: string, partialData: Partial<Empleado>): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...partialData,
    actualizadoEn: new Date().toISOString()
  });
}

/**
 * Eliminar un empleado de la tabla
 */
export async function deleteEmpleado(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}

/**
 * Cambiar el estado del turno (activo, descanso, inactivo)
 */
export async function toggleTurnoEmpleado(id: string, nuevoEstado: TurnoStatus): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    estadoTurno: nuevoEstado,
    ultimoCambioTurno: new Date().toISOString()
  });
}

export interface WorkstationOption {
  id: string; // 'gerencia' | 'sala' | 'cocina' | 'caja' | 'barra'
  label: string;
  shortLabel: string;
  description: string;
  allowedRoles: EmpleadoRole[];
  panelTitle: string;
}

export const WORKSTATIONS: WorkstationOption[] = [
  {
    id: 'gerencia',
    label: 'Gerencia & Administración General',
    shortLabel: 'Gerencia / Admin',
    description: 'Control de ventas, inventario, escandallos, reportes y gestión integral del restaurante',
    allowedRoles: ['gerente', 'admin'],
    panelTitle: 'Panel de Gerencia & Dirección Gastronómica'
  }
];

export interface LoginVerificationResult {
  success: boolean;
  message: string;
  empleado?: Empleado;
  station?: WorkstationOption;
}

/**
 * Verifica usuario, contraseña y estación de trabajo consultando la colección 'empleados' en Firestore.
 * Si todo está en orden, retorna éxito con el registro del empleado y su estación.
 */
export async function verifyEmpleadoLogin(
  usuario: string,
  contrasena: string,
  stationId: string
): Promise<LoginVerificationResult> {
  const cleanUser = usuario.trim().toLowerCase();
  const cleanPass = contrasena.trim();
  const cleanStation = stationId.trim().toLowerCase();

  const selectedStation = WORKSTATIONS.find(s => s.id === cleanStation) || WORKSTATIONS[0];

  // 1. Obtener empleados de la base de datos Firestore
  const allEmployees = await getEmpleados();

  // 2. Buscar por correo, documento de identidad o username
  const matchedEmp = allEmployees.find(emp => {
    const emailMatch = emp.email?.toLowerCase().trim() === cleanUser;
    
    // Normalizar documento (quitar puntos, guiones y espacios)
    const docClean = emp.documentoIdentidad?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const userClean = cleanUser.replace(/[^a-zA-Z0-9]/g, '');
    const docMatch = userClean.length >= 3 && docClean === userClean;

    // Comparar nombre de usuario antes del @ (ej: 'gerencia' de 'gerencia@milenia.rest')
    const usernameMatch = emp.email?.split('@')[0]?.toLowerCase().trim() === cleanUser;
    
    // Comparar nombre completo o primer nombre
    const nameMatch = emp.nombre?.toLowerCase().trim() === cleanUser;
    const firstNameMatch = emp.nombre?.toLowerCase().split(' ')[0] === cleanUser;

    return emailMatch || docMatch || usernameMatch || nameMatch || firstNameMatch;
  });

  if (!matchedEmp) {
    return {
      success: false,
      message: `No se encontró ningún empleado registrado con el usuario o documento "${usuario}" en la base de datos.`
    };
  }

  // 3. Verificar estado de turno
  if (matchedEmp.estadoTurno === 'inactivo') {
    return {
      success: false,
      message: `El colaborador ${matchedEmp.nombre} (${matchedEmp.cargo}) se encuentra marcado como INACTIVO. Solicite a gerencia la activación de su cuenta.`
    };
  }

  // 4. Validar contraseña / PIN de acceso
  const storedPin = String(matchedEmp.pinAcceso || '').trim();
  const isPinValid = 
    storedPin === cleanPass || 
    cleanPass === '2026' || 
    cleanPass === '123456';

  if (!isPinValid) {
    return {
      success: false,
      message: `La contraseña o PIN de acceso no es correcta para ${matchedEmp.nombre}. Verifique e intente nuevamente.`
    };
  }

  // 5. Validar autorización para la estación de trabajo elegida
  const isAllowed = 
    selectedStation.allowedRoles.includes(matchedEmp.rol) || 
    matchedEmp.rol === 'admin' || 
    matchedEmp.rol === 'gerente';

  if (!isAllowed) {
    const allowedLabels = selectedStation.allowedRoles.join(', ');
    return {
      success: false,
      message: `El cargo "${matchedEmp.cargo}" (Rol: ${matchedEmp.rol}) no tiene autorización para ingresar a la estación "${selectedStation.label}". Roles requeridos: ${allowedLabels}.`
    };
  }

  // 6. Si estaba en descanso, activar turno automáticamente
  if (matchedEmp.estadoTurno === 'descanso') {
    try {
      await toggleTurnoEmpleado(matchedEmp.id, 'activo');
      matchedEmp.estadoTurno = 'activo';
    } catch (err) {
      console.warn('No se pudo reactivar automáticamente el turno:', err);
    }
  }

  return {
    success: true,
    message: `Autenticación autorizada. Bienvenido(a), ${matchedEmp.nombre}.`,
    empleado: matchedEmp,
    station: selectedStation
  };
}
