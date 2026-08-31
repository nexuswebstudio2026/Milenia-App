import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export interface MileniaEmpleado {
  id: string;
  employeeCode: string; // e.g. EMP-MLN-001
  name: string;
  documentId: string; // Cédula de Ciudadanía
  phone: string;
  email: string;
  assignedAllyId: string; // ID del restaurante aliado o 'all'
  assignedAllyName: string; // Nombre del restaurante aliado o 'Todos los Aliados (Cobertura Global)'
  operationalRole: string; // Cargo de Personal Operativo (ej: Soporte Técnico POS, Asesor Onboarding, etc.)
  department: 'Soporte & Operaciones' | 'Comercial & Crecimiento' | 'Tecnología & Redes' | 'Administración & Finanzas';
  status: 'active' | 'inactive' | 'vacation';
  salaryCop?: number;
  hireDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_MILENIA_EMPLEADOS: MileniaEmpleado[] = [
  {
    id: 'emp-001',
    employeeCode: 'EMP-MLN-001',
    name: 'Andrés Felipe Morales',
    documentId: '1098765432',
    phone: '+57 304 347 0984',
    email: 'andres.morales@milenia.app',
    assignedAllyId: 'all',
    assignedAllyName: 'Todos los Aliados (Cobertura Global)',
    operationalRole: 'Líder de Operaciones & Despliegues Milenia',
    department: 'Soporte & Operaciones',
    status: 'active',
    salaryCop: 2800000,
    hireDate: '2025-01-15',
    notes: 'Encargado de la supervisión de hardware, comandas y configuración de restaurantes.',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP-MLN-002',
    name: 'Valentina Restrepo Henao',
    documentId: '1020304050',
    phone: '+57 312 456 7890',
    email: 'valentina.restrepo@milenia.app',
    assignedAllyId: 'all',
    assignedAllyName: 'Todos los Aliados (Cobertura Global)',
    operationalRole: 'Especialista en Onboarding & Digitalización de Cartas',
    department: 'Comercial & Crecimiento',
    status: 'active',
    salaryCop: 2200000,
    hireDate: '2025-03-01',
    notes: 'Configura las fotos, categorías y precios de los aliados en menos de 2 horas.',
    createdAt: '2025-03-01T09:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP-MLN-003',
    name: 'Camilo Ernesto Torres',
    documentId: '1015894231',
    phone: '+57 318 654 3210',
    email: 'camilo.torres@milenia.app',
    assignedAllyId: '1',
    assignedAllyName: 'Asadero & Brasa Santandereana',
    operationalRole: 'Técnico de Soporte POS & Comanderas en Sitio',
    department: 'Soporte & Operaciones',
    status: 'active',
    salaryCop: 1950000,
    hireDate: '2025-06-10',
    notes: 'Asignado prioritario para soporte de impresoras térmicas e infraestructura de red.',
    createdAt: '2025-06-10T14:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z'
  },
  {
    id: 'emp-004',
    employeeCode: 'EMP-MLN-004',
    name: 'Diana Marcela Castro',
    documentId: '1032456789',
    phone: '+57 310 987 6543',
    email: 'diana.castro@milenia.app',
    assignedAllyId: 'all',
    assignedAllyName: 'Todos los Aliados (Cobertura Global)',
    operationalRole: 'Especialista en Facturación Electrónica DIAN',
    department: 'Tecnología & Redes',
    status: 'active',
    salaryCop: 2600000,
    hireDate: '2025-04-18',
    notes: 'Auditoría y resolución de resoluciones DIAN y sincronización de certificados digitales.',
    createdAt: '2025-04-18T11:00:00.000Z',
    updatedAt: '2026-08-30T10:00:00.000Z'
  }
];

const LOCAL_STORAGE_KEY = 'milenia_corporate_empleados_v1';
const FIRESTORE_COLLECTION = 'empleados';

/**
 * Normaliza un documento Firestore a la interfaz MileniaEmpleado
 */
export function parseEmpleadoDoc(data: any, docId?: string, index: number = 0): MileniaEmpleado {
  const id = String(docId || data.id || `emp-${index + 1}`);
  const seqNum = String(index + 1).padStart(3, '0');
  
  return {
    id,
    employeeCode: data.employeeCode || `EMP-MLN-${seqNum}`,
    name: data.name || data.nombre || 'Colaborador Milenia',
    documentId: String(data.documentId || data.cedula || data.cédula || '1000000000'),
    phone: data.phone || data.telefono || data.teléfono || '+57 300 000 0000',
    email: data.email || data.correo || 'empleado@milenia.app',
    assignedAllyId: String(data.assignedAllyId || data.restauranteId || 'all'),
    assignedAllyName: data.assignedAllyName || data.restauranteAliado || 'Todos los Aliados (Cobertura Global)',
    operationalRole: data.operationalRole || data.personalOperativo || data.cargo || 'Personal Operativo Milenia',
    department: data.department || 'Soporte & Operaciones',
    status: data.status || 'active',
    salaryCop: Number(data.salaryCop || data.salario || 0),
    hireDate: data.hireDate || data.fechaIngreso || new Date().toISOString().split('T')[0],
    notes: data.notes || data.notas || '',
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString()
  };
}

/**
 * Obtiene todos los empleados de Milenia desde Firestore
 */
export async function getMileniaEmpleados(): Promise<MileniaEmpleado[]> {
  try {
    if (db) {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      const snap = await getDocs(colRef);

      if (!snap.empty) {
        const list = snap.docs.map((d, i) => parseEmpleadoDoc(d.data(), d.id, i));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (err) {
    console.warn('Error fetching empleados from Firestore:', err);
  }

  // Fallback a localStorage
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (_) {}
  }

  // Sembrar datos iniciales en Firestore si la colección estaba vacía
  try {
    if (db) {
      for (const emp of INITIAL_MILENIA_EMPLEADOS) {
        await setDoc(doc(db, FIRESTORE_COLLECTION, emp.id), emp, { merge: true });
        // También en respaldo milenia_empleados
        await setDoc(doc(db, 'milenia_empleados', emp.id), emp, { merge: true });
      }
    }
  } catch (_) {}

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_MILENIA_EMPLEADOS));
  return INITIAL_MILENIA_EMPLEADOS;
}

/**
 * Guarda o actualiza un empleado de Milenia en Firestore
 */
export async function saveMileniaEmpleado(emp: Partial<MileniaEmpleado>): Promise<MileniaEmpleado> {
  const id = emp.id || `emp-${Date.now()}`;
  const now = new Date().toISOString();

  const fullEmployee: MileniaEmpleado = {
    id,
    employeeCode: emp.employeeCode || `EMP-MLN-${String(Math.floor(100 + Math.random() * 900))}`,
    name: emp.name?.trim() || 'Nuevo Empleado Milenia',
    documentId: String(emp.documentId || '').trim(),
    phone: emp.phone?.trim() || '+57 300 000 0000',
    email: emp.email?.trim().toLowerCase() || 'empleado@milenia.app',
    assignedAllyId: emp.assignedAllyId || 'all',
    assignedAllyName: emp.assignedAllyName || 'Todos los Aliados (Cobertura Global)',
    operationalRole: emp.operationalRole?.trim() || 'Personal Operativo Milenia',
    department: emp.department || 'Soporte & Operaciones',
    status: emp.status || 'active',
    salaryCop: Number(emp.salaryCop || 0),
    hireDate: emp.hireDate || now.split('T')[0],
    notes: emp.notes || '',
    createdAt: emp.createdAt || now,
    updatedAt: now
  };

  // Guardar en LocalStorage
  const currentList = await getMileniaEmpleados();
  const index = currentList.findIndex(e => e.id === id);
  let updatedList: MileniaEmpleado[];
  if (index >= 0) {
    updatedList = [...currentList];
    updatedList[index] = fullEmployee;
  } else {
    updatedList = [fullEmployee, ...currentList];
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  // Guardar en Firestore
  try {
    if (db) {
      await setDoc(doc(db, FIRESTORE_COLLECTION, id), fullEmployee, { merge: true });
      await setDoc(doc(db, 'milenia_empleados', id), fullEmployee, { merge: true });
    }
  } catch (err) {
    console.warn('Error saving empleado to Firestore:', err);
  }

  return fullEmployee;
}

/**
 * Elimina un empleado de Milenia en Firestore
 */
export async function deleteMileniaEmpleado(id: string): Promise<boolean> {
  const currentList = await getMileniaEmpleados();
  const updatedList = currentList.filter(e => e.id !== id);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));

  try {
    if (db) {
      await deleteDoc(doc(db, FIRESTORE_COLLECTION, id));
      await deleteDoc(doc(db, 'milenia_empleados', id));
    }
    return true;
  } catch (err) {
    console.warn('Error deleting empleado from Firestore:', err);
    return false;
  }
}

/**
 * Suscripción en tiempo real a la colección de empleados
 */
export function subscribeToMileniaEmpleados(onUpdate: (empleados: MileniaEmpleado[]) => void) {
  try {
    if (db) {
      const colRef = collection(db, FIRESTORE_COLLECTION);
      return onSnapshot(colRef, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map((d, i) => parseEmpleadoDoc(d.data(), d.id, i));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          onUpdate(list);
        }
      });
    }
  } catch (err) {
    console.warn('Error in onSnapshot for empleados:', err);
  }
  return () => {};
}
