import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText, 
  Sparkles, 
  Eye, 
  Printer, 
  ArrowUpRight, 
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { formatCop } from '../../utils/currency';
import { MileniaAlly, getAliados } from '../../services/mileniaAliadosService';
import { 
  MileniaTransaction, 
  getContabilidad, 
  addTransaction,
  subscribeToContabilidad 
} from '../../services/mileniaContabilidadService';
import { db, collection, getDocs, doc, setDoc, onSnapshot } from '../../firebaseConfig';

export interface MileniaSaleItem {
  id: string;
  invoiceNumber: string; // e.g. "FACT-2026-0042"
  dianCufe?: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  amountCop: number;
  taxCop: number; // Impoconsumo 8% o IVA
  tipCop?: number;
  paymentMethod: 'DAVIVIENDA' | 'WOMPI' | 'PSE' | 'NEQUI' | 'DAVIPLATA' | 'TARJETA' | 'EFECTIVO' | 'TRANSFERENCIA';
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  saleType: 'SUSCRIPCION_SAAS' | 'CONSUMO_RESTAURANTE' | 'MODULO_EXTRA' | 'DEMO_20';
  itemsSummary: string;
  date: string;
  createdAt: string;
}

const INITIAL_SALES: MileniaSaleItem[] = [
  {
    id: 'sale-001',
    invoiceNumber: 'MIL-2026-0104',
    dianCufe: '4a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b-104',
    restaurantId: '1',
    restaurantName: 'Parrilla & Fuego Camilo',
    customerName: 'Andrés Camilo Vidal (Suscripción)',
    customerEmail: 'camilovidal.1704@gmail.com',
    customerPhone: '+57 304 347 0984',
    amountCop: 289000,
    taxCop: 0,
    paymentMethod: 'DAVIVIENDA',
    paymentStatus: 'PAID',
    saleType: 'SUSCRIPCION_SAAS',
    itemsSummary: 'Suscripción Mensual Plan Pro Milenia SaaS (16 Mesas + DIAN)',
    date: '2026-08-28',
    createdAt: '2026-08-28T14:30:00.000Z'
  },
  {
    id: 'sale-002',
    invoiceNumber: 'MIL-2026-0103',
    dianCufe: '8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b-103',
    restaurantId: '5',
    restaurantName: 'Trattoria Bella Italia',
    customerName: 'Miguel Narváez',
    customerEmail: 'miguel.owner@milenia.co',
    customerPhone: '+57 318 450 1192',
    amountCop: 499000,
    taxCop: 0,
    paymentMethod: 'DAVIVIENDA',
    paymentStatus: 'PAID',
    saleType: 'SUSCRIPCION_SAAS',
    itemsSummary: 'Suscripción Mensual Plan Enterprise (32 Mesas + KDS Pro)',
    date: '2026-08-25',
    createdAt: '2026-08-25T11:15:00.000Z'
  },
  {
    id: 'sale-003',
    invoiceNumber: 'POS-REST-1-089',
    dianCufe: 'dian-cufe-pos-882910-089',
    restaurantId: '1',
    restaurantName: 'Parrilla & Fuego Camilo',
    customerName: 'Carlos Gómez (Mesa 4)',
    customerEmail: 'carlos.gomez@gmail.com',
    customerPhone: '+57 310 998 1234',
    amountCop: 168000,
    taxCop: 12444, // 8% impoconsumo
    tipCop: 15000,
    paymentMethod: 'DAVIVIENDA',
    paymentStatus: 'PAID',
    saleType: 'CONSUMO_RESTAURANTE',
    itemsSummary: '2x Bife de Chorizo Angus, 1x Botella Malbec Reserva, 1x Postre Tres Leches',
    date: '2026-08-30',
    createdAt: '2026-08-30T13:45:00.000Z'
  },
  {
    id: 'sale-004',
    invoiceNumber: 'MIL-2026-0102',
    dianCufe: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b-102',
    restaurantId: '3',
    restaurantName: 'La Taquería Chingona',
    customerName: 'Santiago Londoño',
    customerEmail: 'santiago@taqueriachingona.com',
    customerPhone: '+57 312 908 4411',
    amountCop: 149000,
    taxCop: 0,
    paymentMethod: 'WOMPI',
    paymentStatus: 'PAID',
    saleType: 'SUSCRIPCION_SAAS',
    itemsSummary: 'Suscripción Mensual Plan Básico (8 Mesas)',
    date: '2026-08-20',
    createdAt: '2026-08-20T09:30:00.000Z'
  },
  {
    id: 'sale-005',
    invoiceNumber: 'MIL-2026-0101',
    dianCufe: '6a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b-101',
    restaurantId: '2',
    restaurantName: 'Sushi Lounge Wok',
    customerName: 'Marcela Reyes',
    customerEmail: 'marcela@sushilounge.co',
    customerPhone: '+57 301 776 5432',
    amountCop: 289000,
    taxCop: 0,
    paymentMethod: 'PSE',
    paymentStatus: 'PAID',
    saleType: 'SUSCRIPCION_SAAS',
    itemsSummary: 'Suscripción Mensual Plan Pro Milenia SaaS (16 Mesas)',
    date: '2026-08-15',
    createdAt: '2026-08-15T16:20:00.000Z'
  }
];

interface MileniaVentasSectionProps {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const MileniaVentasSection: React.FC<MileniaVentasSectionProps> = ({ showToast }) => {
  const [sales, setSales] = useState<MileniaSaleItem[]>(INITIAL_SALES);
  const [aliados, setAliados] = useState<MileniaAlly[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlly, setSelectedAlly] = useState('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [selectedSaleType, setSelectedSaleType] = useState('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'month' | 'year'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<MileniaSaleItem | null>(null);

  // Form State for new Sale
  const [formData, setFormData] = useState({
    invoiceNumber: `MIL-2026-0${Math.floor(105 + Math.random() * 900)}`,
    restaurantId: '1',
    restaurantName: 'Parrilla & Fuego Camilo',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    amountCop: 289000,
    paymentMethod: 'DAVIVIENDA' as MileniaSaleItem['paymentMethod'],
    paymentStatus: 'PAID' as MileniaSaleItem['paymentStatus'],
    saleType: 'SUSCRIPCION_SAAS' as MileniaSaleItem['saleType'],
    itemsSummary: 'Suscripción Mensual Plan Pro Milenia SaaS (16 Mesas + DIAN)',
    date: new Date().toISOString().split('T')[0]
  });

  // Load Aliados and Sales from Firestore / LocalStorage
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allyList = await getAliados();
        setAliados(allyList);

        // Fetch sales from firestore collection /ventas if available
        try {
          const colRef = collection(db, 'ventas');
          const snap = await getDocs(colRef);
          if (!snap.empty) {
            const list = snap.docs.map(d => d.data() as MileniaSaleItem);
            setSales(list);
          } else {
            // Save initial sales to firestore for persistence
            for (const s of INITIAL_SALES) {
              await setDoc(doc(db, 'ventas', s.id), s, { merge: true });
            }
          }
        } catch (e) {
          console.warn('Firestore ventas load fallback:', e);
        }
      } catch (err) {
        console.warn('Error loading sales data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen to real-time updates from /ventas
    try {
      const unsubscribe = onSnapshot(collection(db, 'ventas'), (snap) => {
        if (!snap.empty) {
          const updated = snap.docs.map(d => d.data() as MileniaSaleItem);
          setSales(updated);
        }
      });
      return () => unsubscribe();
    } catch (_) {}
  }, []);

  // Filter logic
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.dianCufe && sale.dianCufe.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAlly = selectedAlly === 'all' || String(sale.restaurantId) === String(selectedAlly);
    const matchesPayment = selectedPaymentMethod === 'all' || sale.paymentMethod === selectedPaymentMethod;
    const matchesType = selectedSaleType === 'all' || sale.saleType === selectedSaleType;

    let matchesDate = true;
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    const currentYear = today.substring(0, 4);

    if (dateRange === 'today') {
      matchesDate = sale.date === today;
    } else if (dateRange === 'month') {
      matchesDate = sale.date.startsWith(currentMonth);
    } else if (dateRange === 'year') {
      matchesDate = sale.date.startsWith(currentYear);
    }

    return matchesSearch && matchesAlly && matchesPayment && matchesType && matchesDate;
  });

  // Calculate Metrics
  const totalSalesRevenue = filteredSales.reduce((acc, s) => acc + (s.amountCop || 0), 0);
  const totalSaasRevenue = filteredSales
    .filter(s => s.saleType === 'SUSCRIPCION_SAAS')
    .reduce((acc, s) => acc + (s.amountCop || 0), 0);
  const totalOrdersNetwork = filteredSales.filter(s => s.saleType === 'CONSUMO_RESTAURANTE').length;
  const averageTicket = filteredSales.length > 0 ? Math.round(totalSalesRevenue / filteredSales.length) : 0;

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedAllyObj = aliados.find(a => String(a.id) === String(formData.restaurantId));
      const restName = selectedAllyObj ? selectedAllyObj.name : formData.restaurantName;
      const newId = `sale-${Date.now()}`;
      const cufe = `cufe-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`;

      const newSale: MileniaSaleItem = {
        id: newId,
        invoiceNumber: formData.invoiceNumber,
        dianCufe: cufe,
        restaurantId: String(formData.restaurantId),
        restaurantName: restName,
        customerName: formData.customerName.trim() || 'Cliente Milenia',
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        amountCop: Number(formData.amountCop),
        taxCop: formData.saleType === 'CONSUMO_RESTAURANTE' ? Math.round(Number(formData.amountCop) * 0.08) : 0,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        saleType: formData.saleType,
        itemsSummary: formData.itemsSummary.trim() || 'Venta registrada en panel',
        date: formData.date,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore /ventas
      await setDoc(doc(db, 'ventas', newId), newSale, { merge: true });

      // Also register into /contabilidad as an INGRESO
      try {
        await addTransaction({
          type: 'INGRESO',
          amountCop: newSale.amountCop,
          description: `Venta Factura ${newSale.invoiceNumber} - ${newSale.restaurantName}`,
          category: newSale.saleType === 'SUSCRIPCION_SAAS' ? 'SUSCRIPCION_SAAS' : 'COMISION_VENTAS',
          date: newSale.date,
          restaurantId: newSale.restaurantId,
          restaurantName: newSale.restaurantName,
          paymentMethod: newSale.paymentMethod === 'DAVIVIENDA' ? 'DAVIVIENDA_TRANSFERENCIA' : 'TRANSFERENCIA_BANCARIA',
          referenceNumber: newSale.invoiceNumber,
          notes: newSale.itemsSummary
        });
      } catch (_) {}

      setSales(prev => [newSale, ...prev]);
      setIsModalOpen(false);
      showToast('Venta Registrada', `Factura ${newSale.invoiceNumber} guardada en Firestore.`, 'success');
    } catch (err) {
      console.error('Error saving sale:', err);
      showToast('Error al Guardar', 'No se pudo registrar la venta en la base de datos.', 'error');
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ['Factura', 'Fecha', 'Aliado', 'Cliente', 'Tipo', 'Metodo', 'Estado', 'Monto_COP'];
      const rows = filteredSales.map(s => [
        s.invoiceNumber,
        s.date,
        `"${s.restaurantName}"`,
        `"${s.customerName}"`,
        s.saleType,
        s.paymentMethod,
        s.paymentStatus,
        s.amountCop
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `milenia_ventas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Exportación Exitosa', 'El archivo CSV de ventas ha sido descargado.', 'info');
    } catch (e) {
      showToast('Error', 'No se pudo generar el archivo CSV.', 'error');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              Gestión Comercial & Facturación DIAN &bull; Milenia SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Módulo de Ventas e Ingresos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Consolidación centralizada de suscripciones mensuales, cobros a aliados comerciales, pagos Davivienda y facturas electrónicas generadas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Registrar Venta</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Ventas Totales */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Facturado</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">{formatCop(totalSalesRevenue)}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {filteredSales.length} transacciones registradas
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Colección:</span>
            <span className="text-emerald-400 font-bold">/ventas (Firestore)</span>
          </div>
        </div>

        {/* Metric 2: Recaudos Suscripción SaaS */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">MRR Suscripciones</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400">{formatCop(totalSaasRevenue)}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Planes Básico, Pro y Enterprise
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Cuenta Oficial:</span>
            <span className="text-amber-400">Banco Davivienda</span>
          </div>
        </div>

        {/* Metric 3: Ticket Promedio */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Ticket Promedio</span>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-purple-300">{formatCop(averageTicket)}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Promedio ponderado por venta
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Impoconsumo:</span>
            <span className="text-purple-400">8% Restaurantes</span>
          </div>
        </div>

        {/* Metric 4: Facturación DIAN */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Resolución DIAN</span>
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-blue-400">100%</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Prefijo MIL-2026 habilitado
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>CUFE Emitidos:</span>
            <span className="text-blue-400 font-bold">{filteredSales.filter(s => s.dianCufe).length} Facturas</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por factura, aliado, cliente o CUFE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by Ally */}
          <div>
            <select
              value={selectedAlly}
              onChange={(e) => setSelectedAlly(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Aliados ({aliados.length})</option>
              {aliados.map(ally => (
                <option key={ally.id} value={ally.id}>{ally.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Sale Type */}
          <div>
            <select
              value={selectedSaleType}
              onChange={(e) => setSelectedSaleType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Tipos</option>
              <option value="SUSCRIPCION_SAAS">Suscripción SaaS</option>
              <option value="CONSUMO_RESTAURANTE">Consumo Restaurante (POS)</option>
              <option value="MODULO_EXTRA">Módulos Extra</option>
            </select>
          </div>

          {/* Filter by Date Range */}
          <div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="all">Periodo: Histórico Completo</option>
              <option value="today">Periodo: Hoy</option>
              <option value="month">Periodo: Este Mes</option>
              <option value="year">Periodo: Año 2026</option>
            </select>
          </div>

        </div>
      </div>

      {/* Sales Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-sm">Registro de Ventas & Facturación DIAN</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredSales.length} de {sales.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Factura & CUFE</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4">Restaurante / Aliado</th>
                <th className="py-3 px-4">Cliente / Concepto</th>
                <th className="py-3 px-4">Medio de Pago</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Monto (COP)</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                    No se encontraron registros de ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Factura & CUFE */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-white flex items-center gap-1.5">
                        <span>{sale.invoiceNumber}</span>
                        {sale.dianCufe && (
                          <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 rounded text-[9px] font-mono border border-blue-500/30">
                            DIAN
                          </span>
                        )}
                      </div>
                      {sale.dianCufe && (
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]" title={sale.dianCufe}>
                          CUFE: {sale.dianCufe.substring(0, 16)}...
                        </div>
                      )}
                    </td>

                    {/* Fecha */}
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {sale.date}
                    </td>

                    {/* Aliado */}
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[150px]">{sale.restaurantName}</span>
                      </div>
                    </td>

                    {/* Cliente / Concepto */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{sale.customerName}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {sale.itemsSummary}
                      </div>
                    </td>

                    {/* Medio de Pago */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded-lg border font-bold ${
                        sale.paymentMethod === 'DAVIVIENDA' 
                          ? 'bg-red-500/20 text-red-300 border-red-500/40'
                          : sale.paymentMethod === 'WOMPI'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        sale.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{sale.paymentStatus === 'PAID' ? 'Aprobado' : 'Pendiente'}</span>
                      </span>
                    </td>

                    {/* Monto */}
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400 whitespace-nowrap">
                      {formatCop(sale.amountCop)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setViewingSale(sale)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                        title="Ver Detalle de Factura"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VER DETALLE DE FACTURA / VENTA */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Detalle de Factura Electrónica</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{viewingSale.invoiceNumber}</p>
                </div>
              </div>

              <button 
                onClick={() => setViewingSale(null)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* DIAN Badge */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-mono text-[10px]">CÓDIGO ÚNICO DE FACTURA ELECTRÓNICA (CUFE):</div>
                <div className="font-mono text-emerald-400 text-[11px] break-all">
                  {viewingSale.dianCufe || 'CUFE-DIAN-OFICIAL-APROBADO-2026'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Restaurante / Aliado:</span>
                  <span className="font-bold text-white">{viewingSale.restaurantName}</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Fecha de Emisión:</span>
                  <span className="font-mono text-white">{viewingSale.date}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">Cliente / Razón Social:</span>
                <div className="font-bold text-white">{viewingSale.customerName}</div>
                {viewingSale.customerEmail && <div className="text-slate-400 font-mono text-[11px]">{viewingSale.customerEmail}</div>}
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">Concepto Facturado:</span>
                <div className="text-slate-200">{viewingSale.itemsSummary}</div>
              </div>

              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-mono uppercase">Total Facturado</span>
                  <span className="text-xs text-amber-400 font-mono">Medio: {viewingSale.paymentMethod}</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">
                  {formatCop(viewingSale.amountCop)}
                </div>
              </div>

            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
              <button
                onClick={() => setViewingSale(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Factura</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR NUEVA VENTA / FACTURA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registrar Nueva Venta / Factura</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Almacena en colección /ventas y /contabilidad</p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Número de Factura *</label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha de Venta *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Restaurante / Aliado *</label>
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {aliados.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipo de Venta *</label>
                  <select
                    value={formData.saleType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      const amount = type === 'SUSCRIPCION_SAAS' ? 289000 : 150000;
                      setFormData({ ...formData, saleType: type, amountCop: amount });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="SUSCRIPCION_SAAS">Suscripción SaaS Milenia</option>
                    <option value="CONSUMO_RESTAURANTE">Consumo Restaurante (POS)</option>
                    <option value="MODULO_EXTRA">Módulo Extra / Licencia</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cliente / Titular *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Andrés Camilo Vidal"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monto en COP *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={formData.amountCop}
                    onChange={(e) => setFormData({ ...formData, amountCop: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Medio de Pago *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="DAVIVIENDA">Banco Davivienda</option>
                    <option value="WOMPI">Wompi Pasarela</option>
                    <option value="PSE">PSE Débito</option>
                    <option value="NEQUI">Nequi</option>
                    <option value="DAVIPLATA">DaviPlata</option>
                    <option value="TARJETA">Tarjeta de Crédito</option>
                    <option value="EFECTIVO">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estado del Pago *</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PAID">Aprobado / Pagado</option>
                    <option value="PENDING">Pendiente por Confirmar</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Descripción / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Suscripción Mensual Plan Pro Milenia SaaS"
                  value={formData.itemsSummary}
                  onChange={(e) => setFormData({ ...formData, itemsSummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  Guardar Venta en Firestore
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
