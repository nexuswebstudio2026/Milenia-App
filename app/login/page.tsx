'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  Receipt, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { loginUser } from '../../lib/auth-service';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Firebase Auth + Firestore users/{uid} fetch
      const result = await loginUser(email, password);
      
      setSuccessInfo({
        name: result.profile.name,
        redirectUrl: result.redirectUrl
      });

      // 2. Redirección dinámica basada en rol y restaurante
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = result.redirectUrl;
        }
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Error al iniciar sesión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // Helper para rellenar rápido credenciales de prueba
  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Glows (Estética Milenia Luxury Dark) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MILENIA RESTAURANT SUITE</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Portal de Acceso
          </h1>
          <p className="text-sm text-slate-400">
            Ingresa tus credenciales para acceder al panel de tu restaurante.
          </p>
        </div>

        {/* Card Principal con Estética Milenia: Dark, bordes dorados e inputs minimalistas */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/5 relative overflow-hidden">
          
          {/* Línea dorada decorativa superior */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

          {/* Mensaje de Éxito / Redirigiendo */}
          {successInfo ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¡Bienvenido, {successInfo.name}!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Redirigiendo a <span className="text-amber-400 font-mono font-bold">{successInfo.redirectUrl}</span>...
                </p>
              </div>
              <div className="w-8 h-8 mx-auto border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Mensaje de Error */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Campo Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="propietario@milenia.co"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                  />
                </div>
              </div>

              {/* Campo Contraseña con botón de Ver/Ocultar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                  <a href="#" className="text-[11px] text-amber-400/80 hover:text-amber-300 transition">
                    ¿Olvidaste tu clave?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
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

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Autenticando en Firestore...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Selector Rápido de Cuentas Demo de Prueba */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
              Cuentas de Prueba Pre-configuradas:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('camilo.owner@milenia.co', 'Milenia2026!')}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-amber-500/30 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Restaurante 1 (Owner)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  camilo.owner@milenia.co
                </div>
                <div className="text-[9px] text-amber-400/80 font-mono mt-1 font-bold">
                  &rarr; /1/admin
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo('alejandro.cajero@milenia.co', 'Milenia2026!')}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-teal-500/30 text-left transition group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-teal-400 text-xs font-bold">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Restaurante 3 (Staff)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                  alejandro.cajero@milenia.co
                </div>
                <div className="text-[9px] text-teal-400/80 font-mono mt-1 font-bold">
                  &rarr; /3/dashboard/12345
                </div>
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Milenia SaaS Multi-Tenant &bull; Autenticación segura Firebase Auth v10+ &bull; RBAC Firestore
        </p>

      </div>
    </div>
  );
}
