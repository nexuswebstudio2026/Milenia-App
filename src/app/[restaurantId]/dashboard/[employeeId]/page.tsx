import React, { useEffect } from 'react';
import { useTasty } from '../../../../context/TastyContext';
import { useStore } from '../../../../store/useStore';
import { EmployeeDashboard } from '../../../../components/employee/EmployeeDashboard';
import { ArrowLeft, Building2, User, ShieldCheck } from 'lucide-react';

interface EmployeeDashboardPageProps {
  params?: {
    restaurantId: string;
    employeeId: string;
  };
}

/**
 * Next.js App Router Page: app/[restaurantId]/dashboard/[employeeId]/page.tsx
 * Employee Operational Dashboard (POS Waiter, KDS Kitchen, Cashier, Turnos)
 */
export default function EmployeeDashboardPage({ params }: EmployeeDashboardPageProps) {
  const { currentTenant, currentEmployee, switchTenant, switchEmployee, navigateTo } = useTasty();
  const { setRestaurantId, setActiveEmployeeId } = useStore();

  const rId = params?.restaurantId || currentTenant.id;
  const eId = params?.employeeId || currentEmployee?.id || 'emp-101';

  useEffect(() => {
    if (rId && rId !== currentTenant.id) {
      switchTenant(rId);
      setRestaurantId(rId);
    }
    if (eId && eId !== currentEmployee?.id) {
      switchEmployee(eId);
      setActiveEmployeeId(eId);
    }
  }, [rId, eId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Multi-Tenant Context Header */}
      <div className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo({ routeType: 'customer_menu', restaurantId: rId })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Menú</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 border-l border-slate-800 pl-3">
            <span className="text-xs text-slate-400">Restaurante:</span>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {currentTenant.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-white leading-none">{currentEmployee?.name || 'Empleado'}</p>
              <p className="text-[10px] text-slate-400 capitalize">{currentEmployee?.role || 'Operativo'} • ID: {eId}</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1"></span>
          </div>

          <button
            onClick={() => navigateTo({ routeType: 'tenant_admin', restaurantId: rId })}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Admin</span>
          </button>
        </div>
      </div>

      {/* Main Operational Container */}
      <main className="flex-1">
        <EmployeeDashboard />
      </main>
    </div>
  );
}

export { EmployeeDashboardPage };
