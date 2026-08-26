import { useState, useEffect, useCallback } from 'react';
import { TenantRestaurant, TenantEmployee } from '../types';
import { INITIAL_TENANTS, INITIAL_EMPLOYEES } from '../data/multiTenantData';

export type AppRouteType = 
  | 'superadmin'
  | 'tenant_admin'
  | 'employee_dashboard'
  | 'customer_menu'
  | 'customer_reservations'
  | 'customer_tracking'
  | 'ally_panel';

export interface ParsedTenantRoute {
  path: string;
  routeType: AppRouteType;
  restaurantId: string;
  employeeId?: string;
  cargo?: string;
  subView?: string;
}

/**
 * Hook to parse and sync multi-tenant URLs:
 * - /superadmin
 * - /panel/[idaliado]/[cargo] (Panel de Gerentes & Cargos por Negocio Aliado)
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
    const qTenant = params.get('tenant') || params.get('restaurantId') || params.get('idaliado') || params.get('aliado');
    const qEmp = params.get('emp') || params.get('employeeId');
    const qCargo = params.get('cargo') || params.get('rol') || params.get('position');
    const qView = params.get('view');
    const qPanel = params.get('panel');

    // Clean pathname
    const segments = pathname.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);

    // Route: /superadmin
    if (segments[0] === 'superadmin' || qView === 'superadmin') {
      return {
        path: '/superadmin',
        routeType: 'superadmin',
        restaurantId: '1',
        cargo: 'gerente'
      };
    }

    // Route: /panel/:idaliado/:cargo (e.g. /panel/1/gerente or /panel/milenia-bogota/administrador)
    if (segments[0] === 'panel' || qPanel !== null || qView === 'panel') {
      let targetId = segments[1] || qTenant || '1';
      const matched = INITIAL_TENANTS.find(t => t.id === targetId || t.slug === targetId);
      if (matched) targetId = matched.id;
      
      const targetCargo = segments[2] || qCargo || 'gerente';
      const cleanCargo = targetCargo.toLowerCase().replace(/-/g, '_');

      return {
        path: `/panel/${targetId}/${cleanCargo}`,
        routeType: 'ally_panel',
        restaurantId: targetId,
        cargo: cleanCargo,
        subView: 'panel'
      };
    }

    // Default restaurant is 1 (Parrilla Camilo) if not specified
    let restaurantId = qTenant || '1';
    let employeeId = qEmp || 'emp-101';
    let cargo = qCargo || 'gerente';
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
        } else if (segments[1] === 'panel') {
          routeType = 'ally_panel';
          if (segments[2]) {
            cargo = segments[2].toLowerCase().replace(/-/g, '_');
          }
          subView = 'panel';
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
    if (qView === 'panel') routeType = 'ally_panel';
    if (qView === 'reservations') routeType = 'customer_reservations';
    if (qView === 'tracking') routeType = 'customer_tracking';
    if (qView === 'menu') routeType = 'customer_menu';

    // Construct standard URL representation
    let path = `/${restaurantId}`;
    if (routeType === 'ally_panel') path = `/panel/${restaurantId}/${cargo || 'gerente'}`;
    else if (routeType === 'tenant_admin') path = `/${restaurantId}/admin`;
    else if (routeType === 'employee_dashboard') path = `/${restaurantId}/dashboard/${employeeId}`;
    else if (routeType === 'customer_reservations') path = `/${restaurantId}/reservations`;
    else if (routeType === 'customer_tracking') path = `/${restaurantId}/tracking`;

    return {
      path,
      routeType,
      restaurantId,
      employeeId,
      cargo,
      subView
    };
  }

  // Navigate to a multi-tenant route
  const navigateTo = useCallback((options: {
    restaurantId?: string;
    employeeId?: string;
    cargo?: string;
    routeType?: AppRouteType;
    subView?: string;
  }) => {
    const targetRestaurantId = options.restaurantId || currentRoute.restaurantId || '1';
    const targetRouteType = options.routeType || currentRoute.routeType;
    let targetEmp = options.employeeId || currentRoute.employeeId;
    const targetCargo = options.cargo || currentRoute.cargo || 'gerente';

    // If switching restaurant, ensure employee belongs to that restaurant
    if (options.restaurantId && options.restaurantId !== currentRoute.restaurantId) {
      const validEmp = INITIAL_EMPLOYEES.find(e => e.restaurantId === targetRestaurantId);
      targetEmp = validEmp ? validEmp.id : 'emp-101';
    }

    let newPath = `/${targetRestaurantId}`;
    if (targetRouteType === 'superadmin') {
      newPath = `/superadmin`;
    } else if (targetRouteType === 'ally_panel') {
      const cleanCargo = (targetCargo || 'gerente').toLowerCase().replace(/-/g, '_');
      newPath = `/panel/${targetRestaurantId}/${cleanCargo}`;
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
      cargo: targetCargo,
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
