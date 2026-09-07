import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { MensajeContacto } from '../types';

export const MENSAJES_COLLECTION = 'mensajes_contactos';
export const MENSAJES_STORAGE_KEY = 'milenia_mensajes_contactos_cache_v1';

export const MENSAJES_DEMO: MensajeContacto[] = [
  {
    id: 'msg-demo-001',
    nombre: 'Carolina Restrepo Montoya',
    restaurante: 'Bistró Provenza & Sabor',
    email: 'carolina.restrepo@bistroprovenza.co',
    telefono: '+57 314 889 4210',
    asunto: 'Consulta sobre KDS y Facturación DIAN',
    mensaje: 'Buenas tardes equipo de Gerencia de Milenia. Queremos implementar el sistema en nuestras dos sedes de El Poblado y Laureles. ¿Tienen disponibilidad para una demostración personalizada este jueves?',
    estado: 'no_leido',
    canal: 'Formulario de Contacto Web',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() // hace 45 minutos
  },
  {
    id: 'msg-demo-002',
    nombre: 'Javier Enrique Beltrán',
    restaurante: 'Asador Campestre San Juan',
    email: 'gerencia@asadorcampestresj.com',
    telefono: '+57 320 654 8890',
    asunto: 'Cotización para 25 mesas e integración de comandas',
    mensaje: 'Hola, estamos remodelando el área de servicio y requerimos saber el valor del plan para 25 mesas, 4 impresoras de comanda y 2 puntos de cobro táctil. Agradezco pronta respuesta.',
    estado: 'no_leido',
    canal: 'Formulario de Contacto Web',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // hace 3 horas
  },
  {
    id: 'msg-demo-003',
    nombre: 'Mariana Duque Gómez',
    restaurante: 'Café & Dulce Tradición',
    email: 'mariana.duque@cafedulce.com',
    telefono: '+57 301 234 5678',
    asunto: 'Agradecimiento y soporte en cierre de mes',
    mensaje: 'Muchas gracias a la administración por el soporte brindado en el cierre fiscal del fin de semana. Todo cuadró a la perfección con la DIAN.',
    estado: 'leido',
    canal: 'Formulario de Contacto Web',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // hace 1 día
  }
];

function getStoredLocalMessages(): MensajeContacto[] {
  try {
    const raw = localStorage.getItem(MENSAJES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error al leer mensajes locales:', err);
  }
  return MENSAJES_DEMO;
}

function saveStoredLocalMessages(messages: MensajeContacto[]): void {
  try {
    localStorage.setItem(MENSAJES_STORAGE_KEY, JSON.stringify(messages));
  } catch (err) {
    console.warn('Error al guardar mensajes locales:', err);
  }
}

/**
 * Envía un mensaje desde el formulario de contacto público a la tabla `mensajes_contactos` en Firestore.
 */
export async function enviarMensajeContacto(
  payload: Omit<MensajeContacto, 'id' | 'createdAt' | 'estado'>
): Promise<{ success: boolean; id: string; mensaje: MensajeContacto }> {
  const newId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const nuevoMensaje: MensajeContacto = {
    id: newId,
    nombre: payload.nombre.trim(),
    restaurante: payload.restaurante?.trim() || 'No especificado',
    email: payload.email.trim(),
    telefono: payload.telefono?.trim() || '',
    asunto: payload.asunto?.trim() || `Mensaje de ${payload.nombre.trim()}`,
    mensaje: payload.mensaje.trim(),
    estado: 'no_leido',
    restaurantId: payload.restaurantId || 'general',
    canal: payload.canal || 'Formulario de Contacto Web',
    createdAt: now
  };

  // 1. Guardar en local storage para disponibilidad inmediata
  const localList = getStoredLocalMessages();
  const updatedLocal = [nuevoMensaje, ...localList];
  saveStoredLocalMessages(updatedLocal);

  // 2. Guardar en Firestore colección `mensajes_contactos`
  try {
    const docRef = doc(db, MENSAJES_COLLECTION, newId);
    await setDoc(docRef, nuevoMensaje);
    console.log(`[Contacto] Mensaje guardado en Firestore (${MENSAJES_COLLECTION}/${newId})`);
  } catch (error) {
    console.warn('[Contacto] Falló guardado en Firestore, pero quedó en almacenamiento local:', error);
    handleFirestoreError(error, OperationType.CREATE, MENSAJES_COLLECTION);
  }

  return { success: true, id: newId, mensaje: nuevoMensaje };
}

/**
 * Obtiene todos los mensajes de contacto desde Firestore (con fallback a local cache)
 */
export async function obtenerMensajesContacto(): Promise<MensajeContacto[]> {
  try {
    const colRef = collection(db, MENSAJES_COLLECTION);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ ...d.data(), id: d.id } as MensajeContacto));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveStoredLocalMessages(items);
      return items;
    }
  } catch (error) {
    console.warn('[Contacto] Error al consultar Firestore, usando cache:', error);
    handleFirestoreError(error, OperationType.GET, MENSAJES_COLLECTION);
  }

  return getStoredLocalMessages();
}

/**
 * Suscribe la vista de Bandeja de Entrada a cambios en tiempo real
 */
export function suscribirMensajesContacto(
  callback: (mensajes: MensajeContacto[]) => void
): () => void {
  try {
    const colRef = collection(db, MENSAJES_COLLECTION);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as MensajeContacto));
        saveStoredLocalMessages(items);
        callback(items);
      } else {
        // Si está vacía en firestore, devolver mensajes locales/demo
        callback(getStoredLocalMessages());
      }
    }, (error) => {
      console.warn('[Contacto] Error en listener tiempo real, usando fallback:', error);
      handleFirestoreError(error, OperationType.LIST, MENSAJES_COLLECTION);
      callback(getStoredLocalMessages());
    });

    return unsubscribe;
  } catch (err) {
    console.warn('[Contacto] No fue posible inicializar snapshot listener:', err);
    callback(getStoredLocalMessages());
    return () => {};
  }
}

/**
 * Actualiza el estado de un mensaje (ej: 'leido', 'respondido', 'archivado')
 */
export async function actualizarEstadoMensaje(
  id: string, 
  nuevoEstado: MensajeContacto['estado'],
  notasInternas?: string
): Promise<void> {
  // Actualizar en localStorage
  const current = getStoredLocalMessages();
  const updated = current.map(msg => {
    if (msg.id === id) {
      return {
        ...msg,
        estado: nuevoEstado,
        ...(notasInternas ? { notasInternas } : {}),
        ...(nuevoEstado === 'respondido' ? { respondidoAt: new Date().toISOString() } : {})
      };
    }
    return msg;
  });
  saveStoredLocalMessages(updated);

  // Actualizar en Firestore
  try {
    const docRef = doc(db, MENSAJES_COLLECTION, id);
    const patch: Partial<MensajeContacto> = {
      estado: nuevoEstado,
      ...(notasInternas ? { notasInternas } : {}),
      ...(nuevoEstado === 'respondido' ? { respondidoAt: new Date().toISOString() } : {})
    };
    await updateDoc(docRef, patch);
  } catch (err) {
    console.warn('[Contacto] Error al actualizar estado en Firestore:', err);
    handleFirestoreError(err, OperationType.UPDATE, `${MENSAJES_COLLECTION}/${id}`);
  }
}

/**
 * Elimina un mensaje de la bandeja de entrada
 */
export async function eliminarMensaje(id: string): Promise<void> {
  const current = getStoredLocalMessages();
  const updated = current.filter(m => m.id !== id);
  saveStoredLocalMessages(updated);

  try {
    const docRef = doc(db, MENSAJES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('[Contacto] Error al eliminar mensaje en Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, `${MENSAJES_COLLECTION}/${id}`);
  }
}
