import React, { useState } from 'react';
import { TableOrder, MenuItem, KitchenOrder, InvoiceRecord } from '../../types/milenia';
import { Plus, Minus, Send, CheckCircle2, User, Clock, Utensils, CreditCard, DollarSign, Smartphone } from 'lucide-react';

interface MileniaPosViewProps {
  tables: TableOrder[];
  menu: MenuItem[];
  onUpdateTable: (table: TableOrder) => void;
  onSendToKitchen: (order: KitchenOrder) => void;
  onInvoiceCreated: (invoice: InvoiceRecord) => void;
}

export const MileniaPosView: React.FC<MileniaPosViewProps> = ({
  tables,
  menu,
  onUpdateTable,
  onSendToKitchen,
  onInvoiceCreated
}) => {
  const [selectedTableNumber, setSelectedTableNumber] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Nequi / Daviplata' | 'Tarjeta / Datáfono'>('Efectivo');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const selectedTable = tables.find(t => t.tableNumber === selectedTableNumber) || tables[0];

  const categories = ['Todos', 'Platos Fuertes', 'Entradas', 'Bebidas', 'Postres'];
  const filteredMenu = selectedCategory === 'Todos' 
    ? menu 
    : menu.filter(m => m.category === selectedCategory);

  const calculateTotal = (items: { price: number; quantity: number }[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const total = calculateTotal(selectedTable.items);
  const subtotal = Math.round(total / 1.08);
  const impoconsumo = total - subtotal;

  const handleAddItem = (item: MenuItem) => {
    const existingIndex = selectedTable.items.findIndex(i => i.id === item.id);
    let updatedItems = [...selectedTable.items];

    if (existingIndex >= 0) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + 1
      };
    } else {
      updatedItems.push({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      });
    }

    onUpdateTable({
      ...selectedTable,
      status: 'ocupada',
      waiter: selectedTable.waiter === 'Sin asignar' ? 'Mesero en Turno' : selectedTable.waiter,
      openedAt: selectedTable.openedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: updatedItems
    });
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    let updatedItems = [...selectedTable.items];
    const index = updatedItems.findIndex(i => i.id === itemId);
    if (index === -1) return;

    const newQty = updatedItems[index].quantity + delta;
    if (newQty <= 0) {
      updatedItems = updatedItems.filter(i => i.id !== itemId);
    } else {
      updatedItems[index] = { ...updatedItems[index], quantity: newQty };
    }

    const newStatus = updatedItems.length === 0 ? 'libre' : selectedTable.status;

    onUpdateTable({
      ...selectedTable,
      status: newStatus,
      waiter: updatedItems.length === 0 ? 'Sin asignar' : selectedTable.waiter,
      openedAt: updatedItems.length === 0 ? undefined : selectedTable.openedAt,
      items: updatedItems
    });
  };

  const handleSendKitchenTicket = () => {
    if (selectedTable.items.length === 0) return;

    const newKitchenOrder: KitchenOrder = {
      id: `K-${Date.now().toString().slice(-4)}`,
      tableNumber: selectedTable.tableNumber,
      items: [...selectedTable.items],
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pendiente',
      urgency: 'normal'
    };

    onSendToKitchen(newKitchenOrder);
    alert(`✅ Comanda enviada a Cocina para la Mesa #${selectedTable.tableNumber}`);
  };

  const handleProcessPayment = () => {
    if (total === 0) return;

    const invoice: InvoiceRecord = {
      id: `FAC-${Math.floor(1000 + Math.random() * 9000)}`,
      tableNumber: selectedTable.tableNumber,
      total,
      subtotal,
      tax: impoconsumo,
      paymentMethod,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onInvoiceCreated(invoice);

    // Free the table
    onUpdateTable({
      ...selectedTable,
      status: 'libre',
      waiter: 'Sin asignar',
      openedAt: undefined,
      items: []
    });

    setShowCheckoutModal(false);
    alert(`🎉 Factura ${invoice.id} generada con éxito. Mesa #${selectedTable.tableNumber} liberada.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Table Selector Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>Mesas del Restaurante</span>
            <span className="text-xs font-normal text-slate-500">(Selecciona para ver comanda)</span>
          </h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
              Libre
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Ocupada
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Pidiendo Cuenta
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {tables.map(table => {
            const isSelected = table.tableNumber === selectedTableNumber;
            const tableTotal = calculateTotal(table.items);
            
            let statusColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300';
            if (table.status === 'ocupada') {
              statusColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 text-amber-900 dark:text-amber-200';
            } else if (table.status === 'cuenta_pedida') {
              statusColor = 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-400 text-indigo-900 dark:text-indigo-200';
            }

            return (
              <button
                key={table.tableNumber}
                id={`table-btn-${table.tableNumber}`}
                onClick={() => setSelectedTableNumber(table.tableNumber)}
                className={`p-3.5 rounded-2xl border-2 text-left transition relative cursor-pointer ${statusColor} ${
                  isSelected ? 'ring-2 ring-amber-500 shadow-md scale-[1.02]' : 'hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm font-mono">Mesa {table.tableNumber}</span>
                  <span className={`w-2 h-2 rounded-full ${
                    table.status === 'ocupada' ? 'bg-amber-500' : table.status === 'cuenta_pedida' ? 'bg-indigo-500' : 'bg-slate-400'
                  }`} />
                </div>
                <div className="mt-2 text-[11px]">
                  {table.status === 'libre' ? (
                    <span className="text-slate-400">Disponible</span>
                  ) : (
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white font-mono">
                        ${tableTotal.toLocaleString('es-CO')}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{table.items.length} ítems</div>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace: Menu on Left, Active Order on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Menu Picker */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span>Carta & Productos</span>
            </h3>
            <span className="text-xs text-slate-500">Milenia Gastronomía</span>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredMenu.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.name}</h4>
                    <span className="font-mono font-black text-xs text-amber-600 dark:text-amber-400 shrink-0">
                      ${item.price.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <button
                  id={`add-item-${item.id}`}
                  onClick={() => handleAddItem(item)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar a Mesa {selectedTable.tableNumber}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 cols: Current Table Order & Checkout */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header of Table */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base text-slate-900 dark:text-white font-mono">
                    Comanda Mesa {selectedTable.tableNumber}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedTable.status === 'ocupada' 
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' 
                      : selectedTable.status === 'cuenta_pedida'
                      ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {selectedTable.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" /> {selectedTable.waiter}
                  </span>
                  {selectedTable.openedAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedTable.openedAt}
                    </span>
                  )}
                </div>
              </div>

              {selectedTable.items.length > 0 && (
                <button
                  onClick={() => onUpdateTable({ ...selectedTable, status: 'cuenta_pedida' })}
                  className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition cursor-pointer"
                >
                  Pedir Cuenta
                </button>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {selectedTable.items.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <p className="font-bold text-slate-500">Mesa sin pedidos activos</p>
                  <p className="mt-1">Selecciona productos de la carta para comenzar la comanda.</p>
                </div>
              ) : (
                selectedTable.items.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        ${item.price.toLocaleString('es-CO')} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-black font-mono">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-20 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ${(item.price * item.quantity).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary & Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mt-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal (Base Gravable):</span>
                <span className="font-mono font-medium">${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Impoconsumo (8% DIAN):</span>
                <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                  ${impoconsumo.toLocaleString('es-CO')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-1.5 border-t border-slate-200 dark:border-slate-800">
                <span>Total a Pagar:</span>
                <span className="font-mono text-base text-emerald-600 dark:text-emerald-400">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                id="btn-send-kds"
                disabled={selectedTable.items.length === 0}
                onClick={handleSendKitchenTicket}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400" />
                <span>Enviar Comanda</span>
              </button>

              <button
                id="btn-checkout"
                disabled={selectedTable.items.length === 0}
                onClick={() => setShowCheckoutModal(true)}
                className="py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cobrar / Facturar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-black text-base text-slate-900 dark:text-white font-mono">
                Facturar Mesa {selectedTable.tableNumber}
              </h3>
              <span className="font-black text-lg text-emerald-600 font-mono">
                ${total.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Selecciona Medio de Pago:
              </p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setPaymentMethod('Efectivo')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition cursor-pointer ${
                    paymentMethod === 'Efectivo'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Efectivo</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('Nequi / Daviplata')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition cursor-pointer ${
                    paymentMethod === 'Nequi / Daviplata'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Nequi/Davi</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('Tarjeta / Datáfono')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 font-bold transition cursor-pointer ${
                    paymentMethod === 'Tarjeta / Datáfono'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Datáfono</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-mono text-slate-900 dark:text-white">${subtotal.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between">
                <span>Impoconsumo 8%:</span>
                <span className="font-mono text-slate-900 dark:text-white">${impoconsumo.toLocaleString('es-CO')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Cobrado:</span>
                <span className="font-mono text-emerald-600 font-bold">${total.toLocaleString('es-CO')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleProcessPayment}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-black text-xs text-slate-950 transition shadow-sm cursor-pointer"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
