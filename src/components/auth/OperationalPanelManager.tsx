import React, { useState } from 'react';
import { 
  Utensils, 
  Shield, 
  UserCheck, 
  ChefHat, 
  KeyRound, 
  Wine, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Send, 
  Receipt, 
  Plus, 
  Minus, 
  Search, 
  Timer, 
  DollarSign, 
  Sparkles, 
  CreditCard, 
  Layers,
  Moon,
  Sun,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { Empleado } from '../../types/empleado';
import { WorkstationOption, WORKSTATIONS } from '../../services/empleadosService';
import { AdminDashboard } from '../admin/AdminDashboard';

interface OperationalPanelManagerProps {
  authenticatedEmpleado: Empleado;
  station: WorkstationOption;
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const OperationalPanelManager: React.FC<OperationalPanelManagerProps> = ({
  authenticatedEmpleado,
  station,
  onLogout,
  isDarkMode,
  onToggleTheme
}) => {
  const [currentStation, setCurrentStation] = useState<WorkstationOption>(station);

  // Station: Salón / Mesas State
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [salonOrders, setSalonOrders] = useState<Record<number, { name: string; price: number; qty: number; category: string }[]>>({
    1: [
      { name: 'Corte Angus a la Brasa', price: 68000, qty: 1, category: 'Carnes' },
      { name: 'Copa Gran Reserva', price: 34000, qty: 2, category: 'Vinos' }
    ],
    2: [
      { name: 'Risotto de Setas Silvestres', price: 46000, qty: 1, category: 'Entradas' },
      { name: 'Carpaccio de Res Curada', price: 38000, qty: 1, category: 'Entradas' }
    ],
    3: [
      { name: 'Pesca del Día con Cítricos', price: 54000, qty: 2, category: 'Mar' }
    ],
    4: [],
    5: [
      { name: 'Pulpo Rostizado al Carbón', price: 62000, qty: 1, category: 'Entradas' }
    ],
    6: []
  });
  const [salonNotification, setSalonNotification] = useState<string | null>(null);

  // Station: Cocina / KDS State
  const [kdsTickets, setKdsTickets] = useState([
    { id: 'T-101', table: 2, elapsedMinutes: 12, items: ['1x Risotto de Setas', '1x Carpaccio de Res'], status: 'preparando' },
    { id: 'T-102', table: 1, elapsedMinutes: 22, items: ['1x Corte Angus Término 3/4', '2x Copa Gran Reserva'], status: 'recibido' },
    { id: 'T-103', table: 5, elapsedMinutes: 8, items: ['1x Pulpo Rostizado al Carbón'], status: 'preparando' }
  ]);

  // Station: Caja State
  const [cajaSelectedTable, setCajaSelectedTable] = useState<number>(1);
  const [cajaPaymentMethod, setCajaPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('tarjeta');
  const [cajaSuccessMessage, setCajaSuccessMessage] = useState<string | null>(null);

  const getStationIcon = (id: string) => {
    switch (id) {
      case 'gerencia': return Shield;
      case 'sala': return UserCheck;
      case 'cocina': return ChefHat;
      case 'caja': return KeyRound;
      case 'barra': return Wine;
      default: return Utensils;
    }
  };

  const StationIcon = getStationIcon(currentStation.id);

  // Helper calculations for Salón
  const currentTableItems = salonOrders[selectedTable] || [];
  const currentSubtotal = currentTableItems.reduce((sum, it) => sum + (it.price * it.qty), 0);
  const currentTaxService = Math.round(currentSubtotal * 0.08);
  const currentTipSugerida = Math.round(currentSubtotal * 0.10);
  const currentTotal = currentSubtotal + currentTaxService + currentTipSugerida;

  const handleAddItemToTable = (dish: { name: string; price: number; category: string }) => {
    setSalonOrders(prev => {
      const items = [...(prev[selectedTable] || [])];
      const existing = items.find(i => i.name === dish.name);
      if (existing) {
        existing.qty += 1;
      } else {
        items.push({ ...dish, qty: 1 });
      }
      return { ...prev, [selectedTable]: items };
    });
  };

  const handleUpdateItemQty = (dishName: string, delta: number) => {
    setSalonOrders(prev => {
      const items = (prev[selectedTable] || [])
        .map(i => i.name === dishName ? { ...i, qty: i.qty + delta } : i)
        .filter(i => i.qty > 0);
      return { ...prev, [selectedTable]: items };
    });
  };

  const handleSendOrderToKitchen = () => {
    if (currentSubtotal === 0) return;
    setSalonNotification(`Comanda de Mesa ${selectedTable} transmitida al KDS de cocina.`);
    setKdsTickets(prev => [
      ...prev,
      {
        id: `T-${Math.floor(100 + Math.random() * 900)}`,
        table: selectedTable,
        elapsedMinutes: 1,
        items: currentTableItems.map(i => `${i.qty}x ${i.name}`),
        status: 'recibido'
      }
    ]);
    setTimeout(() => setSalonNotification(null), 3500);
  };

  const handleProcessBillPayment = () => {
    setCajaSuccessMessage(`Factura electrónica DIAN para Mesa ${cajaSelectedTable} liquidada con ${cajaPaymentMethod.toUpperCase()}. Transmitida a la DIAN.`);
    setSalonOrders(prev => ({ ...prev, [cajaSelectedTable]: [] }));
    setTimeout(() => setCajaSuccessMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP OPERATIONAL STATION APP BAR */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand and Station badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Utensils className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-black tracking-widest text-white uppercase leading-none">
                  MILENIA
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                  <StationIcon className="w-3 h-3" />
                  <span>{currentStation.shortLabel}</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {currentStation.panelTitle}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Station Tabs (if Manager/Admin) */}
          <div className="flex items-center gap-2">
            {/* Switch Station Dropdown / Quick Selector (if Manager/Admin) */}
            {(authenticatedEmpleado.rol === 'gerente' || authenticatedEmpleado.rol === 'admin') && (
              <div className="hidden lg:flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl">
                {WORKSTATIONS.map(st => {
                  const StIcon = getStationIcon(st.id);
                  const isCurrent = currentStation.id === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => {
                        setCurrentStation(st);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                      title={`Cambiar a ${st.label}`}
                    >
                      <StIcon className="w-3.5 h-3.5" />
                      <span>{st.shortLabel.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Authenticated Staff Pill */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                {authenticatedEmpleado.nombre.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">
                  {authenticatedEmpleado.nombre}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {authenticatedEmpleado.cargo}
                </div>
              </div>
            </div>

            {/* Exit / Cerrar Turno Button */}
            <button
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Cerrar turno y salir al inicio"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Turno</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. MAIN ACTIVE PANEL CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {currentStation.id === 'gerencia' ? (
          /* ========================================================================= */
          /* PANEL DE GERENCIA: ADMIN DASHBOARD (Includes Empleados option inside)      */
          /* ========================================================================= */
          <AdminDashboard />
        ) : currentStation.id === 'sala' ? (
          /* ========================================================================= */
          /* PANEL DE SALÓN: TOMA DE PEDIDOS POS & MESAS                               */
          /* ========================================================================= */
          <div className="space-y-6 animate-fadeIn">
            
            {/* Notification */}
            {salonNotification && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{salonNotification}</span>
              </div>
            )}

            {/* Table Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Mesas del Salón Principal</h3>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Mesa activa: <strong className="text-amber-400">Mesa {selectedTable}</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[1, 2, 3, 4, 5, 6].map(num => {
                  const items = salonOrders[num] || [];
                  const isSelected = selectedTable === num;
                  const isOccupied = items.length > 0;
                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedTable(num)}
                      className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                          : isOccupied
                          ? 'border-blue-500/40 bg-blue-950/20 text-blue-300'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">Mesa {num}</div>
                      <div className="text-[10px] opacity-75 font-mono">
                        {isOccupied ? `${items.length} platos` : 'Libre'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Order Grid: Catalog (7 cols) + Comanda Ticket (5 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Menu Catalog (Left) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white">Catálogo de Platos para Comanda</h4>
                    <span className="text-xs text-slate-400">Toca para agregar</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'Corte Angus a la Brasa', price: 68000, category: 'Carnes' },
                      { name: 'Risotto de Setas Silvestres', price: 46000, category: 'Entradas' },
                      { name: 'Pesca del Día con Cítricos', price: 54000, category: 'Mar' },
                      { name: 'Carpaccio de Res Curada', price: 38000, category: 'Entradas' },
                      { name: 'Pulpo Rostizado al Carbón', price: 62000, category: 'Entradas' },
                      { name: 'Copa Gran Reserva', price: 34000, category: 'Vinos' }
                    ].map(dish => (
                      <div
                        key={dish.name}
                        onClick={() => handleAddItemToTable(dish)}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 transition cursor-pointer flex items-center justify-between group"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{dish.category}</span>
                          <div className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                            {dish.name}
                          </div>
                          <div className="text-xs font-mono text-amber-400 font-bold">
                            ${dish.price.toLocaleString()}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-slate-500 group-hover:text-amber-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comanda Ticket (Right) */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h4 className="font-bold text-sm text-white">Comanda Digital • Mesa {selectedTable}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">Atiende: {authenticatedEmpleado.nombre}</span>
                  </div>
                  <Receipt className="w-5 h-5 text-amber-400" />
                </div>

                {/* Items */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {currentTableItems.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      Esta mesa no tiene ítems cargados. Selecciona platos del catálogo.
                    </div>
                  ) : (
                    currentTableItems.map(it => (
                      <div key={it.name} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">{it.name}</div>
                          <div className="text-[11px] font-mono text-amber-400 font-bold">
                            ${(it.price * it.qty).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleUpdateItemQty(it.name, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-mono font-bold text-white">{it.qty}</span>
                          <button
                            onClick={() => handleUpdateItemQty(it.name, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotals */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Base Imponible:</span>
                    <span className="font-mono text-white">${currentSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Impoconsumo (8%):</span>
                    <span className="font-mono text-amber-400">${currentTaxService.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Propina Sugerida (10%):</span>
                    <span className="font-mono text-blue-400">${currentTipSugerida.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                    <span>Total Mesa:</span>
                    <span className="font-mono text-base font-black text-amber-400">${currentTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  disabled={currentSubtotal === 0}
                  onClick={handleSendOrderToKitchen}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmitir a Cocina (KDS)</span>
                </button>
              </div>

            </div>
          </div>
        ) : currentStation.id === 'cocina' ? (
          /* ========================================================================= */
          /* PANEL DE COCINA: KDS & COMANDAS ACTIVAS                                  */
          /* ========================================================================= */
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ChefHat className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Pantalla de Comandas de Cocina (KDS)</h3>
                  <span className="text-xs text-slate-400">Jefe de Cocina: {authenticatedEmpleado.nombre}</span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {kdsTickets.length} comandas en preparación
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {kdsTickets.map(ticket => {
                const isUrgent = ticket.elapsedMinutes > 20;
                return (
                  <div
                    key={ticket.id}
                    className={`p-5 rounded-3xl border shadow-xl flex flex-col justify-between space-y-4 ${
                      isUrgent 
                        ? 'bg-rose-950/20 border-rose-500/50' 
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div>
                          <span className="font-black text-lg text-white">Mesa {ticket.table}</span>
                          <div className="text-xs font-mono text-slate-400">Ticket #{ticket.id}</div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono flex items-center gap-1 ${
                          isUrgent ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-500 text-slate-950'
                        }`}>
                          <Timer className="w-3.5 h-3.5" />
                          <span>{ticket.elapsedMinutes} min</span>
                        </div>
                      </div>

                      <div className="py-3 space-y-2">
                        {ticket.items.map((itemStr, idx) => (
                          <div key={idx} className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>{itemStr}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setKdsTickets(prev => prev.filter(t => t.id !== ticket.id))}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Comanda Lista (Despachar)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* PANEL DE CAJA & FACTURACIÓN DIAN                                          */
          /* ========================================================================= */
          <div className="space-y-6 animate-fadeIn">
            {cajaSuccessMessage && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{cajaSuccessMessage}</span>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Terminal de Caja & Facturación Electrónica DIAN</h3>
                    <span className="text-xs text-slate-400">Responsable de Caja: {authenticatedEmpleado.nombre}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-amber-400 border border-slate-700">
                  Resolución DIAN: 187640392819
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Select Table to Charge */}
                <div className="lg:col-span-6 space-y-4">
                  <label className="text-xs font-bold text-slate-300">Seleccionar Mesa para Cobro:</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 5].map(num => (
                      <button
                        key={num}
                        onClick={() => setCajaSelectedTable(num)}
                        className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                          cajaSelectedTable === num
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-bold">Mesa {num}</div>
                        <div className="text-[10px] text-emerald-400 font-mono">Consumo Activo</div>
                      </button>
                    ))}
                  </div>

                  <label className="text-xs font-bold text-slate-300 pt-2 block">Medio de Pago:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['tarjeta', 'efectivo', 'nequi', 'daviplata'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setCajaPaymentMethod(method)}
                        className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition cursor-pointer ${
                          cajaPaymentMethod === method
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bill Summary & Emit Invoice */}
                <div className="lg:col-span-6 bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono uppercase text-slate-400">Resumen Liquidación Mesa {cajaSelectedTable}</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">Documento Soporte Electrónico</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal Consumos:</span>
                      <span className="font-mono text-white">$124,000 COP</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Impoconsumo (8%):</span>
                      <span className="font-mono text-amber-400">$9,920 COP</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Propina Voluntaria (10%):</span>
                      <span className="font-mono text-blue-400">$12,400 COP</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                      <span>Total a Facturar:</span>
                      <span className="font-mono text-base font-black text-amber-400">$146,320 COP</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProcessBillPayment}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Emitir Factura Electrónica & Cerrar Mesa</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
