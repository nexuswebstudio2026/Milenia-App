import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { 
  Download, 
  Smartphone, 
  Monitor,
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Compass,
  Cpu,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { language } = useTasty();
  const { 
    deviceInfo, 
    triggerInstall, 
    hasNativePrompt,
    isInsideIframe,
    openInNewTab
  } = usePwaInstall();

  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'guide' | 'success'>('idle');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstallStatus('installing');
    const res = await triggerInstall();
    if (res === 'accepted') {
      setInstallStatus('success');
      setTimeout(() => {
        onClose();
      }, 1800);
    } else {
      setInstallStatus('guide');
    }
  };

  const isIosOrSafari = deviceInfo.os === 'ios' || deviceInfo.os === 'ipados' || deviceInfo.browser === 'safari';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 text-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/15 overflow-hidden my-auto"
        >
          {/* Ambient Gold Glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-amber-600/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            id="close-pwa-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer z-20"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-5 text-center">
            
            {/* Official Logo Preview (Same as Header) */}
            <div className="inline-flex flex-col items-center gap-2 mx-auto pt-1">
              <div className="relative">
                <div className="w-18 h-18 rounded-2xl bg-linear-to-br from-amber-400 via-amber-500 to-amber-600 p-0.5 shadow-xl shadow-amber-500/30">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1.5 overflow-hidden">
                    <img 
                      src="/apple-touch-icon.png" 
                      alt="Logo Oficial MILENIA" 
                      className="w-full h-full object-contain rounded-[10px]" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icon.svg';
                      }}
                    />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-950"></span>
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400/90">
                {language === 'es' ? 'Logo Oficial MILENIA' : 'Official MILENIA Logo'}
              </span>
            </div>

            {/* Main Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                {deviceInfo.installHeadline}
              </h2>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {deviceInfo.installSubheadline}
              </p>
            </div>

            {/* "DETECTADO AUTOMÁTICAMENTE" CARD */}
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {language === 'es' ? 'Detectado Automáticamente' : 'Detected Automatically'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {language === 'es' ? 'Listo para Instalar' : 'Ready to Install'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Conectado en / Dispositivo */}
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  {deviceInfo.isMobile ? (
                    <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
                  ) : (
                    <Monitor className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {language === 'es' ? 'Conectado en' : 'Connected on'}
                    </span>
                    <span className="font-bold text-white text-xs truncate block">
                      {deviceInfo.isMobile ? 'Dispositivo Móvil' : deviceInfo.deviceModel}
                    </span>
                  </div>
                </div>

                {/* Sistema Operativo */}
                <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {language === 'es' ? 'Sistema' : 'System'}
                    </span>
                    <span className="font-bold text-white text-xs truncate block">
                      {deviceInfo.osName}
                    </span>
                  </div>
                </div>

                {/* Navegador */}
                <div className="col-span-2 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0 flex-1 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        {language === 'es' ? 'Navegador Web' : 'Browser'}
                      </span>
                      <span className="font-bold text-white text-xs truncate block">
                        {deviceInfo.browserName}
                      </span>
                    </div>
                    <span className="text-[10px] text-amber-400 font-semibold">
                      {language === 'es' ? 'Icono Oficial Incluido' : 'Official Logo Included'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success state */}
            {installStatus === 'success' ? (
              <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1.5 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-serif font-bold text-emerald-300 text-sm">
                  {language === 'es' ? '¡Aplicación Instalada con Éxito!' : 'App Installed Successfully!'}
                </h4>
                <p className="text-xs text-slate-300">
                  {language === 'es' ? 'MILENIA con su logo oficial ya está en tu pantalla de inicio / escritorio.' : 'MILENIA with its official logo is now on your device.'}
                </p>
              </div>
            ) : (
              /* PRIMARY FUNCTIONAL INSTALL BUTTON */
              <div className="space-y-2.5">
                <button
                  onClick={handleInstallClick}
                  id="direct-pwa-install-modal-btn"
                  className="w-full py-4 px-5 rounded-2xl font-serif font-bold text-sm sm:text-base bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>{deviceInfo.installButtonText}</span>
                </button>

                {isInsideIframe && (
                  <button
                    onClick={openInNewTab}
                    id="open-direct-pwa-tab-btn"
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-700 hover:border-amber-500/50 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'es' ? 'Abrir en pestaña completa (Recomendado para 1 Clic)' : 'Open in direct tab for 1-Click install'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Exact Step-by-Step Instructions based on OS & Browser */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-300">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                {language === 'es' ? `Instrucciones para ${deviceInfo.browserName}:` : `Instructions for ${deviceInfo.browserName}:`}
              </span>

              {isIosOrSafari ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{language === 'es' ? 'En Safari, toca el botón' : 'In Safari, tap'}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        {language === 'es' ? 'Compartir' : 'Share'}
                      </span>
                      <span className="text-slate-400 text-[11px]">{language === 'es' ? '(barra inferior)' : '(bottom bar)'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/40">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white font-medium">{language === 'es' ? 'Baja en el menú y selecciona' : 'Scroll and select'}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-amber-500/40">
                        <PlusSquare className="w-3.5 h-3.5" />
                        {language === 'es' ? 'Añadir a pantalla de inicio' : 'Add to Home Screen'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>{language === 'es' ? 'En la barra superior o menú' : 'In top bar or menu'}</span>
                      <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        (⋮)
                      </span>
                      <span>{language === 'es' ? 'pulsa' : 'click'}</span>
                      <span className="font-bold text-amber-400">
                        {language === 'es' ? '"Instalar MILENIA"' : '"Install MILENIA"'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-amber-500/15 p-2.5 rounded-xl border border-amber-500/40">
                    <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white font-medium">
                        {language === 'es' ? 'Confirma para tener el logo oficial en tu escritorio / pantalla.' : 'Confirm to get the official logo on your device.'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
