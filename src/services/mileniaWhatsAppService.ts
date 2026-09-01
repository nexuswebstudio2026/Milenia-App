import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

export interface WhatsAppMessageItem {
  id: string;
  senderName: string;
  senderPhone: string;
  isFromMe: boolean;
  messageText: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'received';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document' | 'video';
}

export interface WhatsAppConversation {
  id: string; // Phone number or Group JID (e.g. 573158942301@s.whatsapp.net or 1203630293849302@g.us)
  name: string;
  phoneNumber?: string;
  isGroup: boolean;
  groupParticipantsCount?: number;
  avatarUrl?: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  assignedLeadId?: string;
  assignedLeadName?: string;
  status: 'active' | 'archived' | 'pinned';
  tags: string[];
}

export interface WhatsAppInstanceConfig {
  instanceName: string;
  phoneNumber: string;
  apiProvider: 'evolution_api' | 'meta_cloud_api' | 'baileys_gateway' | 'custom_webhook';
  apiUrl: string;
  apiKey: string;
  webhookUrl: string;
  isConnected: boolean;
  batteryLevel?: number;
  qrCodeData?: string;
  lastSyncAt: string;
}

const DEFAULT_CONFIG: WhatsAppInstanceConfig = {
  instanceName: 'milenia_business_oficial',
  phoneNumber: '+57 304 347 0984',
  apiProvider: 'evolution_api',
  apiUrl: 'https://whatsapp-api.milenia.app',
  apiKey: 'mln_live_sec_993848201847193847',
  webhookUrl: typeof window !== 'undefined' ? `${window.location.origin}/api/whatsapp/webhook` : 'https://milenia.app/api/whatsapp/webhook',
  isConnected: true,
  batteryLevel: 94,
  lastSyncAt: new Date().toISOString()
};

export const INITIAL_CONVERSATIONS: WhatsAppConversation[] = [
  {
    id: '573158942301',
    name: 'Carlos Mauricio Gómez (Asadero Santandereana)',
    phoneNumber: '+57 315 894 2301',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessageText: 'Hola Andrés, ya revisamos la propuesta del Plan Máximo. ¿Podemos agendar la llamada para ver las comandas en vivo?',
    lastMessageTime: 'Hace 5 min',
    unreadCount: 2,
    assignedLeadId: 'crm-001',
    assignedLeadName: 'Asadero & Brasa Santandereana',
    status: 'active',
    tags: ['Interesado', 'Demo Comandera', 'Bucaramanga']
  },
  {
    id: 'group-narino-gastronomia',
    name: 'Grupo: Empresarios Gastronómicos Nariño & Pasto 🍽️',
    isGroup: true,
    groupParticipantsCount: 48,
    avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    lastMessageText: 'Don Fernando: "Colegas, ¿alguien ya implementó el sistema POS táctil con facturación DIAN de Milenia?"',
    lastMessageTime: 'Hace 18 min',
    unreadCount: 5,
    status: 'pinned',
    tags: ['Gremio Pasto', '48 Restaurantes', 'Referidos']
  },
  {
    id: '573104556789',
    name: 'Sofia Valderrama (Trattoria Bella Napoli)',
    phoneNumber: '+57 310 455 6789',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    lastMessageText: 'Perfecto, acabo de adjuntar el RUT y certificado de Davivienda para la activación del restaurante.',
    lastMessageTime: 'Hace 42 min',
    unreadCount: 0,
    assignedLeadId: 'crm-002',
    assignedLeadName: 'Trattoria Bella Napoli',
    status: 'active',
    tags: ['RUT Recibido', 'Medellín', 'KDS Cocina']
  },
  {
    id: 'group-lideres-franquicias',
    name: 'Grupo: Red de Franquicias & Cadenas Colombia 🇨🇴',
    isGroup: true,
    groupParticipantsCount: 112,
    avatarUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    lastMessageText: 'Mariana Pardo: "Recomendadísimo el soporte de Milenia, nos habilitaron 3 sucursales en un solo día."',
    lastMessageTime: 'Hace 2 horas',
    unreadCount: 0,
    status: 'active',
    tags: ['Franquicias', '112 Miembros']
  },
  {
    id: '573187654321',
    name: 'Javier Tanaka (Sushi Bar Nikkei 85)',
    phoneNumber: '+57 318 765 4321',
    isGroup: false,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastMessageText: '¿El menú digital QR permite actualizar fotos y precios al instante desde el celular del gerente?',
    lastMessageTime: 'Ayer',
    unreadCount: 0,
    assignedLeadId: 'crm-003',
    assignedLeadName: 'Sushi Bar Nikkei 85',
    status: 'active',
    tags: ['Carta QR', 'Bogotá D.C.']
  }
];

export const INITIAL_MESSAGES: Record<string, WhatsAppMessageItem[]> = {
  '573158942301': [
    {
      id: 'm1',
      senderName: 'Milenia Comercial',
      senderPhone: '+57 304 347 0984',
      isFromMe: true,
      messageText: '¡Hola Carlos Mauricio! 👋 Te enviamos la propuesta con todo el desglose del Plan Máximo Integral ($600.000 COP/mes) que incluye comandas móviles ilimitadas y facturación electrónica.',
      timestamp: '10:15 AM',
      status: 'read'
    },
    {
      id: 'm2',
      senderName: 'Carlos Mauricio Gómez',
      senderPhone: '+57 315 894 2301',
      isFromMe: false,
      messageText: 'Excelente Andrés, muchas gracias. Ya lo revisamos con los socios del asadero.',
      timestamp: '10:32 AM',
      status: 'received'
    },
    {
      id: 'm3',
      senderName: 'Carlos Mauricio Gómez',
      senderPhone: '+57 315 894 2301',
      isFromMe: false,
      messageText: 'Hola Andrés, ya revisamos la propuesta del Plan Máximo. ¿Podemos agendar la llamada para ver las comandas en vivo?',
      timestamp: '10:35 AM',
      status: 'received'
    }
  ],
  'group-narino-gastronomia': [
    {
      id: 'gm1',
      senderName: 'Hernán Caicedo (Asopasto)',
      senderPhone: '+57 312 998 1234',
      isFromMe: false,
      messageText: 'Buenos días colegas, les comparto que la feria gastronómica de Pasto inicia este fin de semana.',
      timestamp: '09:12 AM',
      status: 'received'
    },
    {
      id: 'gm2',
      senderName: 'Don Fernando (Restaurante El Galeras)',
      senderPhone: '+57 316 443 7890',
      isFromMe: false,
      messageText: 'Colegas, ¿alguien ya implementó el sistema POS táctil con facturación DIAN de Milenia?',
      timestamp: '09:40 AM',
      status: 'received'
    },
    {
      id: 'gm3',
      senderName: 'Milenia Soporte Oficial',
      senderPhone: '+57 304 347 0984',
      isFromMe: true,
      messageText: '¡Hola Don Fernando y a todos! Con gusto podemos activarles una demostración guiada sin costo con la carta de su restaurante montada en menos de 15 minutos.',
      timestamp: '09:44 AM',
      status: 'sent'
    }
  ],
  '573104556789': [
    {
      id: 'sm1',
      senderName: 'Sofia Valderrama',
      senderPhone: '+57 310 455 6789',
      isFromMe: false,
      messageText: 'Hola equipo Milenia, les envío el listado de 18 platos y las 3 zonas de mesas para la Trattoria.',
      timestamp: '08:20 AM',
      status: 'received'
    },
    {
      id: 'sm2',
      senderName: 'Milenia Comercial',
      senderPhone: '+57 304 347 0984',
      isFromMe: true,
      messageText: '¡Perfecto Sofia! Quedó configurado. Solo nos faltaba el RUT para emitir tu contrato.',
      timestamp: '08:45 AM',
      status: 'read'
    },
    {
      id: 'sm3',
      senderName: 'Sofia Valderrama',
      senderPhone: '+57 310 455 6789',
      isFromMe: false,
      messageText: 'Perfecto, acabo de adjuntar el RUT y certificado de Davivienda para la activación del restaurante.',
      timestamp: '09:15 AM',
      status: 'received'
    }
  ]
};

const STORAGE_CONVERSATIONS_KEY = 'milenia_whatsapp_conversations_v1';
const STORAGE_CONFIG_KEY = 'milenia_whatsapp_config_v1';
const STORAGE_MESSAGES_PREFIX = 'milenia_wa_msgs_';

/**
 * Obtiene la configuración de conexión de WhatsApp
 */
export async function getWhatsAppConfig(): Promise<WhatsAppInstanceConfig> {
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'crm_whatsapp_config'));
      if (!snap.empty) {
        return snap.docs[0].data() as WhatsAppInstanceConfig;
      }
    }
  } catch (e) {
    console.warn('Error fetching whatsapp config from firestore:', e);
  }

  const local = localStorage.getItem(STORAGE_CONFIG_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }
  return DEFAULT_CONFIG;
}

/**
 * Guarda o actualiza la configuración de WhatsApp
 */
export async function saveWhatsAppConfig(config: WhatsAppInstanceConfig): Promise<void> {
  localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
  try {
    if (db) {
      await setDoc(doc(db, 'crm_whatsapp_config', 'main_instance'), config, { merge: true });
    }
  } catch (e) {
    console.warn('Error saving whatsapp config to firestore:', e);
  }
}

/**
 * Obtiene las conversaciones y grupos de WhatsApp
 */
export async function getWhatsAppConversations(): Promise<WhatsAppConversation[]> {
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'crm_whatsapp_conversations'));
      if (!snap.empty) {
        const list = snap.docs.map(d => ({ ...d.data(), id: d.id })) as WhatsAppConversation[];
        localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(list));
        return list;
      }
    }
  } catch (e) {
    console.warn('Error fetching whatsapp conversations from firestore:', e);
  }

  const local = localStorage.getItem(STORAGE_CONVERSATIONS_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }

  // Guardar iniciales en Firestore si está disponible
  try {
    if (db) {
      for (const conv of INITIAL_CONVERSATIONS) {
        await setDoc(doc(db, 'crm_whatsapp_conversations', conv.id), conv, { merge: true });
      }
    }
  } catch (_) {}

  localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
  return INITIAL_CONVERSATIONS;
}

/**
 * Obtiene el historial de mensajes de un chat o grupo
 */
export async function getConversationMessages(conversationId: string): Promise<WhatsAppMessageItem[]> {
  try {
    if (db) {
      const snap = await getDocs(collection(db, 'crm_whatsapp_conversations', conversationId, 'messages'));
      if (!snap.empty) {
        return snap.docs.map(d => ({ ...d.data(), id: d.id })) as WhatsAppMessageItem[];
      }
    }
  } catch (e) {
    console.warn('Error fetching messages from firestore:', e);
  }

  const local = localStorage.getItem(`${STORAGE_MESSAGES_PREFIX}${conversationId}`);
  if (local) {
    try { return JSON.parse(local); } catch (_) {}
  }

  return INITIAL_MESSAGES[conversationId] || [
    {
      id: 'default-1',
      senderName: 'Cliente WhatsApp',
      senderPhone: conversationId,
      isFromMe: false,
      messageText: 'Hola, me gustaría recibir más información del software Milenia.',
      timestamp: 'Ayer',
      status: 'received'
    }
  ];
}

/**
 * Genera una sesión de vinculación con QR y Código de Vinculación (Pairing Code)
 */
export async function startPairingSession(phoneNumber?: string): Promise<{ qrCode: string; pairingCode: string; config: WhatsAppInstanceConfig }> {
  try {
    const res = await fetch('/api/whatsapp/instance/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.data) {
        const updatedConfig: WhatsAppInstanceConfig = {
          ...DEFAULT_CONFIG,
          phoneNumber: data.data.phoneNumber || phoneNumber || DEFAULT_CONFIG.phoneNumber,
          isConnected: false,
          qrCodeData: data.data.qrCode,
          lastSyncAt: data.data.lastSyncAt
        };
        await saveWhatsAppConfig(updatedConfig);
        return {
          qrCode: data.data.qrCode,
          pairingCode: data.data.pairingCode || 'MLNA-9824',
          config: updatedConfig
        };
      }
    }
  } catch (err) {
    console.warn('Fallback generating local pairing session:', err);
  }

  // Generar sesión local en fallback
  const randRef = Math.random().toString(36).substring(2, 12);
  const randKey = Math.random().toString(36).substring(2, 12);
  const qr = `2@${btoa('milenia_wa_' + randRef)},${btoa(randKey)},${btoa('client_sec_' + Date.now())}`;
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let pair = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) pair += '-';
    pair += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const updatedConfig: WhatsAppInstanceConfig = {
    ...DEFAULT_CONFIG,
    phoneNumber: phoneNumber || DEFAULT_CONFIG.phoneNumber,
    isConnected: false,
    qrCodeData: qr,
    lastSyncAt: new Date().toISOString()
  };
  await saveWhatsAppConfig(updatedConfig);

  return {
    qrCode: qr,
    pairingCode: pair,
    config: updatedConfig
  };
}

/**
 * Confirma y activa la vinculación de WhatsApp
 */
export async function confirmWhatsAppPairing(phoneNumber?: string): Promise<WhatsAppInstanceConfig> {
  const current = await getWhatsAppConfig();
  const phone = phoneNumber || current.phoneNumber || '+57 304 347 0984';

  const updated: WhatsAppInstanceConfig = {
    ...current,
    phoneNumber: phone,
    isConnected: true,
    batteryLevel: 98,
    lastSyncAt: new Date().toISOString()
  };

  await saveWhatsAppConfig(updated);

  try {
    await fetch('/api/whatsapp/instance/confirm-paired', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone })
    });
  } catch (_) {}

  return updated;
}

/**
 * Desconecta la sesión de WhatsApp
 */
export async function disconnectWhatsAppInstance(): Promise<WhatsAppInstanceConfig> {
  const current = await getWhatsAppConfig();
  const updated: WhatsAppInstanceConfig = {
    ...current,
    isConnected: false,
    lastSyncAt: new Date().toISOString()
  };
  await saveWhatsAppConfig(updated);

  try {
    await fetch('/api/whatsapp/instance/disconnect', { method: 'POST' });
  } catch (_) {}

  return updated;
}

/**
 * Agrega o crea una nueva conversación de WhatsApp
 */
export async function addNewWhatsAppConversation(conv: Partial<WhatsAppConversation>): Promise<WhatsAppConversation> {
  const id = conv.id || conv.phoneNumber?.replace(/[^0-9]/g, '') || `chat_${Date.now()}`;
  const newChat: WhatsAppConversation = {
    id,
    name: conv.name || conv.phoneNumber || 'Nuevo Contacto',
    phoneNumber: conv.phoneNumber || '+57 300 000 0000',
    isGroup: Boolean(conv.isGroup),
    groupParticipantsCount: conv.groupParticipantsCount,
    avatarUrl: conv.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastMessageText: conv.lastMessageText || 'Conversación iniciada desde el CRM',
    lastMessageTime: 'Justo ahora',
    unreadCount: 0,
    assignedLeadId: conv.assignedLeadId,
    assignedLeadName: conv.assignedLeadName,
    status: 'active',
    tags: conv.tags || ['Nuevo', 'WhatsApp CRM']
  };

  const currentList = await getWhatsAppConversations();
  const exists = currentList.findIndex(c => c.id === id);
  let updatedList: WhatsAppConversation[];
  if (exists >= 0) {
    updatedList = [...currentList];
    updatedList[exists] = { ...updatedList[exists], ...newChat };
  } else {
    updatedList = [newChat, ...currentList];
  }

  localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updatedList));

  try {
    if (db) {
      await setDoc(doc(db, 'crm_whatsapp_conversations', id), newChat, { merge: true });
    }
  } catch (e) {
    console.warn('Error adding whatsapp conversation to firestore:', e);
  }

  return newChat;
}

/**
 * Simula o inyecta la recepción de un mensaje en tiempo real
 */
export async function receiveIncomingWhatsAppMessage(
  conversationId: string, 
  senderName: string, 
  messageText: string,
  senderPhone?: string
): Promise<{ message: WhatsAppMessageItem; conversation: WhatsAppConversation }> {
  const newMsg: WhatsAppMessageItem = {
    id: `msg-in-${Date.now()}`,
    senderName,
    senderPhone: senderPhone || conversationId,
    isFromMe: false,
    messageText: messageText.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'received'
  };

  // Guardar mensaje
  const currentMsgs = await getConversationMessages(conversationId);
  const updatedMsgs = [...currentMsgs, newMsg];
  localStorage.setItem(`${STORAGE_MESSAGES_PREFIX}${conversationId}`, JSON.stringify(updatedMsgs));

  // Actualizar conversación
  const conversations = await getWhatsAppConversations();
  let found = conversations.find(c => c.id === conversationId);
  if (!found) {
    found = await addNewWhatsAppConversation({
      id: conversationId,
      name: senderName,
      phoneNumber: senderPhone || conversationId,
      lastMessageText: messageText.trim()
    });
  } else {
    found.lastMessageText = messageText.trim();
    found.lastMessageTime = 'Justo ahora';
    found.unreadCount = (found.unreadCount || 0) + 1;
  }

  const updatedConvs = conversations.map(c => c.id === conversationId ? (found as WhatsAppConversation) : c);
  localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updatedConvs));

  try {
    if (db) {
      await setDoc(doc(db, 'crm_whatsapp_conversations', conversationId, 'messages', newMsg.id), newMsg, { merge: true });
      await setDoc(doc(db, 'crm_whatsapp_conversations', conversationId), {
        lastMessageText: messageText.trim(),
        lastMessageTime: 'Justo ahora',
        unreadCount: (found.unreadCount || 0)
      }, { merge: true });
    }
  } catch (_) {}

  return { message: newMsg, conversation: found };
}

/**
 * Envía un mensaje a un chat o grupo y lo sincroniza en Firestore y LocalStorage
 */
export async function sendWhatsAppMessage(conversationId: string, text: string): Promise<WhatsAppMessageItem> {
  const newMsg: WhatsAppMessageItem = {
    id: `msg-${Date.now()}`,
    senderName: 'Milenia Asesor Oficial',
    senderPhone: '+57 304 347 0984',
    isFromMe: true,
    messageText: text.trim(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent'
  };

  const currentMsgs = await getConversationMessages(conversationId);
  const updatedMsgs = [...currentMsgs, newMsg];
  localStorage.setItem(`${STORAGE_MESSAGES_PREFIX}${conversationId}`, JSON.stringify(updatedMsgs));

  // Actualizar conversación
  const conversations = await getWhatsAppConversations();
  const updatedConversations = conversations.map(c => {
    if (c.id === conversationId) {
      return {
        ...c,
        lastMessageText: text.trim(),
        lastMessageTime: 'Justo ahora',
        unreadCount: 0
      };
    }
    return c;
  });

  localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(updatedConversations));

  // Persistir en Firestore
  try {
    if (db) {
      await setDoc(doc(db, 'crm_whatsapp_conversations', conversationId, 'messages', newMsg.id), newMsg, { merge: true });
      await setDoc(doc(db, 'crm_whatsapp_conversations', conversationId), {
        lastMessageText: text.trim(),
        lastMessageTime: 'Justo ahora',
        unreadCount: 0
      }, { merge: true });
    }
  } catch (e) {
    console.warn('Error saving message in firestore:', e);
  }

  // Notificar al backend si está disponible
  try {
    await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: conversationId,
        message: text.trim(),
        isGroup: conversationId.includes('group')
      })
    });
  } catch (_) {}

  return newMsg;
}

/**
 * Suscripción en tiempo real a las conversaciones de WhatsApp
 */
export function subscribeToWhatsAppConversations(onUpdate: (conversations: WhatsAppConversation[]) => void) {
  try {
    if (db) {
      const colRef = collection(db, 'crm_whatsapp_conversations');
      return onSnapshot(colRef, (snap) => {
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id })) as WhatsAppConversation[];
          localStorage.setItem(STORAGE_CONVERSATIONS_KEY, JSON.stringify(list));
          onUpdate(list);
        }
      });
    }
  } catch (err) {
    console.warn('Error in onSnapshot for whatsapp conversations:', err);
  }
  return () => {};
}
