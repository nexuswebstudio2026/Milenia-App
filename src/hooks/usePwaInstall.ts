import { useState, useEffect } from 'react';
import { detectBrowserAndOS, BrowserInfo } from '../utils/browserDetection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>(() => detectBrowserAndOS());

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandaloneMode);

    const info = detectBrowserAndOS();
    setBrowserInfo(info);

    // On iOS or any supported mobile browser, it's installable via specific browser menus if not standalone
    if (!isStandaloneMode) {
      setIsInstallable(true);
    }

    // Listen for Chromium PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'manual_guide' | 'unsupported'> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        setDeferredPrompt(null);
        return choiceResult.outcome;
      } catch (err) {
        console.warn('Install prompt error:', err);
        return 'manual_guide';
      }
    }

    return 'manual_guide';
  };

  return {
    isInstallable,
    isInstalled,
    isIOS: browserInfo.os === 'ios',
    isAndroid: browserInfo.os === 'android',
    isDesktop: browserInfo.os === 'desktop',
    browserInfo,
    triggerInstall,
    hasNativePrompt: !!deferredPrompt
  };
}

