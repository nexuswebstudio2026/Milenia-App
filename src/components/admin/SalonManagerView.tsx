import React, { useState } from 'react';
import { 
  UserCheck, 
  Utensils, 
  ChefHat, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  Send, 
  Users, 
  CreditCard, 
  DollarSign, 
  Coins, 
  Sparkles, 
  Search, 
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';
import { useTasty } from '../../context/TastyContext';
import { MenuItem } from '../../types';

interface TableOrderItem {
  name: string;
  price: number;
  qty: number;
  category: string;
}

interface SalonTableData {
  id: number;
  name: string;
  zone: 'Salón Principal' | 'Terraza' | 'VIP Cava' | 'Barra';
  capacity: number;
  diners: number;
  status: 'available' | 'occupied' | 'kds_sent' | 'billing';
  assignedWaiter: string;
  waiterId: string;
  occupiedSince?: string;
  items: TableOrderItem[];
}

const INITIAL_SALON_TABLES: SalonTableData[] = [
  {
    id: 1,
    name: 'Mesa 1',
    zone: 'Terraza',
    capacity: 4,
    diners: 3,
    status: 'kds_sent',
    assignedWaiter: 'Carlos Mendoza',
    waiterId: 'mes-01',
    occupiedSince: '13:20',
    items: [
      { name: 'Corte Angus a la Brasa', price: 68000, qty: 1, category: 'Carnes' },
      { name: 'Copa Gran Reserva Cabernet', price: 34000, qty: 2, category: 'Vinos' },
      { name: 'Papas Rústicas Trufadas', price: 18000, qty: 1, category: 'Acompañamientos' }
    ]
  },
  {
    id: 2,
    name: 'Mesa 2',
    zone: 'Salón Principal',
    capacity: 4,
    diners: 2,
    status: 'occupied',
    assignedWaiter: 'Andrea Ruiz',
    waiterId: 'mes-02',
    occupiedSince: '13:45',
    items: [
      { name: 'Risotto de Setas Silvestres', price: 46000, qty: 1, category: 'Entradas' },
      { name: 'Carpaccio de Res Curada', price: 38000, qty: 1, category: 'Entradas' }
    ]
  },
  {
    id: 3,
    name: 'Mesa 3',
    zone: 'Salón Principal',
    capacity: 6,
    diners: 5,
    status: 'billing',
    assignedWaiter: 'Carlos Mendoza',
    waiterId: 'mes-01',
    occupiedSince: '12:50',
    items: [
      { name: 'Pesca del Día con Cítricos', price: 54000, qty: 3, category: 'Pescados' },
      { name: 'Ceviche Mixto Costero', price: 36000, qty: 2, category: 'Entradas' },
      { name: 'Limonada de Coco Artesanal', price: 14000, qty: 4, category: 'Bebidas' }
    ]
  },
  {
    id: 4,
    name: 'Mesa 4',
    zone: 'Salón Principal',
    capacity: 2,
    diners: 0,
    status: 'available',
    assignedWaiter: 'Sin Asignar',
    waiterId: '',
    items: []
  },
  {
    id: 5,
    name: 'Mesa 5',
    zone: 'VIP Cava',
    capacity: 8,
    diners: 6,
    status: 'kds_sent',
    assignedWaiter: 'Mateo Gómez',
    waiterId: 'mes-03',
    occupiedSince: '13:10',
    items: [
      { name: 'Pulpo Rostizado al Carbón', price: 62000, qty: 2, category: 'Entradas' },
      { name: 'Tomahawk Steak Prime (1kg)', price: 165000, qty: 1, category: 'Carnes' },
      { name: 'Botella Malbec Gran Reserva', price: 140000, qty: 1, category: 'Vinos' }
    ]
  },
  {
    id: 6,
    name: 'Mesa 6',
    zone: 'Barra',
    capacity: 2,
    diners: 0,
    status: 'available',
    assignedWaiter: 'Sin Asignar',
    waiterId: '',
    items: []
  },
  {
    id: 7,
    name: 'Mesa 7',
    zone: 'Terraza',
    capacity: 4,
    diners: 4,
    status: 'occupied',
    assignedWaiter: 'Andrea Ruiz',
    waiterId: 'mes-02',
    occupiedSince: '14:05',
    items: [
      { name: 'Hamburguesa Artesanal Trufada', price: 42000, qty: 2, category: 'Principales' },
      { name: 'Cerveza Artesanal IPA', price: 16000, qty: 4, category: 'Bebidas' }
    ]
  },
  {
    id: 8,
    name: 'Mesa 8',
    zone: 'VIP Cava',
    capacity: 6,
    diners: 0,
    status: 'available',
    assignedWaiter: 'Sin Asignar',
    waiterId: '',
    items: []
  }
];

const AVAILABLE_WAITERS = [
  { id: 'mes-01', name: 'Carlos Mendoza', role: 'Mesero Líder', shift: 'Turno Tarde' },
  { id: 'mes-02', name: 'Andrea Ruiz', role: 'Mesera de Salón', shift: 'Turno Tarde' },
  { id: 'mes-03', name: 'Mateo Gómez', role: 'Sommelier & Mesero VIP', shift: 'Turno Tarde' }
];

export const SalonManagerView: React.FC = () => {
  const { menuItems, showToast } = useTasty();
  const [tables, setTables] = useState<SalonTableData[]>(INITIAL_SALON_TABLES);
  const [selectedTableId, setSelectedTableId] = useState<number>(1);
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [menuSearch, setMenuSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'nequi' | 'daviplata'>('tarjeta');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const selectedTable = tables.find(t => t.id === selectedTableId) || tables[0];

  // Calculations for active table
  const subtotal = selectedTable.items.reduce((sum, it) => sum + (it.price * it.qty), 0);
  const impoconsumo = Math.round(subtotal * 0.08); // 8% Impoconsumo Ley Colombia
  const tipSugerida = Math.round(subtotal * 0.10); // 10% Propina Voluntaria
  const totalWithTip = subtotal + impoconsumo + tipSugerida;

  // Overview metrics
  const totalOccupied = tables.filter(t => t.status !== 'available').length;
  const totalAvailable = tables.filter(t => t.status === 'available').length;
  const totalBilling = tables.filter(t => t.status === 'billing').length;
  const activeSalonSales = tables.reduce((sum, t) => {
    return sum + t.items.reduce((s, it) => s + (it.price * it.qty), 0);
  }, 0);

  // Filter tables by zone
  const filteredTables = tables.filter(t => {
    if (zoneFilter === 'all') return true;
    return t.zone === zoneFilter;
  });

  // Filter catalog items to add to table
  const filteredCatalog = menuItems.filter(item => {
    return item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
           (item.categoryId || '').toLowerCase().includes(menuSearch.toLowerCase());
  }).slice(0, 10);

  // Table actions
  const handleAddItemToTable = (dish: { name: string; price: number; category: string }) => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      const items = [...t.items];
      const existing = items.find(it => it.name === dish.name);
      if (existing) {
        existing.qty += 1;
      } else {
        items.push({ ...dish, qty: 1 });
      }
      return {
        ...t,
        items,
        status: t.status === 'available' ? 'occupied' : t.status,
        diners: t.diners === 0 ? 2 : t.diners,
        occupiedSince: t.occupiedSince || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
      };
    }));
    showToast('Plato Agregado', `${dish.name} añadido a ${selectedTable.name}`, 'info');
  };

  const handleUpdateQty = (dishName: string, delta: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      const items = t.items.map(it => {
        if (it.name === dishName) {
          return { ...it, qty: it.qty + delta };
        }
        return it;
      }).filter(it => it.qty > 0);

      const status = items.length === 0 ? 'available' : t.status;
      return { ...t, items, status };
    }));
  };

  const handleSendToKitchen = () => {
    if (selectedTable.items.length === 0) return;
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return { ...t, status: 'kds_sent' };
    }));
    setNotification(`Comanda de ${selectedTable.name} enviada exitosamente a la Pantalla de Cocina (KDS).`);
    showToast('Comanda Transmitida', `La comanda de ${selectedTable.name} ya está en la cocina`, 'success');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleProcessPayment = () => {
    if (selectedTable.items.length === 0) return;
    setIsProcessingPayment(true);
    setTimeout(() => {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedTableId) return t;
        return {
          ...t,
          items: [],
          status: 'available',
          diners: 0,
          occupiedSince: undefined
        };
      }));
      setIsProcessingPayment(false);
      const msg = `Cuenta de ${selectedTable.name} liquidada por ${formatCOP(totalWithTip)} (${paymentMethod.toUpperCase()}). Factura Electrónica emitida.`;
      setNotification(msg);
      showToast('Pago & Liquidación Exitosa', msg, 'success');
      setTimeout(() => setNotification(null), 5000);
    }, 800);
  };

  const handleAssignWaiter = (waiterName: string, waiterId: string) => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return { ...t, assignedWaiter: waiterName, waiterId };
    }));
    showToast('Mesero Asignado', `${waiterName} asignado a ${selectedTable.name}`, 'info');
  };

  const handleClearTable = () => {
    setTables(prev => prev.map(t => {
      if (t.id !== selectedTableId) return t;
      return {
        ...t,
        items: [],
        status: 'available',
        diners: 0,
        occupiedSince: undefined
      };
    }));
    showToast('Mesa Liberada', `${selectedTable.name} ahora está libre para nuevos clientes`, 'info');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. TOP METRICS & OVERVIEW BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Mesas Ocupadas</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalOccupied}</span>
            <span className="text-xs text-slate-400">/ {tables.length} mesas</span>
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-medium">
            {Math.round((totalOccupied / tables.length) * 100)}% ocupación salón
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Mesas Disponibles</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalAvailable}</span>
            <span className="text-xs text-emerald-400 font-bold">Listas para sentar</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Rotación continua
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Cuentas por Cobrar</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{totalBilling}</span>
            <span className="text-xs text-rose-400 font-bold">Pidiendo cuenta</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Prioridad en caja
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Venta en Mesas (Vivo)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {formatCOP(activeSalonSales)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Consumo en curso salón
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2. ZONE FILTER & TABLE MAP + LIVE COMANDA CONTROLLER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER: INTERACTIVE TABLE MAP (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Mapa del Salón & Mesas en Tiempo Real</h3>
                  <p className="text-[11px] text-slate-400">Supervisión en vivo de ocupación, comandas y meseros asignados</p>
                </div>
              </div>

              {/* Zone Filter */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                {['all', 'Salón Principal', 'Terraza', 'VIP Cava', 'Barra'].map(z => (
                  <button
                    key={z}
                    onClick={() => setZoneFilter(z)}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                      zoneFilter === z
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {z === 'all' ? 'Todas' : z}
                  </button>
                ))}
              </div>
            </div>

            {/* Table Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {filteredTables.map(tbl => {
                const isSelected = tbl.id === selectedTableId;
                const itemCount = tbl.items.reduce((s, it) => s + it.qty, 0);
                const tableTotal = tbl.items.reduce((s, it) => s + (it.price * it.qty), 0);

                let statusColor = 'border-slate-800 bg-slate-950/70 text-slate-400';
                let badgeColor = 'bg-slate-800 text-slate-400';
                let badgeText = 'Disponible';

                if (tbl.status === 'billing') {
                  statusColor = 'border-rose-500/60 bg-rose-950/20 text-rose-300 shadow-md shadow-rose-500/10';
                  badgeColor = 'bg-rose-500 text-white animate-pulse';
                  badgeText = 'Pidiendo Cuenta';
                } else if (tbl.status === 'kds_sent') {
                  statusColor = 'border-blue-500/50 bg-blue-950/20 text-blue-300 shadow-md shadow-blue-500/10';
                  badgeColor = 'bg-blue-500 text-white';
                  badgeText = 'En Cocina';
                } else if (tbl.status === 'occupied') {
                  statusColor = 'border-amber-500/50 bg-amber-950/20 text-amber-300 shadow-md shadow-amber-500/10';
                  badgeColor = 'bg-amber-500 text-slate-950 font-bold';
                  badgeText = 'Consumiendo';
                }

                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected 
                        ? 'ring-2 ring-amber-400 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]' 
                        : statusColor
                    } hover:border-amber-400/80`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-black text-sm text-white">{tbl.name}</span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </div>

                    <div className="mt-2 text-[11px] text-slate-300 font-medium">
                      {tbl.zone}
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{tbl.diners > 0 ? `${tbl.diners} pax` : `Cap. ${tbl.capacity}`}</span>
                      <span>{tbl.occupiedSince ? `${tbl.occupiedSince}` : '—'}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-slate-400 truncate max-w-[80px]">
                        {tbl.assignedWaiter !== 'Sin Asignar' ? tbl.assignedWaiter.split(' ')[0] : 'Libre'}
                      </span>
                      <span className="font-mono font-bold text-amber-400">
                        {tableTotal > 0 ? formatCOP(tableTotal) : '$0'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MESEROS EN TURNO PERFORMANCE PANEL */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase text-white tracking-wider">
                  Brigada de Meseros en Servicio (Salón)
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">3 meseros activos en sala</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABLE_WAITERS.map(w => {
                const assignedTables = tables.filter(t => t.waiterId === w.id);
                const waiterSales = assignedTables.reduce((sum, t) => {
                  return sum + t.items.reduce((s, it) => s + (it.price * it.qty), 0);
                }, 0);
                const waiterTips = Math.round(waiterSales * 0.10);

                return (
                  <div key={w.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center justify-center border border-amber-500/30">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">{w.name}</div>
                          <div className="text-[10px] text-slate-400">{w.role}</div>
                        </div>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400 block">Mesas:</span>
                        <span className="text-white font-bold">{assignedTables.length} asignadas</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Propinas:</span>
                        <span className="text-emerald-400 font-bold">{formatCOP(waiterTips)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: ACTIVE TABLE CONTROLLER & ORDER COMMAND (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            
            {/* Header: Table Title & Assign Waiter */}
            <div className="border-b border-slate-800 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{selectedTable.name}</span>
                    <span className="text-xs font-normal text-slate-400">({selectedTable.zone})</span>
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Capacidad: {selectedTable.capacity} puestos • Comensales: {selectedTable.diners || 0}
                  </div>
                </div>

                <button
                  onClick={handleClearTable}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:text-rose-300 bg-slate-950 border border-slate-800 hover:border-rose-500/40 rounded-xl transition cursor-pointer"
                  title="Limpiar y liberar mesa"
                >
                  Liberar Mesa
                </button>
              </div>

              {/* Waiter assignment dropdown */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400">Mesero Responsable:</span>
                <select
                  value={selectedTable.waiterId}
                  onChange={(e) => {
                    const found = AVAILABLE_WAITERS.find(w => w.id === e.target.value);
                    if (found) {
                      handleAssignWaiter(found.name, found.id);
                    }
                  }}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">Sin Asignar</option>
                  {AVAILABLE_WAITERS.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.role})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Order Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Comanda Actual</span>
                <span className="text-[11px] text-slate-400">{selectedTable.items.length} ítems</span>
              </div>

              {selectedTable.items.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-950 border border-slate-800/80 text-slate-400 space-y-1">
                  <Utensils className="w-6 h-6 mx-auto text-slate-600 mb-1" />
                  <div className="text-xs font-bold text-slate-300">Mesa sin pedidos activos</div>
                  <div className="text-[11px]">Agrega platos del catálogo inferior para abrir comanda.</div>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedTable.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate">{it.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {formatCOP(it.price)} c/u
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleUpdateQty(it.name, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-mono font-bold text-amber-400">
                          {it.qty}
                        </span>
                        <button
                          onClick={() => handleUpdateQty(it.name, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center font-bold transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right font-mono font-bold text-white shrink-0 min-w-[70px]">
                        {formatCOP(it.price * it.qty)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Menu Dish Inserter */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Agregar Plato a la Mesa</span>
                <div className="relative w-36">
                  <Search className="w-3 h-3 absolute left-2 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar plato..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-6 pr-2 py-1 text-[11px] bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredCatalog.map(dish => (
                  <button
                    key={dish.id}
                    onClick={() => handleAddItemToTable({ name: dish.name, price: dish.price, category: dish.categoryId || 'General' })}
                    className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left transition cursor-pointer group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-amber-300 truncate">
                      {dish.name}
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {formatCOP(dish.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Bill Summary Calculations */}
            {selectedTable.items.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Consumo:</span>
                  <span className="font-mono text-white">{formatCOP(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Impoconsumo (8% DIAN):</span>
                  <span className="font-mono text-white">{formatCOP(impoconsumo)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="text-blue-400">Propina Voluntaria (10%):</span>
                  <span className="font-mono text-blue-400 font-bold">{formatCOP(tipSugerida)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                  <span>Total Liquidación:</span>
                  <span className="text-amber-400 font-mono">{formatCOP(totalWithTip)}</span>
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleSendToKitchen}
                disabled={selectedTable.items.length === 0}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChefHat className="w-4 h-4" />
                <span>Transmitir Comanda a Cocina (KDS)</span>
              </button>

              {/* Payment Method Selector & Liquidar Button */}
              {selectedTable.items.length > 0 && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-400">Método de Cobro (POS):</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['tarjeta', 'efectivo', 'nequi', 'daviplata'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 px-2 rounded-xl text-[10px] font-bold uppercase transition cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleProcessPayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{isProcessingPayment ? 'Transmitiendo a DIAN...' : `Liquidar & Cobrar (${formatCOP(totalWithTip)})`}</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
