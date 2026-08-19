import { useState, useEffect } from 'react';
import { detectBrowserAndOS, DeviceInfo } from '../utils/browserDetection';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectBrowserAndOS());

  useEffect(() => {
    // Check if already in standalone / installed mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandaloneMode);

    const info = detectBrowserAndOS();
    setDeviceInfo(info);

    // On iOS/Android/Desktop, it's installable via native prompt or browser guided menu
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
    deviceInfo,
    browserInfo: deviceInfo, // Backward compatibility
    isIOS: deviceInfo.os === 'ios',
    isIPad: deviceInfo.os === 'ipados',
    isAndroid: deviceInfo.os === 'android',
    isMac: deviceInfo.os === 'macos',
    isWindows: deviceInfo.os === 'windows',
    isSmartphone: deviceInfo.deviceType === 'smartphone',
    isTablet: deviceInfo.deviceType === 'tablet',
    isLaptop: deviceInfo.deviceType === 'laptop',
    isDesktop: deviceInfo.deviceType === 'desktop',
    triggerInstall,
    hasNativePrompt: !!deferredPrompt
  };
}


