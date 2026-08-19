import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Zap, 
  Bell, 
  WifiOff, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { language } = useTasty();
  const { isInstalled, isIOS, isAndroid, isDesktop, triggerInstall, hasNativePrompt } = usePwaInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'accepted') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex relative">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <img src="/icon.svg" alt="MILENIA Icon" className="w-10 h-10 object-contain" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-950"></span>
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-500/20 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{language === 'es' ? 'App Oficial & PWA' : 'Official Web App'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {language === 'es' ? 'Instalar MILENIA' : 'Install MILENIA'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {language === 'es'
                  ? 'Accede a la alta cocina de Ana Milena con 1 toque desde tu pantalla de inicio.'
                  : 'Instant access to Ana Milena haute cuisine from your home screen or desktop.'}
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 my-5">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center space-y-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-200">
                {language === 'es' ? 'Carga Rápida' : 'Ultra Fast'}
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center space-y-1">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-200">
                {language === 'es' ? 'Pedidos en Vivo' : 'Live Status'}
              </span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-2.5 text-center flex flex-col items-center justify-center space-y-1">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-semibold text-slate-200">
                {language === 'es' ? 'Modo Offline' : 'Offline Ready'}
              </span>
            </div>
          </div>

          {/* Device Specific Content */}
          {isInstalled ? (
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-emerald-300">
                {language === 'es' ? '¡MILENIA ya está instalada en este dispositivo!' : 'MILENIA is already installed!'}
              </p>
            </div>
          ) : isIOS ? (
            /* iOS / iPhone / iPad Guided Steps */
            <div className="space-y-3 bg-slate-950/70 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>{language === 'es' ? 'Instalación en iPhone / iPad' : 'iPhone / iPad Installation'}</span>
              </div>
              
              <ol className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span>{language === 'es' ? 'Toca el botón' : 'Tap'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      <Share2 className="w-3 h-3 text-sky-400" />
                      {language === 'es' ? 'Compartir' : 'Share'}
                    </span>
                    <span className="text-slate-400 text-[10px]">{language === 'es' ? '(barra de Safari)' : '(Safari bar)'}</span>
                  </div>
                </li>

                <li className="flex items-center gap-2.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span>{language === 'es' ? 'Desplaza y elige' : 'Scroll and select'}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      <PlusSquare className="w-3 h-3 text-emerald-400" />
                      {language === 'es' ? 'Añadir a inicio' : 'Add to Home'}
                    </span>
                  </div>
                </li>

                <li className="flex items-center gap-2.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <span>{language === 'es' ? 'Pulsa ' : 'Tap '}</span>
                    <strong className="text-amber-400">{language === 'es' ? '"Añadir"' : '"Add"'}</strong>
                    <span>{language === 'es' ? ' en la esquina superior.' : ' in top corner.'}</span>
                  </div>
                </li>
              </ol>
            </div>
          ) : (
            /* Android / Desktop / Laptop Direct Install Action */
            <div className="space-y-3">
              <button
                onClick={handleInstallClick}
                className="w-full py-3.5 px-6 rounded-2xl font-serif font-bold text-sm bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 active:scale-[0.98] transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isDesktop
                    ? (language === 'es' ? 'Instalar en este Ordenador / Portátil' : 'Install on Desktop / Laptop')
                    : isAndroid
                    ? (language === 'es' ? 'Instalar en Android (1 Toque)' : 'Install on Android (1 Tap)')
                    : (language === 'es' ? 'Instalar Aplicación Web' : 'Install Web App')}
                </span>
              </button>

              {!hasNativePrompt && (
                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  {language === 'es'
                    ? 'O pulsa en el menú de tu navegador (⋮) y selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".'
                    : 'Or open your browser menu (⋮) and choose "Install App" or "Add to Home Screen".'}
                </p>
              )}
            </div>
          )}

          {/* Bottom Security Note */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'es' ? 'Sin descargas pesadas • No ocupa espacio' : 'Lightweight PWA • Zero clutter'}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
