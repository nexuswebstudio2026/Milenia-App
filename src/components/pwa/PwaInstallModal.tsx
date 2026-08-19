import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { BrowserType, DeviceType, OperatingSystem } from '../../utils/browserDetection';
import { 
  Download, 
  Smartphone, 
  Tablet,
  Laptop, 
  Monitor,
  Share2, 
  PlusSquare, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Zap, 
  Bell, 
  WifiOff, 
  ShieldCheck,
  ChevronRight,
  Compass,
  ExternalLink,
  Info,
  Layers,
  Globe,
  Cpu,
  Fingerprint
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
    hasNativePrompt,
    isIOS,
    isIPad,
    isAndroid,
    isMac,
    isWindows,
    isSmartphone,
    isTablet,
    isLaptop,
    isDesktop
  } = usePwaInstall();
  
  // Selected tabs
  const [selectedDeviceTab, setSelectedDeviceTab] = useState<DeviceType>(deviceInfo.deviceType);
  const [selectedBrowserTab, setSelectedBrowserTab] = useState<BrowserType>(deviceInfo.browser);

  useEffect(() => {
    if (isOpen) {
      setSelectedDeviceTab(deviceInfo.deviceType);
      setSelectedBrowserTab(deviceInfo.browser);
    }
  }, [isOpen, deviceInfo]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'accepted') {
      onClose();
    }
  };

  const getDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-5 h-5 text-amber-400" />;
      case 'tablet': return <Tablet className="w-5 h-5 text-amber-400" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-amber-400" />;
      case 'desktop': return <Monitor className="w-5 h-5 text-amber-400" />;
      default: return <Smartphone className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-xl bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/10 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            id="close-pwa-modal-btn"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer z-20"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Container */}
          <div className="overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            
            {/* Header */}
            <div className="text-center space-y-2 pt-1">
              <div className="inline-flex relative">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <img src="/icon.svg" alt="MENIA Icon" className="w-10 h-10 object-contain" />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-slate-950"></span>
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-amber-500/20 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{language === 'es' ? 'Instalación Multi-Dispositivo • PWA' : 'Multi-Device Installation • PWA'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wider">
                  {deviceInfo.installHeadline}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  {deviceInfo.installSubheadline}
                </p>
              </div>
            </div>

            {/* LIVE DETECTED HARDWARE & OS CARD */}
            <div className="bg-slate-950/90 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                    {language === 'es' ? 'Dispositivo y Sistema Detectados' : 'Detected Device & System'}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {language === 'es' ? '100% Compatible' : 'Ready'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {/* Device Type */}
                <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center gap-2">
                  {getDeviceIcon(deviceInfo.deviceType)}
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">{language === 'es' ? 'Dispositivo' : 'Device'}</span>
                    <span className="font-bold text-white text-xs truncate block">{deviceInfo.deviceModel}</span>
                  </div>
                </div>

                {/* Operating System */}
                <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">{language === 'es' ? 'Sistema (OS)' : 'System'}</span>
                    <span className="font-bold text-white text-xs truncate block">{deviceInfo.osName}</span>
                  </div>
                </div>

                {/* Browser */}
                <div className="col-span-2 sm:col-span-1 bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">{language === 'es' ? 'Navegador' : 'Browser'}</span>
                    <span className="font-bold text-white text-xs truncate block">{deviceInfo.browserName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct 1-Click Install Button if supported & Native prompt available */}
            {hasNativePrompt && (
              <div className="bg-linear-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300">
                      {language === 'es' ? 'Instalación Instantánea Disponible' : 'Direct 1-Tap Install Ready'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-semibold">{deviceInfo.deviceModel}</span>
                </div>
                <button
                  onClick={handleInstallClick}
                  id="direct-pwa-install-btn"
                  className="w-full py-3.5 px-5 rounded-xl font-serif font-bold text-sm bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'es' ? `Instalar MENIA en tu ${deviceInfo.deviceModel}` : `Install MENIA on ${deviceInfo.deviceModel}`}</span>
                </button>
              </div>
            )}

            {/* DEVICE SELECTOR TABS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'es' ? 'Seleccionar tipo de dispositivo:' : 'Select device type:'}
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {[
                  { id: 'smartphone', name: 'Smartphone', icon: Smartphone, label: 'iPhone / Android' },
                  { id: 'tablet', name: 'Tablet', icon: Tablet, label: 'iPad / Android' },
                  { id: 'laptop', name: 'Portátil', icon: Laptop, label: 'MacBook / Win' },
                  { id: 'desktop', name: 'Escritorio', icon: Monitor, label: 'PC / Mac' },
                ].map((d) => {
                  const isActive = selectedDeviceTab === d.id;
                  const isDetected = deviceInfo.deviceType === d.id;
                  const Icon = d.icon;

                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDeviceTab(d.id as DeviceType)}
                      className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold leading-tight">{d.name}</span>
                      {isDetected && (
                        <span className={`text-[8px] uppercase px-1 rounded font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-400'}`}>
                          {language === 'es' ? 'Detectado' : 'Active'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BROWSER SELECTOR CHIPS */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'es' ? 'Navegadores compatibles:' : 'Supported browsers:'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: 'safari', name: 'Safari (Apple)' },
                  { id: 'chrome', name: 'Google Chrome' },
                  { id: 'opera', name: 'Opera / GX' },
                  { id: 'samsung', name: 'Samsung Internet' },
                  { id: 'firefox', name: 'Firefox' },
                  { id: 'edge', name: 'Edge' },
                  { id: 'brave', name: 'Brave' },
                  { id: 'inapp', name: 'Instagram / Redes' },
                ].map((b) => {
                  const isActive = selectedBrowserTab === b.id;
                  const isDetected = deviceInfo.browser === b.id;

                  return (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBrowserTab(b.id as BrowserType)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 text-xs ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      <span>{b.name}</span>
                      {isDetected && (
                        <span className={`text-[9px] px-1 rounded ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {language === 'es' ? 'Actual' : 'Active'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DYNAMIC STEP-BY-STEP INSTRUCTIONS ACCORDING TO BROWSER & DEVICE */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
              
              {/* SAFARI (iOS / iPadOS / macOS) */}
              {selectedBrowserTab === 'safari' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span>{selectedDeviceTab === 'tablet' ? 'Safari en iPad (iPadOS)' : selectedDeviceTab === 'laptop' || selectedDeviceTab === 'desktop' ? 'Safari en Mac (macOS Sonoma / Sequoia)' : 'Safari en iPhone (iOS)'}</span>
                    </div>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el botón' : 'Tap'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <Share2 className="w-3 h-3 text-sky-400" />
                          {language === 'es' ? 'Compartir' : 'Share'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? '(barra de navegación de Safari)' : '(in Safari toolbar)'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Desplaza la lista y pulsa' : 'Scroll down and select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3 text-emerald-400" />
                          {selectedDeviceTab === 'laptop' || selectedDeviceTab === 'desktop'
                            ? (language === 'es' ? 'Añadir al Dock' : 'Add to Dock')
                            : (language === 'es' ? 'Añadir a pantalla de inicio' : 'Add to Home Screen')}
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span>{language === 'es' ? 'Pulsa ' : 'Tap '}</span>
                        <strong className="text-amber-400">{language === 'es' ? '"Añadir"' : '"Add"'}</strong>
                        <span>{language === 'es' ? ' en la esquina superior derecha.' : ' in the top right corner.'}</span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* GOOGLE CHROME (Android, Windows, macOS, Chromebook) */}
              {selectedBrowserTab === 'chrome' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>{language === 'es' ? `Google Chrome (${selectedDeviceTab === 'laptop' || selectedDeviceTab === 'desktop' ? 'Portátil / PC' : 'Móvil / Tablet'})` : 'Google Chrome'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca los tres puntos' : 'Tap the three dots menu'}</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (⋮) {language === 'es' ? 'Menú' : 'Menu'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la esquina superior' : 'in top corner'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Selecciona' : 'Select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <Download className="w-3 h-3" />
                          {language === 'es' ? 'Instalar aplicación' : 'Install App'}
                        </span>
                        <span>{language === 'es' ? 'o "Añadir a pantalla de inicio"' : 'or "Add to Home Screen"'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span>{language === 'es' ? 'Pulsa ' : 'Click '}</span>
                        <strong className="text-amber-400">{language === 'es' ? '"Instalar"' : '"Install"'}</strong>
                        <span>{language === 'es' ? ' para añadir MENIA como aplicación independiente.' : ' to finish setup.'}</span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* OPERA / OPERA GX */}
              {selectedBrowserTab === 'opera' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Compass className="w-4 h-4" />
                    <span>{language === 'es' ? 'Opera / Opera GX' : 'Opera Browser'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el icono' : 'Tap'}</span>
                        <span className="font-bold text-rose-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (O) {language === 'es' ? 'de Opera' : 'Opera Menu'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'o los tres puntos' : 'or three dots'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Elige' : 'Choose'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3" />
                          {language === 'es' ? 'Pantalla de inicio' : 'Home Screen'}
                        </span>
                        <span>{language === 'es' ? 'o "Instalar app"' : 'or "Install App"'}</span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* SAMSUNG INTERNET */}
              {selectedBrowserTab === 'samsung' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'es' ? 'Samsung Internet (Galaxy Phones & Tablets)' : 'Samsung Internet'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú' : 'Tap'}</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (≡)
                        </span>
                        <span>{language === 'es' ? 'o la flecha de descarga en la barra de direcciones' : 'or download icon'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Selecciona' : 'Select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3" />
                          {language === 'es' ? '+ Añadir página a > Pantalla de inicio' : '+ Add page to > Home Screen'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* MOZILLA FIREFOX */}
              {selectedBrowserTab === 'firefox' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>{language === 'es' ? 'Mozilla Firefox' : 'Mozilla Firefox'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú' : 'Tap'}</span>
                        <span className="font-bold text-orange-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (⋮)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'junto a la barra de direcciones' : 'next to address bar'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Pulsa en' : 'Tap on'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <Download className="w-3 h-3" />
                          {language === 'es' ? 'Instalar o Añadir a inicio' : 'Install or Add to Home'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* MICROSOFT EDGE */}
              {selectedBrowserTab === 'edge' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Laptop className="w-4 h-4" />
                    <span>{language === 'es' ? 'Microsoft Edge (Windows / Mac / Android)' : 'Microsoft Edge'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú' : 'Tap'}</span>
                        <span className="font-bold text-sky-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (···)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la barra de Edge' : 'in Edge toolbar'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Selecciona' : 'Select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <Download className="w-3 h-3" />
                          {language === 'es' ? 'Instalar esta app / Añadir al teléfono' : 'Install this app'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* BRAVE */}
              {selectedBrowserTab === 'brave' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'es' ? 'Brave Browser' : 'Brave Browser'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú' : 'Tap'}</span>
                        <span className="font-bold text-amber-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (⋮)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la esquina' : 'menu'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Selecciona' : 'Select'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <Download className="w-3 h-3" />
                          {language === 'es' ? 'Instalar aplicación' : 'Install App'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* IN-APP BROWSERS (Instagram, TikTok, FB, WhatsApp, Twitter) */}
              {selectedBrowserTab === 'inapp' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <ExternalLink className="w-4 h-4" />
                    <span>{language === 'es' ? 'Navegador Integrado de Redes Sociales' : 'In-App WebViews'}</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {language === 'es'
                        ? 'Las aplicaciones como Instagram o TikTok no permiten instalar PWAs de forma directa dentro de su visor. Para instalar MENIA:'
                        : 'In-app social browsers restrict direct installation. Open in Safari or Chrome to install:'}
                    </span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca los tres puntos' : 'Tap'}</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (···)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la esquina superior' : 'in the corner'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Pulsa en' : 'Tap on'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <ExternalLink className="w-3 h-3" />
                          {language === 'es' ? '"Abrir en el navegador del sistema"' : '"Open in Browser"'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-2">
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

            {/* Bottom Security Note */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'es' ? 'PWA Ligera • No ocupa espacio • Cero descargas pesadas' : 'Lightweight PWA • Zero storage clutter • Secure'}</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
