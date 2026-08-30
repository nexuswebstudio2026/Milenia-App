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
  ArrowUpRight
} from 'lucide-react';
import { 
  WhatsAppConversation, 
  WhatsAppMessageItem, 
  WhatsAppInstanceConfig,
  getWhatsAppConfig,
  saveWhatsAppConfig,
  getWhatsAppConversations,
  getConversationMessages,
  sendWhatsAppMessage
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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [config, setConfig] = useState<WhatsAppInstanceConfig | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [convs, conf] = await Promise.all([
        getWhatsAppConversations(),
        getWhatsAppConfig()
      ]);
      setConversations(convs);
      setConfig(conf);
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

  const handleSaveConfig = async (newConfig: WhatsAppInstanceConfig) => {
    await saveWhatsAppConfig(newConfig);
    setConfig(newConfig);
    setShowConfigModal(false);
    showToast('Configuración guardada', 'Parámetros de WhatsApp actualizados', 'success');
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

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in flex flex-col h-[750px]">
      
      {/* Top Bar Header */}
      <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                WhatsApp Business Inbox & Grupos
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {config?.isConnected ? 'En Línea' : 'Desconectado'}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Instancia: <strong className="text-slate-200 font-mono">{config?.phoneNumber || '+57 304 347 0984'}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Evolution API / Meta Gateway</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Escanear código QR para vincular dispositivo WhatsApp Business"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Vincular con QR</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Configurar API, Webhook y credenciales de WhatsApp"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Configuración API</span>
          </button>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 text-xs transition cursor-pointer"
            title="Sincronizar mensajes"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Inbox Container (Columns: Left List / Right Active Chat) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Conversations & Groups List */}
        <div className="w-full sm:w-80 md:w-96 border-r border-slate-800 flex flex-col bg-slate-950/40">
          
          {/* Search and Filters */}
          <div className="p-3.5 border-b border-slate-800/80 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar clientes, grupos o mensajes..."
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-emerald-500 transition"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterType === 'all'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Todos ({conversations.length})
              </button>
              <button
                onClick={() => setFilterType('direct')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'direct'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Phone className="w-3 h-3" />
                <span>Directos</span>
              </button>
              <button
                onClick={() => setFilterType('groups')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  filterType === 'groups'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Grupos</span>
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No se encontraron conversaciones con ese criterio.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isSelected = activeChat?.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveChat(conv)}
                    className={`w-full p-3.5 text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-500' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {conv.avatarUrl ? (
                        <img 
                          src={conv.avatarUrl} 
                          alt={conv.name} 
                          className="w-11 h-11 rounded-2xl object-cover border border-slate-700" 
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold">
                          {conv.isGroup ? <Users className="w-5 h-5 text-emerald-400" /> : conv.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      {conv.isGroup && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 border-2 border-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                          G
                        </div>
                      )}
                    </div>

                    {/* Meta & snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {conv.name}
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
                        Grupo de WhatsApp ({activeChat.groupParticipantsCount || 48} miembros)
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

                {activeChat.phoneNumber && (
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
              <button
                type="button"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition"
                title="Adjuntar catálogo, cotización o imagen"
              >
                <Paperclip className="w-4 h-4" />
              </button>

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

      {/* QR Code Pairing Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-400" />
                <span>Vincular WhatsApp con Código QR</span>
              </h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Escanea este código con tu aplicación de <strong>WhatsApp Business</strong> en tu celular:
              <br />
              <span className="text-slate-300 font-medium">Ajustes &gt; Dispositivos vinculados &gt; Vincular dispositivo</span>
            </p>

            {/* QR Mock Display */}
            <div className="p-6 bg-white rounded-2xl flex flex-col items-center justify-center shadow-inner">
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://milenia.app/api/whatsapp/pair-instance" 
                alt="QR Code WhatsApp" 
                className="w-44 h-44 object-contain"
              />
              <span className="text-[11px] text-slate-800 font-bold mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                Esperando escaneo en tiempo real...
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Soporta recepción simultánea de chats individuales y mensajes en grupos.</span>
            </div>

            <button
              onClick={() => {
                setShowQrModal(false);
                showToast('Dispositivo Vinculado', 'WhatsApp Business sincronizado exitosamente con el CRM de Milenia', 'success');
              }}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition cursor-pointer"
            >
              Confirmar Vinculación Activa
            </button>
          </div>
        </div>
      )}

      {/* API Configuration Modal */}
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
                  Proveedor de API
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
                  URL del Servidor API / Gateway
                </label>
                <input
                  type="text"
                  value={config.apiUrl}
                  onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
                  placeholder="https://whatsapp-api.milenia.app"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  API Key / Token de Autenticación
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="mln_live_sec_..."
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
                    onClick={() => {
                      navigator.clipboard.writeText(webhookEndpoint);
                      showToast('Copiado', 'URL del webhook copiada al portapapeles', 'info');
                    }}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-bold"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveConfig(config)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 text-xs font-black cursor-pointer shadow-md"
              >
                Guardar Conexión
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
