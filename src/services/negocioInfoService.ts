import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { NegocioInfo, NegocioFoto, DiaAtencion } from '../types';

export const NEGOCIO_INFO_COLLECTION = 'negocio_info';
export const LOCAL_STORAGE_KEY = 'tasty_negocio_info_v1';

export const DEFAULT_DIAS_ATENCION: DiaAtencion[] = [
  { dia: 'Lunes', abierto: true, apertura: '11:30', cierre: '23:00' },
  { dia: 'Martes', abierto: true, apertura: '11:30', cierre: '23:00' },
  { dia: 'Miércoles', abierto: true, apertura: '11:30', cierre: '23:00' },
  { dia: 'Jueves', abierto: true, apertura: '11:30', cierre: '23:00' },
  { dia: 'Viernes', abierto: true, apertura: '11:30', cierre: '23:30' },
  { dia: 'Sábado', abierto: true, apertura: '12:00', cierre: '23:30' },
  { dia: 'Domingo', abierto: true, apertura: '12:00', cierre: '21:00' }
];

export function formatTime12h(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  if (isNaN(h)) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${ampm}`;
}

export function formatHorariosFromDias(dias: DiaAtencion[]): string {
  if (!dias || dias.length === 0) return 'Horario no especificado';

  const abiertos = dias.filter(d => d.abierto);
  if (abiertos.length === 0) return 'Cerrado temporalmente';

  // Si todos los días abiertos tienen el mismo horario
  const first = abiertos[0];
  const allSameTime = abiertos.every(d => d.apertura === first.apertura && d.cierre === first.cierre);
  const timeStr = `${formatTime12h(first.apertura)} - ${formatTime12h(first.cierre)}`;

  if (allSameTime) {
    if (abiertos.length === 7) {
      return `Lunes a Domingo: ${timeStr}`;
    }
    if (abiertos.length === 6 && !dias.find(d => d.dia === 'Domingo')?.abierto) {
      return `Lunes a Sábado: ${timeStr} (Domingo cerrado)`;
    }
    if (abiertos.length === 5 && !dias.find(d => d.dia === 'Sábado')?.abierto && !dias.find(d => d.dia === 'Domingo')?.abierto) {
      return `Lunes a Viernes: ${timeStr} (Fines de semana cerrado)`;
    }
    return `${abiertos.map(d => d.dia.slice(0, 3)).join(', ')}: ${timeStr}`;
  }

  // Agrupación por horarios distintos
  const groups: { dias: string[]; time: string }[] = [];
  for (const item of abiertos) {
    const time = `${formatTime12h(item.apertura)} - ${formatTime12h(item.cierre)}`;
    const existing = groups.find(g => g.time === time);
    if (existing) {
      existing.dias.push(item.dia);
    } else {
      groups.push({ dias: [item.dia], time });
    }
  }

  const parts = groups.map(g => {
    if (g.dias.length === 1) return `${g.dias[0]}: ${g.time}`;
    if (g.dias.length === 2) return `${g.dias[0]} y ${g.dias[1]}: ${g.time}`;
    return `${g.dias[0]} a ${g.dias[g.dias.length - 1]}: ${g.time}`;
  });

  const cerrados = dias.filter(d => !d.abierto).map(d => d.dia);
  if (cerrados.length > 0 && cerrados.length <= 2) {
    return `${parts.join(' • ')} (${cerrados.join(', ')} cerrado)`;
  }

  return parts.join(' • ');
}

export const DEFAULT_NEGOCIO_INFO: NegocioInfo = {
  id: 'principal',
  nombre: 'Tasty Restaurant & Bar Gourmet',
  logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
  eslogan: 'Experiencia Culinaria & Sabores de Vanguardia',
  nit: '901.450.888-1',
  telefono: '+57 304 347 0984',
  email: 'contacto@tastyrestaurant.co',
  direccion: 'Calle 93 # 12-45, Chicó Empresarial',
  ciudad: 'Bogotá D.C.',
  departamento: 'Bogotá D.C.',
  pais: 'Colombia',
  horarios: 'Lunes a Domingo: 11:30 AM - 11:00 PM',
  diasAtencion: DEFAULT_DIAS_ATENCION,
  sitioWeb: 'https://tastyrestaurant.co',
  redesSociales: {
    facebook: 'https://facebook.com/tastyrestaurant',
    instagram: '@tastyrestaurant_col',
    x: '@tasty_gourmet',
    tiktok: '@tasty_gourmet',
    threads: '@tastyrestaurant_col',
    whatsapp: '+57 304 347 0984'
  },
  galeria: [
    {
      id: 'foto-1',
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      titulo: 'Salón Principal y Ambiente',
      categoria: 'Instalaciones',
      destacada: true,
      descripcion: 'Espacio cálido y moderno con iluminación tenue para cenas memorables.',
      fecha: '2026-01-15'
    },
    {
      id: 'foto-2',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
      titulo: 'Corte de Carne Angus Prime',
      categoria: 'Platos',
      destacada: true,
      descripcion: 'Cortes seleccionados madurados durante 28 días con guarnición rústica.',
      fecha: '2026-02-10'
    },
    {
      id: 'foto-3',
      url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
      titulo: 'Barra de Coctelería de Autor',
      categoria: 'Bar',
      destacada: false,
      descripcion: 'Mixología artesanal con destilados premium e ingredientes botánicos.',
      fecha: '2026-03-01'
    },
    {
      id: 'foto-4',
      url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=80',
      titulo: 'Terraza al Aire Libre',
      categoria: 'Terraza',
      destacada: false,
      descripcion: 'Área lounge pet-friendly con vista panorámica y calefacción nocturna.',
      fecha: '2026-03-12'
    },
    {
      id: 'foto-5',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80',
      titulo: 'Pizza Artesanal al Horno de Leña',
      categoria: 'Platos',
      destacada: false,
      descripcion: 'Masa madre fermentada 48 horas con mozzarella di bufala fresca.',
      fecha: '2026-04-05'
    },
    {
      id: 'foto-6',
      url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&auto=format&fit=crop&q=80',
      titulo: 'Cocina Abierta & Chef Station',
      categoria: 'Instalaciones',
      destacada: false,
      descripcion: 'Preparaciones en vivo con los más altos estándares de higiene y técnica.',
      fecha: '2026-05-20'
    }
  ],
  descripcion: 'Restaurante y bar gastronómico de alta cocina enfocado en ingredientes de origen local, cortes madurados a la brasa y coctelería contemporánea.',
  resolucionDian: 'Resolución DIAN No. 18764000192 de 2026 (Prefijo POS- 1 al 10000)',
  sede: 'Sede Principal Chicó',
  activa: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Gerencia'
};

/**
 * Obtiene la lista completa de configuraciones de negocios desde la colección 'negocio_info' en Firebase Firestore.
 */
export async function getNegocioInfoList(): Promise<NegocioInfo[]> {
  try {
    const colRef = collection(db, NEGOCIO_INFO_COLLECTION);
    const snap = await getDocs(colRef);
    
    if (!snap.empty) {
      const list: NegocioInfo[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data() as NegocioInfo;
        list.push({
          ...DEFAULT_NEGOCIO_INFO,
          ...data,
          id: docSnap.id
        });
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
      return list;
    }

    // Si la tabla está vacía en Firestore, creamos el registro inicial
    const initialDocRef = doc(db, NEGOCIO_INFO_COLLECTION, DEFAULT_NEGOCIO_INFO.id);
    await setDoc(initialDocRef, DEFAULT_NEGOCIO_INFO, { merge: true });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([DEFAULT_NEGOCIO_INFO]));
    return [DEFAULT_NEGOCIO_INFO];
  } catch (error) {
    console.warn('Advertencia al consultar Firestore negocio_info:', error);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return [DEFAULT_NEGOCIO_INFO];
  }
}

/**
 * Obtiene el registro activo o principal de información del negocio
 */
export async function getActiveNegocioInfo(): Promise<NegocioInfo> {
  const list = await getNegocioInfoList();
  const active = list.find(n => n.activa) || list[0] || DEFAULT_NEGOCIO_INFO;
  return active;
}

export const getNegocioInfoActivo = getActiveNegocioInfo;

/**
 * Guarda o actualiza un registro en la tabla 'negocio_info' en Firestore (CREATE o UPDATE)
 */
export async function saveNegocioInfo(info: NegocioInfo): Promise<NegocioInfo> {
  const cleanId = info.id || `negocio_${Date.now()}`;
  const payload: NegocioInfo = {
    ...info,
    id: cleanId,
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, NEGOCIO_INFO_COLLECTION, cleanId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Error al guardar en Firestore negocio_info:', error);
  }

  // Actualizar caché local
  try {
    const current = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: NegocioInfo[] = current ? JSON.parse(current) : [];
    const index = list.findIndex(n => n.id === cleanId);
    if (index >= 0) {
      list[index] = payload;
    } else {
      list.push(payload);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (_) {}

  return payload;
}

/**
 * Elimina un registro de la tabla 'negocio_info' en Firestore (DELETE)
 */
export async function deleteNegocioInfo(id: string): Promise<boolean> {
  try {
    const docRef = doc(db, NEGOCIO_INFO_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn('Error al eliminar en Firestore negocio_info:', error);
  }

  try {
    const current = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (current) {
      let list: NegocioInfo[] = JSON.parse(current);
      list = list.filter(n => n.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    }
  } catch (_) {}

  return true;
}

/**
 * Suscribe a los cambios en tiempo real de la tabla 'negocio_info'
 */
export function subscribeToNegocioInfo(callback: (list: NegocioInfo[]) => void) {
  try {
    const colRef = collection(db, NEGOCIO_INFO_COLLECTION);
    return onSnapshot(colRef, (snap) => {
      if (!snap.empty) {
        const list: NegocioInfo[] = [];
        snap.forEach(docSnap => {
          list.push({
            ...DEFAULT_NEGOCIO_INFO,
            ...(docSnap.data() as NegocioInfo),
            id: docSnap.id
          });
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        callback(list);
      } else {
        callback([DEFAULT_NEGOCIO_INFO]);
      }
    }, (err) => {
      console.warn('Error en listener de negocio_info:', err);
    });
  } catch (e) {
    console.warn('No se pudo inicializar snapshot listener de negocio_info:', e);
    return () => {};
  }
}
