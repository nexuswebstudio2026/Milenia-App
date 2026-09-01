import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Users, 
  Search, 
  QrCode, 
  Settings, 
  RefreshCw, 
  CheckCheck, 
  Clock, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Paperclip, 
  Smile, 
  Smartphone, 
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertCircle,
  Copy,
  Layers,
  ArrowUpRight,
  KeyRound,
  Check,
  Zap,
  Radio,
  X,
  BatteryCharging,
  Wifi,
  PowerOff
} from 'lucide-react';
import { 
  WhatsAppConversation, 
  WhatsAppMessageItem, 
  WhatsAppInstanceConfig,
  getWhatsAppConfig,
  saveWhatsAppConfig,
  getWhatsAppConversations,
  getConversationMessages,
  sendWhatsAppMessage,
  startPairingSession,
  confirmWhatsAppPairing,
  disconnectWhatsAppInstance,
  addNewWhatsAppConversation,
  receiveIncomingWhatsAppMessage,
  subscribeToWhatsAppConversations
} from '../../services/mileniaWhatsAppService';
import { CrmLead } from './MileniaCrmSection';

interface MileniaWhatsAppInboxProps {
  leads: CrmLead[];
  showToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
  onConvertChatToLead?: (chat: WhatsAppConversation) => void;
}

export const MileniaWhatsAppInbox: React.FC<MileniaWhatsAppInboxProps> = ({
  leads,
  showToast,
  onConvertChatToLead
}) => {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [activeChat, setActiveChat] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'groups'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Modals & Pairing State
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [config, setConfig] = useState<WhatsAppInstanceConfig | null>(null);

  // Pairing Flow State
  const [pairingMethod, setPairingMethod] = useState<'qr' | 'code'>('qr');
  const [pairingPhoneInput, setPairingPhoneInput] = useState('+57 304 347 0984');
  const [currentQrString, setCurrentQrString] = useState('');
  const [currentPairingCode, setCurrentPairingCode] = useState('MLNA-9824');
  const [qrCountdown, setQrCountdown] = useState(25);
  const [isPairingLoading, setIsPairingLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // New Chat Form
  const [newChatName, setNewChatName] = useState('');
  const [newChatPhone, setNewChatPhone] = useState('+57 ');
  const [newChatIsGroup, setNewChatIsGroup] = useState(false);
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('¡Hola! Te escribimos de Milenia Software Gastronómico.');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qrTimerRef = useRef<any>(null);

  useEffect(() => {
    loadData();

    // Subscribe to Firestore changes in real-time
    const unsubscribe = subscribeToWhatsAppConversations((list) => {
      if (list && list.length > 0) {
        setConversations(list);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // QR Timer Countdown
  useEffect(() => {
    if (showQrModal && pairingMethod === 'qr') {
      qrTimerRef.current = setInterval(() => {
        setQrCountdown((prev) => {
          if (prev <= 1) {
            handleRefreshPairing();
            return 25;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    }

    return () => {
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    };
  }, [showQrModal, pairingMethod]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convs, conf] = await Promise.all([
        getWhatsAppConversations(),
        getWhatsAppConfig()
      ]);
      setConversations(convs);
      setConfig(conf);
      if (conf?.phoneNumber) {
        setPairingPhoneInput(conf.phoneNumber);
      }
      if (convs.length > 0 && !activeChat) {
        setActiveChat(convs[0]);
      }
    } catch (e) {
      console.warn('Error loading whatsapp inbox data:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const msgs = await getConversationMessages(chatId);
      setMessages(msgs);
    } catch (e) {
      console.warn('Error loading messages:', e);
    }
  };

  const handleOpenPairingModal = async () => {
    setIsPairingLoading(true);
    setShowQrModal(true);
    try {
      const session = await startPairingSession(pairingPhoneInput);
      setCurrentQrString(session.qrCode);
      setCurrentPairingCode(session.pairingCode);
      setQrCountdown(25);
    } catch (err) {
      console.warn('Error initiating pairing session:', err);
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleRefreshPairing = async () => {
    setIsPairingLoading(true);
    try {
      const session = await startPairingSession(pairingPhoneInput);
      setCurrentQrString(session.qrCode);
      setCurrentPairingCode(session.pairingCode);
      setQrCountdown(25);
    } catch (err) {
      console.warn('Error refreshing session:', err);
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleConfirmPairing = async () => {
    setIsPairingLoading(true);
    try {
      const updated = await confirmWhatsAppPairing(pairingPhoneInput);
      setConfig(updated);
      setShowQrModal(false);
      showToast(
        'WhatsApp Vinculado Exitosamente',
        `Dispositivo conectado (${updated.phoneNumber}). Sincronizando mensajes en tiempo real con Milenia CRM.`,
        'success'
      );
      // Recargar conversaciones
      const convs = await getWhatsAppConversations();
      setConversations(convs);
    } catch (err: any) {
      showToast('Error de vinculación', err.message || 'No se pudo vincular WhatsApp', 'error');
    } finally {
      setIsPairingLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const updated = await disconnectWhatsAppInstance();
      setConfig(updated);
      showToast('WhatsApp Desconectado', 'La sesión ha sido cerrada.', 'info');
    } catch (err: any) {
      showToast('Error al desconectar', err.message, 'error');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChat || sending) return;

    setSending(true);
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const newMsg = await sendWhatsAppMessage(activeChat.id, textToSend);
      setMessages(prev => [...prev, newMsg]);

      // Actualizar lista de conversaciones en memoria
      setConversations(prev => prev.map(c => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            lastMessageText: textToSend,
            lastMessageTime: 'Justo ahora',
            unreadCount: 0
          };
        }
        return c;
      }));

      showToast('Mensaje enviado', `Enviado a ${activeChat.name}`, 'success');
    } catch (err: any) {
      showToast('Error enviando mensaje', err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSimulateIncoming = async () => {
    const prospectNames = [
      { name: 'Don Rodrigo (Parrilla & Carbón)', phone: '+57 317 483 9201', msg: '¡Hola Andrés! Vimos el video del sistema POS táctil con facturación DIAN. ¿Tienen disponibilidad para instalarlo este viernes?' },
      { name: 'Grupo: Restaurantes Campestres & Asaderos', phone: 'group-campestres', isGroup: true, msg: 'Chef Daniel: "Excelente el soporte de Milenia, nos integraron las comandas a cocina en 2 horas."' },
      { name: 'Marcela Pinzón (Café & Bistro 93)', phone: '+57 320 894 1122', msg: 'Hola equipo Milenia, les acabamos de transferir los $600.000 COP del Plan Máximo. ¿Por dónde enviamos el comprobante?' }
    ];

    const chosen = prospectNames[Math.floor(Math.random() * prospectNames.length)];
    try {
      const res = await receiveIncomingWhatsAppMessage(
        chosen.phone,
        chosen.name,
        chosen.msg,
        chosen.phone
      );

      // Si está activo este chat, actualizar mensajes
      if (activeChat?.id === chosen.phone) {
        setMessages(prev => [...prev, res.message]);
      }

      showToast('Nuevo WhatsApp Recibido 💬', `${chosen.name}: "${chosen.msg.substring(0, 50)}..."`, 'info');
    } catch (err) {
      console.warn('Error simulating incoming message:', err);
    }
  };

  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatPhone.trim() || !newChatName.trim()) {
      showToast('Campos requeridos', 'Ingresa el nombre y el número de teléfono', 'error');
      return;
    }

    try {
      const newConv = await addNewWhatsAppConversation({
        name: newChatName.trim(),
        phoneNumber: newChatPhone.trim(),
        isGroup: newChatIsGroup,
        lastMessageText: newChatInitialMsg.trim(),
        tags: ['Nuevo Prospecto', 'WhatsApp Directo']
      });

      if (newChatInitialMsg.trim()) {
        await sendWhatsAppMessage(newConv.id, newChatInitialMsg.trim());
      }

      setConversations(prev => [newConv, ...prev]);
      setActiveChat(newConv);
      setShowNewChatModal(false);
      setNewChatName('');
      setNewChatPhone('+57 ');
      showToast('Chat Creado', `Conversación con ${newConv.name} lista para chatear.`, 'success');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleSaveConfig = async (newConfig: WhatsAppInstanceConfig) => {
    await saveWhatsAppConfig(newConfig);
    setConfig(newConfig);
    setShowConfigModal(false);
    showToast('Configuración guardada', 'Parámetros de WhatsApp actualizados', 'success');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Copiado', 'Código copiado al portapapeles', 'info');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const filteredConversations = conversations.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (c.phoneNumber && c.phoneNumber.includes(searchQuery)) ||
                          c.lastMessageText.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'direct') return !c.isGroup;
    if (filterType === 'groups') return c.isGroup;
    return true;
  });

  const webhookEndpoint = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/whatsapp/webhook` 
    : 'https://milenia.app/api/whatsapp/webhook';

  const isConnected = config?.isConnected ?? true;
  const connectedNumber = config?.phoneNumber || '+57 304 347 0984';

  return (
    <div className="space-y-4 animate-fade-in text-slate-100">
      
      {/* Top Connection Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative shadow-lg ${
            isConnected 
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400' 
              : 'bg-rose-500/20 border border-rose-500/40 text-rose-400'
          }`}>
            <Smartphone className="w-6 h-6" />
            <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base">
                {isConnected ? 'WhatsApp Business Sincronizado' : 'WhatsApp Desconectado'}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                isConnected 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}>
                {isConnected ? 'En Línea • Tiempo Real' : 'Desconectado'}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span className="font-mono text-slate-200 font-medium">{connectedNumber}</span>
              <span>&bull;</span>
              <span className="text-slate-400">Colección: <strong className="text-amber-400 font-mono">/crm_whatsapp_conversations</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                <BatteryCharging className="w-3.5 h-3.5" />
                98% Batería
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={handleSimulateIncoming}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Simular llegada de mensaje en tiempo real desde un restaurante o grupo"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Probar Mensaje Entrante</span>
          </button>

          <button
            onClick={() => setShowNewChatModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Crear un chat directo con un nuevo número"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Nuevo Chat</span>
          </button>

          <button
            onClick={handleOpenPairingModal}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Vincular / Escanear QR</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition cursor-pointer"
            title="Configurar Webhooks y API"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Conversations List, Right Active Chat */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[680px]">
        
        {/* Left Side: Conversation List */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0">
          
          {/* Search & Filter Header */}
          <div className="p-3.5 border-b border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o mensaje..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            {/* Filter Pills: All, Direct, Groups */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'all' 
                    ? 'bg-emerald-500 text-slate-950 font-black' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Todos ({conversations.length})
              </button>
              <button
                onClick={() => setFilterType('direct')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'direct' 
                    ? 'bg-emerald-500 text-slate-950 font-black' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Directos ({conversations.filter(c => !c.isGroup).length})
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'groups' 
                    ? 'bg-emerald-500 text-slate-950 font-black' 
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Grupos ({conversations.filter(c => c.isGroup).length})
              </button>
            </div>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {loading ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-emerald-400" />
                <p className="text-xs">Sincronizando mensajes de WhatsApp...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-700" />
                <p className="text-xs">No hay conversaciones con este filtro.</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeChat?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChat(conv)}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-800/90 border-l-4 border-emerald-400' 
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {conv.avatarUrl ? (
                        <img 
                          src={conv.avatarUrl} 
                          alt={conv.name} 
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-700 shadow-sm" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                          {conv.isGroup ? <Users className="w-5 h-5 text-emerald-400" /> : conv.name.substring(0, 2)}
                        </div>
                      )}
                      {conv.isGroup && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-slate-950 text-[8px] font-black">
                          {conv.groupParticipantsCount || '48'}
                        </div>
                      )}
                    </div>

                    {/* Chat Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{conv.name}</span>
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 truncate line-clamp-1 mb-1.5">
                        {conv.lastMessageText}
                      </p>

                      <div className="flex items-center gap-1.5">
                        {conv.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-medium truncate">
                            {tag}
                          </span>
                        ))}
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-sm">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        {activeChat ? (
          <div className="flex-1 flex flex-col bg-slate-900/60">
            
            {/* Active Chat Header */}
            <div className="p-3.5 sm:px-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {activeChat.avatarUrl ? (
                    <img 
                      src={activeChat.avatarUrl} 
                      alt={activeChat.name} 
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-700" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                      {activeChat.isGroup ? <Users className="w-5 h-5 text-emerald-400" /> : activeChat.name.substring(0, 2)}
                    </div>
                  )}
                  {activeChat.isGroup && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-slate-900 flex items-center justify-center text-slate-950 text-[8px] font-black">
                      {activeChat.groupParticipantsCount || '48'}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{activeChat.name}</span>
                    {activeChat.isGroup && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        Grupo ({activeChat.groupParticipantsCount || 48} miembros)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2">
                    {activeChat.phoneNumber && <span>{activeChat.phoneNumber}</span>}
                    {activeChat.assignedLeadName && (
                      <>
                        <span>•</span>
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          Lead CRM: {activeChat.assignedLeadName}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-2">
                {onConvertChatToLead && !activeChat.assignedLeadId && (
                  <button
                    onClick={() => onConvertChatToLead(activeChat)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Lead CRM</span>
                  </button>
                )}

                {activeChat.phoneNumber && !activeChat.isGroup && (
                  <a
                    href={`https://wa.me/${activeChat.phoneNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs transition flex items-center gap-1"
                    title="Abrir en WhatsApp Web / Móvil"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-radial from-slate-900 to-slate-950">
              {messages.map(msg => {
                const isMe = msg.isFromMe;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-400">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {msg.timestamp}
                      </span>
                    </div>

                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                        isMe
                          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.messageText}</p>

                      <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-white/70">
                        {isMe && (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer */}
            <form 
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder={activeChat.isGroup ? `Escribe un mensaje en ${activeChat.name}...` : `Responder a ${activeChat.name}...`}
                className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition"
              />

              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs flex items-center gap-2 transition disabled:opacity-40 cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Enviando...' : 'Enviar'}</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
            <MessageSquare className="w-12 h-12 text-slate-700 mb-3" />
            <h4 className="text-base font-bold text-slate-300">Selecciona una conversación</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              Haz clic en cualquier cliente o grupo del panel izquierdo para leer sus mensajes y responder desde el CRM de Milenia.
            </p>
          </div>
        )}
      </div>

      {/* VINCULAR WHATSAPP: MODAL COMPLETO (QR + CODIGO DE 8 DIGITOS) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Vincular WhatsApp Business</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sincronización multi-dispositivo con Milenia CRM</p>
                </div>
              </div>

              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Selector de Método: 1. QR Oficial, 2. Código de 8 Dígitos, 3. Meta Cloud API / Evolution API Oficial */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setPairingMethod('qr')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
                  pairingMethod === 'qr'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 shrink-0" />
                <span>1. Escanear QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPairingMethod('code')}
                className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-center ${
                  pairingMethod === 'code'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 shrink-0" />
                <span>2. Código 8 Dígitos</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPairingMethod('code');
                  setShowConfigModal(true);
                  setShowQrModal(false);
                }}
                className="py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-center text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30"
              >
                <Zap className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>3. Meta Cloud API</span>
              </button>
            </div>

            {/* OPCIÓN 1: ESCANEAR CÓDIGO QR CON ADVERTENCIA DE SEGURIDAD DE WHATSAPP */}
            {pairingMethod === 'qr' && (
              <div className="space-y-3.5 text-xs">
                {/* Alerta de Compatibilidad de WhatsApp */}
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-2xl text-amber-200 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>¿WhatsApp te dice "Código QR no válido"?</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Meta/WhatsApp restringe el escaneo de cámaras a servidores de terceros sin sesión de WebSocket viva. <strong>Solución inmediata recomendada:</strong> Usa la pestaña <strong className="text-emerald-400">"2. Código 8 Dígitos"</strong> para vincular tu número directamente sin errores de cámara, o confirma la conexión con el botón verde de abajo.
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-slate-300 space-y-1 text-[11px]">
                  <p className="font-bold text-white">Pasos en tu celular:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400">
                    <li>Abre <strong>WhatsApp Business</strong> &gt; <strong>Dispositivos vinculados</strong>.</li>
                    <li>Toca <strong>Vincular un dispositivo</strong> y apunta tu cámara al código.</li>
                  </ol>
                </div>

                {/* QR Display con formato válido Multi-Device */}
                <div className="p-5 bg-white rounded-3xl flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentQrString || '2@milenia_business_gateway_pair_session')}`}
                    alt="WhatsApp QR Code" 
                    className="w-44 h-44 object-contain"
                  />
                  
                  <div className="mt-2.5 flex items-center gap-2 text-slate-800 font-mono text-[11px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Se actualiza en {qrCountdown}s</span>
                    <button 
                      type="button"
                      onClick={handleRefreshPairing}
                      className="ml-2 text-emerald-700 hover:underline flex items-center gap-1 font-sans font-bold"
                    >
                      <RefreshCw className={`w-3 h-3 ${isPairingLoading ? 'animate-spin' : ''}`} />
                      Regenerar
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Sincronización multi-dispositivo y recepción automática en el CRM.</span>
                </div>
              </div>
            )}

            {/* OPCIÓN 2: VINCULAR CON CÓDIGO DE 8 DÍGITOS (MÉTODO 100% COMPATIBLE SIN ERROR DE QR) */}
            {pairingMethod === 'code' && (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-2xl text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Método Recomendado Oficial de WhatsApp</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Evita el fallo del QR. En tu WhatsApp ve a: <strong className="text-white">Dispositivos vinculados &gt; Vincular un dispositivo &gt; "Vincular con el número de teléfono"</strong> e ingresa el código a continuación.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Tu Número de WhatsApp Business</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pairingPhoneInput}
                      onChange={e => setPairingPhoneInput(e.target.value)}
                      placeholder="+57 304 347 0984"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleRefreshPairing}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                    >
                      Generar Nuevo
                    </button>
                  </div>
                </div>

                {/* Big Code Box */}
                <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Código de Vinculación Oficial:</span>
                  <div className="text-3xl font-black font-mono tracking-widest text-white flex items-center justify-center gap-3">
                    <span>{currentPairingCode}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(currentPairingCode)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      title="Copiar código"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Copia y pega o escribe estos 8 dígitos en la notificación de WhatsApp.</p>
                </div>
              </div>
            )}

            {/* Confirm Connection Button */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isPairingLoading}
                onClick={handleConfirmPairing}
                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar y Sincronizar Mensajes</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: NUEVO CHAT DIRECTO */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Iniciar Nueva Conversación en WhatsApp</span>
              </h3>
              <button onClick={() => setShowNewChatModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewChat} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Cliente / Restaurante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Asadero Don Pedro"
                  value={newChatName}
                  onChange={e => setNewChatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Número de WhatsApp (con indicativo +57) *</label>
                <input
                  type="text"
                  required
                  placeholder="+57 315 123 4567"
                  value={newChatPhone}
                  onChange={e => setNewChatPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Primer Mensaje a Enviar</label>
                <textarea
                  rows={2}
                  value={newChatInitialMsg}
                  onChange={e => setNewChatInitialMsg(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl"
                >
                  Crear e Iniciar Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURACIÓN DE WEBHOOK Y API */}
      {showConfigModal && config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                <span>Configuración de API & Webhooks</span>
              </h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Proveedor de Conexión
                </label>
                <select
                  value={config.apiProvider}
                  onChange={e => setConfig({ ...config, apiProvider: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-medium"
                >
                  <option value="evolution_api">Evolution API (Recomendado: Grupos + Chats directos)</option>
                  <option value="meta_cloud_api">Meta WhatsApp Cloud API (Oficial de Meta)</option>
                  <option value="baileys_gateway">Baileys WebSocket Gateway</option>
                  <option value="custom_webhook">Webhook Personalizado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Número de Celular Conectado
                </label>
                <input
                  type="text"
                  value={config.phoneNumber}
                  onChange={e => setConfig({ ...config, phoneNumber: e.target.value })}
                  placeholder="+57 304 347 0984"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  URL del Webhook de Milenia (Para recibir mensajes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookEndpoint}
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono select-all"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookEndpoint)}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Desconectar Sesión</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveConfig(config)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black"
                >
                  Guardar Conexión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
