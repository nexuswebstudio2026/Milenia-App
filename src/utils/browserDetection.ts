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

export type OperatingSystem = 'ios' | 'ipados' | 'android' | 'macos' | 'windows' | 'chromeos' | 'linux' | 'other';

export type DeviceType = 'smartphone' | 'tablet' | 'laptop' | 'desktop';

export interface DeviceInfo {
  // Browser details
  browser: BrowserType;
  browserName: string;
  browserVersion?: string;
  
  // OS details
  os: OperatingSystem;
  osName: string;
  osVersion?: string;

  // Hardware & Device details
  deviceType: DeviceType;
  deviceTypeName: string;
  deviceModel: string;
  isMobile: boolean;
  isTouchDevice: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;

  // In-app detection
  isInApp: boolean;
  inAppName?: string;

  // Capabilities
  supportsNativePrompt: boolean;
  canInstallPwa: boolean;
  
  // Suggested tailored action text
  installHeadline: string;
  installSubheadline: string;
  installButtonText: string;
}

export function detectBrowserAndOS(): DeviceInfo {
  if (typeof window === 'undefined' || !window.navigator) {
    return {
      browser: 'chrome',
      browserName: 'Google Chrome',
      os: 'windows',
      osName: 'Windows',
      deviceType: 'desktop',
      deviceTypeName: 'Computadora de Escritorio',
      deviceModel: 'PC Windows',
      isMobile: false,
      isTouchDevice: false,
      screenWidth: 1920,
      screenHeight: 1080,
      pixelRatio: 1,
      isInApp: false,
      supportsNativePrompt: true,
      canInstallPwa: true,
      installHeadline: 'Instalar MENIA en tu PC Windows',
      installSubheadline: 'Acceso directo en tu barra de tareas y escritorio con soporte offline.',
      installButtonText: 'Instalar en tu PC Windows'
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const platform = (navigator.platform || '').toLowerCase();
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const isTouch = maxTouchPoints > 0;
  const screenWidth = window.screen?.width || window.innerWidth;
  const screenHeight = window.screen?.height || window.innerHeight;
  const pixelRatio = window.devicePixelRatio || 1;

  // --- 1. OPERATING SYSTEM & DEVICE TYPE DETECTION ---
  let os: OperatingSystem = 'other';
  let osName = 'Sistema Operativo';
  let deviceType: DeviceType = 'desktop';
  let deviceTypeName = 'Computadora';
  let deviceModel = 'Dispositivo';
  let isMobile = false;

  // Check iPad specifically (including modern iPadOS which reports MacIntel with touch points)
  const isIPad = /ipad/.test(ua) || (platform.includes('mac') && maxTouchPoints > 1 && screenWidth >= 768);
  const isIPhone = /iphone|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isMac = !isIPad && (platform.includes('mac') || /macintosh|mac os x/.test(ua));
  const isWindows = platform.includes('win') || /windows nt|win32|win64/.test(ua);
  const isChromeOS = /cros/.test(ua);
  const isLinux = !isAndroid && !isChromeOS && (platform.includes('linux') || /linux/.test(ua));

  if (isIPad) {
    os = 'ipados';
    osName = 'iPadOS';
    deviceType = 'tablet';
    deviceTypeName = 'Tablet (iPad)';
    deviceModel = 'iPad';
    isMobile = true;
  } else if (isIPhone) {
    os = 'ios';
    osName = 'iOS';
    deviceType = 'smartphone';
    deviceTypeName = 'Dispositivo Móvil';
    deviceModel = 'Dispositivo Móvil (iPhone)';
    isMobile = true;
  } else if (isAndroid) {
    os = 'android';
    osName = 'Android';
    isMobile = true;
    const isAndroidTablet = !/mobile/.test(ua) || screenWidth >= 600 || (Math.min(screenWidth, screenHeight) >= 600);
    if (isAndroidTablet) {
      deviceType = 'tablet';
      deviceTypeName = 'Tablet Android';
      deviceModel = 'Tablet Android';
    } else {
      deviceType = 'smartphone';
      deviceTypeName = 'Dispositivo Móvil';
      deviceModel = 'Dispositivo Móvil Android';
    }
  } else if (isMac) {
    os = 'macos';
    osName = 'macOS';
    isMobile = false;
    deviceType = (screenWidth <= 1728 && screenHeight <= 1117) ? 'laptop' : 'desktop';
    deviceTypeName = deviceType === 'laptop' ? 'Portátil (MacBook)' : 'Mac de Escritorio';
    deviceModel = deviceType === 'laptop' ? 'MacBook' : 'Mac';
  } else if (isWindows) {
    os = 'windows';
    osName = 'Windows';
    isMobile = false;
    deviceType = (isTouch || screenWidth <= 1920 && screenHeight <= 1080 && /laptop|notebook|portable/.test(ua)) ? 'laptop' : 'desktop';
    deviceTypeName = 'PC Windows';
    deviceModel = 'PC Windows';
  } else if (isChromeOS) {
    os = 'chromeos';
    osName = 'ChromeOS';
    isMobile = false;
    deviceType = 'laptop';
    deviceTypeName = 'Chromebook';
    deviceModel = 'Chromebook';
  } else if (isLinux) {
    os = 'linux';
    osName = 'Linux';
    isMobile = false;
    deviceType = isTouch ? 'laptop' : 'desktop';
    deviceTypeName = 'PC Linux';
    deviceModel = 'PC Linux';
  } else if (/mobile|phone|arm/.test(ua)) {
    isMobile = true;
    deviceType = 'smartphone';
    deviceTypeName = 'Dispositivo Móvil';
    deviceModel = 'Dispositivo Móvil';
  }

  // --- 2. IN-APP WEBVIEW DETECTION ---
  let isInApp = false;
  let inAppName: string | undefined;

  if (/instagram/.test(ua)) {
    isInApp = true;
    inAppName = 'Instagram';
  } else if (/fban|fbav|fb_iab|messenger/.test(ua)) {
    isInApp = true;
    inAppName = 'Facebook';
  } else if (/musical_ly|tiktok|bytedance/.test(ua)) {
    isInApp = true;
    inAppName = 'TikTok';
  } else if (/twitter/.test(ua)) {
    isInApp = true;
    inAppName = 'X (Twitter)';
  } else if (/whatsapp/.test(ua)) {
    isInApp = true;
    inAppName = 'WhatsApp';
  } else if (/line\//.test(ua)) {
    isInApp = true;
    inAppName = 'LINE';
  } else if (/gsa\/|gmail/.test(ua)) {
    isInApp = true;
    inAppName = 'Google App';
  }

  // --- 3. BROWSER DETECTION ---
  let browser: BrowserType = 'other';
  let browserName = 'Navegador Web';

  if (isInApp) {
    browser = 'inapp';
    browserName = inAppName ? `Navegador de ${inAppName}` : 'Navegador Integrado';
  } else if (/samsungbrowser/.test(ua)) {
    browser = 'samsung';
    browserName = 'Samsung Internet';
  } else if (/opr\/|opera|opt\/|opios/.test(ua)) {
    browser = 'opera';
    browserName = 'Opera';
  } else if (/edg\/|edge\/|edga|edgios/.test(ua)) {
    browser = 'edge';
    browserName = 'Microsoft Edge';
  } else if (/fxios|firefox/.test(ua)) {
    browser = 'firefox';
    browserName = 'Mozilla Firefox';
  } else if ((navigator as any).brave || /brave/.test(ua)) {
    browser = 'brave';
    browserName = 'Brave Browser';
  } else if ((os === 'ios' || os === 'ipados') && (/crios/.test(ua) || (/chrome/.test(ua) && !/safari/.test(ua)))) {
    browser = 'chrome';
    browserName = 'Google Chrome';
  } else if ((os === 'ios' || os === 'ipados') && /safari/.test(ua) && !/crios|fxios|opios|edgios/.test(ua)) {
    browser = 'safari';
    browserName = 'Safari';
  } else if (/chrome|chromium/.test(ua) && !/edg|opr|opera|samsungbrowser/.test(ua)) {
    browser = 'chrome';
    browserName = 'Google Chrome';
  } else if (/safari/.test(ua) && !/chrome|chromium/.test(ua)) {
    browser = 'safari';
    browserName = 'Safari';
  }

  const supportsNativePrompt = (browser === 'chrome' || browser === 'edge' || browser === 'opera' || browser === 'samsung' || browser === 'brave') && (os !== 'ios' && os !== 'ipados');
  const canInstallPwa = true;

  // --- 4. TAILORED AUTOMATIC INSTALLATION HEADLINES ---
  let installHeadline = 'Instalar MENIA';
  let installSubheadline = 'Acceso rápido con un toque en tu dispositivo.';
  let installButtonText = 'Instalar en tu Dispositivo';

  if (isMobile) {
    installHeadline = 'Instalar MENIA en tu dispositivo móvil';
    installSubheadline = `Instala la aplicación web de MENIA en tu dispositivo móvil desde ${browserName}.`;
    installButtonText = 'Instalar en tu dispositivo móvil';
  } else if (os === 'windows') {
    installHeadline = 'Instalar MENIA en tu PC Windows';
    installSubheadline = 'Acceso directo en tu barra de tareas y escritorio con soporte offline.';
    installButtonText = 'Instalar en tu PC Windows';
  } else if (os === 'macos') {
    installHeadline = 'Instalar MENIA en tu Mac';
    installSubheadline = 'Aplicación de escritorio nativa optimizada para macOS.';
    installButtonText = 'Instalar en tu Mac';
  } else {
    installHeadline = 'Instalar MENIA en tu ordenador';
    installSubheadline = 'Aplicación de escritorio independiente con soporte offline.';
    installButtonText = 'Instalar en tu ordenador';
  }

  return {
    browser,
    browserName,
    os,
    osName,
    deviceType,
    deviceTypeName,
    deviceModel,
    isMobile,
    isTouchDevice: isTouch,
    screenWidth,
    screenHeight,
    pixelRatio,
    isInApp,
    inAppName,
    supportsNativePrompt,
    canInstallPwa,
    installHeadline,
    installSubheadline,
    installButtonText
  };
}
