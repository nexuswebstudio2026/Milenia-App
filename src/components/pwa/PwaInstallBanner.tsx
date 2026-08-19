import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { Download, Smartphone, Tablet, Laptop, Monitor, Sparkles, X, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallBannerProps {
  onOpenModal: () => void;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ onOpenModal }) => {
  const { language } = useTasty();
  const { isInstalled, deviceInfo } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (isInstalled || dismissed) return null;

  const renderDeviceIcon = () => {
    switch (deviceInfo.deviceType) {
      case 'smartphone': return <Smartphone className="w-3.5 h-3.5" />;
      case 'tablet': return <Tablet className="w-3.5 h-3.5" />;
      case 'laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'desktop': return <Monitor className="w-3.5 h-3.5" />;
      default: return <Smartphone className="w-3.5 h-3.5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        className="my-4 bg-linear-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-3.5 sm:p-4 text-white shadow-xl shadow-amber-500/5 relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 p-1 shadow-md shadow-amber-500/10">
              <img src="/icon.svg" alt="MENIA Icon" className="w-7 h-7 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-sm text-white tracking-wider truncate">
                  MENIA App
                </span>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  {renderDeviceIcon()}
                  <span>{deviceInfo.deviceModel} • {deviceInfo.osName}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate">
                {language === 'es'
                  ? `Dispositivo detectado: ${deviceInfo.deviceModel} con ${deviceInfo.browserName}. Pulsa para instalar.`
                  : `Detected device: ${deviceInfo.deviceModel} on ${deviceInfo.browserName}. Tap to install.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenModal}
              id="pwa-banner-install-btn"
              className="flex-1 sm:flex-initial bg-linear-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'es' ? `Instalar en ${deviceInfo.deviceModel}` : `Install on ${deviceInfo.deviceModel}`}</span>
            </button>

            <button
              onClick={handleDismiss}
              id="pwa-banner-dismiss-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              aria-label="Descartar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};


