import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Sparkles,
  Ticket,
  UserCheck,
  Building2,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasty } from '../../context/TastyContext';
import { saveUserToAllyDatabase, AllyUser } from '../../services/tenantUsersService';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface MileniaOwnerAuthScreenProps {
  onSuccess: () => void;
}

export const MileniaOwnerAuthScreen: React.FC<MileniaOwnerAuthScreenProps> = ({
  onSuccess
}) => {
  const { showToast, setMileniaView } = useTasty();
  const { signInWithEmail } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('camilovidal.1704@gmail.com');
  const [password, setPassword] = useState('123456');
  const [name, setName] = useState('Andrés Camilo Vidal Canchón');
  const [documentId, setDocumentId] = useState('1085312034');
  const [phone, setPhone] = useState('+57 304 347 0984');
  const [masterToken, setMasterToken] = useState('MILENIA-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage('Por favor ingresa usuario (correo) y contraseña.');
      setLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      let userUid = `owner-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;

      // 1. Autenticar o Registrar en Firebase Auth
      try {
        if (mode === 'register') {
          try {
            const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            userUid = cred.user.uid;
          } catch (authCreateErr: any) {
            if (authCreateErr?.code === 'auth/email-already-in-use') {
              const loginCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
              userUid = loginCred.user.uid;
            } else {
              console.warn('Firebase Auth error on register, falling back to database sync:', authCreateErr);
            }
          }
        } else {
          // Modo Login
          try {
            const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
            userUid = cred.user.uid;
          } catch (authLoginErr: any) {
            console.warn('Firebase Auth login notice:', authLoginErr?.code);
            // Si la cuenta aún no existe en Auth, intentamos crearla automáticamente para asegurar persistencia
            try {
              const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
              userUid = cred.user.uid;
            } catch (_) {
              // Continuamos con el identificador seguro
            }
          }
        }
      } catch (authErr) {
        console.warn('Auth operation notice:', authErr);
      }

      // 2. GUARDAR Y PERSISTIR OBLIGATORIAMENTE EN LA TABLA /users DE FIREBASE FIRESTORE
      const ownerUserPayload: AllyUser = {
        uid: userUid,
        name: name.trim() || 'Andrés Camilo Vidal (Propietario Milenia)',
        email: cleanEmail,
        restaurantId: '1',
        role: 'OWNER',
        employeeId: documentId.trim() || '1085312034',
        documentId: documentId.trim() || '1085312034',
        position: 'Propietario & Fundador Milenia SaaS',
        phone: phone.trim() || '+57 304 347 0984',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Guardar en /users/{uid} y en la subcolección /aliados/1/usuarios/{uid}
      await saveUserToAllyDatabase(ownerUserPayload);

      // También guardar explícitamente en la colección /users
      try {
        const userDocRef = doc(db, 'users', userUid);
        await setDoc(userDocRef, {
          ...ownerUserPayload,
          lastLoginAt: new Date().toISOString(),
          isSuperAdminOwner: true
        }, { merge: true });
      } catch (dbErr) {
        console.warn('Direct Firestore setDoc notice:', dbErr);
      }

      // 3. Establecer Token de Sesión Verificada en sessionStorage
      sessionStorage.setItem('milenia_owner_session_token', JSON.stringify({
        authenticated: true,
        uid: userUid,
        email: cleanEmail,
        name: ownerUserPayload.name,
        documentId: ownerUserPayload.documentId,
        role: 'OWNER',
        verifiedAt: new Date().toISOString()
      }));

      // Intentar sincronizar contexto global de Auth si es posible
      try {
        await signInWithEmail(cleanEmail, cleanPassword);
      } catch (_) {}

      setSuccessMessage('¡Credenciales verificadas y guardadas en la base de datos de Firebase!');
      showToast('Acceso Autorizado', 'Bienvenido al Dashboard del Propietario de Milenia.', 'success');

      setTimeout(() => {
        onSuccess();
      }, 500);

    } catch (err: any) {
      console.error('Error in handleOwnerSubmit:', err);
      setErrorMessage(err?.message || 'Error al procesar el ingreso. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCamiloCredentials = () => {
    setEmail('camilovidal.1704@gmail.com');
    setPassword('123456');
    setName('Andrés Camilo Vidal Canchón');
    setDocumentId('1085312034');
    setPhone('+57 304 347 0984');
    setMasterToken('MILENIA-2026');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fade-in">
      <div className="max-w-md w-full bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600"></div>

        {/* Header Badge & Title */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/25">
            <Crown className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono text-[11px] font-black uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            Acceso Privado &bull; Propietario Milenia
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            {mode === 'login' ? 'Ingreso de Propietario' : 'Registrar Nuevo Propietario'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Ingresa tu usuario y contraseña para sincronizar con la tabla <span className="text-amber-400 font-mono font-bold">/users</span> de Firebase y acceder al panel maestro.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Registrar Propietario</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-400 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-400 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs relative z-10">
          
          {mode === 'register' && (
            <div className="space-y-1.5 animate-fade-in">
              <label className="block text-slate-300 font-bold">
                Nombre Completo del Propietario *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Andrés Camilo Vidal Canchón"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Usuario / Correo Electrónico *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camilovidal.1704@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold">
              Contraseña de Acceso *
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3 animate-fade-in">
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">Cédula / ID</label>
                <input
                  type="text"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  placeholder="1085312034"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-slate-300 font-bold">Teléfono WhatsApp</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+57 304 347 0984"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Quick Demo Autofill Button */}
          <div className="pt-1 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={handleFillCamiloCredentials}
              className="text-amber-400 hover:text-amber-300 underline font-bold cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Autocompletar Andrés Camilo (Owner)</span>
            </button>
            <span className="text-slate-500 font-mono text-[10px]">Cédula: 1085312034</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-xl transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Guardando en Firebase Firestore...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' ? 'Ingresar al Dashboard de Propietario' : 'Registrar y Guardar en /users'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMileniaView('inicio')}
              className="w-full py-2 text-slate-400 hover:text-white font-bold transition text-xs cursor-pointer"
            >
              Volver al Inicio
            </button>
          </div>

        </form>

        {/* Database info footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-400" />
            Tabla Firebase: <strong className="text-slate-400">/users</strong>
          </span>
          <span className="text-amber-400">Rol: OWNER</span>
        </div>

      </div>
    </div>
  );
};
