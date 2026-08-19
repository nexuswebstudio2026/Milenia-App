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
  Zap, 
  Compass,
  ExternalLink,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { language } = useTasty();
  const { 
    isInstalled, 
    deviceInfo, 
    triggerInstall, 
    hasNativePrompt
  } = usePwaInstall();

  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'guide'>('idle');

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setInstallStatus('installing');
    const res = await triggerInstall();
    if (res === 'accepted') {
      onClose();
    } else {
      // If manual guide is needed (e.g. Safari on iOS), show steps
      setInstallStatus('guide');
    }
  };

  const isIosOrSafari = deviceInfo.os === 'ios' || deviceInfo.os === 'ipados' || deviceInfo.browser === 'safari';
  const showGuide = installStatus === 'guide' || (isIosOrSafari && !hasNativePrompt);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-500/10 overflow-hidden my-auto"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

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
            {/* App Icon */}
            <div className="inline-flex relative mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <img src="/icon.svg" alt="MENIA Icon" className="w-11 h-11 object-contain" />
                </div>
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-950"></span>
              </span>
            </div>

            {/* Title and Subtitle */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                {deviceInfo.installHeadline}
              </h2>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {deviceInfo.installSubheadline}
              </p>
            </div>

            {/* Live Detected Info Card */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  {deviceInfo.isMobile ? (
                    <Smartphone className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    {language === 'es' ? 'Detectado Automáticamente' : 'Auto Detected'}
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {deviceInfo.isMobile ? 'Dispositivo Móvil' : deviceInfo.deviceModel} • <span className="text-slate-300 font-normal">{deviceInfo.browserName}</span>
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'es' ? 'Listo' : 'Ready'}
              </span>
            </div>

            {/* Primary Direct Action Button */}
            <button
              onClick={handleInstallClick}
              id="direct-pwa-install-modal-btn"
              className="w-full py-3.5 px-5 rounded-2xl font-serif font-bold text-sm bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{deviceInfo.installButtonText}</span>
            </button>

            {/* Exact Step-by-Step Guide for Safari/iOS or Manual when native prompt not applicable */}
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5 text-xs text-slate-300"
              >
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  {language === 'es' ? `Pasos para ${deviceInfo.browserName}:` : `Steps for ${deviceInfo.browserName}:`}
                </span>

                {deviceInfo.isInApp ? (
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      {language === 'es'
                        ? '1. Toca los tres puntos (···) y selecciona "Abrir en el navegador".'
                        : '1. Tap (···) and select "Open in browser".'}
                    </p>
                    <p className="text-slate-300">
                      {language === 'es'
                        ? '2. Pulsa en Instalar o Añadir a pantalla de inicio.'
                        : '2. Tap Install or Add to Home Screen.'}
                    </p>
                  </div>
                ) : isIosOrSafari ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">1</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{language === 'es' ? 'Toca el botón' : 'Tap'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          <Share2 className="w-3 h-3 text-sky-400" />
                          {language === 'es' ? 'Compartir' : 'Share'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                      <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">2</span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{language === 'es' ? 'Selecciona' : 'Select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3" />
                          {language === 'es' ? 'Añadir a pantalla de inicio' : 'Add to Home Screen'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-slate-300">
                      {language === 'es'
                        ? '1. Pulsa en el menú de tres puntos (⋮) de tu navegador.'
                        : '1. Tap the three dots (⋮) menu.'}
                    </p>
                    <p className="text-slate-300">
                      {language === 'es'
                        ? '2. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio".'
                        : '2. Select "Install App" or "Add to Home Screen".'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
