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
  Laptop,
  Phone,
  MapPin,
  FileText,
  Utensils,
  CreditCard,
  UserPlus,
  Briefcase,
  IdCard,
  Hash,
  Store,
  Layers
} from 'lucide-react';
import { loginUser, registerUser, UserRole, calculateRedirectUrl } from '../../lib/auth-service';
import { TenantRestaurant, TenantEmployee, EmployeeRole } from '../../types';

export const MileniaLoginView: React.FC = () => {
  const { tenants, addTenant, addEmployee, navigateTo, setMode: setAppMode, setTenantView } = useTasty();
  const { 
    userProfile, 
    logout, 
    loginAsDemo 
  } = useAuth();

  // Tab de Modo: Iniciar Sesión, Registrar Aliado (Nuevo Restaurante), Registrar Empleado
  const [activeTab, setActiveTab] = useState<'signin' | 'register_ally' | 'register_employee'>('signin');
  
  // Estado común
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Campos Iniciar Sesión
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Campos Registrar Aliado (Nuevo Restaurante)
  const [allyName, setAllyName] = useState('');
  const [allyRut, setAllyRut] = useState('');
  const [allyLegalName, setAllyLegalName] = useState('');
  const [allyAddress, setAllyAddress] = useState('');
  const [allyCity, setAllyCity] = useState('Bogotá D.C.');
  const [allyPhone, setAllyPhone] = useState('');
  const [allyEmail, setAllyEmail] = useState('');
  const [allyCuisine, setAllyCuisine] = useState('Parrilla & Gastronomía Tradicional');
  const [allyTablesCount, setAllyTablesCount] = useState<number>(10);
  const [allyPlan, setAllyPlan] = useState<'basic' | 'pro' | 'enterprise'>('pro');
  // Propietario / Gerente del Aliado
  const [allyOwnerName, setAllyOwnerName] = useState('');
  const [allyOwnerDocumentId, setAllyOwnerDocumentId] = useState('');
  const [allyOwnerEmployeeId, setAllyOwnerEmployeeId] = useState('EMP-101');
  const [allyOwnerPhone, setAllyOwnerPhone] = useState('');
  const [allyOwnerEmail, setAllyOwnerEmail] = useState('');
  const [allyOwnerPassword, setAllyOwnerPassword] = useState('');

  // 3. Campos Registrar Empleado
  const [empFullName, setEmpFullName] = useState('');
  const [empRole, setEmpRole] = useState<'gerente' | 'chef-ejecutivo' | 'cajero-principal' | 'capitan-salon' | 'supervisor' | 'barista' | 'auxiliar'>('capitan-salon');
  const [empRestaurantId, setEmpRestaurantId] = useState<string>(() => (tenants.length > 0 ? tenants[0].id : '1'));
  const [empEmployeeId, setEmpEmployeeId] = useState('EMP-' + Math.floor(100 + Math.random() * 900));
  const [empDocumentId, setEmpDocumentId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empPinCode, setEmpPinCode] = useState('1234');

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(loginEmail, loginPassword);
      
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
        redirectUrl: directUrl,
        message: '¡Autenticado con éxito! Redirigiendo al Panel del Aliado...'
      });

      // Redirección directa e inmediata al Panel del Aliado
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({ 
          routeType: 'ally_panel', 
          restaurantId: rId,
          cargo: targetCargo
        });
      }, 300);
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  // Manejo de Registro de Aliado (Nuevo Restaurante)
  const handleRegisterAllySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allyName.trim()) {
      setError('Por favor ingresa el nombre del restaurante aliado.');
      return;
    }
    if (!allyRut.trim()) {
      setError('Por favor ingresa el Registro Único Tributario (RUT / NIT).');
      return;
    }
    if (!allyOwnerName.trim()) {
      setError('Por favor ingresa el nombre completo del Propietario / Gerente.');
      return;
    }
    if (!allyOwnerEmail.trim() || !allyOwnerPassword.trim()) {
      setError('Por favor ingresa el correo y contraseña de acceso para el Propietario.');
      return;
    }

    setLoading(true);

    try {
      // 1. Generar ID único para el restaurante
      const slug = allyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      const newRestaurantId = String(Date.now().toString().slice(-4) || '10');

      // 2. Crear objeto TenantRestaurant
      const newTenant: TenantRestaurant = {
        id: newRestaurantId,
        slug: slug || `rest-${newRestaurantId}`,
        name: allyName.trim(),
        city: allyCity.trim(),
        address: allyAddress.trim() || 'Dirección Comercial Principal',
        phone: allyPhone.trim() || allyOwnerPhone.trim() || '+57 304 347 0984',
        email: allyEmail.trim() || allyOwnerEmail.trim(),
        createdAt: new Date().toISOString(),
        tablesCount: Number(allyTablesCount) || 10,
        activeOrdersCount: 0,
        totalMonthlySalesCop: 0,
        branding: {
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          primaryColor: '#ea580c',
          accentColor: '#f59e0b',
          themeStyle: 'rustic',
          bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
          tagline: allyCuisine || 'Gastronomía Tradicional',
          currency: 'COP',
          currencySymbol: '$',
          nit: allyRut.trim(),
          legalBusinessName: allyLegalName.trim() || allyName.trim() + ' S.A.S.',
          dianResolution: `Resolución DIAN No. 187640${Math.floor(100000 + Math.random() * 900000)} de 2026`,
          tipSuggestedPercentage: 10,
          taxRateImpoconsumo: 8
        },
        subscription: {
          plan: allyPlan,
          status: 'active',
          mrrCop: allyPlan === 'enterprise' ? 490000 : allyPlan === 'pro' ? 289000 : 149000,
          renewsAt: '2026-12-31',
          maxTables: allyPlan === 'enterprise' ? 50 : 20,
          maxEmployees: allyPlan === 'enterprise' ? 30 : 10,
          features: ['POS Meseros', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Control de Inventario']
        }
      };

      // Guardar en Firestore & Context
      addTenant(newTenant);

      // 3. Registrar al Propietario / Gerente como usuario en Firebase Auth y Firestore
      const userRes = await registerUser(allyOwnerEmail, allyOwnerPassword, {
        name: allyOwnerName.trim(),
        restaurantId: newRestaurantId,
        role: 'OWNER',
        employeeId: allyOwnerEmployeeId || 'EMP-101',
        position: 'Propietario & Gerente General',
        phone: allyOwnerPhone || allyPhone
      });

      // 4. Agregar a la lista de empleados del restaurante
      const newOwnerEmployee: TenantEmployee = {
        id: allyOwnerEmployeeId || `emp-${newRestaurantId}-101`,
        restaurantId: newRestaurantId,
        name: allyOwnerName.trim(),
        role: 'owner',
        position: 'Propietario & Gerente General',
        documentId: allyOwnerDocumentId || '1085312034',
        email: allyOwnerEmail.trim(),
        phone: allyOwnerPhone.trim() || allyPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        pinCode: '1234',
        shiftStatus: 'active',
        currentClockInTime: new Date().toISOString()
      };
      addEmployee(newOwnerEmployee);

      const directUrl = `/panel/${newRestaurantId}/gerente`;
      setSuccessInfo({
        name: `${newTenant.name} (${allyOwnerName})`,
        redirectUrl: directUrl,
        message: '¡Restaurante Aliado y Cuenta Administradora registrados con éxito!'
      });

      // Redirigir directamente al panel del aliado
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: newRestaurantId,
          cargo: 'gerente'
        });
      }, 400);

    } catch (err: any) {
      console.error('Error registrando aliado:', err);
      setError(err?.message || 'Error al registrar el restaurante aliado.');
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
      const userRes = await registerUser(empEmail, empPassword, {
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

  // Helper para rellenar cuentas demo y autenticar
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-sans">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide">
          <KeyRound className="w-3.5 h-3.5" />
          <span>MILENIA SAAS &bull; GESTIÓN DE ACCESOS Y REGISTRO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Portal de Acceso y Registro
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Inicia sesión para ir directo al panel del aliado, registra un nuevo restaurante con sus datos tributarios o registra nuevos empleados.
        </p>
      </div>

      {/* Tabs Principales de Navegación */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('signin'); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
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
          onClick={() => { setActiveTab('register_ally'); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'register_ally'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Registrar Aliado</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register_employee'); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'register_employee'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Empleado</span>
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

            {/* Card Restaurante 5 - Miguel (Gerente Aliado) */}
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

            {/* Card Restaurante 3 - Alejandro (Cajero Staff) */}
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
                      Cajero Principal DIAN
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
      )}

      {/* 2. Sesión Activa Actual */}
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
              type="button"
              onClick={() => {
                const targetUrl = calculateRedirectUrl(userProfile);
                setAppMode('restaurant');
                setTenantView('restaurant-panel-gerente');
                const targetCargo = targetUrl.split('/').pop() || 'gerente';
                navigateTo({ 
                  routeType: 'ally_panel', 
                  restaurantId: String(userProfile.restaurantId || '1'),
                  cargo: targetCargo
                });
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Ir a mi Panel del Aliado</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Cerrar sesión actual"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Principal del Formulario */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Banner de Éxito y Redirección */}
        {successInfo && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-300">
                {successInfo.message}
              </p>
              <p className="text-xs text-slate-300">
                Bienvenido <span className="font-bold text-white">{successInfo.name}</span>.
              </p>
              <p className="text-[11px] font-mono text-emerald-400/90">
                Ruta activa: {successInfo.redirectUrl}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: INICIAR SESIÓN COMO ALIADO / EMPLEADO                              */}
        {/* ========================================================================= */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-amber-500" />
                <span>Ingreso Directo al Panel del Aliado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa con tu correo corporativo y contraseña para abrir el panel de control de tu restaurante.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
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
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="camilo.owner@milenia.co"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
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
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
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

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando y Abriendo Panel...</span>
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
        {/* TAB 2: REGISTRAR ALIADO (NUEVO RESTAURANTE COMPLETO)                       */}
        {/* ========================================================================= */}
        {activeTab === 'register_ally' && (
          <form onSubmit={handleRegisterAllySubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <span>Registrar Nuevo Restaurante Aliado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Registra un nuevo establecimiento gastronómico en la red Milenia SaaS con todos sus datos tributarios y su cuenta administradora.
              </p>
            </div>

            {/* Sección 1: Datos del Establecimiento */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                <Building2 className="w-4 h-4" />
                <span>1. Información del Restaurante & Datos Tributarios</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Comercial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Restaurante *
                  </label>
                  <div className="relative">
                    <Utensils className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyName}
                      onChange={(e) => setAllyName(e.target.value)}
                      placeholder="Ej. Fogón Santandereano & Brasas"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* RUT / NIT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registro Único Tributario (RUT / NIT) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyRut}
                      onChange={(e) => setAllyRut(e.target.value)}
                      placeholder="Ej. 901.884.231-9"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razón Social */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Razón Social / Empresa Legal
                  </label>
                  <input
                    type="text"
                    value={allyLegalName}
                    onChange={(e) => setAllyLegalName(e.target.value)}
                    placeholder="Ej. Inversiones Gastronómicas del Oriente S.A.S."
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Especialidad de Cocina */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Cocina / Especialidad
                  </label>
                  <input
                    type="text"
                    value={allyCuisine}
                    onChange={(e) => setAllyCuisine(e.target.value)}
                    placeholder="Ej. Parrilla, Carnes & Típica Colombiana"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Dirección */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dirección Comercial de la Sede *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyAddress}
                      onChange={(e) => setAllyAddress(e.target.value)}
                      placeholder="Ej. Calle 72 # 11-45, Barrio Chapinero"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ciudad / Municipio
                  </label>
                  <select
                    value={allyCity}
                    onChange={(e) => setAllyCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Pereira">Pereira</option>
                    <option value="Manizales">Manizales</option>
                    <option value="Santa Marta">Santa Marta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Teléfono PBX */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / PBX *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={allyPhone}
                      onChange={(e) => setAllyPhone(e.target.value)}
                      placeholder="+57 304 347 0984"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Mesas Iniciales */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad de Mesas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={allyTablesCount}
                    onChange={(e) => setAllyTablesCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Plan SaaS */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Plan Milenia SaaS
                  </label>
                  <select
                    value={allyPlan}
                    onChange={(e) => setAllyPlan(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="pro">Pro ($289.000 COP/mes)</option>
                    <option value="enterprise">Enterprise ($490.000 COP/mes)</option>
                    <option value="basic">Básico ($149.000 COP/mes)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 2: Cuenta del Propietario / Gerente General */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Credenciales del Propietario / Gerente General (Acceso Panel)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Propietario */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo del Propietario *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyOwnerName}
                      onChange={(e) => setAllyOwnerName(e.target.value)}
                      placeholder="Ej. Laura Marcela Ramírez"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Cédula Propietario */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula de Ciudadanía (C.C.) *
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyOwnerDocumentId}
                      onChange={(e) => setAllyOwnerDocumentId(e.target.value)}
                      placeholder="Ej. 1085312034"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email de Acceso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo de Acceso (Usuario Administrador) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={allyOwnerEmail}
                      onChange={(e) => setAllyOwnerEmail(e.target.value)}
                      placeholder="gerencia@nuevorestaurante.co"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Contraseña de Acceso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={allyOwnerPassword}
                      onChange={(e) => setAllyOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Registrar Aliado */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando Restaurante y Perfil en Firestore...</span>
                </>
              ) : (
                <>
                  <Store className="w-4 h-4 stroke-[2.5]" />
                  <span>Registrar Aliado y Entrar al Panel de Control</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: REGISTRAR EMPLEADO                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'register_employee' && (
          <form onSubmit={handleRegisterEmployeeSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>Registrar Nuevo Empleado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Vincula un nuevo colaborador operativo o gerencial al restaurante aliado correspondiente.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              
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
                    placeholder="Ej. Daniela Morales Pantoja"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Rol y Restaurante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cargo / Rol */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rol / Cargo del Empleado *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value as any)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="gerente">Gerente General (Acceso Total)</option>
                      <option value="chef-ejecutivo">Chef Ejecutivo & KDS Cocina</option>
                      <option value="cajero-principal">Cajero Principal & Facturación DIAN</option>
                      <option value="capitan-salon">Capitán de Salón / Mesero POS</option>
                      <option value="supervisor">Supervisor de Turno</option>
                      <option value="barista">Barista & Bebidas</option>
                      <option value="auxiliar">Auxiliar de Operaciones</option>
                    </select>
                  </div>
                </div>

                {/* Restaurante Asignado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Restaurante Aliado *
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={empRestaurantId}
                      onChange={(e) => setEmpRestaurantId(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>
                          ID {t.id} - {t.name} ({t.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* ID Empleado y Cédula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Empleado */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      ID del Empleado *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmpEmployeeId('EMP-' + Math.floor(100 + Math.random() * 900))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Auto-generar ID
                    </button>
                  </div>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={empEmployeeId}
                      onChange={(e) => setEmpEmployeeId(e.target.value)}
                      placeholder="EMP-104"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                {/* Cédula de Ciudadanía */}
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
                      placeholder="Ej. 1085312034"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Teléfono, Correo y Contraseña */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      placeholder="+57 315 220 8910"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="daniela.mesera@milenia.co"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Contraseña */}
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
                      className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Botón Registrar Empleado */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando Empleado en el Restaurante...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Registrar Empleado y Abrir Panel del Cargo</span>
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
          <span>Estructura de Base de Datos Multi-Tenant en Firestore:</span>
        </div>
        <pre className="bg-slate-950 p-3 rounded-xl text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800/80">
{`// 1. Restaurantes Aliados: /aliados/{id}
{ "id": "1", "name": "Parrilla & Fuego Camilo", "nit": "901.884.231-9", "city": "Bogotá", "plan": "pro" }

// 2. Usuarios Globales y de Restaurante: /users/{uid} y /aliados/{restaurantId}/usuarios/{uid}
{ "name": "Camilo Andrés Vidal", "role": "OWNER", "restaurantId": "1", "employeeId": "101", "documentId": "1085312034" }`}
        </pre>
      </div>

    </div>
  );
};
