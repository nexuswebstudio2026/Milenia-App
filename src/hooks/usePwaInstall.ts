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
  const [isInsideIframe, setIsInsideIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInsideIframe(window.self !== window.top);
    } catch {
      setIsInsideIframe(true);
    }

    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandaloneMode);

    const info = detectBrowserAndOS();
    setDeviceInfo(info);

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

  const triggerInstall = async (): Promise<'accepted' | 'dismissed' | 'opened_direct_tab' | 'manual_guide'> => {
    // 1. Native Chromium Prompt (Android / Windows / Mac / Linux / ChromeOS) if available
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
      }
    }

    // 2. If inside iframe (AI Studio preview iframe or embed), native prompts are blocked by browser security
    if (isInsideIframe && typeof window !== 'undefined') {
      try {
        window.open(window.location.href, '_blank');
        return 'opened_direct_tab';
      } catch {
        return 'manual_guide';
      }
    }

    return 'manual_guide';
  };

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return {
    isInstallable,
    isInstalled,
    deviceInfo,
    browserInfo: deviceInfo,
    isIOS: deviceInfo.os === 'ios',
    isIPad: deviceInfo.os === 'ipados',
    isAndroid: deviceInfo.os === 'android',
    isMac: deviceInfo.os === 'macos',
    isWindows: deviceInfo.os === 'windows',
    isSmartphone: deviceInfo.deviceType === 'smartphone',
    isTablet: deviceInfo.deviceType === 'tablet',
    isLaptop: deviceInfo.deviceType === 'laptop',
    isDesktop: deviceInfo.deviceType === 'desktop',
    isInsideIframe,
    triggerInstall,
    openInNewTab,
    hasNativePrompt: !!deferredPrompt
  };
}
