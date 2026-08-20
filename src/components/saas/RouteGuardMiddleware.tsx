import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Store, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  RefreshCw,
  Sparkles,
  ChevronDown
} from 'lucide-react';

export const RouteGuardMiddleware: React.FC = () => {
  const { 
    currentRoute, 
    navigateTo, 
    tenants, 
    employees, 
    currentTenant, 
    currentEmployee,
    verifyEmployeeAccess,
    showToast
  } = useTasty();

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const verification = verifyEmployeeAccess(
    currentRoute.restaurantId || currentTenant.id,
    currentRoute.employeeId || currentEmployee?.id || ''
  );

  return (
    <div className="w-full bg-slate-900 text-slate-100 border-b border-amber-500/20 px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left: Current Active Route & Middleware Status */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px]">
            <Lock className="w-3.5 h-3.5" />
            <span className="font-bold">Next.js Dynamic Route:</span>
            <span className="text-white font-semibold underline decoration-amber-500">
              /{currentRoute.restaurantId || currentTenant.id}/dashboard/{currentRoute.employeeId || currentEmployee?.id || 'emp-101'}
            </span>
          </div>

          {verification.valid ? (
            <div className="flex items-center gap-1 text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Middleware: Acceso Autorizado (Tenant Aislado)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-rose-400 font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Middleware: Violación de Seguridad Inter-Tenant</span>
            </div>
          )}
        </div>

        {/* Right: Tenant & Employee Quick Test Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative">
            <button
              onClick={() => setIsSelectorOpen(!isSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium transition cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate max-w-[140px] font-bold">{currentTenant.name}</span>
              <span className="text-slate-500">|</span>
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="truncate max-w-[110px]">{currentEmployee?.name || 'Empleado'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isSelectorOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white text-xs">Simular Rutas SaaS Multitenant</span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">Colombia</span>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {tenants.map(t => {
                    const tenantEmps = employees.filter(e => e.restaurantId === t.id);
                    const isSelected = t.id === currentTenant.id;
                    return (
                      <div key={t.id} className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 text-xs">{t.name}</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                            ID: {t.id}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">NIT: {t.branding.nit}</div>
                        
                        <div className="flex flex-wrap gap-1 pt-1">
                          {tenantEmps.map(emp => (
                            <button
                              key={emp.id}
                              onClick={() => {
                                navigateTo({
                                  restaurantId: t.id,
                                  employeeId: emp.id,
                                  routeType: 'employee_dashboard'
                                });
                                setIsSelectorOpen(false);
                                showToast('Ruta Actualizada', `Accediendo a /${t.id}/dashboard/${emp.id} como ${emp.name}`, 'info');
                              }}
                              className={`text-[10px] px-2 py-1 rounded-md font-medium transition cursor-pointer ${
                                currentEmployee?.id === emp.id && isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold'
                                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                              }`}
                            >
                              {emp.name.split(' ')[0]} ({emp.role})
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Security Error Alert if Unauthorized */}
      {!verification.valid && (
        <div className="mt-2 max-w-7xl mx-auto p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-white">403 Acceso Denegado por Middleware de Seguridad</div>
              <div className="text-rose-300 text-[11px]">{verification.error}</div>
            </div>
          </div>
          <button
            onClick={() => {
              if (verification.employee) {
                navigateTo({
                  restaurantId: verification.employee.restaurantId,
                  employeeId: verification.employee.id,
                  routeType: 'employee_dashboard'
                });
              } else {
                navigateTo({
                  restaurantId: currentTenant.id,
                  employeeId: employees.find(e => e.restaurantId === currentTenant.id)?.id || 'emp-101',
                  routeType: 'employee_dashboard'
                });
              }
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition cursor-pointer shrink-0"
          >
            Redirigir a Restaurante Asignado
          </button>
        </div>
      )}
    </div>
  );
};
