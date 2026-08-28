import React, { useState, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  LayoutDashboard, 
  Building2, 
  Receipt, 
  Settings, 
  User, 
  LogOut, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Crown, 
  Flame, 
  RefreshCw, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Server, 
  Database, 
  FileSpreadsheet, 
  Save, 
  Check, 
  X, 
  ChevronRight, 
  ExternalLink,
  Wallet,
  PieChart,
  ArrowRight,
  Clock,
  Briefcase,
  Layers,
  FileText,
  Key
} from 'lucide-react';
import { formatCop } from '../../utils/currency';
import { 
  MileniaAlly, 
  AllyPlan, 
  AllyStatus, 
  getAliados, 
  addAliado, 
  updateAliado, 
  deleteAliado, 
  subscribeToAliados 
} from '../../services/mileniaAliadosService';
import { 
  MileniaTransaction, 
  TransactionType, 
  TransactionCategory, 
  getContabilidad, 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  subscribeToContabilidad 
} from '../../services/mileniaContabilidadService';
import { 
  MileniaSystemConfig, 
  MileniaOwnerProfile, 
  getSystemConfig, 
  saveSystemConfig, 
  getOwnerProfile, 
  saveOwnerProfile,
  DEFAULT_SYSTEM_CONFIG,
  DEFAULT_OWNER_PROFILE
} from '../../services/mileniaSystemService';
import {
  MileniaFinancialSummary,
  DEFAULT_FINANCIAL_SUMMARY,
  getFinancialSummary,
  saveFinancialSummary,
  resetFinancialSummaryToZero,
  subscribeToFinancialSummary
} from '../../services/mileniaFinancialSummaryService';
import { MileniaOwnerAuthScreen } from './MileniaOwnerAuthScreen';
import { BusinessProfileSection } from './BusinessProfileSection';
import { FirestoreDatabaseManager } from './FirestoreDatabaseManager';
import { Menu, PanelLeftClose, PanelLeft, ChevronLeft, Calculator } from 'lucide-react';

type NavigationSection = 'dashboard' | 'aliados' | 'contabilidad' | 'database' | 'configuracion' | 'perfil_usuario' | 'perfil_negocio';

export const MileniaOwnerDashboard: React.FC = () => {
  const { setMileniaView, showToast, switchTenant, navigateTo } = useTasty();

  // Sidebar toggle state (abrir / cerrar sidebar nav)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = sessionStorage.getItem('milenia_owner_session_token');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.authenticated === true;
      }
    } catch (_) {}
    return false;
  });

  // Active Navigation Tab
  const [currentSection, setCurrentSection] = useState<NavigationSection>('dashboard');

  // Aliados State
  const [aliados, setAliados] = useState<MileniaAlly[]>([]);
  const [loadingAliados, setLoadingAliados] = useState(false);
  const [searchAliado, setSearchAliado] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isAllyModalOpen, setIsAllyModalOpen] = useState(false);
  const [editingAlly, setEditingAlly] = useState<MileniaAlly | null>(null);
  const [deletingAlly, setDeletingAlly] = useState<MileniaAlly | null>(null);

  // Aliado Form State
  const [allyFormData, setAllyFormData] = useState({
    name: '',
    nit: '',
    city: 'Bogotá D.C.',
    address: '',
    phone: '',
    email: '',
    plan: 'Pro' as AllyPlan,
    status: 'Activo' as AllyStatus,
    monthlyFeeCop: 289000,
    tablesCount: 16,
    contactName: ''
  });

  // Contabilidad State
  const [transactions, setTransactions] = useState<MileniaTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [searchTx, setSearchTx] = useState('');
  const [filterTxType, setFilterTxType] = useState<string>('all');
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<MileniaTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<MileniaTransaction | null>(null);

  // Transaction Form State
  const [txFormData, setTxFormData] = useState({
    type: 'INGRESO' as TransactionType,
    description: '',
    category: 'SUSCRIPCION_SAAS' as TransactionCategory,
    amountCop: 289000,
    date: new Date().toISOString().split('T')[0],
    restaurantName: '',
    paymentMethod: 'PSE' as const,
    referenceNumber: '',
    notes: ''
  });

  // System Settings State
  const [systemConfig, setSystemConfig] = useState<MileniaSystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [savingConfig, setSavingConfig] = useState(false);

  // Owner Profile State
  const [ownerProfile, setOwnerProfile] = useState<MileniaOwnerProfile>(DEFAULT_OWNER_PROFILE);
  const [savingProfile, setSavingProfile] = useState(false);

  // Financial Summary State (/resumen_financiero Firestore collection)
  const [financialSummary, setFinancialSummary] = useState<MileniaFinancialSummary>(DEFAULT_FINANCIAL_SUMMARY);
  const [isFinSummaryModalOpen, setIsFinSummaryModalOpen] = useState(false);
  const [savingFinSummary, setSavingFinSummary] = useState(false);
  const [finSummaryFormData, setFinSummaryFormData] = useState({
    ingresos: 0,
    gastos: 0,
    titulo: 'Resumen Financiero Consolidado',
    descripcion: 'Tabla de ingresos, gastos y balance neto en Firestore (/resumen_financiero)',
    notas: ''
  });

  // Load Data on Mount & Listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Load Aliados
    const loadAllAliados = async () => {
      setLoadingAliados(true);
      const data = await getAliados();
      setAliados(data);
      setLoadingAliados(false);
    };

    // Load Contabilidad
    const loadAllContabilidad = async () => {
      setLoadingTransactions(true);
      const data = await getContabilidad();
      setTransactions(data);
      setLoadingTransactions(false);
    };

    // Load Financial Summary
    const loadFinSummary = async () => {
      const summary = await getFinancialSummary();
      setFinancialSummary(summary);
      setFinSummaryFormData({
        ingresos: summary.ingresos,
        gastos: summary.gastos,
        titulo: summary.titulo || 'Resumen Financiero Consolidado',
        descripcion: summary.descripcion || '',
        notas: summary.notas || ''
      });
    };

    // Load System & Profile
    const loadSystemData = async () => {
      const config = await getSystemConfig();
      setSystemConfig(config);
      const profile = await getOwnerProfile();
      setOwnerProfile(profile);
    };

    loadAllAliados();
    loadAllContabilidad();
    loadFinSummary();
    loadSystemData();

    // Realtime Subscriptions
    const unsubAliados = subscribeToAliados((updated) => setAliados(updated));
    const unsubContabilidad = subscribeToContabilidad((updated) => setTransactions(updated));
    const unsubFinSummary = subscribeToFinancialSummary((updated) => {
      setFinancialSummary(updated);
      setFinSummaryFormData({
        ingresos: updated.ingresos,
        gastos: updated.gastos,
        titulo: updated.titulo || 'Resumen Financiero Consolidado',
        descripcion: updated.descripcion || '',
        notas: updated.notas || ''
      });
    });

    return () => {
      unsubAliados();
      unsubContabilidad();
      unsubFinSummary();
    };
  }, [isAuthenticated]);

  const handleLogout = () => {
    sessionStorage.removeItem('milenia_owner_session_token');
    setIsAuthenticated(false);
    showToast('Sesión Finalizada', 'Has cerrado la sesión del Propietario de Milenia.', 'info');
  };

  // If not logged in as Owner, show Auth screen
  if (!isAuthenticated) {
    return <MileniaOwnerAuthScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  // ==========================================
  // FINANCIAL CALCULATIONS & STATS
  // (Connected to /resumen_financiero & /contabilidad Firestore tables)
  // ==========================================
  const sumIngresosTransactions = transactions
    .filter(t => t.type === 'INGRESO')
    .reduce((sum, t) => sum + (Number(t.amountCop) || 0), 0);

  const sumGastosTransactions = transactions
    .filter(t => t.type === 'GASTO')
    .reduce((sum, t) => sum + (Number(t.amountCop) || 0), 0);

  // If financialSummary is provided, use the higher figure between summary and the calculated ledger
  const totalIngresos = Math.max(Number(financialSummary.ingresos) || 0, sumIngresosTransactions);
  const totalGastos = Math.max(Number(financialSummary.gastos) || 0, sumGastosTransactions);
  const balanceNeto = totalIngresos - totalGastos;
  const margenNeto = totalIngresos > 0 ? Number(((balanceNeto / totalIngresos) * 100).toFixed(1)) : 0;

  const totalAliadosCount = aliados.length;
  const activeAliadosCount = aliados.filter(a => a.status === 'Activo').length;
  const totalMrrEstimado = aliados
    .filter(a => a.status === 'Activo')
    .reduce((acc, a) => acc + (a.monthlyFeeCop || 0), 0);

  const totalTablesNetwork = aliados.reduce((acc, a) => acc + (a.tablesCount || 0), 0);

  // Latest Registered Aliados (Directly connected to Firestore /aliados)
  const recentAliados = [...aliados]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Filtered Aliados
  const filteredAliados = aliados.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchAliado.toLowerCase()) ||
      a.nit.toLowerCase().includes(searchAliado.toLowerCase()) ||
      a.city.toLowerCase().includes(searchAliado.toLowerCase()) ||
      (a.contactName && a.contactName.toLowerCase().includes(searchAliado.toLowerCase()));
    const matchesPlan = filterPlan === 'all' || a.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.description.toLowerCase().includes(searchTx.toLowerCase()) ||
      (t.restaurantName && t.restaurantName.toLowerCase().includes(searchTx.toLowerCase())) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(searchTx.toLowerCase()));
    const matchesType = filterTxType === 'all' || t.type === filterTxType;
    return matchesSearch && matchesType;
  });

  // ==========================================
  // ALIADO CRUD HANDLERS
  // ==========================================
  const handleOpenCreateAlly = () => {
    setEditingAlly(null);
    setAllyFormData({
      name: '',
      nit: '',
      city: 'Bogotá D.C.',
      address: '',
      phone: '+57 300 000 0000',
      email: '',
      plan: 'Pro',
      status: 'Activo',
      monthlyFeeCop: 289000,
      tablesCount: 16,
      contactName: ''
    });
    setIsAllyModalOpen(true);
  };

  const handleOpenEditAlly = (ally: MileniaAlly) => {
    setEditingAlly(ally);
    setAllyFormData({
      name: ally.name,
      nit: ally.nit,
      city: ally.city,
      address: ally.address || '',
      phone: ally.phone || '',
      email: ally.email || '',
      plan: ally.plan,
      status: ally.status,
      monthlyFeeCop: ally.monthlyFeeCop,
      tablesCount: ally.tablesCount || 10,
      contactName: ally.contactName || ''
    });
    setIsAllyModalOpen(true);
  };

  const handleSaveAlly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allyFormData.name.trim() || !allyFormData.nit.trim()) {
      showToast('Campos Requeridos', 'Por favor ingresa nombre comercial y NIT.', 'warning');
      return;
    }

    // Auto calculate fee by plan if default
    let fee = allyFormData.monthlyFeeCop;
    if (allyFormData.plan === 'Básico' && fee === 289000) fee = 149000;
    if (allyFormData.plan === 'Enterprise' && fee === 289000) fee = 499000;

    if (editingAlly) {
      // Update
      await updateAliado(editingAlly.id, {
        ...allyFormData,
        monthlyFeeCop: fee
      });
      showToast('Aliado Actualizado', `Se guardaron los cambios para ${allyFormData.name}.`, 'success');
    } else {
      // Create
      await addAliado({
        ...allyFormData,
        monthlyFeeCop: fee
      });
      showToast('Aliado Registrado', `Restaurante ${allyFormData.name} añadido a Firestore.`, 'success');
    }

    setIsAllyModalOpen(false);
    setEditingAlly(null);
  };

  const handleConfirmDeleteAlly = async () => {
    if (!deletingAlly) return;
    await deleteAliado(deletingAlly.id);
    showToast('Aliado Eliminado', `Se borró el aliado ${deletingAlly.name} de Firestore permanentemente.`, 'info');
    setDeletingAlly(null);
  };

  // ==========================================
  // FINANCIAL SUMMARY CRUD HANDLERS
  // (Tabla /resumen_financiero en Firebase Firestore)
  // ==========================================
  const handleOpenEditFinSummary = () => {
    setFinSummaryFormData({
      ingresos: financialSummary.ingresos,
      gastos: financialSummary.gastos,
      titulo: financialSummary.titulo || 'Resumen Financiero Consolidado',
      descripcion: financialSummary.descripcion || 'Tabla de ingresos, gastos y balance neto en Firestore (/resumen_financiero)',
      notas: financialSummary.notas || ''
    });
    setIsFinSummaryModalOpen(true);
  };

  const handleSaveFinSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingFinSummary(true);
    try {
      const updated = await saveFinancialSummary({
        ingresos: finSummaryFormData.ingresos,
        gastos: finSummaryFormData.gastos,
        titulo: finSummaryFormData.titulo,
        descripcion: finSummaryFormData.descripcion,
        notas: finSummaryFormData.notas
      });
      setFinancialSummary(updated);
      showToast('Resumen Financiero Guardado', 'Los datos de Ingresos, Gastos y Balance Neto se actualizaron en Firestore.', 'success');
      setIsFinSummaryModalOpen(false);
    } catch (err) {
      showToast('Error al Guardar', 'No se pudo guardar el resumen financiero en Firestore.', 'error');
    } finally {
      setSavingFinSummary(false);
    }
  };

  const handleResetFinSummaryToZero = async () => {
    setSavingFinSummary(true);
    try {
      const reset = await resetFinancialSummaryToZero();
      setFinancialSummary(reset);
      setFinSummaryFormData({
        ingresos: 0,
        gastos: 0,
        titulo: reset.titulo,
        descripcion: reset.descripcion || '',
        notas: reset.notas || ''
      });
      showToast('Finanzas a Cero ($0 COP)', 'Ingresos ($0), Gastos ($0) y Balance Neto ($0) restablecidos en Firestore.', 'info');
      setIsFinSummaryModalOpen(false);
    } catch (err) {
      showToast('Error', 'No se pudo restablecer a cero.', 'error');
    } finally {
      setSavingFinSummary(false);
    }
  };

  const handleSyncFinSummaryFromTx = async () => {
    const txIngresos = transactions
      .filter(t => t.type === 'INGRESO')
      .reduce((acc, t) => acc + (t.amountCop || 0), 0);
    const txGastos = transactions
      .filter(t => t.type === 'GASTO')
      .reduce((acc, t) => acc + (t.amountCop || 0), 0);

    setFinSummaryFormData(prev => ({
      ...prev,
      ingresos: txIngresos,
      gastos: txGastos,
      notas: `Sincronizado desde el libro mayor de contabilidad (${transactions.length} registros).`
    }));
  };

  // ==========================================
  // TRANSACTION CRUD HANDLERS
  // ==========================================
  const handleOpenCreateTx = () => {
    setEditingTx(null);
    setTxFormData({
      type: 'INGRESO',
      description: '',
      category: 'SUSCRIPCION_SAAS',
      amountCop: 289000,
      date: new Date().toISOString().split('T')[0],
      restaurantName: '',
      paymentMethod: 'PSE',
      referenceNumber: `REF-${Date.now().toString().slice(-6)}`,
      notes: ''
    });
    setIsTxModalOpen(true);
  };

  const handleOpenEditTx = (tx: MileniaTransaction) => {
    setEditingTx(tx);
    setTxFormData({
      type: tx.type,
      description: tx.description,
      category: tx.category,
      amountCop: tx.amountCop,
      date: tx.date,
      restaurantName: tx.restaurantName || '',
      paymentMethod: tx.paymentMethod || 'PSE',
      referenceNumber: tx.referenceNumber || '',
      notes: tx.notes || ''
    });
    setIsTxModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txFormData.description.trim() || txFormData.amountCop <= 0) {
      showToast('Datos inválidos', 'Ingresa una descripción y monto válido.', 'warning');
      return;
    }

    if (editingTx) {
      await updateTransaction(editingTx.id, txFormData);
      showToast('Transacción Actualizada', 'Cambios guardados en contabilidad.', 'success');
    } else {
      await addTransaction(txFormData);
      showToast('Movimiento Registrado', 'Transacción guardada en Firestore.', 'success');
    }

    setIsTxModalOpen(false);
    setEditingTx(null);
  };

  const handleConfirmDeleteTx = async () => {
    if (!deletingTx) return;
    await deleteTransaction(deletingTx.id);
    showToast('Transacción Eliminada', 'Se borró el registro de contabilidad.', 'info');
    setDeletingTx(null);
  };

  // ==========================================
  // CONFIG & PROFILE HANDLERS
  // ==========================================
  const handleSaveSystemConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    await saveSystemConfig(systemConfig);
    setSavingConfig(false);
    showToast('Configuración Guardada', 'Parámetros del sistema Milenia actualizados.', 'success');
  };

  const handleSaveOwnerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await saveOwnerProfile(ownerProfile);
    setSavingProfile(false);
    showToast('Perfil Actualizado', 'Tus datos de Propietario se guardaron en Firestore.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased relative overflow-x-hidden">
      
      {/* Mobile Top Header with Hamburger Toggle */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-md">
            <Crown className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-black text-white text-sm tracking-tight">MILENIA OWNER</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 animate-fade-in"
        />
      )}

      {/* ========================================================================= */}
      {/* 1. SIDEBAR NAVEGACIÓN LATERAL (COLAPSABLE / EXPANDIBLE CON BOTÓN)         */}
      {/* ========================================================================= */}
      <aside 
        className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isSidebarOpen ? 'md:w-64 lg:w-72' : 'md:w-20'}
          fixed md:sticky top-0 left-0 h-screen bg-slate-900 border-r border-slate-800 shrink-0 flex flex-col justify-between p-3.5 sm:p-4 z-50 transition-all duration-300 ease-in-out shadow-2xl
        `}
      >
        
        {/* Brand Header & Toggle Button */}
        <div className="space-y-5">
          
          <div className="flex items-center justify-between px-1.5 pt-1">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 shrink-0">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <h2 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                    <span>MILENIA</span>
                    <span className="text-amber-500 text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 font-mono">
                      OWNER
                    </span>
                  </h2>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Portal del Propietario
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25">
                  <Crown className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
            )}

            {/* Desktop Sidebar Toggle Button (Abrir / Cerrar) */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title={isSidebarOpen ? 'Cerrar Sidebar' : 'Abrir Sidebar'}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-amber-400 border border-slate-700 transition cursor-pointer shrink-0"
            >
              {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            
            {/* Dashboard */}
            <button
              onClick={() => {
                setCurrentSection('dashboard');
                setIsMobileMenuOpen(false);
              }}
              title="Dashboard"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'dashboard'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentSection === 'dashboard' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Dashboard</span>}
              </div>
              {isSidebarOpen && currentSection === 'dashboard' && <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>}
            </button>

            {/* Aliados */}
            <button
              onClick={() => {
                setCurrentSection('aliados');
                setIsMobileMenuOpen(false);
              }}
              title="Aliados Gastronómicos"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'aliados'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 shrink-0 ${currentSection === 'aliados' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Aliados</span>}
              </div>
              {isSidebarOpen && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-800 text-slate-300">
                  {aliados.length}
                </span>
              )}
            </button>

            {/* Contabilidad */}
            <button
              onClick={() => {
                setCurrentSection('contabilidad');
                setIsMobileMenuOpen(false);
              }}
              title="Contabilidad & Finanzas"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'contabilidad'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Receipt className={`w-4 h-4 shrink-0 ${currentSection === 'contabilidad' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Contabilidad</span>}
              </div>
              {isSidebarOpen && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Finanzas
                </span>
              )}
            </button>

            {/* Base de Datos Firestore (CRUD completo de tablas) */}
            <button
              onClick={() => {
                setCurrentSection('database');
                setIsMobileMenuOpen(false);
              }}
              title="Gestor de Base de Datos Firestore (CRUD)"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'database'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className={`w-4 h-4 shrink-0 ${currentSection === 'database' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Base de Datos</span>}
              </div>
              {isSidebarOpen && (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Firestore
                </span>
              )}
            </button>

            {/* Configuración */}
            <button
              onClick={() => {
                setCurrentSection('configuracion');
                setIsMobileMenuOpen(false);
              }}
              title="Configuración del Sistema"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'configuracion'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 shrink-0 ${currentSection === 'configuracion' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Configuración</span>}
              </div>
            </button>

            {/* Perfil del Negocio (Milenia / QR / Breve / Bancos) */}
            <button
              onClick={() => {
                setCurrentSection('perfil_negocio');
                setIsMobileMenuOpen(false);
              }}
              title="Perfil del Negocio Milenia"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'perfil_negocio'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Briefcase className={`w-4 h-4 shrink-0 ${currentSection === 'perfil_negocio' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Perfil del Negocio</span>}
              </div>
              {isSidebarOpen && (
                <span className="text-[9px] font-mono text-purple-300 font-bold bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.5 rounded">
                  QR/Breve
                </span>
              )}
            </button>

            {/* Perfil de Usuario (Titular / Propietario) */}
            <button
              onClick={() => {
                setCurrentSection('perfil_usuario');
                setIsMobileMenuOpen(false);
              }}
              title="Perfil de Usuario"
              className={`w-full flex items-center ${isSidebarOpen ? 'justify-between px-3.5' : 'justify-center px-0'} py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                currentSection === 'perfil_usuario'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-4 h-4 shrink-0 ${currentSection === 'perfil_usuario' ? 'text-amber-400' : 'text-slate-400'}`} />
                {isSidebarOpen && <span>Perfil de Usuario</span>}
              </div>
              {isSidebarOpen && (
                <span className="text-[10px] font-mono text-amber-400 font-bold">1085312034</span>
              )}
            </button>

          </nav>

        </div>

        {/* Footer User Info & Logout Button */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          
          {isSidebarOpen ? (
            <div className="flex items-center gap-3 px-1">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
                AC
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Andrés Camilo Vidal</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">camilovidal.1704@gmail.com</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xs">
              AC
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Cerrar Sesión"
            className={`w-full flex items-center justify-center gap-2 ${isSidebarOpen ? 'px-3.5 py-2.5' : 'p-2.5'} rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>

        </div>

      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT AREA                                                      */}
      {/* ========================================================================= */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full min-w-0">
        
        {/* Toggle Bar on top of Main for desktop if closed */}
        {!isSidebarOpen && (
          <div className="hidden md:flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2 text-xs text-slate-400">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
            >
              <PanelLeft className="w-4 h-4" />
              <span>Abrir Navegación Lateral</span>
            </button>
            <span className="font-mono text-[11px] text-slate-500">Milenia Cloud Admin</span>
          </div>
        )}
        
        {/* ======================================================================= */}
        {/* SECCIÓN 1: DASHBOARD (RESUMEN EJECUTIVO)                                */}
        {/* ======================================================================= */}
        {currentSection === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Panel de Control Maestro &bull; Milenia SaaS Colombia
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Bienvenido, Propietario Andrés Camilo
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                    Monitoreo en tiempo real de la red gastronómica conectada a Firebase Firestore, estado de facturación DIAN y balance financiero consolidado.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenCreateAlly}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Nuevo Aliado</span>
                  </button>

                  <button
                    onClick={handleOpenCreateTx}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-emerald-400" />
                    <span>Registrar Transacción</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              
              {/* Stat 1: Total Aliados */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Aliados</span>
                  <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">{totalAliadosCount}</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    <strong className="text-emerald-400 font-sans">{activeAliadosCount} activos</strong> &bull; {totalTablesNetwork} mesas totales
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Colección:</span>
                  <span className="text-amber-400">/aliados (Firestore)</span>
                </div>
              </div>

              {/* Stat 2: Ingresos Totales */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-emerald-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Ingresos Totales</span>
                  <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">{formatCop(totalIngresos)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Entradas registradas en base de datos
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Tabla Firebase:</span>
                  <span className="text-emerald-400 font-bold">/resumen_financiero</span>
                </div>
              </div>

              {/* Stat 3: Gastos Totales */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-rose-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Gastos Totales</span>
                  <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-400">{formatCop(totalGastos)}</div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Costos operativos y servicios
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Tabla Firebase:</span>
                  <span className="text-rose-400 font-bold">/resumen_financiero</span>
                </div>
              </div>

              {/* Stat 4: Balance Neto */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Balance Neto</span>
                  <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 rounded-2xl">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black ${balanceNeto >= 0 ? 'text-white' : 'text-rose-400'}`}>
                    {formatCop(balanceNeto)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Resta: Ingresos menos Gastos
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Cálculo:</span>
                  <span className="text-amber-400 font-bold">Ingresos - Gastos</span>
                </div>
              </div>

            </div>

            {/* Split: Recent Allies & Financial Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 7 Cols: Últimos Aliados Registrados */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-amber-400" />
                      <span>Últimos Aliados Registrados ({aliados.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Conectado a la base de datos Firestore <span className="font-mono text-amber-400">/aliados</span>.</p>
                  </div>

                  <button
                    onClick={() => setCurrentSection('aliados')}
                    className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentAliados.length === 0 ? (
                    <div className="text-center py-8 px-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3">
                      <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-200">No hay aliados registrados en la base de datos</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          La tabla <span className="font-mono text-amber-400">/aliados</span> está vacía. Los aliados eliminados no se volverán a cargar de forma predeterminada.
                        </p>
                      </div>
                      <button
                        onClick={handleOpenCreateAlly}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-amber-500/20"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Registrar Primer Aliado</span>
                      </button>
                    </div>
                  ) : (
                    recentAliados.map(ally => (
                      <div 
                        key={ally.id}
                        className="bg-slate-950 border border-slate-800/80 hover:border-slate-700 p-4 rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-white">{ally.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                              <span>{ally.city}</span>
                              <span>&bull;</span>
                              <span>NIT: {ally.nit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                            ally.plan === 'Enterprise'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : ally.plan === 'Pro'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            Plan {ally.plan}
                          </span>

                          <span className="text-xs font-mono font-bold text-emerald-400">
                            {formatCop(ally.monthlyFeeCop)}/m
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right 5 Cols: Resumen Financiero Consolidado */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-emerald-400" />
                        <span>Resumen Financiero</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Tabla Firestore: <span className="font-mono text-emerald-400 font-bold">/resumen_financiero</span>
                      </p>
                    </div>

                    <button
                      onClick={handleOpenEditFinSummary}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                      title="Editar valores de Ingresos y Gastos"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modificar</span>
                    </button>
                  </div>

                  {/* Visual Balances */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Ingresos</span>
                      <div className="text-lg font-black text-emerald-400 font-mono">{formatCop(totalIngresos)}</div>
                    </div>

                    <div className="p-3.5 bg-slate-950 rounded-2xl border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Gastos</span>
                      <div className="text-lg font-black text-rose-400 font-mono">{formatCop(totalGastos)}</div>
                    </div>
                  </div>

                  {/* Net Balance Highlight */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                        <Calculator className="w-3.5 h-3.5 text-amber-400" />
                        <span>Balance Neto (Resta):</span>
                      </span>
                      <span className={`text-base font-black font-mono ${balanceNeto >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                        {formatCop(balanceNeto)}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono flex justify-between pt-1 border-t border-slate-800/80">
                      <span>Fórmula aplicada:</span>
                      <span className="text-white">{formatCop(totalIngresos)} - {formatCop(totalGastos)} = {formatCop(balanceNeto)}</span>
                    </div>
                  </div>

                  {/* Progress Bar Visual */}
                  <div className="space-y-1.5">
                    <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${(totalIngresos + totalGastos) > 0 ? (totalIngresos / (totalIngresos + totalGastos)) * 100 : 50}%` }}
                      ></div>
                      <div 
                        className="bg-rose-500 h-full transition-all" 
                        style={{ width: `${(totalIngresos + totalGastos) > 0 ? (totalGastos / (totalIngresos + totalGastos)) * 100 : 50}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Ingresos: {totalIngresos > 0 ? `${((totalIngresos / (totalIngresos + totalGastos)) * 100).toFixed(0)}%` : '0%'}</span>
                      <span>Gastos: {totalGastos > 0 ? `${((totalGastos / (totalIngresos + totalGastos)) * 100).toFixed(0)}%` : '0%'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={handleOpenEditFinSummary}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Actualizar Finanzas</span>
                  </button>

                  <button
                    onClick={handleResetFinSummaryToZero}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
                    title="Restablecer valores en Firestore a $0 COP"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>$0 COP</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SECCIÓN 2: MÓDULO ALIADOS (CRUD COMPLETO FIRESTORE)                     */}
        {/* ======================================================================= */}
        {currentSection === 'aliados' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Building2 className="w-6 h-6 text-amber-500" />
                  <span>Gestión de Aliados (Restaurantes)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Administra los restaurantes suscritos a Milenia almacenados en la colección Firestore <span className="font-mono text-amber-400">/aliados</span>.
                </p>
              </div>

              <button
                onClick={handleOpenCreateAlly}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Agregar Nuevo Aliado</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, NIT, ciudad o contacto..."
                  value={searchAliado}
                  onChange={(e) => setSearchAliado(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Todos los Planes</option>
                  <option value="Básico">Plan Básico ($149k)</option>
                  <option value="Pro">Plan Pro ($289k)</option>
                  <option value="Enterprise">Plan Enterprise ($499k)</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>

                <div className="text-xs text-slate-500 font-mono pl-2">
                  Total: <strong className="text-amber-400">{filteredAliados.length}</strong>
                </div>
              </div>
            </div>

            {/* TABLA DE ALIADOS */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Restaurante / Nombre</th>
                      <th className="py-3.5 px-4">NIT</th>
                      <th className="py-3.5 px-4">Ciudad</th>
                      <th className="py-3.5 px-4">Plan</th>
                      <th className="py-3.5 px-4">Tarifa Mensual</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredAliados.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                          <div className="max-w-md mx-auto space-y-3">
                            <Building2 className="w-8 h-8 text-slate-600 mx-auto" />
                            <p className="font-bold text-slate-200">
                              {aliados.length === 0 
                                ? 'No hay aliados en la base de datos Firestore (/aliados)' 
                                : 'No se encontraron aliados que coincidan con los filtros de búsqueda.'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {aliados.length === 0
                                ? 'Los aliados eliminados permanecen borrados y no se cargarán registros predeterminados a menos que los registres.'
                                : 'Prueba cambiando los términos de búsqueda o limpiando los filtros.'}
                            </p>
                            {aliados.length === 0 && (
                              <button
                                onClick={handleOpenCreateAlly}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 transition cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                <span>Registrar Primer Aliado</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredAliados.map(ally => (
                        <tr key={ally.id} className="hover:bg-slate-800/40 transition">
                          
                          {/* Nombre */}
                          <td className="py-4 px-5">
                            <div className="font-bold text-white text-sm">{ally.name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                              <span>{ally.contactName || 'Sin contacto'}</span>
                              {ally.phone && <span>&bull; {ally.phone}</span>}
                            </div>
                          </td>

                          {/* NIT */}
                          <td className="py-4 px-4 font-mono font-semibold text-slate-200">
                            {ally.nit}
                          </td>

                          {/* Ciudad */}
                          <td className="py-4 px-4 text-slate-300">
                            {ally.city}
                          </td>

                          {/* Plan */}
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              ally.plan === 'Enterprise'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                : ally.plan === 'Pro'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            }`}>
                              {ally.plan}
                            </span>
                          </td>

                          {/* Tarifa */}
                          <td className="py-4 px-4 font-mono font-bold text-amber-400">
                            {formatCop(ally.monthlyFeeCop)}
                          </td>

                          {/* Estado */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono border ${
                              ally.status === 'Activo'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {ally.status === 'Activo' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              <span>{ally.status}</span>
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  switchTenant(ally.id);
                                  navigateTo({
                                    restaurantId: ally.id,
                                    cargo: 'gerente',
                                    routeType: 'ally_panel'
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[11px] rounded-xl transition cursor-pointer flex items-center gap-1 border border-amber-500/30"
                                title={`Abrir Panel de Gerente (/panel/${ally.id}/gerente)`}
                              >
                                <Key className="w-3 h-3" />
                                <span>Panel</span>
                              </button>

                              <button
                                onClick={() => handleOpenEditAlly(ally)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                                title="Editar Aliado"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeletingAlly(ally)}
                                className="p-2 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-xl transition cursor-pointer"
                                title="Eliminar Aliado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SECCIÓN 3: MÓDULO CONTABILIDAD (INGRESOS & GASTOS FIRESTORE)             */}
        {/* ======================================================================= */}
        {currentSection === 'contabilidad' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <Receipt className="w-6 h-6 text-emerald-400" />
                  <span>Contabilidad & Finanzas de la Plataforma</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Control de ingresos recurrentes, comisiones y costos de infraestructura en la colección <span className="font-mono text-emerald-400">/contabilidad</span>.
                </p>
              </div>

              <button
                onClick={handleOpenCreateTx}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Registrar Ingreso / Gasto</span>
              </button>
            </div>

            {/* Financial Balance Summary Banner */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-slate-900 border border-emerald-500/30 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Ingresos Totales</span>
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400">{formatCop(totalIngresos)}</div>
                <p className="text-[10px] text-slate-500 font-mono">Entradas por suscripción y onboarding</p>
              </div>

              <div className="bg-slate-900 border border-rose-500/30 p-5 rounded-3xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">Gastos Totales</span>
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
                    <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-400">{formatCop(totalGastos)}</div>
                <p className="text-[10px] text-slate-500 font-mono">Servidores GCP, timbrado DIAN y pauta</p>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/40 p-5 rounded-3xl space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase text-amber-300">Balance Neto (Ganancia)</span>
                  <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                    <Wallet className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>
                <div className={`text-2xl font-black ${balanceNeto >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formatCop(balanceNeto)}
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  Margen Operativo: <strong className="text-white">{margenNeto}%</strong>
                </p>
              </div>

            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por descripción, restaurante o referencia..."
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterTxType}
                  onChange={(e) => setFilterTxType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todos los Movimientos</option>
                  <option value="INGRESO">Solo Ingresos (+)</option>
                  <option value="GASTO">Solo Gastos (-)</option>
                </select>

                <div className="text-xs text-slate-500 font-mono pl-2">
                  Registros: <strong className="text-emerald-400">{filteredTransactions.length}</strong>
                </div>
              </div>
            </div>

            {/* TABLA DE CONTABILIDAD */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-5">Fecha</th>
                      <th className="py-3.5 px-4">Tipo</th>
                      <th className="py-3.5 px-4">Descripción / Concepto</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Método / Ref</th>
                      <th className="py-3.5 px-4 text-right">Monto (COP)</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                          No hay transacciones que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          
                          {/* Fecha */}
                          <td className="py-4 px-5 font-mono text-slate-400 whitespace-nowrap">
                            {tx.date}
                          </td>

                          {/* Tipo */}
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              tx.type === 'INGRESO'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            }`}>
                              {tx.type === 'INGRESO' ? '+' : '-'} {tx.type}
                            </span>
                          </td>

                          {/* Descripción */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-white">{tx.description}</div>
                            {tx.restaurantName && (
                              <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                                Aliado: {tx.restaurantName}
                              </div>
                            )}
                          </td>

                          {/* Categoría */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-400">
                            {tx.category.replace(/_/g, ' ')}
                          </td>

                          {/* Método */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-300">
                            <div>{tx.paymentMethod.replace(/_/g, ' ')}</div>
                            {tx.referenceNumber && <span className="text-slate-500 text-[10px]">{tx.referenceNumber}</span>}
                          </td>

                          {/* Monto */}
                          <td className={`py-4 px-4 text-right font-mono font-black text-sm whitespace-nowrap ${
                            tx.type === 'INGRESO' ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {tx.type === 'INGRESO' ? '+' : '-'} {formatCop(tx.amountCop)}
                          </td>

                          {/* Acciones */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditTx(tx)}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition cursor-pointer"
                                title="Editar Transacción"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setDeletingTx(tx)}
                                className="p-2 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-xl transition cursor-pointer"
                                title="Eliminar Transacción"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ======================================================================= */}
        {/* SECCIÓN 4: CONFIGURACIÓN DEL SISTEMA                                    */}
        {/* ======================================================================= */}
        {currentSection === 'configuracion' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <Settings className="w-6 h-6 text-amber-500" />
                <span>Configuración Global del Sistema Milenia</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajustes de facturación electrónica DIAN, integración con pasarelas de pago y copias de seguridad.
              </p>
            </div>

            <form onSubmit={handleSaveSystemConfig} className="space-y-6 max-w-4xl">
              
              {/* Facturación DIAN */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Parámetros de Facturación Electrónica DIAN 2026</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Número de Resolución DIAN</label>
                    <input
                      type="text"
                      value={systemConfig.dianResolutionNumber}
                      onChange={(e) => setSystemConfig({ ...systemConfig, dianResolutionNumber: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Prefijo de Factura</label>
                    <input
                      type="text"
                      value={systemConfig.dianPrefix}
                      onChange={(e) => setSystemConfig({ ...systemConfig, dianPrefix: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Rango Inicial - Final</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={systemConfig.dianStartRange}
                        onChange={(e) => setSystemConfig({ ...systemConfig, dianStartRange: Number(e.target.value) })}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                      <input
                        type="number"
                        value={systemConfig.dianEndRange}
                        onChange={(e) => setSystemConfig({ ...systemConfig, dianEndRange: Number(e.target.value) })}
                        className="w-1/2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Vigencia Resolución</label>
                    <input
                      type="date"
                      value={systemConfig.dianValidUntil}
                      onChange={(e) => setSystemConfig({ ...systemConfig, dianValidUntil: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Pasarelas de Pago & Cloud */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Pasarelas de Pago & Infraestructura Cloud</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Llave Pública Wompi / PSE</label>
                    <input
                      type="text"
                      value={systemConfig.wompiPublicKey}
                      onChange={(e) => setSystemConfig({ ...systemConfig, wompiPublicKey: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Región Google Cloud</label>
                    <input
                      type="text"
                      value={systemConfig.cloudRegion}
                      disabled
                      className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl px-3 py-2 text-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingConfig ? 'Guardando...' : 'Guardar Configuración en Firestore'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SECCIÓN 5: PERFIL DEL NEGOCIO (MILENIA / QR / BREVE / BANCOS)           */}
        {/* ======================================================================= */}
        {currentSection === 'perfil_negocio' && (
          <BusinessProfileSection showToast={showToast} />
        )}

        {/* ======================================================================= */}
        {/* SECCIÓN 6: PERFIL DE USUARIO (PROPIETARIO / ANDRÉS CAMILO VIDAL)         */}
        {/* ======================================================================= */}
        {currentSection === 'perfil_usuario' && (
          <div className="space-y-6 animate-fade-in">
            <div className="pb-2 border-b border-slate-800">
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                <User className="w-6 h-6 text-amber-500" />
                <span>Perfil de Usuario (Propietario Fundador)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Datos personales y de credenciales del titular de la plataforma Milenia SaaS (C.C. 1085312034).
              </p>
            </div>

            <form onSubmit={handleSaveOwnerProfile} className="space-y-6 max-w-4xl">
              
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                
                <div className="flex items-center gap-4 pb-4 border-b border-slate-800">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
                    AC
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{ownerProfile.name}</h3>
                    <p className="text-xs text-amber-400 font-mono font-bold">{ownerProfile.role}</p>
                    <p className="text-xs text-slate-400">{ownerProfile.companyName} &bull; NIT: {ownerProfile.nit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={ownerProfile.name}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Cédula de Ciudadanía *</label>
                    <input
                      type="text"
                      required
                      value={ownerProfile.documentId}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, documentId: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={ownerProfile.email}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Teléfono WhatsApp *</label>
                    <input
                      type="text"
                      required
                      value={ownerProfile.phone}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Razón Social Empresa</label>
                    <input
                      type="text"
                      value={ownerProfile.companyName}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, companyName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Ciudad / País</label>
                    <input
                      type="text"
                      value={ownerProfile.city}
                      onChange={(e) => setOwnerProfile({ ...ownerProfile, city: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Biografía / Perfil Profesional</label>
                  <textarea
                    rows={3}
                    value={ownerProfile.bio || ''}
                    onChange={(e) => setOwnerProfile({ ...ownerProfile, bio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs"
                  ></textarea>
                </div>

              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? 'Guardando Perfil...' : 'Actualizar Perfil en Firestore'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Sección Base de Datos Firestore (CRUD Completo de Tablas) */}
        {currentSection === 'database' && (
          <FirestoreDatabaseManager showToast={showToast} />
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODALES: CREAR / EDITAR ALIADO                                            */}
      {/* ========================================================================= */}
      {isAllyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingAlly ? 'Editar Restaurante Aliado' : 'Registrar Nuevo Restaurante Aliado'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Colección Firestore /aliados</p>
                </div>
              </div>

              <button 
                onClick={() => setIsAllyModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAlly} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre Comercial del Restaurante *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Parrilla & Fuego Camilo"
                  value={allyFormData.name}
                  onChange={(e) => setAllyFormData({ ...allyFormData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">NIT / Identificación Fiscal *</label>
                  <input
                    type="text"
                    required
                    placeholder="901.450.888-1"
                    value={allyFormData.nit}
                    onChange={(e) => setAllyFormData({ ...allyFormData, nit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Bogotá D.C."
                    value={allyFormData.city}
                    onChange={(e) => setAllyFormData({ ...allyFormData, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Plan Suscripción *</label>
                  <select
                    value={allyFormData.plan}
                    onChange={(e) => {
                      const newPlan = e.target.value as AllyPlan;
                      const fee = newPlan === 'Básico' ? 149000 : newPlan === 'Pro' ? 289000 : 499000;
                      setAllyFormData({ ...allyFormData, plan: newPlan, monthlyFeeCop: fee });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Básico">Básico ($149,000 COP)</option>
                    <option value="Pro">Pro ($289,000 COP)</option>
                    <option value="Enterprise">Enterprise ($499,000 COP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estado de Cuenta *</label>
                  <select
                    value={allyFormData.status}
                    onChange={(e) => setAllyFormData({ ...allyFormData, status: e.target.value as AllyStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Inactivo">Inactivo (Suspendido)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nombre Contacto / Gerente</label>
                  <input
                    type="text"
                    placeholder="Ej. Marco Bellini"
                    value={allyFormData.contactName}
                    onChange={(e) => setAllyFormData({ ...allyFormData, contactName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+57 315 000 0000"
                    value={allyFormData.phone}
                    onChange={(e) => setAllyFormData({ ...allyFormData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAllyModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {editingAlly ? 'Actualizar Aliado' : 'Crear en Firestore'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE ALIADO */}
      {deletingAlly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">¿Eliminar Aliado?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar el restaurante <strong className="text-white">{deletingAlly.name}</strong> (NIT: {deletingAlly.nit}) de la colección <span className="font-mono text-amber-400">/aliados</span> en Firestore? Esta acción no se puede deshacer.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAlly(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAlly}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Sí, Eliminar de Firestore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALES: REGISTRAR / EDITAR TRANSACCIÓN CONTABILIDAD                      */}
      {/* ========================================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingTx ? 'Editar Movimiento Contable' : 'Registrar Transacción'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Colección Firestore /contabilidad</p>
                </div>
              </div>

              <button 
                onClick={() => setIsTxModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tipo de Movimiento *</label>
                  <select
                    value={txFormData.type}
                    onChange={(e) => setTxFormData({ ...txFormData, type: e.target.value as TransactionType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="INGRESO">Ingreso (+ Entrada)</option>
                    <option value="GASTO">Gasto (- Salida)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Monto en COP *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={txFormData.amountCop}
                    onChange={(e) => setTxFormData({ ...txFormData, amountCop: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Descripción / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Suscripción Mensual Plan Pro - Bella Italia"
                  value={txFormData.description}
                  onChange={(e) => setTxFormData({ ...txFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Categoría *</label>
                  <select
                    value={txFormData.category}
                    onChange={(e) => setTxFormData({ ...txFormData, category: e.target.value as TransactionCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="SUSCRIPCION_SAAS">Suscripción SaaS</option>
                    <option value="COMISION_VENTAS">Comisión de Ventas</option>
                    <option value="SERVIDORES_CLOUD">Servidores Cloud</option>
                    <option value="SOPORTE_DIAN">Soporte DIAN</option>
                    <option value="MARKETING_PAUTA">Marketing & Pauta</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={txFormData.date}
                    onChange={(e) => setTxFormData({ ...txFormData, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Método de Pago</label>
                  <select
                    value={txFormData.paymentMethod}
                    onChange={(e) => setTxFormData({ ...txFormData, paymentMethod: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PSE">PSE / Débito</option>
                    <option value="WOMPI">Wompi Pasarela</option>
                    <option value="TRANSFERENCIA_BANCARIA">Transferencia Bancaria</option>
                    <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                    <option value="EFECTIVO">Efectivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Número de Referencia</label>
                  <input
                    type="text"
                    placeholder="REF-2026-001"
                    value={txFormData.referenceNumber}
                    onChange={(e) => setTxFormData({ ...txFormData, referenceNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black rounded-xl transition shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {editingTx ? 'Actualizar Transacción' : 'Guardar en Firestore'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE TRANSACCIÓN */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">¿Eliminar Transacción?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar el movimiento <strong className="text-white">{deletingTx.description}</strong> por valor de <strong className="text-emerald-400 font-mono">{formatCop(deletingTx.amountCop)}</strong> de la contabilidad?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteTx}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACTUALIZAR RESUMEN FINANCIERO (TABLA /resumen_financiero FIRESTORE) */}
      {/* ========================================================================= */}
      {isFinSummaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-amber-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-bold">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Modificar Resumen Financiero
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Tabla Firestore: <span className="text-amber-400 font-bold">/resumen_financiero/principal</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsFinSummaryModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFinSummary} className="space-y-4 text-xs">
              
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Configura directamente los valores de <strong>Ingresos</strong> y <strong>Gastos</strong> almacenados en Firebase. El <strong>Balance Neto</strong> se calcula automáticamente como la resta de <em>Ingresos menos Gastos</em>.
                </p>
                {transactions.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncFinSummaryFromTx}
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer underline pt-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Calcular a partir de las {transactions.length} transacciones registradas</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] font-bold mb-1">
                    Ingresos Totales (COP) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={finSummaryFormData.ingresos}
                      onChange={(e) => setFinSummaryFormData({ ...finSummaryFormData, ingresos: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {formatCop(finSummaryFormData.ingresos)}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-400 font-mono uppercase text-[10px] font-bold mb-1">
                    Gastos Totales (COP) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      value={finSummaryFormData.gastos}
                      onChange={(e) => setFinSummaryFormData({ ...finSummaryFormData, gastos: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-950 border border-rose-500/40 rounded-xl px-3 py-2.5 text-rose-400 font-mono font-bold text-sm focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">
                    {formatCop(finSummaryFormData.gastos)}
                  </span>
                </div>
              </div>

              {/* Dynamic Calculation Live Box */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Balance Neto Calculado (Ingresos - Gastos):</span>
                  <span className={`text-base font-black ${
                    (finSummaryFormData.ingresos - finSummaryFormData.gastos) >= 0 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {formatCop(finSummaryFormData.ingresos - finSummaryFormData.gastos)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>Margen Operativo:</span>
                  <span className="text-white font-bold">
                    {finSummaryFormData.ingresos > 0 
                      ? `${(((finSummaryFormData.ingresos - finSummaryFormData.gastos) / finSummaryFormData.ingresos) * 100).toFixed(1)}%`
                      : '0.0%'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Notas / Descripción (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ej. Resumen financiero oficial para el periodo fiscal actual"
                  value={finSummaryFormData.notas}
                  onChange={(e) => setFinSummaryFormData({ ...finSummaryFormData, notas: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetFinSummaryToZero}
                  disabled={savingFinSummary}
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Restablecer a $0 COP</span>
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsFinSummaryModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingFinSummary}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {savingFinSummary ? 'Guardando...' : 'Guardar en Firestore'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
