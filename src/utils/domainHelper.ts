import { useState, useEffect } from 'react';

/**
 * Returns the currently active domain host (e.g. 'milenia-app.vercel.app', 'milenia-app.co', 'localhost:3000').
 * Adapts automatically to production, custom domain, Vercel, staging or local dev environment.
 */
export function getCurrentDomain(): string {
  if (typeof window !== 'undefined' && window.location.host) {
    return window.location.host;
  }
  return 'milenia-app.vercel.app';
}

/**
 * Returns the full origin URL (e.g. 'https://milenia-app.vercel.app', 'https://milenia-app.co', 'http://localhost:3000').
 */
export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://milenia-app.vercel.app';
}

/**
 * Returns the human-readable display URL for a tenant (e.g. 'milenia-app.vercel.app/1', 'milenia-app.co/2', 'localhost:3000/5')
 */
export function getTenantDisplayUrl(tenantId: string | number, subpath: string = ''): string {
  const domain = getCurrentDomain();
  const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
  return `${domain}/${tenantId}${cleanSubpath}`;
}

/**
 * Returns the complete navigable/shareable URL for a tenant
 */
export function getTenantFullUrl(tenantId: string | number, subpath: string = ''): string {
  const origin = getCurrentOrigin();
  const cleanSubpath = subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : '';
  return `${origin}/${tenantId}${cleanSubpath}`;
}

/**
 * React hook to reactively track domain and full tenant URL in client components
 */
export function useCurrentDomain() {
  const [domain, setDomain] = useState<string>(() => getCurrentDomain());
  const [origin, setOrigin] = useState<string>(() => getCurrentOrigin());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDomain(window.location.host);
      setOrigin(window.location.origin);
    }
  }, []);

  return {
    domain,
    origin,
    getTenantDisplayUrl: (tenantId: string | number, subpath: string = '') => 
      `${domain}/${tenantId}${subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : ''}`,
    getTenantFullUrl: (tenantId: string | number, subpath: string = '') => 
      `${origin}/${tenantId}${subpath ? (subpath.startsWith('/') ? subpath : `/${subpath}`) : ''}`
  };
}
