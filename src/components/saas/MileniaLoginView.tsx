import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { 
  Building2, 
  LogIn, 
  PlusCircle, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Store, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  ExternalLink,
  Users,
  Receipt,
  MapPin,
  Lock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { TenantRestaurant, SubscriptionPlan } from '../../types';
import { formatCop } from '../../utils/currency';

export const MileniaLoginView: React.FC = () => {
  const { 
    tenants, 
    addTenant, 
    selectTenantById, 
    setTenantView, 
    employees, 
    setCurrentEmployee,
    currentTenant,
    setMileniaView 
  } = useTasty();

  const [activeTab, setActiveTab] = useState<'superadmin' | 'tenant_owner' | 'employee'>('superadmin');
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default active for easy test
  const [showNewAllyModal, setShowNewAllyModal] = useState(false);

  // Form state for creating new ally
  const nextId = String(Math.max(...tenants.map(t => parseInt(t.id) || 0), 0) + 1);
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('Bogotá D.C., Cundinamarca');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('+57 310 123 4567');
  const [newEmail, setNewEmail] = useState('');
  const [newNit, setNewNit] = useState('901.555.777-1');
  const [newDian, setNewDian] = useState('Resolución DIAN No. 18764099901 de 2026');
  const [newPlan, setNewPlan] = useState<SubscriptionPlan>('pro');
  const [newTagline, setNewTagline] = useState('Alta Gastronomía & Experiencia Inolvidable');
  const [newPrimaryColor, setNewPrimaryColor] = useState('#ea580c');
  const [newBannerImage, setNewBannerImage] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80');

  // Employee PIN login state
  const [selectedTenantForLogin, setSelectedTenantForLogin] = useState(tenants[0]?.id || '1');
  const [enteredPin, setEnteredPin] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleCreateAlly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newTenant: TenantRestaurant = {
      id: nextId,
      slug: slug || `restaurante-${nextId}`,
      name: newName,
      city: newCity,
      address: newAddress || 'Calle Principal #10-20',
      phone: newPhone,
      email: newEmail || `contacto@${slug || 'aliado'}.co`,
      createdAt: new Date().toISOString().split('T')[0],
      tablesCount: newPlan === 'enterprise' ? 25 : newPlan === 'pro' ? 14 : 8,
      activeOrdersCount: 0,
      totalMonthlySalesCop: 0,
      branding: {
        logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
        primaryColor: newPrimaryColor,
        accentColor: '#f59e0b',
        themeStyle: 'modern',
        bannerImage: newBannerImage,
        tagline: newTagline,
        currency: 'COP',
        currencySymbol: '$',
        dianResolution: newDian,
        nit: newNit,
        tipSuggestedPercentage: 10
      },
      subscription: {
        plan: newPlan,
        status: 'active',
        mrrCop: newPlan === 'enterprise' ? 499000 : newPlan === 'pro' ? 289000 : 149000,
        renewsAt: '2026-09-30',
        maxTables: newPlan === 'enterprise' ? 50 : newPlan === 'pro' ? 25 : 12,
        maxEmployees: newPlan === 'enterprise' ? 25 : newPlan === 'pro' ? 12 : 5,
        features: ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Control de Mesas']
      }
    };

    addTenant(newTenant);
    setShowNewAllyModal(false);
    
    // Reset form
    setNewName('');
    
    // Direct notification and jump option
    selectTenantById(newTenant.id);
    setTenantView('restaurant-inicio');
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const tenantEmps = employees.filter(emp => emp.restaurantId === selectedTenantForLogin);
    const matched = tenantEmps.find(emp => emp.pinCode === enteredPin.trim());

    if (matched) {
      setCurrentEmployee(matched);
      selectTenantById(selectedTenantForLogin);
      setTenantView('restaurant-empleados');
    } else {
      setLoginError('PIN incorrecto. Puedes usar los PIN de prueba: 1111 (Mesero), 2222 (Chef), 3333 (Cajero), 0000 (Owner).');
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-4">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 text-white rounded-3xl p-6 sm:p-10 border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Portal de Acceso & Gestión de Aliados</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Panel de Control Milenia SaaS
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Administra los restaurantes de la red, registra nuevos aliados con su respectivo ID correlativo y accede a los paneles de control.
          </p>
        </div>

        <button
          onClick={() => setShowNewAllyModal(true)}
          className="px-5 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Nuevo Aliado (ID #{nextId})</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('superadmin')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'superadmin'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Gestión de Aliados Registrados ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tenant_owner')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'tenant_owner'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Acceso Dueño / Admin de Restaurante</span>
        </button>

        <button
          onClick={() => setActiveTab('employee')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'employee'
              ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Ingreso de Personal (PIN Mesero / Cocina / Caja)</span>
        </button>
      </div>

      {/* TAB 1: Desglose de Aliados y Acciones */}
      {activeTab === 'superadmin' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Aliados Activos en la Red Milenia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cada aliado dispone de su propia URL independiente y base de datos aislada.
              </p>
            </div>

            <button
              onClick={() => setShowNewAllyModal(true)}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 self-start sm:self-auto cursor-pointer hover:bg-slate-800"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Nuevo Aliado</span>
            </button>
          </div>

          {/* Table / Cards of Allies */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3.5 px-4">ID & Restaurante</th>
                    <th className="py-3.5 px-4">URL Asignada</th>
                    <th className="py-3.5 px-4">Ciudad & NIT</th>
                    <th className="py-3.5 px-4">Plan & MRR</th>
                    <th className="py-3.5 px-4">Mesas / Staff</th>
                    <th className="py-3.5 px-4 text-right">Acciones Directas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-black text-amber-600 dark:text-amber-400 text-xs shrink-0">
                            #{tenant.id}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{tenant.name}</div>
                            <div className="text-[10px] text-slate-400">{tenant.branding.tagline}</div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned URL */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold">
                          <span>milenia.app/{tenant.id}</span>
                        </div>
                      </td>

                      {/* City & NIT */}
                      <td className="py-3.5 px-4">
                        <div>{tenant.city.split(',')[0]}</div>
                        <div className="text-[10px] font-mono text-slate-400">NIT: {tenant.branding.nit}</div>
                      </td>

                      {/* Plan */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {tenant.subscription.plan}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {formatCop(tenant.subscription.mrrCop)} /mes
                        </div>
                      </td>

                      {/* Tables & Staff */}
                      <td className="py-3.5 px-4">
                        <div>{tenant.tablesCount} Mesas</div>
                        <div className="text-[10px] text-slate-400">
                          {employees.filter(e => e.restaurantId === tenant.id).length} Empleados
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              selectTenantById(tenant.id);
                              setTenantView('restaurant-inicio');
                            }}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition cursor-pointer"
                          >
                            Ver Portal
                          </button>
                          <button
                            onClick={() => {
                              selectTenantById(tenant.id);
                              setTenantView('restaurant-empleados');
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                          >
                            POS / KDS
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Owner Login */}
      {activeTab === 'tenant_owner' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-2">
              <Store className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Acceso Dueño de Restaurante</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona tu restaurante para administrar tu carta, mesas y empleados.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Restaurante Aliado
              </label>
              <select
                value={selectedTenantForLogin}
                onChange={(e) => setSelectedTenantForLogin(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    Aliado #{t.id} - {t.name} ({t.city.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Correo Administrador
              </label>
              <input
                type="email"
                defaultValue="admin@restaurante.co"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                defaultValue="••••••••"
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => {
                selectTenantById(selectedTenantForLogin);
                setTenantView('restaurant-admin');
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Ingresar al Panel Administrativo
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Employee PIN Login */}
      {activeTab === 'employee' && (
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Ingreso de Personal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ingresa tu PIN de 4 dígitos para acceder al POS de Mesero, KDS de Cocina o Caja.
            </p>
          </div>

          <form onSubmit={handleEmployeeLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Restaurante donde trabajas
              </label>
              <select
                value={selectedTenantForLogin}
                onChange={(e) => setSelectedTenantForLogin(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    Aliado #{t.id} - {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                PIN de Empleado (4 Dígitos)
              </label>
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Ej. 1111 (Mesero), 2222 (Chef), 3333 (Cajero)"
                className="w-full text-center tracking-widest font-mono text-lg font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Validar PIN & Abrir Turno
            </button>

            {/* Quick Demo Pins */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-700 dark:text-slate-300">PINs de demostración:</div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEnteredPin('1111')}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono font-bold hover:bg-amber-500 hover:text-slate-950"
                >
                  1111 (Mesero)
                </button>
                <button
                  type="button"
                  onClick={() => setEnteredPin('2222')}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono font-bold hover:bg-amber-500 hover:text-slate-950"
                >
                  2222 (Chef)
                </button>
                <button
                  type="button"
                  onClick={() => setEnteredPin('3333')}
                  className="px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded font-mono font-bold hover:bg-amber-500 hover:text-slate-950"
                >
                  3333 (Cajero)
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Registrar Nuevo Aliado con ID automático */}
      {showNewAllyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-fade-in my-8">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
                  #{nextId}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    Registrar Nuevo Restaurante Aliado
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Se creará la URL oficial: <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">milenia.app/{nextId}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowNewAllyModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlly} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Restaurante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Asados La 80, Trattoria Bella Vista"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Ciudad & Departamento *
                  </label>
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="Bogotá D.C., Cundinamarca">Bogotá D.C., Cundinamarca</option>
                    <option value="Medellín, Antioquia">Medellín, Antioquia</option>
                    <option value="Cali, Valle del Cauca">Cali, Valle del Cauca</option>
                    <option value="Cartagena de Indias, Bolívar">Cartagena de Indias, Bolívar</option>
                    <option value="Barranquilla, Atlántico">Barranquilla, Atlántico</option>
                    <option value="Bucaramanga, Santander">Bucaramanga, Santander</option>
                    <option value="Pereira, Risaralda">Pereira, Risaralda</option>
                    <option value="Santa Marta, Magdalena">Santa Marta, Magdalena</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIT de Facturación DIAN *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNit}
                    onChange={(e) => setNewNit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Plan de Suscripción *
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as SubscriptionPlan)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  >
                    <option value="basic">Plan Básico ($149.000 COP/mes) - Hasta 12 mesas</option>
                    <option value="pro">Plan Pro ($289.000 COP/mes) - Hasta 25 mesas + KDS</option>
                    <option value="enterprise">Plan Enterprise ($499.000 COP/mes) - Ilimitado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Slogan o Propuesta Gastronómica
                  </label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>

              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                <span>Al registrar, se asignará el identificador <strong>ID #{nextId}</strong> y se habilitará su carta y POS de inmediato.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAllyModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publicar Aliado #{nextId}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
