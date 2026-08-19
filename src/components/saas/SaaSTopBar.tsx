import React from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Store, 
  ChefHat, 
  UtensilsCrossed, 
  CreditCard, 
  Sparkles, 
  ChevronDown, 
  Globe, 
  ExternalLink,
  Code2
} from 'lucide-react';

export const SaaSTopBar: React.FC = () => {
  const { 
    currentTenant, 
    tenants, 
    switchTenant, 
    currentEmployee, 
    tenantEmployees, 
    switchEmployee, 
    currentRoute, 
    navigateTo,
    theme
  } = useTasty();

  const isSuperAdmin = currentRoute.routeType === 'superadmin';
  const isAdmin = currentRoute.routeType === 'tenant_admin';
  const isEmployee = currentRoute.routeType === 'employee_dashboard';
  const isCustomer = currentRoute.routeType === 'customer_menu' || currentRoute.routeType === 'customer_reservations';

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Left: SaaS Brand & Tenant Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-750">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-black text-amber-400 tracking-wider flex items-center gap-1.5 uppercase text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              MILENIA SAAS
            </span>
            <span className="hidden sm:inline bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">
              v3.2 Multi-Tenant
            </span>
          </div>

          {/* Tenant Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400 text-[11px] hidden lg:inline">Restaurante:</span>
            <div className="relative">
              <select
                id="tenant-switcher-select"
                value={currentTenant.id}
                onChange={(e) => switchTenant(e.target.value)}
                className="bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs py-1.5 pl-2.5 pr-7 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition appearance-none"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                    {t.name} (ID: {t.id} - {t.city.split(',')[0]})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Employee Selector Dropdown (When inside a tenant) */}
          {!isSuperAdmin && (
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-slate-400 text-[11px] hidden lg:inline">Empleado:</span>
              <div className="relative">
                <select
                  id="employee-switcher-select"
                  value={currentEmployee?.id || ''}
                  onChange={(e) => switchEmployee(e.target.value)}
                  className="bg-slate-800 hover:bg-slate-750 text-amber-300 font-semibold text-xs py-1.5 pl-2.5 pr-7 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer transition appearance-none"
                >
                  {tenantEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Center/Right: Route View Switcher & Simulated Next.js Dynamic URL */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          
          {/* Quick Route Switchers */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700">
            {/* SuperAdmin */}
            <button
              onClick={() => navigateTo({ routeType: 'superadmin' })}
              id="route-btn-superadmin"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                isSuperAdmin 
                  ? 'bg-purple-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Panel Maestro SuperAdmin Milenia"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>SuperAdmin</span>
            </button>

            {/* Owner Admin */}
            <button
              onClick={() => navigateTo({ routeType: 'tenant_admin' })}
              id="route-btn-admin"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                isAdmin 
                  ? 'bg-amber-500 text-slate-950 shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Panel Owner del Restaurante"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Admin Owner</span>
            </button>

            {/* POS / Kitchen Employee */}
            <button
              onClick={() => navigateTo({ routeType: 'employee_dashboard' })}
              id="route-btn-dashboard"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                isEmployee 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="POS Mesero / Comanda Cocina / Caja"
            >
              {currentEmployee?.role === 'cocina' ? (
                <ChefHat className="w-3.5 h-3.5 text-emerald-300" />
              ) : currentEmployee?.role === 'cajero' ? (
                <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
              ) : (
                <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-300" />
              )}
              <span>POS Empleado</span>
            </button>

            {/* Customer Menu */}
            <button
              onClick={() => navigateTo({ routeType: 'customer_menu' })}
              id="route-btn-menu"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                isCustomer 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
              title="Vista Carta Digital QR Cliente"
            >
              <Globe className="w-3.5 h-3.5 text-blue-300" />
              <span>Menú QR</span>
            </button>
          </div>

          {/* Dynamic Next.js URL Display Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950 text-slate-300 px-3 py-1 rounded-xl border border-slate-800 font-mono text-[11px] select-all shadow-inner">
            <Code2 className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-slate-500">milenia.app</span>
            <span className="text-amber-300 font-bold">{currentRoute.path}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
