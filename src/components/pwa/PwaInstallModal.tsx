import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { BrowserType } from '../../utils/browserDetection';
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
  ChevronRight,
  Compass,
  ExternalLink,
  Info,
  Layers,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallModal: React.FC<PwaInstallModalProps> = ({ isOpen, onClose }) => {
  const { language } = useTasty();
  const { isInstalled, browserInfo, triggerInstall, hasNativePrompt } = usePwaInstall();
  
  // Allow user to toggle between detected browser and other browsers
  const [selectedBrowserTab, setSelectedBrowserTab] = useState<BrowserType>(browserInfo.browser);

  useEffect(() => {
    if (isOpen) {
      setSelectedBrowserTab(browserInfo.browser);
    }
  }, [isOpen, browserInfo]);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const res = await triggerInstall();
    if (res === 'accepted') {
      onClose();
    }
  };

  const isCurrentActiveTabDetected = selectedBrowserTab === browserInfo.browser;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 text-white rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/10 overflow-hidden my-auto max-h-[90vh] flex flex-col"
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
          <div className="overflow-y-auto pr-1 space-y-5 custom-scrollbar">
            
            {/* Header */}
            <div className="text-center space-y-2.5 pt-2">
              <div className="inline-flex relative">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/25">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <img src="/icon.svg" alt="MENIA Icon" className="w-11 h-11 object-contain" />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-950"></span>
                </span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-amber-500/20 mb-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{language === 'es' ? 'App Web Oficial • PWA' : 'Official Web App • PWA'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wider">
                  {language === 'es' ? 'Instalar MENIA en tu Dispositivo' : 'Install MENIA on Your Device'}
                </h2>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {language === 'es'
                    ? 'Accede a la carta de autor, reservas y pedidos con 1 toque en tu pantalla de inicio.'
                    : 'Instant access to dining, table reservations, and live orders from your home screen.'}
                </p>
              </div>
            </div>

            {/* Detected Browser Badge */}
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                    {language === 'es' ? 'Navegador Detectado' : 'Detected Browser'}
                  </span>
                  <p className="text-xs font-bold text-white truncate">
                    {browserInfo.browserName} <span className="text-slate-400 font-normal">({browserInfo.osName})</span>
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                {language === 'es' ? 'Compatible' : 'Ready'}
              </span>
            </div>

            {/* Browser Selector Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'es' ? 'Guía paso a paso por navegador:' : 'Step-by-step guide by browser:'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {[
                  { id: 'safari', name: 'Safari (iOS)' },
                  { id: 'chrome', name: 'Google Chrome' },
                  { id: 'opera', name: 'Opera / GX' },
                  { id: 'samsung', name: 'Samsung Internet' },
                  { id: 'firefox', name: 'Firefox' },
                  { id: 'edge', name: 'Edge' },
                  { id: 'brave', name: 'Brave' },
                  { id: 'inapp', name: 'Instagram / Redes' },
                ].map((b) => {
                  const isActive = selectedBrowserTab === b.id;
                  const isDetected = browserInfo.browser === b.id;

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

            {/* Direct 1-Click Install Button if supported & Native prompt available */}
            {hasNativePrompt && (
              <div className="bg-linear-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300">
                    {language === 'es' ? 'Instalación Directa Disponible' : 'Direct 1-Tap Install Ready'}
                  </span>
                </div>
                <button
                  onClick={handleInstallClick}
                  id="direct-pwa-install-btn"
                  className="w-full py-3 px-5 rounded-xl font-serif font-bold text-sm bg-linear-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{language === 'es' ? 'Instalar MENIA con 1 Toque' : 'Install MENIA (1-Tap)'}</span>
                </button>
              </div>
            )}

            {/* Dynamic Step-by-Step Instructions based on selectedBrowserTab */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              
              {/* SAFARI (iOS / iPadOS) */}
              {selectedBrowserTab === 'safari' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'es' ? 'Instrucciones en Safari (iPhone / iPad)' : 'Safari Instructions (iOS / iPadOS)'}</span>
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
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? '(en la barra inferior de Safari)' : '(in Safari toolbar)'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Desplaza la lista y pulsa' : 'Scroll down and tap'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3 text-emerald-400" />
                          {language === 'es' ? 'Añadir a pantalla de inicio' : 'Add to Home Screen'}
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

              {/* GOOGLE CHROME (Android / iOS / Desktop) */}
              {selectedBrowserTab === 'chrome' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <Globe className="w-4 h-4" />
                    <span>{language === 'es' ? 'Instrucciones en Google Chrome' : 'Google Chrome Instructions'}</span>
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
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'arriba a la derecha' : 'top right'}</span>
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
                        <span>{language === 'es' ? 'Pulsa ' : 'Tap '}</span>
                        <strong className="text-amber-400">{language === 'es' ? '"Instalar"' : '"Install"'}</strong>
                        <span>{language === 'es' ? ' en la ventana de confirmación.' : ' in the confirmation dialog.'}</span>
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
                    <span>{language === 'es' ? 'Instrucciones en Opera / Opera GX' : 'Opera / Opera GX Instructions'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el icono de Opera' : 'Tap the Opera icon'}</span>
                        <span className="font-bold text-rose-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (O) {language === 'es' ? 'o menú' : 'or menu'}
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la barra inferior o superior' : 'in the toolbar'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Pulsa en' : 'Tap on'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          <PlusSquare className="w-3 h-3" />
                          {language === 'es' ? 'Pantalla de inicio' : 'Home screen'}
                        </span>
                        <span>{language === 'es' ? 'o "Instalar app"' : 'or "Install App"'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span>{language === 'es' ? 'Pulsa ' : 'Tap '}</span>
                        <strong className="text-amber-400">{language === 'es' ? '"Añadir"' : '"Add"'}</strong>
                        <span>{language === 'es' ? ' para fijar MENIA en tu pantalla.' : ' to pin MENIA to your screen.'}</span>
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
                    <span>{language === 'es' ? 'Instrucciones en Samsung Internet' : 'Samsung Internet Instructions'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú de 3 líneas' : 'Tap the 3 lines menu'}</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (≡)
                        </span>
                        <span>{language === 'es' ? 'o el icono de descarga en la barra' : 'or the download icon in URL bar'}</span>
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
                          {language === 'es' ? '+ Añadir página a' : '+ Add page to'}
                        </span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        3
                      </div>
                      <div className="flex-1">
                        <span>{language === 'es' ? 'Elige ' : 'Choose '}</span>
                        <strong className="text-amber-400">{language === 'es' ? '"Pantalla de inicio"' : '"Home Screen"'}</strong>
                        <span>{language === 'es' ? ' y pulsa Añadir.' : ' and tap Add.'}</span>
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
                    <span>{language === 'es' ? 'Instrucciones en Mozilla Firefox' : 'Mozilla Firefox Instructions'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca los tres puntos' : 'Tap the 3 dots'}</span>
                        <span className="font-bold text-orange-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (⋮)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'junto a la barra de direcciones' : 'next to the address bar'}</span>
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
                          {language === 'es' ? 'Instalar' : 'Install'}
                        </span>
                        <span>{language === 'es' ? 'o "Añadir a la pantalla de inicio"' : 'or "Add to Home Screen"'}</span>
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
                    <span>{language === 'es' ? 'Instrucciones en Microsoft Edge' : 'Microsoft Edge Instructions'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca el menú' : 'Tap the menu'}</span>
                        <span className="font-bold text-sky-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (···)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la barra inferior o superior' : 'in the toolbar'}</span>
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
                          {language === 'es' ? 'Añadir al teléfono / Instalar' : 'Add to Phone / Install'}
                        </span>
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {/* BRAVE BROWSER */}
              {selectedBrowserTab === 'brave' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{language === 'es' ? 'Instrucciones en Brave Browser' : 'Brave Browser Instructions'}</span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca los tres puntos' : 'Tap the 3 dots'}</span>
                        <span className="font-bold text-amber-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (⋮)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'abajo a la derecha' : 'bottom right'}</span>
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
                          {language === 'es' ? 'Instalar app / Pantalla de inicio' : 'Install app / Add to Home'}
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
                    <span>{language === 'es' ? 'Navegadores Integrados (Instagram / TikTok / Facebook)' : 'In-App WebViews'}</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-200 leading-relaxed flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {language === 'es'
                        ? 'Los navegadores dentro de redes sociales no permiten la instalación directa. Ábrelo en Safari o Chrome para instalar:'
                        : 'Social in-app browsers do not support direct PWA install. Open in Safari or Chrome first:'}
                    </span>
                  </div>
                  <ol className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        1
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Toca los 3 puntos' : 'Tap the 3 dots'}</span>
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                          (···)
                        </span>
                        <span className="text-slate-400 text-[11px]">{language === 'es' ? 'en la esquina superior o inferior' : 'in the top or bottom corner'}</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-2.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                        2
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 flex-wrap">
                        <span>{language === 'es' ? 'Pulsa en' : 'Select'}</span>
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
              <span>{language === 'es' ? 'PWA Ligera • No consume almacenamiento • Cero publicidad' : 'Lightweight PWA • Zero clutter • Private & Secure'}</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

