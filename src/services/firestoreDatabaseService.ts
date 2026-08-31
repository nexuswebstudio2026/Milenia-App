import { 
  db, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot 
} from '../firebaseConfig';

export interface FirestoreTableMeta {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'saas' | 'operativo' | 'sistema';
  icon: string;
  defaultTemplate: Record<string, any>;
}

export const FIRESTORE_TABLES: FirestoreTableMeta[] = [
  {
    id: 'solicitudes_afiliados',
    name: 'Solicitudes de Afiliados & Demo',
    description: 'Registros de contactos, restaurantes interesados, demos solicitadas y prospectos',
    category: 'saas',
    icon: 'Sparkles',
    defaultTemplate: {
      name: 'Carlos Mendoza',
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
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'aliados',
    name: 'Aliados Gastronómicos',
    description: 'Restaurantes y comercios registrados en la plataforma SaaS Milenia',
    category: 'saas',
    icon: 'Building2',
    defaultTemplate: {
      name: 'Nuevo Restaurante Aliado',
      nit: '900.123.456-7',
      city: 'Bogotá D.C.',
      address: 'Calle 100 # 15-20',
      phone: '+57 300 123 4567',
      email: 'contacto@restaurante.com',
      plan: 'Pro',
      status: 'Activo',
      monthlyFeeCop: 289000,
      tablesCount: 12,
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'empleados',
    name: 'Empleados & Personal Milenia',
    description: 'Personal operativo, soporte técnico, asesores de onboarding y equipo corporativo de Milenia',
    category: 'saas',
    icon: 'Users',
    defaultTemplate: {
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
      hireDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'milenia_aliados',
    name: 'Aliados Milenia (Registro)',
    description: 'Colección de aliados y comercios registrados en Milenia',
    category: 'saas',
    icon: 'Building2',
    defaultTemplate: {
      name: 'Restaurante Aliado Milenia',
      nit: '900.123.456-7',
      city: 'Bogotá D.C.',
      address: 'Calle 100 # 15-20',
      phone: '+57 300 123 4567',
      email: 'contacto@restaurante.com',
      plan: 'Plan Máximo Integral Milenia',
      status: 'Activo',
      monthlyFeeCop: 600000,
      tablesCount: 16,
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'crm_whatsapp_conversations',
    name: 'WhatsApp CRM & Grupos',
    description: 'Historial de conversaciones y grupos de WhatsApp Business vinculados al CRM',
    category: 'saas',
    icon: 'MessageSquare',
    defaultTemplate: {
      name: 'Carlos Gómez (Asadero)',
      phoneNumber: '+57 315 894 2301',
      isGroup: false,
      lastMessageText: 'Hola Andrés, ya revisamos la propuesta.',
      lastMessageTime: 'Hace 5 min',
      unreadCount: 0,
      status: 'active',
      tags: ['WhatsApp', 'Plan Máximo', 'Demo']
    }
  },
  {
    id: 'resumen_financiero',
    name: 'Resumen Financiero',
    description: 'Consolidado oficial de ingresos, gastos y balance neto en tiempo real',
    category: 'saas',
    icon: 'Calculator',
    defaultTemplate: {
      titulo: 'Resumen Financiero Consolidado',
      ingresos: 0,
      gastos: 0,
      balanceNeto: 0,
      margenNeto: 0,
      descripcion: 'Consolidado de ingresos y gastos',
      notas: 'Balance = Ingresos - Gastos',
      updatedAt: new Date().toISOString(),
      updatedBy: 'Propietario Milenia'
    }
  },
  {
    id: 'contabilidad',
    name: 'Libro Mayor y Contabilidad',
    description: 'Historial de transacciones, ingresos por suscripciones y gastos operativos',
    category: 'saas',
    icon: 'Receipt',
    defaultTemplate: {
      date: new Date().toISOString().split('T')[0],
      type: 'INGRESO',
      category: 'Suscripción SaaS',
      description: 'Pago de suscripción mensual Plan Pro',
      amountCop: 289000,
      allyName: 'Restaurante Ejemplo',
      status: 'COMPLETADO',
      invoiceNumber: 'FAC-0001',
      paymentMethod: 'Wompi / Bancolombia'
    }
  },
  {
    id: 'users',
    name: 'Usuarios & Empleados',
    description: 'Perfiles de usuarios, empleados de salón, meseros, administradores y credenciales',
    category: 'core',
    icon: 'Users',
    defaultTemplate: {
      name: 'Nombre del Empleado',
      email: 'empleado@ejemplo.com',
      role: 'staff',
      restaurantId: '1',
      position: 'Mesero / Salonero',
      phone: '+57 310 000 0000',
      documentId: '1020304050',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'menu_items',
    name: 'Menú & Platos Gastronómicos',
    description: 'Carta digital, precios, categorías, descripciones y disponibilidad',
    category: 'operativo',
    icon: 'UtensilsCrossed',
    defaultTemplate: {
      name: 'Plato Especial de la Casa',
      description: 'Preparación artesanal con ingredientes frescos locales',
      price: 32000,
      categoryId: 'cat-principales',
      restaurantId: '1',
      inStock: true,
      prepTimeMinutes: 15,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    id: 'orders',
    name: 'Pedidos & Comandas',
    description: 'Comandas activas, pedidos de salón, domicilios y estados de cocina',
    category: 'operativo',
    icon: 'ShoppingBag',
    defaultTemplate: {
      orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderType: 'dinein',
      status: 'received',
      tableNumber: 'Mesa 4',
      restaurantId: '1',
      items: [
        { name: 'Plato Principal', quantity: 2, price: 32000, subtotal: 64000 }
      ],
      subtotal: 64000,
      tax: 5120,
      tip: 6400,
      total: 75520,
      paymentMethod: 'efectivo',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'sales',
    name: 'Ventas & Facturas DIAN',
    description: 'Registros de ventas cerradas, impoconsumo, propinas y resolución DIAN',
    category: 'operativo',
    icon: 'CreditCard',
    defaultTemplate: {
      restaurantId: '1',
      invoiceNumber: `FE-${Math.floor(10000 + Math.random() * 90000)}`,
      dianResolution: 'Res. 18764000001 de DIAN Colombia',
      subtotalCop: 100000,
      impoconsumoCop: 8000,
      tipCop: 10000,
      totalCop: 118000,
      paymentMethod: 'nequi',
      cashierEmployeeId: 'emp-101',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'attendance',
    name: 'Asistencia y Turnos',
    description: 'Control de reloj de entrada/salida y horas laboradas por empleados',
    category: 'operativo',
    icon: 'Clock',
    defaultTemplate: {
      restaurantId: '1',
      employeeId: 'emp-101',
      employeeName: 'Carlos Gómez',
      documentId: '1085312034',
      clockInTime: new Date().toISOString(),
      status: 'active',
      date: new Date().toISOString().split('T')[0],
      totalHours: 0
    }
  },
  {
    id: 'reservations',
    name: 'Reservas de Mesas',
    description: 'Agenda de clientes, cantidad de personas, fechas y asignación de mesa',
    category: 'operativo',
    icon: 'Calendar',
    defaultTemplate: {
      restaurantId: '1',
      reservationCode: `RES-${Math.floor(100 + Math.random() * 900)}`,
      guestName: 'María Rodríguez',
      guestEmail: 'maria@ejemplo.com',
      guestPhone: '+57 320 123 4567',
      guestsCount: 4,
      date: new Date().toISOString().split('T')[0],
      time: '19:30',
      status: 'confirmed',
      tableAssigned: 'Mesa 2',
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 'negocio',
    name: 'Perfil del Negocio Milenia',
    description: 'Razón social, NIT, llaves Breve, códigos QR de pago, bancos y contacto',
    category: 'sistema',
    icon: 'Briefcase',
    defaultTemplate: {
      id: 'milenia_oficial',
      businessName: 'MILENIA SAS',
      nit: '901.884.231-9',
      legalRepresentative: 'Nexus Web Studio SAS',
      phone: '+57 300 987 6543',
      email: 'soporte@milenia.com',
      address: 'Carrera 7 # 72-41',
      city: 'Bogotá D.C.',
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'system_config',
    name: 'Configuración del Sistema',
    description: 'Parámetros globales de la plataforma SaaS y soporte técnico',
    category: 'sistema',
    icon: 'Sliders',
    defaultTemplate: {
      id: 'global_settings',
      platformName: 'Milenia Cloud Restaurant OS',
      currency: 'COP',
      taxRatePercent: 8,
      dianPrefix: 'MIL',
      supportEmail: 'soporte@milenia.com',
      supportPhone: '+57 300 000 0000',
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'restaurant_config',
    name: 'Configuración de Restaurantes',
    description: 'Ajustes específicos por restaurante individual (horarios, logos, DIAN)',
    category: 'operativo',
    icon: 'Store',
    defaultTemplate: {
      name: 'Mi Restaurante',
      restaurantId: '1',
      acceptingOrders: true,
      dianResolution: '18764000001',
      taxRate: 8,
      updatedAt: new Date().toISOString()
    }
  },
  {
    id: 'tenants',
    name: 'Tenants (Inquilinos)',
    description: 'Alias de sincronización multi-tenant en Firestore',
    category: 'saas',
    icon: 'Layers',
    defaultTemplate: {
      name: 'Inquilino Restaurante',
      slug: 'inquilino-ejemplo',
      city: 'Medellín',
      status: 'Activo',
      createdAt: new Date().toISOString()
    }
  }
];

export interface FirestoreDocumentRecord {
  id: string;
  data: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Obtiene todos los documentos de una colección de Firestore
 */
export async function getCollectionDocuments(collectionName: string): Promise<FirestoreDocumentRecord[]> {
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    
    return snap.docs.map(docSnap => ({
      id: docSnap.id,
      data: docSnap.data()
    }));
  } catch (error) {
    console.error(`Error obteniendo documentos de la colección "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Obtiene un documento específico por ID
 */
export async function getSingleDocument(collectionName: string, docId: string): Promise<FirestoreDocumentRecord | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return {
        id: snap.id,
        data: snap.data()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error obteniendo documento "${docId}" de "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Crea un nuevo documento en la colección especificada
 */
export async function createDocument(
  collectionName: string, 
  data: Record<string, any>, 
  customDocId?: string
): Promise<{ id: string; data: Record<string, any> }> {
  try {
    if (customDocId && customDocId.trim()) {
      const cleanId = customDocId.trim();
      const docRef = doc(db, collectionName, cleanId);
      await setDoc(docRef, {
        ...data,
        id: cleanId,
        _createdAt: data._createdAt || new Date().toISOString()
      }, { merge: true });
      return { id: cleanId, data };
    } else {
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        _createdAt: new Date().toISOString()
      });
      return { id: docRef.id, data };
    }
  } catch (error) {
    console.error(`Error creando documento en "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Actualiza un documento existente en la colección
 */
export async function updateDocument(
  collectionName: string, 
  docId: string, 
  data: Record<string, any>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      id: docId,
      _updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error(`Error actualizando documento "${docId}" en "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Elimina un documento de la colección
 */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error eliminando documento "${docId}" de "${collectionName}":`, error);
    throw error;
  }
}

/**
 * Suscripción en tiempo real a una colección de Firestore
 */
export function subscribeToCollectionLive(
  collectionName: string,
  onUpdate: (docs: FirestoreDocumentRecord[]) => void,
  onError?: (err: any) => void
) {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(colRef, (snap) => {
      const list = snap.docs.map(d => ({
        id: d.id,
        data: d.data()
      }));
      onUpdate(list);
    }, (err) => {
      console.warn(`Listener warning en colección "${collectionName}":`, err);
      if (onError) onError(err);
    });
  } catch (e) {
    console.warn(`No se pudo iniciar listener en colección "${collectionName}":`, e);
    return () => {};
  }
}
