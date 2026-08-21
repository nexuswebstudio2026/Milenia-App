import React, { useState } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth, DEMO_USERS, DemoAccountConfig } from '../../context/AuthContext';
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
  EyeOff,
  AlertCircle,
  Mail,
  User,
  Hash,
  LogOut,
  RefreshCw,
  HelpCircle,
  Database
} from 'lucide-react';
import { UserRole } from '../../types';

export const MileniaLoginView: React.FC = () => {
  const { tenants, navigateTo, setMileniaView } = useTasty();
  const { 
    user, 
    userProfile, 
    loading, 
    error, 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    loginAsDemo, 
    logout,
    getRedirectPath,
    clearError 
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Signup extra profile fields
  const [signupRole, setSignupRole] = useState<UserRole>('staff');
  const [signupRestaurantId, setSignupRestaurantId] = useState('3');
  const [signupDocumentId, setSignupDocumentId] = useState('12345');
  const [signupName, setSignupName] = useState('');
  const [signupPosition, setSignupPosition] = useState('Cajero Principal');

  const [localStatus, setLocalStatus] = useState<string | null>(null);

  // Execute demo login and auto-redirect
  const handleDemoClick = async (demoKey: 'miguel_owner' | 'alejandro_staff') => {
    clearError();
    setLocalStatus('Autenticando con Firebase...');
    const targetUrl = await loginAsDemo(demoKey);
    setLocalStatus(`Perfil resuelto en Firestore. Redirigiendo a ${targetUrl}...`);
    
    setTimeout(() => {
      if (demoKey === 'miguel_owner') {
        navigateTo({ routeType: 'tenant_admin', restaurantId: '5' });
      } else {
        navigateTo({ routeType: 'employee_dashboard', restaurantId: '3', employeeId: '12345' });
      }
    }, 400);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalStatus('Procesando autenticación...');

    try {
      if (mode === 'signin') {
        const profile = await signInWithEmail(email, password);
        setLocalStatus(`Inicio exitoso. Redirigiendo a su portal...`);
        const path = getRedirectPath(profile);
        
        setTimeout(() => {
          if (profile.role === 'owner') {
            navigateTo({ routeType: 'tenant_admin', restaurantId: profile.restaurantId || '5' });
          } else {
            navigateTo({ 
              routeType: 'employee_dashboard', 
              restaurantId: profile.restaurantId || '3',
              employeeId: profile.documentId || '12345'
            });
          }
        }, 500);
      } else {
        if (!signupName.trim()) {
          setLocalStatus('Por favor ingresa tu nombre completo.');
          return;
        }
        const profile = await signUpWithEmail(email, password, {
          role: signupRole,
          restaurantId: signupRestaurantId,
          documentId: signupDocumentId,
          name: signupName,
          email,
          position: signupPosition
        });

        setLocalStatus(`Cuenta creada y registrada en /users/${profile.uid}. Redirigiendo...`);
        setTimeout(() => {
          if (profile.role === 'owner') {
            navigateTo({ routeType: 'tenant_admin', restaurantId: profile.restaurantId });
          } else {
            navigateTo({ 
              routeType: 'employee_dashboard', 
              restaurantId: profile.restaurantId,
              employeeId: profile.documentId
            });
          }
        }, 500);
      }
    } catch (err: any) {
      setLocalStatus(null);
    }
  };

  const handleGoogleSubmit = async () => {
    clearError();
    setLocalStatus('Abriendo ventana de autenticación Google...');
    try {
      const profile = await signInWithGoogle();
      setLocalStatus(`Google Auth exitoso. Perfil sincronizado en Firestore.`);
      setTimeout(() => {
        if (profile.role === 'owner') {
          navigateTo({ routeType: 'tenant_admin', restaurantId: profile.restaurantId });
        } else {
          navigateTo({ 
            routeType: 'employee_dashboard', 
            restaurantId: profile.restaurantId,
            employeeId: profile.documentId
          });
        }
      }, 500);
    } catch (err) {
      setLocalStatus(null);
    }
  };

  const handleNavigateToActivePortal = () => {
    if (!userProfile) return;
    if (userProfile.role === 'owner') {
      navigateTo({ routeType: 'tenant_admin', restaurantId: userProfile.restaurantId || '5' });
    } else {
      navigateTo({ 
        routeType: 'employee_dashboard', 
        restaurantId: userProfile.restaurantId || '3',
        employeeId: userProfile.documentId || '12345'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold">
          <KeyRound className="w-3.5 h-3.5" />
          <span>Milenia SaaS • Firebase Authentication & Firestore RBAC</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Ingreso de Aliados & Colaboradores
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Accede al panel de administración o a tu terminal de punto de venta (POS) y turno según tu rol y restaurante asignado en Firestore.
        </p>
      </div>

      {/* 1. Quick Access Demo Profiles (MIGUEL & ALEJANDRO) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">
              Acceso Rápido Demo (Casos de Prueba Solicitados)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">1-Click Auto Login</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Miguel Owner Button */}
          <button
            onClick={() => handleDemoClick('miguel_owner')}
            className="text-left bg-slate-800/90 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-4 rounded-2xl transition group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white group-hover:text-amber-400 transition">
                      Miguel Ángel (Owner)
                    </p>
                    <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black uppercase">
                      Owner
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Restaurante ID: <strong className="text-white">5</strong> (Mar & Fuego Caribe)
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span className="text-slate-400">Redirección Firestore:</span>
              <span className="text-amber-400 font-bold">/5/admin</span>
            </div>
          </button>

          {/* Alejandro Staff Button */}
          <button
            onClick={() => handleDemoClick('alejandro_staff')}
            className="text-left bg-slate-800/90 hover:bg-slate-800 border border-teal-500/40 hover:border-teal-500 p-4 rounded-2xl transition group relative overflow-hidden cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-black">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white group-hover:text-teal-400 transition">
                      Alejandro Restrepo (Cajero)
                    </p>
                    <span className="text-[9px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded font-black uppercase">
                      Staff
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Rest. ID: <strong className="text-white">3</strong> • CC: <strong className="text-white">12345</strong>
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <span className="text-slate-400">Redirección Firestore:</span>
              <span className="text-teal-400 font-bold">/3/dashboard/12345</span>
            </div>
          </button>

        </div>
      </div>

      {/* 2. Active Session Card if logged in */}
      {userProfile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sesión activa • Restaurante: {userProfile.restaurantId} • Cédula/Doc: {userProfile.documentId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleNavigateToActivePortal}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <span>Ir a {getRedirectPath()}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={logout}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-500/20 text-slate-700 dark:text-slate-300 hover:text-red-400 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Form: Firebase Authentication (Email/Password & Google) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        
        {/* Toggle Mode: Iniciar Sesión vs Registrarse */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center max-w-xs w-full">
            <button
              type="button"
              onClick={() => { setMode('signin'); clearError(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); clearError(); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        </div>

        {/* Status / Notifications */}
        {localStatus && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
            <span>{localStatus}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          
          {/* If Signup: Name, Role, RestaurantId, DocumentId */}
          {mode === 'signup' && (
            <div className="space-y-4 pt-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Rol en Firestore
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="owner">Owner (Propietario)</option>
                    <option value="staff">Staff (Cajero / Operativo)</option>
                  </select>
                </div>

                {/* RestaurantId */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Restaurante Asignado
                  </label>
                  <select
                    value={signupRestaurantId}
                    onChange={(e) => setSignupRestaurantId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        ID {t.id} - {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DocumentId / Cédula */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cédula / Document ID
                  </label>
                  <input
                    type="text"
                    required
                    value={signupDocumentId}
                    onChange={(e) => setSignupDocumentId(e.target.value)}
                    placeholder="Ej. 12345"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico (Firebase Auth)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@milenia.co"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>
              {mode === 'signin' ? 'Iniciar Sesión con Firebase' : 'Registrar Aliado en Firestore'}
            </span>
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">
              o continuar con
            </span>
          </div>
        </div>

        {/* Google Auth Button */}
        <button
          onClick={handleGoogleSubmit}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Acceder con Google Auth</span>
        </button>

      </div>

    </div>
  );
};
