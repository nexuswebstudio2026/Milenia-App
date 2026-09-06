import React from 'react';
import { UtensilsCrossed, MonitorCheck, ReceiptText, ShieldCheck, Store } from 'lucide-react';

interface MileniaNavbarProps {
  activeTab: 'pos' | 'kds' | 'cashier';
  setActiveTab: (tab: 'pos' | 'kds' | 'cashier') => void;
  activeOrdersCount: number;
  kdsPendingCount: number;
}

export const MileniaNavbar: React.FC<MileniaNavbarProps> = ({
  activeTab,
  setActiveTab,
  activeOrdersCount,
  kdsPendingCount
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg tracking-tight text-white font-mono">MILENIA</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  POS v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Store className="w-3 h-3 text-slate-500" />
                <span>Parrilla & Sabor Colombiano</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  En Línea
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            id="tab-pos"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Mesas & POS</span>
            {activeOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'pos' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}>
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            id="tab-kds"
            onClick={() => setActiveTab('kds')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'kds'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <MonitorCheck className="w-4 h-4" />
            <span>Comandas KDS</span>
            {kdsPendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'kds' ? 'bg-slate-950 text-amber-400' : 'bg-red-500 text-white'
              }`}>
                {kdsPendingCount}
              </span>
            )}
          </button>

          <button
            id="tab-cashier"
            onClick={() => setActiveTab('cashier')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'cashier'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-300 hover:text-white hover:bg-slate-900'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Caja & Facturación</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
