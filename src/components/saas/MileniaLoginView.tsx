import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LogIn, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Mail, 
  User, 
  Loader2, 
  CheckCircle2, 
  Phone, 
  UserPlus, 
  IdCard, 
  Hash, 
  Store, 
  ArrowRight,
  UtensilsCrossed,
  ChefHat
} from 'lucide-react';
import { loginUser, registerUser, UserRole, calculateRedirectUrl } from '../../lib/auth-service';
import { TenantEmployee, EmployeeRole } from '../../types';

export const MileniaLoginView: React.FC = () => {
  const { tenants, addEmployee, navigateTo, setMode: setAppMode, setTenantView, setMileniaView } = useTasty();
  const { userProfile, loginAsDemo } = useAuth();

  // Tab de Modo: Iniciar Sesión o Registrar Empleado
  const [activeTab, setActiveTab] = useState<'signin' | 'register_employee'>(() => {
    const autoTab = sessionStorage.getItem('milenia_auto_tab');
    if (autoTab === 'register_employee') {
      sessionStorage.removeItem('milenia_auto_tab');
      return 'register_employee';
    }
    return 'signin';
  });
  
  // Estado común
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Campos Iniciar Sesión
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Campos Registrar Empleado
  const [empFullName, setEmpFullName] = useState('');
  const [empRole, setEmpRole] = useState<'gerente' | 'chef-ejecutivo' | 'cajero-principal' | 'capitan-salon' | 'supervisor' | 'barista' | 'auxiliar'>('capitan-salon');
  const [empRestaurantId, setEmpRestaurantId] = useState<string>(() => (tenants.length > 0 ? tenants[0].id : '1'));
  const [empEmployeeId, setEmpEmployeeId] = useState('EMP-' + Math.floor(100 + Math.random() * 900));
  const [empDocumentId, setEmpDocumentId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empPinCode, setEmpPinCode] = useState('1234');

  // Helper para seleccionar y autenticar con perfiles demo
  const handleSelectDemo = async (demoEmail: string, demoPass: string, demoType?: 'miguel_owner' | 'alejandro_staff', directRestaurantId?: string) => {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);
    setError(null);
    
    if (demoType) {
      await loginAsDemo(demoType);
      const targetRest = demoType === 'miguel_owner' ? '5' : '3';
      const targetCargo = demoType === 'miguel_owner' ? 'gerente' : 'cajero-principal';
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      navigateTo({ routeType: 'ally_panel', restaurantId: targetRest, cargo: targetCargo });
    } else if (directRestaurantId) {
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      navigateTo({ routeType: 'ally_panel', restaurantId: directRestaurantId, cargo: 'gerente' });
    }
  };

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        throw new Error('Por favor ingresa tu correo y contraseña.');
      }

      const { user, profile } = await loginUser(loginEmail.trim(), loginPassword.trim());
      
      const roleText = (profile.role === 'OWNER' || (profile.role as string) === 'owner') ? 'Propietario / Gerente' : 'Personal Operativo';
      const restaurantTargetId = String(profile.restaurantId || '1');
      const positionCargoSlug = profile.position ? profile.position.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'gerente';
      const directUrl = `/panel/${restaurantTargetId}/${positionCargoSlug}`;

      setSuccessInfo({
        name: profile.name,
        redirectUrl: directUrl,
        message: `¡Bienvenido de nuevo, ${profile.name}! Accediendo al Panel de Control...`
      });

      // Redirigir al panel
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: restaurantTargetId,
          cargo: positionCargoSlug
        });
      }, 500);

    } catch (err: any) {
      console.error('Error iniciando sesión:', err);
      setError(err?.message || 'Error al autenticar. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  // Manejo de Registro de Empleado
  const handleRegisterEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!empFullName.trim()) {
      setError('Por favor ingresa el nombre completo del empleado.');
      return;
    }
    if (!empDocumentId.trim()) {
      setError('Por favor ingresa la Cédula de Ciudadanía del empleado.');
      return;
    }
    if (!empEmployeeId.trim()) {
      setError('Por favor ingresa o genera el ID del empleado.');
      return;
    }
    if (!empEmail.trim() || !empPassword.trim()) {
      setError('Por favor ingresa el correo electrónico y la contraseña.');
      return;
    }

    setLoading(true);

    try {
      const isOwnerRole = empRole === 'gerente';
      const roleMapped: UserRole = isOwnerRole ? 'OWNER' : 'STAFF';

      let positionTitle = 'Capitán de Salón';
      if (empRole === 'gerente') positionTitle = 'Gerente General';
      else if (empRole === 'chef-ejecutivo') positionTitle = 'Chef Ejecutivo & KDS';
      else if (empRole === 'cajero-principal') positionTitle = 'Cajero Principal & DIAN';
      else if (empRole === 'capitan-salon') positionTitle = 'Capitán de Salón / Mesero';
      else if (empRole === 'supervisor') positionTitle = 'Supervisor de Turno';
      else if (empRole === 'barista') positionTitle = 'Barista & Bebidas';
      else if (empRole === 'auxiliar') positionTitle = 'Auxiliar de Operaciones';

      // 1. Registrar usuario en Firebase Auth y Firestore
      await registerUser(empEmail, empPassword, {
        name: empFullName.trim(),
        restaurantId: empRestaurantId,
        role: roleMapped,
        employeeId: empEmployeeId.trim(),
        position: positionTitle,
        phone: empPhone.trim()
      });

      // 2. Mapear a TenantEmployee
      const employeeRoleType: EmployeeRole = 
        empRole === 'gerente' ? 'administrador' :
        empRole === 'chef-ejecutivo' ? 'cocina' :
        empRole === 'cajero-principal' ? 'cajero' : 'mesero';

      const newEmp: TenantEmployee = {
        id: empEmployeeId.trim(),
        restaurantId: empRestaurantId,
        name: empFullName.trim(),
        role: employeeRoleType,
        position: positionTitle,
        documentId: empDocumentId.trim(),
        email: empEmail.trim(),
        phone: empPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        pinCode: empPinCode || '1234',
        shiftStatus: 'active',
        currentClockInTime: new Date().toISOString()
      };

      addEmployee(newEmp);

      const targetCargoSlug = empRole;
      const directUrl = `/panel/${empRestaurantId}/${targetCargoSlug}`;

      setSuccessInfo({
        name: `${empFullName} (${positionTitle})`,
        redirectUrl: directUrl,
        message: '¡Empleado registrado con éxito en el restaurante seleccionado!'
      });

      // Redirigir directamente al panel correspondiente
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: empRestaurantId,
          cargo: targetCargoSlug
        });
      }, 400);

    } catch (err: any) {
      console.error('Error registrando empleado:', err);
      setError(err?.message || 'Error al registrar el empleado.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-sans">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide">
          <KeyRound className="w-3.5 h-3.5" />
          <span>MILENIA SAAS &bull; GESTIÓN DE ACCESOS Y REGISTRO DE EMPLEADOS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Ingreso de Aliados
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Inicia sesión para entrar directamente al panel de tu restaurante o registra nuevos colaboradores y empleados en el sistema.
        </p>
      </div>

      {/* Tabs Principales: ÚNICAMENTE Iniciar Sesión y Registrar Empleado */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-xl mx-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('signin'); setError(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register_employee'); setError(null); }}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'register_employee'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* Callout de Afiliación / Registrar Aliado en la Barra Superior */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">¿Deseas afiliar un nuevo restaurante a la red Milenia?</p>
            <p className="text-[11px] text-slate-400">Registra tu establecimiento, sube tu RUT y activa tu suscripción en la sección oficial.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMileniaView('registrar_aliado')}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-1.5 transition whitespace-nowrap cursor-pointer"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Registrar Aliado</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. Acceso Rápido y Casos de Prueba (Solo en pestaña Iniciar Sesión) */}
      {activeTab === 'signin' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Acceso Rápido 1-Click al Panel del Aliado
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Perfiles Demostrativos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Card Restaurante 1 - Camilo (Gerente Aliado) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('camilo.owner@milenia.co', 'Milenia2026!', undefined, '1')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  Aliado #1
                </span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">
                Asador & Parrilla La 93
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Camilo Benavides (Gerente)</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-amber-400/90 font-mono">
                <span>Entrar directo &rarr;</span>
              </div>
            </button>

            {/* Card Restaurante 5 - Miguel (Propietario) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('propietario@milenia.co', 'Milenia2026!', 'miguel_owner')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Aliado #5
                </span>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="font-bold text-white text-xs group-hover:text-amber-400 transition">
                Fogón & Leña Sabanero
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Miguel Ángel (Dueño)</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-emerald-400/90 font-mono">
                <span>Entrar directo &rarr;</span>
              </div>
            </button>

            {/* Card Restaurante 3 - Alejandro (Cajero / DIAN) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('alejandro.staff@milenia.co', 'Milenia2026!', 'alejandro_staff')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-slate-800 hover:border-teal-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">
                  Aliado #3
                </span>
                <UtensilsCrossed className="w-4 h-4 text-teal-400" />
              </div>
              <p className="font-bold text-white text-xs group-hover:text-teal-400 transition">
                Trattoria Bella Italia
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Alejandro (Cajero DIAN)</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-teal-400/90 font-mono">
                <span>Entrar directo &rarr;</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Banner de Mensajes de Éxito o Error */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs sm:text-sm animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successInfo && (
        <div className="p-5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-4 text-emerald-200 text-xs sm:text-sm animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-white text-base">{successInfo.message}</p>
              <p className="text-xs text-emerald-300 mt-0.5">
                Accediendo al Panel de <strong className="text-white">{successInfo.name}</strong>...
              </p>
            </div>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Contenedor Principal de Formularios */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* ========================================================================= */}
        {/* TAB 1: INICIAR SESIÓN                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-amber-500" />
                <span>Ingreso Seguro a la Plataforma</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa con tu correo electrónico registrado y contraseña para abrir el panel de tu restaurante.
              </p>
            </div>

            <div className="space-y-4">
              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="gerente@restaurante.co o personal@milenia.co"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña *
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Botón de Enviar Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando Credenciales...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Iniciar Sesión y Entrar al Panel del Aliado</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REGISTRAR EMPLEADO                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'register_employee' && (
          <form onSubmit={handleRegisterEmployeeSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>Registrar Nuevo Empleado / Colaborador</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Crea una cuenta para un miembro del equipo asociada a su restaurante correspondiente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Restaurante Destino */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Restaurante Aliado al que Pertenecerá *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={empRestaurantId}
                    onChange={(e) => setEmpRestaurantId(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        Aliado #{t.id} - {t.name} ({t.city.split(',')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo del Empleado *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={empFullName}
                    onChange={(e) => setEmpFullName(e.target.value)}
                    placeholder="Ej. Valentina Gómez Martínez"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Cargo u Oficio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cargo / Rol Operativo *
                </label>
                <div className="relative">
                  <ChefHat className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="capitan-salon">Capitán de Salón / Mesero</option>
                    <option value="cajero-principal">Cajero Principal & Facturación DIAN</option>
                    <option value="chef-ejecutivo">Chef Ejecutivo & Cocina KDS</option>
                    <option value="supervisor">Supervisor de Turno</option>
                    <option value="barista">Barista & Bebidas</option>
                    <option value="auxiliar">Auxiliar de Operaciones</option>
                    <option value="gerente">Gerente Administrativo</option>
                  </select>
                </div>
              </div>

              {/* Cédula */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cédula de Ciudadanía (C.C.) *
                </label>
                <div className="relative">
                  <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={empDocumentId}
                    onChange={(e) => setEmpDocumentId(e.target.value)}
                    placeholder="Ej. 1.085.492.110"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* ID Empleado */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Código de Empleado (ID) *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={empEmployeeId}
                    onChange={(e) => setEmpEmployeeId(e.target.value)}
                    placeholder="Ej. EMP-502"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Teléfono Móvil
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={empPhone}
                    onChange={(e) => setEmpPhone(e.target.value)}
                    placeholder="300 123 4567"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* PIN Code Rápido */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PIN de Acceso Rápido al POS (4 dígitos)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    maxLength={4}
                    value={empPinCode}
                    onChange={(e) => setEmpPinCode(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono text-center tracking-widest"
                  />
                </div>
              </div>

              {/* Correo y Contraseña */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Correo Electrónico de Acceso *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    placeholder="empleado@restaurante.co"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña de Acceso *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando Empleado en Firestore...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Registrar Empleado y Habilitar Acceso</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>

    </div>
  );
};
