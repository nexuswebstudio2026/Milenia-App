export type BrowserType = 
  | 'safari'
  | 'chrome'
  | 'opera'
  | 'firefox'
  | 'samsung'
  | 'edge'
  | 'brave'
  | 'inapp'
  | 'other';

export type OperatingSystem = 'ios' | 'android' | 'desktop' | 'other';

export interface BrowserInfo {
  browser: BrowserType;
  browserName: string;
  os: OperatingSystem;
  osName: string;
  isInApp: boolean;
  inAppName?: string;
  supportsNativePrompt: boolean;
}

export function detectBrowserAndOS(): BrowserInfo {
  if (typeof window === 'undefined' || !window.navigator) {
    return {
      browser: 'chrome',
      browserName: 'Google Chrome',
      os: 'desktop',
      osName: 'Escritorio',
      isInApp: false,
      supportsNativePrompt: true
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const vendor = (navigator.vendor || '').toLowerCase();

  // Detect OS
  const isIOS = /iphone|ipad|ipod/.test(ua) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(ua);
  const isDesktop = !isIOS && !isAndroid && !/mobile/.test(ua);

  let os: OperatingSystem = 'desktop';
  let osName = 'Escritorio / Laptop';
  if (isIOS) {
    os = 'ios';
    osName = /ipad/.test(ua) ? 'iPadOS' : 'iOS (iPhone)';
  } else if (isAndroid) {
    os = 'android';
    osName = 'Android';
  }

  // Detect In-App WebViews (Instagram, Facebook, TikTok, WhatsApp, etc.)
  let isInApp = false;
  let inAppName: string | undefined;

  if (/instagram/.test(ua)) {
    isInApp = true;
    inAppName = 'Instagram';
  } else if (/fban|fbav|fb_iab|messenger/.test(ua)) {
    isInApp = true;
    inAppName = 'Facebook / Messenger';
  } else if (/musical_ly|tiktok|bytedance/.test(ua)) {
    isInApp = true;
    inAppName = 'TikTok';
  } else if (/twitter/.test(ua)) {
    isInApp = true;
    inAppName = 'X / Twitter';
  } else if (/whatsapp/.test(ua)) {
    isInApp = true;
    inAppName = 'WhatsApp';
  } else if (/line\//.test(ua)) {
    isInApp = true;
    inAppName = 'LINE';
  } else if (/gsa\/|gmail/.test(ua)) {
    isInApp = true;
    inAppName = 'Google App / Gmail';
  }

  // Detect Browser
  let browser: BrowserType = 'other';
  let browserName = 'Navegador Web';

  if (isInApp) {
    browser = 'inapp';
    browserName = inAppName || 'Navegador Integrado';
  } else if (/samsungbrowser/.test(ua)) {
    browser = 'samsung';
    browserName = 'Samsung Internet';
  } else if (/opr\/|opera|opt\/|opios/.test(ua)) {
    browser = 'opera';
    browserName = 'Opera Browser';
  } else if (/edg\/|edge\/|edga|edgios/.test(ua)) {
    browser = 'edge';
    browserName = 'Microsoft Edge';
  } else if (/fxios|firefox/.test(ua)) {
    browser = 'firefox';
    browserName = 'Mozilla Firefox';
  } else if ((navigator as any).brave || /brave/.test(ua)) {
    browser = 'brave';
    browserName = 'Brave Browser';
  } else if (isIOS && (/crios/.test(ua) || (/chrome/.test(ua) && !/safari/.test(ua)))) {
    browser = 'chrome';
    browserName = 'Google Chrome (iOS)';
  } else if (isIOS && /safari/.test(ua) && !/crios|fxios|opios|edgios/.test(ua)) {
    browser = 'safari';
    browserName = 'Safari';
  } else if (/chrome|chromium/.test(ua) && !/edg|opr|opera|samsungbrowser/.test(ua)) {
    browser = 'chrome';
    browserName = 'Google Chrome';
  } else if (/safari/.test(ua) && !/chrome|chromium/.test(ua)) {
    browser = 'safari';
    browserName = 'Safari';
  }

  const supportsNativePrompt = (browser === 'chrome' || browser === 'edge' || browser === 'opera' || browser === 'samsung' || browser === 'brave') && os !== 'ios';

  return {
    browser,
    browserName,
    os,
    osName,
    isInApp,
    inAppName,
    supportsNativePrompt
  };
}
