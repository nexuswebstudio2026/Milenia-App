import React, { useState } from 'react';
import { Utensils, Send, CheckCircle2, Plus, Minus, Receipt, Clock, ChefHat, Sparkles } from 'lucide-react';

interface MockItem {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
}

const DEMO_MENU: MockItem[] = [
  { id: '1', name: 'Bandeja Paisa Tradicional', price: 38000, category: 'Platos Fuertes', badge: 'Más Vendido' },
  { id: '2', name: 'Punta de Anca Angus (400g)', price: 49000, category: 'Platos Fuertes' },
  { id: '3', name: 'Costillas BBQ Ahumadas', price: 42000, category: 'Platos Fuertes' },
  { id: '4', name: 'Picada Criolla Mixta (x2)', price: 45000, category: 'Entradas' },
  { id: '5', name: 'Limonada de Coco Frappé', price: 14000, category: 'Bebidas' },
  { id: '6', name: 'Cerveza Artesanal Dorada', price: 9000, category: 'Bebidas' }
];

export const InteractivePosSimulator: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<number>(2);
  const [orderItems, setOrderItems] = useState<{ [table: number]: { [itemId: string]: number } }>({
    1: { '1': 2, '5': 2 },
    2: { '2': 1, '3': 1, '6': 2 },
    3: { '4': 1, '5': 1 },
    4: {},
    5: { '1': 1 },
    6: {}
  });

  const [notification, setNotification] = useState<string | null>(null);

  const currentTableItems = orderItems[selectedTable] || {};

  const handleAddItem = (item: MockItem) => {
    setOrderItems(prev => {
      const tableCart = { ...(prev[selectedTable] || {}) };
      tableCart[item.id] = (tableCart[item.id] || 0) + 1;
      return { ...prev, [selectedTable]: tableCart };
    });
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setOrderItems(prev => {
      const tableCart = { ...(prev[selectedTable] || {}) };
      const current = tableCart[itemId] || 0;
      const next = current + delta;
      if (next <= 0) {
        delete tableCart[itemId];
      } else {
        tableCart[itemId] = next;
      }
      return { ...prev, [selectedTable]: tableCart };
    });
  };

  const handleSendToKitchen = () => {
    if (Object.keys(currentTableItems).length === 0) return;
    setNotification(`🔥 ¡Comanda enviada a pantalla KDS de Cocina para Mesa ${selectedTable}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleClearTable = () => {
    setOrderItems(prev => ({ ...prev, [selectedTable]: {} }));
    setNotification(`✅ Factura emitida y Mesa ${selectedTable} liberada.`);
    setTimeout(() => setNotification(null), 4000);
  };

  // Calculations
  let rawTotal = 0;
  Object.entries(currentTableItems).forEach(([id, qtyVal]) => {
    const qty = Number(qtyVal);
    const item = DEMO_MENU.find(m => m.id === id);
    if (item) rawTotal += item.price * qty;
  });

  const subtotal = Math.round(rawTotal / 1.08);
  const impoconsumo = rawTotal - subtotal;
  const tip10 = Math.round(rawTotal * 0.10);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
      {/* Glow decorative corner */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Simulator Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                SIMULADOR INTERACTIVO
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> En Vivo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Prueba cómo tus meseros comandan en 3 clics sin capacitación</p>
          </div>
        </div>

        {/* Table Selector Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Mesas:</span>
          {[1, 2, 3, 4, 5].map(num => {
            const hasItems = Object.keys(orderItems[num] || {}).length > 0;
            const isSelected = selectedTable === num;
            return (
              <button
                key={num}
                onClick={() => setSelectedTable(num)}
                className={`w-7 h-7 rounded-lg text-xs font-black font-mono transition cursor-pointer flex items-center justify-center relative ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : hasItems
                    ? 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {num}
                {hasItems && !isSelected && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Simulator Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4 relative z-10">
        {/* Menu products list (Left 7 cols) */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
            <span>Carta del Restaurante</span>
            <span className="text-[10px] text-slate-500 font-mono">Precios en COP</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
            {DEMO_MENU.map(item => {
              const qtyInTable = currentTableItems[item.id] || 0;
              return (
                <div
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/60 hover:bg-slate-950 transition cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-bold text-xs text-slate-200 group-hover:text-white leading-tight">
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
                    <span className="font-mono font-black text-xs text-amber-400">
                      ${item.price.toLocaleString('es-CO')}
                    </span>
                    <button
                      type="button"
                      className="w-6 h-6 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-300 font-black text-xs flex items-center justify-center transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Table Ticket (Right 5 cols) */}
        <div className="md:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-black text-white font-mono">
                <span>MESA #{selectedTable}</span>
                <span className="text-[10px] font-normal text-slate-400">(Comanda Abierta)</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" /> Ahora
              </span>
            </div>

            {/* Selected items list */}
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {Object.keys(currentTableItems).length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-[11px]">
                  Toca cualquier plato de la izquierda para agregarlo a la mesa.
                </div>
              ) : (
                Object.entries(currentTableItems).map(([id, qtyVal]) => {
                  const qty = Number(qtyVal);
                  const item = DEMO_MENU.find(m => m.id === id);
                  if (!item) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs"
                    >
                      <div className="min-w-0 pr-1 flex-1">
                        <p className="font-bold text-slate-200 truncate text-[11px]">{item.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ${(item.price * qty).toLocaleString('es-CO')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-md px-1">
                        <button
                          onClick={() => handleUpdateQty(id, -1)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono font-bold text-xs px-1 text-white">{qty}</span>
                        <button
                          onClick={() => handleUpdateQty(id, 1)}
                          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Breakdown & Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2 mt-2">
            <div className="text-[11px] space-y-1 text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Base Gravable:</span>
                <span>${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>Impuesto y Servicio (8%):</span>
                <span>${impoconsumo.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-xs font-black text-white pt-1 border-t border-slate-800">
                <span>Total Mesa:</span>
                <span className="text-emerald-400 font-mono text-sm">
                  ${rawTotal.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                disabled={rawTotal === 0}
                onClick={handleSendToKitchen}
                className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                <span>A Cocina</span>
              </button>

              <button
                disabled={rawTotal === 0}
                onClick={handleClearTable}
                className="py-2 px-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer transition shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cobrar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
