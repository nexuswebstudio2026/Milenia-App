import { useState, useEffect, useCallback } from 'react';
import { TenantRestaurant, TenantEmployee } from '../types';
import { INITIAL_TENANTS, INITIAL_EMPLOYEES } from '../data/multiTenantData';

export type AppRouteType = 
  | 'superadmin'
  | 'tenant_admin'
  | 'employee_dashboard'
  | 'customer_menu'
  | 'customer_reservations'
  | 'customer_tracking';

export interface ParsedTenantRoute {
  path: string;
  routeType: AppRouteType;
  restaurantId: string;
  employeeId?: string;
  subView?: string;
}

/**
 * Hook to parse and sync multi-tenant URLs:
 * - /superadmin
 * - /[restaurantId]/admin
 * - /[restaurantId]/dashboard/[employeeId]
 * - /[restaurantId]/menu (or /[restaurantId])
 * - /[restaurantId]/reservations
 * - /[restaurantId]/tracking
 */
export function useTenantRoute() {
  const [currentRoute, setCurrentRoute] = useState<ParsedTenantRoute>(() => {
    return parseUrl(window.location.pathname, window.location.search);
  });

  function parseUrl(pathname: string, search: string): ParsedTenantRoute {
    const params = new URLSearchParams(search);
    
    // Check if query params or hash override for easy dev navigation
    const qTenant = params.get('tenant') || params.get('restaurantId');
    const qEmp = params.get('emp') || params.get('employeeId');
    const qView = params.get('view');

    // Clean pathname
    const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

    // Route: /superadmin
    if (segments[0] === 'superadmin' || qView === 'superadmin') {
      return {
        path: '/superadmin',
        routeType: 'superadmin',
        restaurantId: '1',
      };
    }

    // Default restaurant is 1 (Parrilla Camilo) if not specified
    let restaurantId = qTenant || '1';
    let employeeId = qEmp || 'emp-101';
    let routeType: AppRouteType = 'customer_menu';
    let subView = 'menu';

    if (segments.length > 0) {
      const first = segments[0];
      // Check if first segment is a known restaurant ID or slug
      const matchedTenant = INITIAL_TENANTS.find(t => t.id === first || t.slug === first);
      if (matchedTenant) {
        restaurantId = matchedTenant.id;
        
        if (segments[1] === 'admin') {
          routeType = 'tenant_admin';
          subView = 'admin';
        } else if (segments[1] === 'dashboard') {
          routeType = 'employee_dashboard';
          if (segments[2]) {
            employeeId = segments[2];
          }
          subView = 'dashboard';
        } else if (segments[1] === 'reservations') {
          routeType = 'customer_reservations';
          subView = 'reservations';
        } else if (segments[1] === 'tracking') {
          routeType = 'customer_tracking';
          subView = 'tracking';
        } else {
          routeType = 'customer_menu';
          subView = 'menu';
        }
      }
    }

    if (qView === 'admin') routeType = 'tenant_admin';
    if (qView === 'dashboard') routeType = 'employee_dashboard';
    if (qView === 'reservations') routeType = 'customer_reservations';
    if (qView === 'tracking') routeType = 'customer_tracking';
    if (qView === 'menu') routeType = 'customer_menu';

    // Construct standard URL representation
    let path = `/${restaurantId}`;
    if (routeType === 'tenant_admin') path = `/${restaurantId}/admin`;
    if (routeType === 'employee_dashboard') path = `/${restaurantId}/dashboard/${employeeId}`;
    if (routeType === 'customer_reservations') path = `/${restaurantId}/reservations`;
    if (routeType === 'customer_tracking') path = `/${restaurantId}/tracking`;

    return {
      path,
      routeType,
      restaurantId,
      employeeId,
      subView
    };
  }

  // Navigate to a multi-tenant route
  const navigateTo = useCallback((options: {
    restaurantId?: string;
    employeeId?: string;
    routeType?: AppRouteType;
    subView?: string;
  }) => {
    const targetRestaurantId = options.restaurantId || currentRoute.restaurantId || '1';
    const targetRouteType = options.routeType || currentRoute.routeType;
    let targetEmp = options.employeeId || currentRoute.employeeId;

    // If switching restaurant, ensure employee belongs to that restaurant
    if (options.restaurantId && options.restaurantId !== currentRoute.restaurantId) {
      const validEmp = INITIAL_EMPLOYEES.find(e => e.restaurantId === targetRestaurantId);
      targetEmp = validEmp ? validEmp.id : 'emp-101';
    }

    let newPath = `/${targetRestaurantId}`;
    if (targetRouteType === 'superadmin') {
      newPath = `/superadmin`;
    } else if (targetRouteType === 'tenant_admin') {
      newPath = `/${targetRestaurantId}/admin`;
    } else if (targetRouteType === 'employee_dashboard') {
      newPath = `/${targetRestaurantId}/dashboard/${targetEmp || 'emp-101'}`;
    } else if (targetRouteType === 'customer_reservations') {
      newPath = `/${targetRestaurantId}/reservations`;
    } else if (targetRouteType === 'customer_tracking') {
      newPath = `/${targetRestaurantId}/tracking`;
    }

    // Update history state
    try {
      window.history.pushState({}, '', newPath);
    } catch {
      // Fallback in iframe sandbox if pushState restricted
    }

    setCurrentRoute({
      path: newPath,
      routeType: targetRouteType,
      restaurantId: targetRestaurantId,
      employeeId: targetEmp,
      subView: options.subView
    });
  }, [currentRoute]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseUrl(window.location.pathname, window.location.search));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentRoute,
    navigateTo
  };
}
