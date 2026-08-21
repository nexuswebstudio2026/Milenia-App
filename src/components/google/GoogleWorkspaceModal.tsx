import React, { useState, useEffect } from 'react';
import { 
  getStoredGoogleUser, 
  requestGoogleWorkspaceAuth, 
  disconnectGoogleWorkspace, 
  GoogleAuthUser 
} from '../../services/googleAuthService';
import { 
  fetchUpcomingCalendarEvents, 
  GoogleCalendarEvent 
} from '../../services/googleCalendarService';
import { 
  getLocalDriveDocuments, 
  GoogleDriveDocument, 
  archiveDailyZReportToGoogleDrive 
} from '../../services/googleDriveService';
import { useTasty } from '../../context/TastyContext';
import { 
  Calendar, 
  HardDrive, 
  CheckCircle2, 
  Cloud, 
  X, 
  ExternalLink, 
  Upload, 
  RefreshCw, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'calendar' | 'drive' | 'account';
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'account'
}) => {
  const { currentTenant, showToast, reservations, tenantEmployees } = useTasty();
  const [activeTab, setActiveTab] = useState<'calendar' | 'drive' | 'account'>(initialTab);
  const [user, setUser] = useState<GoogleAuthUser | null>(getStoredGoogleUser());
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [driveDocs, setDriveDocs] = useState<GoogleDriveDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customEmail, setCustomEmail] = useState('nexuswebstudio2026@gmail.com');

  useEffect(() => {
    if (isOpen) {
      setUser(getStoredGoogleUser());
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const events = await fetchUpcomingCalendarEvents();
      setCalendarEvents(events);
      const docs = getLocalDriveDocuments().filter(d => d.restaurantId === currentTenant.id || !d.restaurantId);
      setDriveDocs(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const connectedUser = await requestGoogleWorkspaceAuth(customEmail);
      setUser(connectedUser);
      showToast('Google Workspace Conectado', `Cuenta vinculada con éxito (${connectedUser.email})`, 'success');
      loadData();
    } catch (e) {
      showToast('Error de Conexión', 'No se pudo vincular la cuenta de Google', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectGoogleWorkspace();
    setUser(null);
    showToast('Desconectado', 'Sesión de Google Workspace cerrada', 'info');
  };

  const handleGenerateAndSaveZReport = async () => {
    setIsLoading(true);
    try {
      const stats = {
        totalSalesCop: 3850000,
        impoconsumoCop: 308000,
        tipsCop: 385000,
        ordersCount: 24,
        topDishName: 'Solomillo Wellington Reserva',
        date: new Date().toISOString().split('T')[0]
      };
      const res = await archiveDailyZReportToGoogleDrive(currentTenant, stats);
      if (res.success) {
        showToast('Guardado en Google Drive', `Cierre de caja Z exportado a la nube: ${res.document.name}`, 'success');
        loadData();
      }
    } catch (e) {
      showToast('Error al exportar', 'No se pudo subir a Google Drive', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-500/30">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  Google Workspace & Cloud Hub
                </h3>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  OAuth 2.0 Habilitado
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronización de Google Calendar (Reservas/Turnos) y Google Drive (Facturas DIAN/Cierres Z)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 gap-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'account'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Cuenta & Permisos</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Google Calendar ({calendarEvents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'drive'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Google Drive ({driveDocs.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: ACCOUNT & OAUTH */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              
              {/* Connection Status Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
                    G
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {user ? user.name : 'Conexión Google Workspace'}
                      </h4>
                      {user && (
                        <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Conectado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user ? user.email : 'Conecta tu cuenta para sincronizar reservas en Calendar y facturas en Drive.'}
                    </p>
                  </div>
                </div>

                {user ? (
                  <button
                    onClick={handleDisconnect}
                    className="py-2 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition"
                  >
                    Desconectar Cuenta
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                      type="email"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white w-full sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                      placeholder="correo@ejemplo.com"
                    />
                    <button
                      onClick={handleConnect}
                      disabled={isLoading}
                      className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition whitespace-nowrap"
                    >
                      {isLoading ? 'Conectando...' : 'Conectar Google'}
                    </button>
                  </div>
                )}
              </div>

              {/* Scopes & Permissions List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Permisos y Funcionalidades Activas
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">Google Calendar API</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Exportación automática de reservas de comensales y asignación de turnos del personal en Colombia.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white">Google Drive API</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Almacenamiento seguro en la nube de Facturas DIAN (Impoconsumo 8%) y Cierres Fiscales Z en PDF/JSON.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: GOOGLE CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Eventos & Reservas Sincronizadas
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Calendario primario de {currentTenant.name}
                  </p>
                </div>
                <button
                  onClick={loadData}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold rounded-xl transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>

              {calendarEvents.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No hay eventos en el calendario aún</p>
                  <p className="text-xs text-slate-500 mt-1">Crea una reserva para sincronizarla automáticamente con Google Calendar.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {calendarEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xs hover:border-amber-500/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${evt.eventType === 'shift' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{evt.summary}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                            <span>📅 {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString('es-CO') : evt.start?.date}</span>
                            {evt.location && <span>• 📍 {evt.location}</span>}
                          </p>
                        </div>
                      </div>

                      {evt.htmlLink && (
                        <a
                          href={evt.htmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Abrir en Google Calendar"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Archivos en Google Drive ({currentTenant.name})
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Facturas electrónicas DIAN, Cierres Z y Auditorías contables
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateAndSaveZReport}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Exportar Cierre Z a Drive</span>
                  </button>
                  <button
                    onClick={loadData}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 rounded-xl transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {driveDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 shadow-xs hover:border-emerald-500/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${doc.category === 'invoice' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</h5>
                          <span className="text-[10px] font-bold px-2 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                            {doc.sizeFormatted}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {doc.contentSnippet}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {doc.downloadUrl && (
                        <a
                          href={doc.downloadUrl}
                          download={doc.name}
                          className="p-2 text-slate-400 hover:text-emerald-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Descargar archivo"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                      {doc.webViewLink && (
                        <a
                          href={doc.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Abrir en Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Encriptación Google Cloud Security & DIAN Colombia Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
