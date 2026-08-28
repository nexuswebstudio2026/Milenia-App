import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  Receipt, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Mail, 
  User, 
  LogOut, 
  Loader2, 
  CheckCircle2,
  HelpCircle,
  Laptop
} from 'lucide-react';
import { loginUser, registerUser, UserRole, calculateRedirectUrl } from '../../lib/auth-service';

export const MileniaLoginView: React.FC = () => {
  const { tenants, navigateTo, setMode: setAppMode, setTenantView } = useTasty();
  const { 
    userProfile, 
    logout, 
    loginAsDemo 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string } | null>(null);

  // Campos para nuevo registro
  const [signupRole, setSignupRole] = useState<'OWNER' | 'STAFF'>('OWNER');
  const [signupRestaurantId, setSignupRestaurantId] = useState('1');
  const [signupEmployeeId, setSignupEmployeeId] = useState('101');
  const [signupName, setSignupName] = useState('');
  const [signupPosition, setSignupPosition] = useState('Propietario General');

  // Login con Email y Contraseña (Firebase Auth + Firestore)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const result = await loginUser(email, password);
        
        const posLower = String(result.profile.position || '').toLowerCase();
        const rId = String(result.profile.restaurantId || '1');
        
        let targetCargo = 'gerente';
        if (posLower.includes('chef') || posLower.includes('cocina')) targetCargo = 'chef-ejecutivo';
        else if (posLower.includes('cajer') || posLower.includes('caja') || posLower.includes('facturacion')) targetCargo = 'cajero-principal';
        else if (posLower.includes('meser') || posLower.includes('capitan') || posLower.includes('salon')) targetCargo = 'capitan-salon';
        else if (posLower.includes('supervis')) targetCargo = 'supervisor';

        const directUrl = `/panel/${rId}/${targetCargo}`;
        setSuccessInfo({
          name: result.profile.name,
          redirectUrl: directUrl
        });

        // Redirección Dinámica Inmediata al Panel de Acceso del Restaurante Aliado
        setAppMode('restaurant');
        setTenantView('restaurant-panel-gerente');
        setTimeout(() => {
          navigateTo({ 
            routeType: 'ally_panel', 
            restaurantId: rId,
            cargo: targetCargo
          });
        }, 200);
      } else {
        if (!signupName.trim()) {
          setError('Por favor ingresa tu nombre completo.');
          setLoading(false);
          return;
        }

        const result = await registerUser(email, password, {
          name: signupName,
          restaurantId: signupRestaurantId,
          role: signupRole,
          employeeId: signupEmployeeId,
          position: signupPosition
        });

        const posLower = String(signupPosition || '').toLowerCase();
        let targetCargo = 'gerente';
        if (posLower.includes('chef') || posLower.includes('cocina')) targetCargo = 'chef-ejecutivo';
        else if (posLower.includes('cajer') || posLower.includes('caja')) targetCargo = 'cajero-principal';
        else if (posLower.includes('meser') || posLower.includes('capitan')) targetCargo = 'capitan-salon';
        else if (posLower.includes('supervis')) targetCargo = 'supervisor';

        const directUrl = `/panel/${signupRestaurantId}/${targetCargo}`;
        setSuccessInfo({
          name: result.profile.name,
          redirectUrl: directUrl
        });

        setAppMode('restaurant');
        setTenantView('restaurant-panel-gerente');
        setTimeout(() => {
          navigateTo({ 
            routeType: 'ally_panel', 
            restaurantId: signupRestaurantId,
            cargo: targetCargo
          });
        }, 200);
      }
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  // Helper para rellenar cuentas demo y autenticar
  const handleSelectDemo = async (demoEmail: string, demoPass: string, demoType?: 'miguel_owner' | 'alejandro_staff', directRestaurantId?: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-sans">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide">
          <KeyRound className="w-3.5 h-3.5" />
          <span>MILENIA SAAS &bull; AUTENTICACIÓN FIREBASE AUTH & FIRESTORE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Ingreso de Restaurantes Aliados
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Inicia sesión con tu correo y contraseña. El sistema consultará tu rol en <span className="font-mono text-amber-500 font-bold">users/{'{uid}'}</span> y te redirigirá automáticamente a tu panel.
        </p>
      </div>

      {/* 1. Acceso Rápido y Casos de Prueba (Incluyendo Restaurante ID 1) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
              Perfiles de Prueba Pre-Configurados (Firebase + Firestore)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">1-Click Auto-Fill</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Card Restaurante 1 - Owner / Gerente (Camilo - Aliado Registrado) */}
          <button
            type="button"
            onClick={() => handleSelectDemo('camilo.owner@milenia.co', 'Milenia2026!', undefined, '1')}
            className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                      Rest. ID 1 (Gerente)
                    </p>
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-black uppercase">
                      Gerente
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Parrilla & Fuego Camilo
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform mt-1" />
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
              <span className="text-slate-500">Destino:</span>
              <span className="text-amber-400 font-bold">/panel/1/gerente</span>
            </div>
          </button>

          {/* Card Restaurante 5 - Owner (Miguel) */}
          <button
            type="button"
            onClick={() => handleSelectDemo('miguel.owner@milenia.co', 'Milenia2026!', 'miguel_owner')}
            className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                      Rest. ID 5 (Gerente)
                    </p>
                    <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-black uppercase">
                      Gerente
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Mar & Fuego Caribe
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform mt-1" />
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
              <span className="text-slate-500">Destino:</span>
              <span className="text-amber-400 font-bold">/panel/5/gerente</span>
            </div>
          </button>

          {/* Card Restaurante 3 - Staff (Alejandro) */}
          <button
            type="button"
            onClick={() => handleSelectDemo('alejandro.cajero@milenia.co', 'Milenia2026!', 'alejandro_staff')}
            className="text-left bg-slate-950/70 hover:bg-slate-800 border border-teal-500/40 hover:border-teal-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-black">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white group-hover:text-teal-400 transition">
                      Rest. ID 3 (Cajero)
                    </p>
                    <span className="text-[8px] bg-teal-500/20 text-teal-400 px-1 py-0.5 rounded font-black uppercase">
                      Cajero
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    Cajero Principal
                  </p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-1 transition-transform mt-1" />
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
              <span className="text-slate-500">Destino:</span>
              <span className="text-teal-400 font-bold">/panel/3/cajero-principal</span>
            </div>
          </button>

        </div>
      </div>

      {/* 2. Sesión Activa */}
      {userProfile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black uppercase">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Restaurante ID: {userProfile.restaurantId} &bull; Empleado ID: {userProfile.documentId || userProfile.employeeId || '101'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const rId = String(userProfile.restaurantId || '1');
                const posLower = String(userProfile.position || '').toLowerCase();
                let targetCargo = 'gerente';
                if (posLower.includes('chef') || posLower.includes('cocina')) targetCargo = 'chef-ejecutivo';
                else if (posLower.includes('cajer') || posLower.includes('caja')) targetCargo = 'cajero-principal';
                else if (posLower.includes('meser') || posLower.includes('capitan')) targetCargo = 'capitan-salon';
                else if (posLower.includes('supervis')) targetCargo = 'supervisor';

                setAppMode('restaurant');
                setTenantView('restaurant-panel-gerente');
                navigateTo({ 
                  routeType: 'ally_panel', 
                  restaurantId: rId,
                  cargo: targetCargo
                });
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Acceder a /panel/{userProfile.restaurantId || '1'}/gerente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              className="px-3 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-red-500/20 text-slate-700 dark:text-slate-300 hover:text-red-400 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Formulario Principal de Login / Registro (Estética Milenia Dark Gold) */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Línea dorada superior */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Toggle Mode: Iniciar Sesión vs Registrar Cuenta */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-950 p-1 rounded-2xl flex items-center max-w-xs w-full border border-slate-800">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Registrar Aliado
            </button>
          </div>
        </div>

        {/* Success / Loading redirect */}
        {successInfo ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">¡Autenticación Exitosa!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bienvenido, <strong className="text-white">{successInfo.name}</strong>. Accediendo a <span className="text-amber-400 font-mono font-bold">{successInfo.redirectUrl}</span>...
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAppMode('restaurant');
                  if (successInfo.redirectUrl.includes('/panel/')) {
                    const parts = successInfo.redirectUrl.split('/');
                    const rId = parts[2] || '1';
                    const cargo = parts[3] || 'gerente';
                    setTenantView('restaurant-panel-gerente');
                    navigateTo({ routeType: 'ally_panel', restaurantId: rId, cargo });
                  } else if (successInfo.redirectUrl.includes('/admin')) {
                    const rId = successInfo.redirectUrl.split('/')[1] || '1';
                    setTenantView('restaurant-panel-gerente');
                    navigateTo({ routeType: 'ally_panel', restaurantId: rId, cargo: 'gerente' });
                  } else if (successInfo.redirectUrl.includes('/dashboard')) {
                    const parts = successInfo.redirectUrl.split('/');
                    const rId = parts[1] || '1';
                    const empId = parts[3] || '101';
                    setTenantView('restaurant-empleados');
                    navigateTo({ routeType: 'employee_dashboard', restaurantId: rId, employeeId: empId });
                  } else {
                    setTenantView('restaurant-panel-gerente');
                    navigateTo({ routeType: 'ally_panel', restaurantId: '1', cargo: 'gerente' });
                  }
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Entrar al Panel Inmediatamente</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={async () => {
                  setSuccessInfo(null);
                  try {
                    await logout();
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs rounded-xl border border-red-500/40 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar Sesión / Cancelar</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            
            {/* Mensaje de Error Amigable */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario adicional si es Registro */}
            {mode === 'signup' && (
              <div className="space-y-4 pt-1 pb-3 border-b border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Ej. Camilo Andrés Gómez"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Rol */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Rol Asignado
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value as 'OWNER' | 'STAFF')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="OWNER">OWNER (Propietario)</option>
                      <option value="STAFF">STAFF (Cajero / POS)</option>
                    </select>
                  </div>

                  {/* Restaurante ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Restaurante ID
                    </label>
                    <select
                      value={signupRestaurantId}
                      onChange={(e) => setSignupRestaurantId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>
                          ID {t.id} - {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Employee ID */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      ID Empleado / Cédula
                    </label>
                    <input
                      type="text"
                      required
                      value={signupEmployeeId}
                      onChange={(e) => setSignupEmployeeId(e.target.value)}
                      placeholder="101"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="camilo.owner@milenia.co"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-500">Mínimo 6 caracteres</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando Firestore...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>{mode === 'signin' ? 'Ingresar a mi Restaurante' : 'Crear Cuenta y Perfil en Firestore'}</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>

      {/* Explicación de Arquitectura Firestore */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold">
          <HelpCircle className="w-4 h-4" />
          <span>Estructura del Documento en Firestore (Ruta: users/{'{uid}'}):</span>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
{`// Ejemplo Firestore Doc: /users/\${uid}
{
  "name": "Camilo Andrés Gómez",
  "email": "camilo.owner@milenia.co",
  "restaurantId": "1",
  "role": "OWNER",          // Redirige dinámicamente a: /1/admin
  "employeeId": "101"       // Si role == 'STAFF' -> /1/dashboard/101
}`}
        </pre>
      </div>

    </div>
  );
};
