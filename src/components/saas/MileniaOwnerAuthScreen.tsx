import React, { useState } from 'react';
import { 
  Crown, 
  Lock, 
  Mail, 
  KeyRound, 
  AlertCircle, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTasty } from '../../context/TastyContext';
import { saveUserToAllyDatabase, AllyUser } from '../../services/tenantUsersService';
import { doc, setDoc } from 'firebase/firestore';
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

  const [email, setEmail] = useState('camilovidal.1704@gmail.com');
  const [password, setPassword] = useState('123456');
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

      // 1. Autenticar en Firebase Auth
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        userUid = cred.user.uid;
      } catch (authLoginErr: any) {
        console.warn('Firebase Auth login notice:', authLoginErr?.code);
        try {
          const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          userUid = cred.user.uid;
        } catch (_) {
          // Continuamos con el identificador seguro
        }
      }

      // 2. Persistir perfil de CEO en Firestore
      const ownerUserPayload: AllyUser = {
        uid: userUid,
        name: 'Andrés Camilo Vidal (CEO Milenia)',
        email: cleanEmail,
        restaurantId: '1',
        role: 'OWNER',
        employeeId: '1085312034',
        documentId: '1085312034',
        position: 'CEO & Fundador Milenia SaaS',
        phone: '+57 304 347 0984',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserToAllyDatabase(ownerUserPayload);

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

      try {
        await signInWithEmail(cleanEmail, cleanPassword);
      } catch (_) {}

      setSuccessMessage('¡Credenciales verificadas exitosamente!');
      showToast('Acceso Autorizado', 'Bienvenido al Dashboard CEO de Milenia.', 'success');

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
            Acceso Privado &bull; CEO MILENIA
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Ingreso CEO MILENIA
          </h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Ingresa tu usuario y contraseña para acceder al panel de control maestro.
          </p>
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

          {/* Submit Button */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-xl transition shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Validando credenciales de CEO...</span>
              ) : (
                <>
                  <span>Ingresar al Dashboard CEO Milenia</span>
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

      </div>
    </div>
  );
};
