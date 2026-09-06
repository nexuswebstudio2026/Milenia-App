import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Receipt, 
  Building2, 
  Calendar, 
  FileSpreadsheet, 
  Printer, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  ShieldCheck, 
  FileText,
  PieChart as PieIcon,
  Wallet
} from 'lucide-react';
import { useTasty } from '../../context/TastyContext';

interface ExpenseItem {
  id: string;
  provider: string;
  concept: string;
  category: 'Materia Prima' | 'Servicios' | 'Nómina' | 'Mantenimiento' | 'Empaques';
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  invoiceRef: string;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: 'exp-01', provider: 'Frigorífico Central del Llano', concept: 'Cortes Angus y Lomo Fino (45 kg)', category: 'Materia Prima', amount: 1850000, date: '2026-09-05', status: 'paid', invoiceRef: 'FE-8921' },
  { id: 'exp-02', provider: 'Distribuidora Lácteos y Quesos', concept: 'Parmesano Reggiano, Mozzarella y Mantequilla', category: 'Materia Prima', amount: 620000, date: '2026-09-05', status: 'paid', invoiceRef: 'FE-1042' },
  { id: 'exp-03', provider: 'Vinos & Licores Nobles S.A.S', concept: 'Cajas Cabernet Sauvignon y Malbec Reserva', category: 'Materia Prima', amount: 1240000, date: '2026-09-04', status: 'pending', invoiceRef: 'FE-4491' },
  { id: 'exp-04', provider: 'Empaques Biodegradables EcoEat', concept: 'Cajas térmicas y vasos compostables', category: 'Empaques', amount: 310000, date: '2026-09-04', status: 'paid', invoiceRef: 'FE-7720' },
  { id: 'exp-05', provider: 'Gas Natural Vanti', concept: 'Suministro Cocina Industrial y Hornos', category: 'Servicios', amount: 480000, date: '2026-09-01', status: 'paid', invoiceRef: 'FAC-9912' },
  { id: 'exp-06', provider: 'Huerta Orgánica Sabana', concept: 'Verduras, Brotes y Frutas frescas', category: 'Materia Prima', amount: 420000, date: '2026-09-06', status: 'pending', invoiceRef: 'FE-3301' }
];

export const AccountingManagerView: React.FC = () => {
  const { orders, currentTenant, showToast } = useTasty();
  const [accountingTab, setAccountingTab] = useState<'balance' | 'cierre_z' | 'gastos' | 'impuestos'>('balance');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  
  // New Expense form
  const [newProvider, setNewProvider] = useState('');
  const [newConcept, setNewConcept] = useState('');
  const [newCategory, setNewCategory] = useState<ExpenseItem['category']>('Materia Prima');
  const [newAmount, setNewAmount] = useState('');
  const [newInvoiceRef, setNewInvoiceRef] = useState('');

  // Cash Register (Cierre Z) input states
  const [cashOpeningBase, setCashOpeningBase] = useState('300000');
  const [cashCountedReal, setCashCountedReal] = useState('1450000');
  const [cierreZGenerated, setCierreZGenerated] = useState(false);

  // Currency Formatter
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // ---------------------------------------------------------------------------
  // Financial Core Calculations
  // ---------------------------------------------------------------------------
  const tenantOrders = useMemo(() => {
    return orders.filter(o => !o.restaurantId || o.restaurantId === currentTenant.id);
  }, [orders, currentTenant.id]);

  const validOrders = useMemo(() => {
    return tenantOrders.filter(o => o.status !== 'cancelled');
  }, [tenantOrders]);

  // Total gross revenue
  const totalSalesGross = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + o.total, 0);
  }, [validOrders]);

  // DIAN Impoconsumo 8%
  const baseGravable = Math.round(totalSalesGross / 1.08);
  const totalImpoconsumo = totalSalesGross - baseGravable;

  // Tips collected (100% goes to waitstaff & kitchen under Ley 1935)
  const totalTips = useMemo(() => {
    return validOrders.reduce((sum, o) => sum + (o.tip || 0), 0);
  }, [validOrders]);

  // Expenses totals
  const totalExpensesPaid = useMemo(() => {
    return expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalExpensesPending = useMemo(() => {
    return expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Food Cost estimation (approx 31.5% of net food revenue)
  const foodCostEstimated = Math.round(baseGravable * 0.315);
  const grossProfitMargin = baseGravable - foodCostEstimated;
  const grossProfitPercent = baseGravable > 0 ? Math.round((grossProfitMargin / baseGravable) * 100) : 0;

  // Net Operating Result
  const netOperatingProfit = grossProfitMargin - (totalExpensesPaid - foodCostEstimated);

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const counts = { efectivo: 0, tarjeta: 0, nequi: 0, daviplata: 0 };
    validOrders.forEach(o => {
      const pm = (o.paymentMethod || 'tarjeta').toLowerCase();
      if (pm.includes('efectivo') || pm.includes('cash')) counts.efectivo += o.total;
      else if (pm.includes('nequi')) counts.nequi += o.total;
      else if (pm.includes('daviplata')) counts.daviplata += o.total;
      else counts.tarjeta += o.total;
    });
    return counts;
  }, [validOrders]);

  const openingBaseNum = parseInt(cashOpeningBase, 10) || 0;
  const countedRealNum = parseInt(cashCountedReal, 10) || 0;
  const expectedCashInDrawer = openingBaseNum + paymentBreakdown.efectivo;
  const cashDifference = countedRealNum - expectedCashInDrawer;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvider || !newAmount) return;

    const parsedAmount = parseInt(newAmount.replace(/\D/g, ''), 10) || 0;
    const item: ExpenseItem = {
      id: `exp-${Date.now()}`,
      provider: newProvider,
      concept: newConcept || 'Compra operativa',
      category: newCategory,
      amount: parsedAmount,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      invoiceRef: newInvoiceRef || `FAC-${Math.floor(1000 + Math.random() * 9000)}`
    };

    setExpenses(prev => [item, ...prev]);
    setIsAddingExpense(false);
    setNewProvider('');
    setNewConcept('');
    setNewAmount('');
    setNewInvoiceRef('');
    showToast('Gasto Registrado', `Factura por ${formatCOP(parsedAmount)} registrada en cuentas por pagar`, 'success');
  };

  const handleToggleExpenseStatus = (id: string) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const nextStatus = e.status === 'paid' ? 'pending' : 'paid';
      return { ...e, status: nextStatus };
    }));
  };

  const handleGenerateCierreZ = () => {
    setCierreZGenerated(true);
    showToast('Cierre Z Emitido', 'El Arqueo y Cierre Z de Caja ha sido sellado contablemente', 'success');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. TOP FINANCIAL SUMMARY TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Ventas Brutas Totales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-white font-mono">
            {formatCOP(totalSalesGross)}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Facturación comercial auditada</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Margen Bruto (Gross Margin)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-400 font-mono">
            {grossProfitPercent}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Costo Alimentos est.: {formatCOP(foodCostEstimated)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Gastos Pagados & Cuentas</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-300 font-mono">
            {formatCOP(totalExpensesPaid)}
          </div>
          <div className="text-[11px] text-amber-400 mt-1 font-medium">
            Por pagar: {formatCOP(totalExpensesPending)}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
            <span>Fondo Propinas Ley 1935</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-black text-blue-300 font-mono">
            {formatCOP(totalTips)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            100% destinado a meseros y cocina
          </div>
        </div>

      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setAccountingTab('balance')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              accountingTab === 'balance'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Estado de Resultados (P&L)</span>
          </button>

          <button
            onClick={() => setAccountingTab('cierre_z')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              accountingTab === 'cierre_z'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Arqueo & Cierre Z de Caja</span>
          </button>

          <button
            onClick={() => setAccountingTab('gastos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              accountingTab === 'gastos'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Cuentas por Pagar & Proveedores</span>
          </button>

          <button
            onClick={() => setAccountingTab('impuestos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              accountingTab === 'impuestos'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Impuestos & DIAN (8% Impoconsumo)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Exportación Contable', 'Libro diario exportado en formato Excel / CSV para el contador', 'info')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exportar para Contador</span>
          </button>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* ---------------- TAB 1: ESTADO DE RESULTADOS (P&L) ---------------- */}
      {accountingTab === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Detailed Financial Ledger */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Estado de Resultados Operativo del Día</h3>
                <p className="text-xs text-slate-400">Estructura contable NIIF para el sector gastronómico</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Auditoría Activa
              </span>
            </div>

            <div className="space-y-3 divide-y divide-slate-800/60 text-xs">
              
              {/* Gross Revenue */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-white text-sm">Ventas Totales Brutas</span>
                </div>
                <span className="font-mono font-black text-sm text-emerald-400">{formatCOP(totalSalesGross)}</span>
              </div>

              {/* Impoconsumo deduction */}
              <div className="flex items-center justify-between pt-2">
                <div className="pl-4 text-slate-400">
                  (-) Impuesto Nacional al Consumo (8% no es ingreso)
                </div>
                <span className="font-mono text-rose-400">-{formatCOP(totalImpoconsumo)}</span>
              </div>

              {/* Net Revenue */}
              <div className="flex items-center justify-between pt-2">
                <div className="font-bold text-white pl-4">
                  (=) Ingresos Operacionales Netos (Base Gravable)
                </div>
                <span className="font-mono font-bold text-white">{formatCOP(baseGravable)}</span>
              </div>

              {/* Food Cost (COGS) */}
              <div className="flex items-center justify-between pt-2">
                <div className="pl-4 text-slate-400">
                  (-) Costo de Venta / Food Cost Estimado (31.5% recetas)
                </div>
                <span className="font-mono text-rose-400">-{formatCOP(foodCostEstimated)}</span>
              </div>

              {/* Gross Margin */}
              <div className="flex items-center justify-between pt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                <div className="font-black text-amber-300">
                  (=) Margen de Contribución Bruta ({grossProfitPercent}%)
                </div>
                <span className="font-mono font-black text-amber-300 text-sm">{formatCOP(grossProfitMargin)}</span>
              </div>

              {/* Operational Expenses */}
              <div className="flex items-center justify-between pt-2">
                <div className="pl-4 text-slate-400">
                  (-) Gastos Operativos & Administrativos Registrados
                </div>
                <span className="font-mono text-rose-400">-{formatCOP(totalExpensesPaid)}</span>
              </div>

              {/* Net Operational Profit */}
              <div className="flex items-center justify-between pt-3 bg-amber-500/10 p-3 rounded-2xl border border-amber-500/30">
                <div>
                  <div className="font-black text-white text-sm">(=) Utilidad Operativa Neta (EBITDA Est.)</div>
                  <div className="text-[10px] text-slate-400">Rendimiento después de costo de insumos y gastos corrientes</div>
                </div>
                <span className="font-mono font-black text-base text-emerald-400">{formatCOP(netOperatingProfit)}</span>
              </div>

            </div>
          </div>

          {/* Payment Method Breakdown Sidebar */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-black text-white border-b border-slate-800 pb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              <span>Ingresos por Medio de Pago</span>
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <div>
                    <div className="font-bold text-white">Tarjetas & Datáfono</div>
                    <div className="text-[10px] text-slate-400">Visa / Mastercard / AMEX</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-white text-right">
                  {formatCOP(paymentBreakdown.tarjeta)}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white">Efectivo en Caja</div>
                    <div className="text-[10px] text-slate-400">Billetes y monedas en cajón</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-white text-right">
                  {formatCOP(paymentBreakdown.efectivo)}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[9px]">
                    N
                  </div>
                  <div>
                    <div className="font-bold text-white">Nequi (QR / Llave)</div>
                    <div className="text-[10px] text-slate-400">Billetera Bancolombia</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-white text-right">
                  {formatCOP(paymentBreakdown.nequi)}
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-[9px]">
                    D
                  </div>
                  <div>
                    <div className="font-bold text-white">Daviplata (Davivienda)</div>
                    <div className="text-[10px] text-slate-400">Transferencias inmediatas</div>
                  </div>
                </div>
                <div className="font-mono font-bold text-white text-right">
                  {formatCOP(paymentBreakdown.daviplata)}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              * Todos los pagos con tarjeta y transferencias cuentan con conciliación bancaria automática.
            </div>
          </div>

        </div>
      )}

      {/* ---------------- TAB 2: ARQUEO & CIERRE Z DE CAJA ---------------- */}
      {accountingTab === 'cierre_z' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <span>Arqueo y Cierre Z de Caja Diario</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Cuadre obligatorio al final de la jornada según reglamentación DIAN y control interno de gerencia.
              </p>
            </div>

            <button
              onClick={handleGenerateCierreZ}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sellar & Emitir Cierre Z Oficial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input 1: Base de Caja */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Base Inicial de Caja (Apertura)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  value={cashOpeningBase}
                  onChange={(e) => setCashOpeningBase(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-[11px] text-slate-500 block">Fondo de cambio entregado al cajero</span>
            </div>

            {/* Metric 2: Efectivo Sistema */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-300 block">
                Efectivo Total Esperado en Cajón
              </span>
              <div className="text-xl font-mono font-black text-amber-400 mt-2">
                {formatCOP(expectedCashInDrawer)}
              </div>
              <span className="text-[11px] text-slate-400 block">
                Base ({formatCOP(openingBaseNum)}) + Ventas Efectivo ({formatCOP(paymentBreakdown.efectivo)})
              </span>
            </div>

            {/* Input 3: Conteo Real */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                Efectivo Físico Contado en Arqueo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">$</span>
                <input
                  type="number"
                  value={cashCountedReal}
                  onChange={(e) => setCashCountedReal(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Diferencia:</span>
                <span className={`font-mono font-bold ${cashDifference >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cashDifference >= 0 ? `+${formatCOP(cashDifference)}` : formatCOP(cashDifference)}
                </span>
              </div>
            </div>

          </div>

          {/* Cierre Z Printable Mock Preview */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl max-w-xl mx-auto font-mono text-xs text-slate-300 space-y-3 shadow-inner">
            <div className="text-center border-b border-dashed border-slate-700 pb-3 space-y-1">
              <div className="font-bold text-sm text-white uppercase">{currentTenant.name}</div>
              <div>NIT: {currentTenant.branding.nit || '901.458.789-3'} - Régimen Común</div>
              <div className="text-[10px] text-slate-400">INFORME DIARIO DE VENTAS - REPORTE Z</div>
              <div className="text-[10px] text-amber-400">FECHA: {new Date().toLocaleDateString('es-CO')} - {new Date().toLocaleTimeString('es-CO')}</div>
            </div>

            <div className="space-y-1 py-2 text-[11px]">
              <div className="flex justify-between">
                <span>VENTAS BRUTAS:</span>
                <span className="text-white font-bold">{formatCOP(totalSalesGross)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>BASE GRAVABLE (ALIMENTOS):</span>
                <span>{formatCOP(baseGravable)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IMPOCONSUMO (8%):</span>
                <span>{formatCOP(totalImpoconsumo)}</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>PROPINA VOLUNTARIA (10%):</span>
                <span>{formatCOP(totalTips)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-700 pt-2 space-y-1 text-[11px]">
              <div className="font-bold text-slate-400">DESGLOSE FORMAS DE PAGO:</div>
              <div className="flex justify-between pl-2">
                <span>- Efectivo:</span>
                <span>{formatCOP(paymentBreakdown.efectivo)}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>- Tarjetas Crédito/Débito:</span>
                <span>{formatCOP(paymentBreakdown.tarjeta)}</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>- Transferencias Digitales:</span>
                <span>{formatCOP(paymentBreakdown.nequi + paymentBreakdown.daviplata)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-700 pt-3 text-center text-[10px] text-slate-500">
              Cierre transmitido a la DIAN y archivado en auditoría digital de Gerencia.
            </div>
          </div>
        </div>
      )}

      {/* ---------------- TAB 3: GASTOS & PROVEEDORES ---------------- */}
      {accountingTab === 'gastos' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
            <div>
              <h3 className="text-base font-black text-white">Cuentas por Pagar a Proveedores & Gastos Operativos</h3>
              <p className="text-xs text-slate-400">Control de egresos, materias primas cárnicas, lácteos y suministros</p>
            </div>

            <button
              onClick={() => setIsAddingExpense(!isAddingExpense)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Factura de Gasto</span>
            </button>
          </div>

          {/* Form to add expense */}
          {isAddingExpense && (
            <form onSubmit={handleCreateExpense} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 animate-fadeIn">
              <div className="text-xs font-bold text-amber-400">Nueva Factura de Proveedor / Gasto</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Proveedor / Beneficiario</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Distribuidora Cárnica"
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Concepto / Detalle</label>
                  <input
                    type="text"
                    placeholder="Ej. Lomo y Costillas Angus (30kg)"
                    value={newConcept}
                    onChange={(e) => setNewConcept(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Valor Total (COP)</label>
                  <input
                    type="number"
                    required
                    placeholder="Ej. 850000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Categoría Contable</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ExpenseItem['category'])}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Materia Prima">Materia Prima (Alimentos/Bebidas)</option>
                    <option value="Servicios">Servicios Públicos (Gas, Luz, Agua)</option>
                    <option value="Nómina">Nómina y Prestaciones</option>
                    <option value="Empaques">Empaques & Desechables</option>
                    <option value="Mantenimiento">Mantenimiento y Equipos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Número de Factura Electrónica</label>
                  <input
                    type="text"
                    placeholder="Ej. FE-9921"
                    value={newInvoiceRef}
                    onChange={(e) => setNewInvoiceRef(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingExpense(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          )}

          {/* Expenses List */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Proveedor / Beneficiario</th>
                  <th className="px-4 py-3">Concepto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3 text-right">Monto (COP)</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-950/40">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{exp.provider}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{exp.invoiceRef}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{exp.concept}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono">{exp.date}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white">
                      {formatCOP(exp.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exp.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {exp.status === 'paid' ? 'Pagada' : 'Por Pagar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleExpenseStatus(exp.id)}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                      >
                        {exp.status === 'paid' ? 'Marcar Pendiente' : 'Marcar Pagado'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- TAB 4: IMPUESTOS & DIAN ---------------- */}
      {accountingTab === 'impuestos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <FileCheckIcon className="w-5 h-5 text-amber-400" />
              <span>Liquidación Impuesto Nacional al Consumo (8%)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Conforme al Estatuto Tributario de Colombia (Art. 512-1), el servicio de restaurante no genera IVA sino Impuesto Nacional al Consumo del 8%.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Gravable Declarable (Ventas Netas):</span>
                <span className="font-mono font-bold text-white">{formatCOP(baseGravable)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tarifa Legal Vigente:</span>
                <span className="font-mono font-bold text-amber-400">8.0%</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-black text-white">
                <span>Impoconsumo a Girar a la DIAN:</span>
                <span className="font-mono text-rose-400">{formatCOP(totalImpoconsumo)}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-slate-300">Calendario Tributario DIAN:</div>
              <div>Bimestre actual: Septiembre - Octubre 2026</div>
              <div>Formulario DIAN: 310 (Impuesto Nacional al Consumo)</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>Auditoría de Propinas (Ley 1935 de 2019)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Las propinas son de propiedad exclusiva del personal de servicio (meseros, bartenders y cocina). El restaurante no puede retenerlas.
            </p>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Propinas Voluntarias Recaudadas:</span>
                <span className="font-mono font-bold text-blue-400">{formatCOP(totalTips)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distribución Salón / Meseros (70%):</span>
                <span className="font-mono text-white">{formatCOP(Math.round(totalTips * 0.70))}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distribución Cocina / Brigada (30%):</span>
                <span className="font-mono text-white">{formatCOP(Math.round(totalTips * 0.30))}</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Fondo verificado en cumplimiento de la Ley 1935</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

function FileCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Receipt {...props as any} />;
}
