import React, { useState, useEffect, useMemo } from 'react';
import { 
  Inbox, 
  Mail, 
  Phone, 
  Building2, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Send, 
  ExternalLink, 
  RefreshCw, 
  Filter, 
  MessageSquare, 
  Calendar, 
  Tag, 
  Sparkles, 
  Eye, 
  CornerDownRight, 
  ChevronRight,
  User,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { MensajeContacto } from '../../types';
import { 
  obtenerMensajesContacto, 
  suscribirMensajesContacto, 
  actualizarEstadoMensaje, 
  eliminarMensaje,
  enviarMensajeContacto
} from '../../services/contactoService';
import { useTasty } from '../../context/TastyContext';

export const BandejaEntradaMensajes: React.FC = () => {
  const { currentTenant, showToast } = useTasty();
  const [mensajes, setMensajes] = useState<MensajeContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<'todos' | 'no_leido' | 'leido' | 'respondido'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [notaInternaInput, setNotaInternaInput] = useState('');
  const [isSavingNota, setIsSavingNota] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Suscripción en tiempo real a Firestore
  useEffect(() => {
    setLoading(true);
    const unsubscribe = suscribirMensajesContacto((items) => {
      setMensajes(items);
      setLoading(false);
      // Auto-select first message if none selected
      setSelectedId((prev) => {
        if (prev && items.some(i => i.id === prev)) return prev;
        return items[0]?.id || null;
      });
    });

    return () => unsubscribe();
  }, []);

  const selectedMessage = useMemo(() => {
    return mensajes.find(m => m.id === selectedId) || null;
  }, [mensajes, selectedId]);

  // Actualizar el campo de nota interna cuando cambia el mensaje seleccionado
  useEffect(() => {
    if (selectedMessage) {
      setNotaInternaInput(selectedMessage.notasInternas || '');
    }
  }, [selectedMessage]);

  // Contadores
  const stats = useMemo(() => {
    const total = mensajes.length;
    const noLeidos = mensajes.filter(m => m.estado === 'no_leido').length;
    const respondidos = mensajes.filter(m => m.estado === 'respondido').length;
    const leidos = mensajes.filter(m => m.estado === 'leido').length;
    return { total, noLeidos, respondidos, leidos };
  }, [mensajes]);

  // Filtrar mensajes
  const filteredMensajes = useMemo(() => {
    return mensajes.filter(m => {
      const matchEstado = filterEstado === 'todos' || m.estado === filterEstado;
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        !searchTerm.trim() ||
        m.nombre.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        (m.restaurante && m.restaurante.toLowerCase().includes(searchLower)) ||
        (m.telefono && m.telefono.includes(searchTerm)) ||
        m.mensaje.toLowerCase().includes(searchLower);
      return matchEstado && matchSearch;
    });
  }, [mensajes, filterEstado, searchTerm]);

  // Acciones
  const handleSelectMessage = async (msg: MensajeContacto) => {
    setSelectedId(msg.id);
    // Si no está leído, marcarlo como leído automáticamente al abrirlo
    if (msg.estado === 'no_leido') {
      await actualizarEstadoMensaje(msg.id, 'leido');
    }
  };

  const handleToggleEstado = async (id: string, nuevoEstado: MensajeContacto['estado']) => {
    await actualizarEstadoMensaje(id, nuevoEstado);
    showToast?.(`Mensaje marcado como: ${nuevoEstado.replace('_', ' ')}`, 'success');
  };

  const handleSaveNota = async () => {
    if (!selectedMessage) return;
    setIsSavingNota(true);
    await actualizarEstadoMensaje(selectedMessage.id, selectedMessage.estado, notaInternaInput);
    setIsSavingNota(false);
    showToast?.('Nota interna de gerencia guardada en Firestore', 'success');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Deseas eliminar este mensaje de la bandeja de entrada?')) {
      await eliminarMensaje(id);
      showToast?.('Mensaje eliminado', 'info');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const items = await obtenerMensajesContacto();
    setMensajes(items);
    setIsRefreshing(false);
    showToast?.('Bandeja de entrada sincronizada con Firestore', 'info');
  };

  // Crear un mensaje de prueba
  const handleCrearMensajePrueba = async () => {
    const nombres = ['Andrés Felipe Salazar', 'Laura Camila Osorio', 'Esteban Restrepo'];
    const rest = ['Parrilla Don Pedro', 'Sushi & Nikkei Bistro', 'Trattoria Bella Vista'];
    const randomIdx = Math.floor(Math.random() * nombres.length);
    
    await enviarMensajeContacto({
      nombre: nombres[randomIdx],
      restaurante: rest[randomIdx],
      email: `${nombres[randomIdx].toLowerCase().replace(/\s+/g, '.')}@restaurante.co`,
      telefono: '+57 312 456 7890',
      asunto: 'Consulta de integración con KDS y menú digital',
      mensaje: `Hola equipo de Gerencia. Estamos interesados en implementar la plataforma en ${rest[randomIdx]}. Quisiéramos saber cómo sincronizar las comandas de cocina y facturación DIAN.`,
      restaurantId: currentTenant?.id || 'general',
      canal: 'Formulario de Contacto Web'
    });
    showToast?.('Nuevo mensaje de prueba registrado en la base de datos', 'success');
  };

  const formatFecha = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Bandeja de Entrada de Gerencia
              </h1>
              {stats.noLeidos > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold animate-pulse">
                  {stats.noLeidos} nuevos
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Mensajes recibidos desde el formulario de contacto oficial • Tabla Firestore: <code className="font-mono text-amber-600 dark:text-amber-400 text-xs">mensajes_contactos</code>
            </p>
          </div>
        </div>

        {/* Acciones de sincronización */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Recargar mensajes desde Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            <span>Sincronizar</span>
          </button>

          <button
            onClick={handleCrearMensajePrueba}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Mensaje Demo</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Total Mensajes
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500">en base de datos</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/20 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-500 block uppercase tracking-wider">
            Nuevos (Sin Leer)
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-500">
              {stats.noLeidos}
            </span>
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">prioritarios</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-blue-500 block uppercase tracking-wider">
            Revisados
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-blue-500">
              {stats.leidos}
            </span>
            <span className="text-xs text-slate-500">en gestión</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-500 block uppercase tracking-wider">
            Respondidos
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-500">
              {stats.respondidos}
            </span>
            <span className="text-xs text-slate-500">completados</span>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por remitente, negocio, email o mensaje..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['todos', 'no_leido', 'leido', 'respondido'] as const).map((est) => {
            const labels: Record<string, string> = {
              todos: 'Todos',
              no_leido: 'No leídos',
              leido: 'Leídos',
              respondido: 'Respondidos'
            };
            const active = filterEstado === est;
            return (
              <button
                key={est}
                onClick={() => setFilterEstado(est)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  active 
                    ? 'bg-amber-500 text-slate-950 shadow-sm' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {labels[est]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenedor Principal: Lista y Detalle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Lista de Mensajes */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block" />
              <p className="text-xs text-slate-500">Cargando bandeja de entrada...</p>
            </div>
          ) : filteredMensajes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Inbox className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No hay mensajes en este filtro
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Los mensajes enviados desde el modal de Contacto aparecerán aquí en tiempo real.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {filteredMensajes.map((msg) => {
                const isSelected = msg.id === selectedId;
                const isUnread = msg.estado === 'no_leido';

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left relative overflow-hidden ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : isUnread
                        ? 'bg-white dark:bg-slate-900 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Indicador lateral no leído */}
                    {isUnread && (
                      <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {msg.nombre}
                        </span>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatFecha(msg.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{msg.restaurante}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {msg.mensaje}
                    </p>

                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {msg.email}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        msg.estado === 'no_leido' 
                          ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' 
                          : msg.estado === 'respondido'
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        {msg.estado === 'no_leido' ? 'No leído' : msg.estado === 'respondido' ? 'Respondido' : 'Leído'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Lectura y Respuesta */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Header del Mensaje */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ID: {selectedMessage.id}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      selectedMessage.estado === 'no_leido'
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        : selectedMessage.estado === 'respondido'
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                    }`}>
                      Estado: {selectedMessage.estado === 'no_leido' ? 'Nuevo / No leído' : selectedMessage.estado === 'respondido' ? 'Respondido' : 'Leído'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                    {selectedMessage.asunto || `Mensaje de ${selectedMessage.nombre}`}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Recibido el {formatFecha(selectedMessage.createdAt)}</span>
                    <span>•</span>
                    <span>Canal: {selectedMessage.canal || 'Web'}</span>
                  </div>
                </div>

                {/* Acciones de Cambio de Estado */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedMessage.estado !== 'respondido' ? (
                    <button
                      onClick={() => handleToggleEstado(selectedMessage.id, 'respondido')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      title="Marcar como atendido/respondido"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Marcar Respondido</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleEstado(selectedMessage.id, 'leido')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Reabrir Mensaje
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition cursor-pointer"
                    title="Eliminar mensaje"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ficha del Remitente */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remitente</span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>{selectedMessage.nombre}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{selectedMessage.restaurante}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Correo Electrónico</span>
                  <a 
                    href={`mailto:${selectedMessage.email}?subject=Respuesta a su solicitud en Milenia Gastronomía`}
                    className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 truncate block"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedMessage.email}</span>
                  </a>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teléfono / WhatsApp</span>
                  {selectedMessage.telefono ? (
                    <a 
                      href={`https://wa.me/${selectedMessage.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(selectedMessage.nombre)},%20te%20contactamos%20desde%20la%20Gerencia%20de%20Milenia%20respecto%20a%20tu%20mensaje.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate block"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedMessage.telefono}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No registrado</span>
                  )}
                </div>
              </div>

              {/* Cuerpo del Mensaje */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
                  Contenido del Mensaje
                </span>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
                  {selectedMessage.mensaje}
                </div>
              </div>

              {/* Botones de Respuesta Rápida Directa */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Respuesta de Gerencia - Milenia Gastronómica&body=Hola ${encodeURIComponent(selectedMessage.nombre)},%0D%0A%0D%0AGracias por comunicarte con la Gerencia de Milenia. En respuesta a tu consulta:%0D%0A%0D%0A`}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Responder por Correo</span>
                </a>

                {selectedMessage.telefono && (
                  <a
                    href={`https://wa.me/${selectedMessage.telefono.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(selectedMessage.nombre)},%20te%20escribimos%20de%20la%20Gerencia%20de%20Milenia%20para%20atender%20tu%20mensaje.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Notas Internas de Gerencia */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Bitácora Interna de Gerencia (Solo visible para administración)</span>
                </div>
                <textarea
                  rows={2}
                  value={notaInternaInput}
                  onChange={(e) => setNotaInternaInput(e.target.value)}
                  placeholder="Escribe notas de seguimiento (ej: llamada realizada el 7 de sep, interesado en plan PRO)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition resize-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNota}
                    disabled={isSavingNota}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavingNota ? 'Guardando...' : 'Guardar Nota en Firestore'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Selecciona un mensaje para leer su detalle
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Elige cualquier mensaje de la lista para ver los datos de contacto, número de teléfono, remitente y responder directamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
