import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  Utensils, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Shield, 
  UserCheck, 
  ChefHat, 
  KeyRound,
  Wine,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Empleado } from '../../types/empleado';
import { 
  WORKSTATIONS, 
  WorkstationOption, 
  verifyEmpleadoLogin 
} from '../../services/empleadosService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmpleados?: () => void;
  onLoginSuccess?: (empleado: Empleado, station: WorkstationOption) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenEmpleados,
  onLoginSuccess 
}) => {
  // Form fields as requested: Usuario, Contraseña y Estación de trabajo
  const [usuario, setUsuario] = useState('gerencia@milenia.rest');
  const [contrasena, setContrasena] = useState('2026');
  const [stationId, setStationId] = useState<string>('gerencia');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ empleado: Empleado; station: WorkstationOption } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessData(null);

    if (!usuario.trim()) {
      setErrorMessage('Por favor ingrese su usuario, correo o documento de identidad.');
      return;
    }
    if (!contrasena.trim()) {
      setErrorMessage('Por favor ingrese su contraseña o PIN de acceso.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificación directa contra la tabla empleados en Firestore
      const result = await verifyEmpleadoLogin(usuario, contrasena, stationId);

      if (!result.success || !result.empleado || !result.station) {
        setErrorMessage(result.message);
        setIsLoading(false);
        return;
      }

      // 2. Éxito: Mostrar confirmación y acceder al panel
      setSuccessData({
        empleado: result.empleado,
        station: result.station
      });

      setIsLoading(false);

      // 3. Transición al respectivo panel
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(result.empleado!, result.station!);
        }
        onClose();
      }, 1200);

    } catch (err: any) {
      console.error('Error durante la verificación de login:', err);
      setErrorMessage('Ocurrió un error consultando la base de datos de empleados. Verifique su conexión.');
      setIsLoading(false);
    }
  };

  const getStationIcon = (id: string) => {
    switch (id) {
      case 'gerencia': return Shield;
      case 'sala': return UserCheck;
      case 'cocina': return ChefHat;
      case 'caja': return KeyRound;
      case 'barra': return Wine;
      default: return Utensils;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top gold accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="Cerrar modal de ingreso"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                <Utensils className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="font-mono text-xl font-black tracking-widest text-white uppercase leading-none">
                  MILENIA
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                    Verificación Tabla Empleados (Firestore)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Ingreso a Estación de Trabajo
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Diligencie su usuario, contraseña y estación asignada para validar su autorización en la base de datos de empleados.
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {successData && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-3 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-white">
                  ¡Acceso verificado para {successData.empleado.nombre}!
                </div>
                <div className="text-[11px] text-emerald-300/90 font-mono">
                  Ingresando al {successData.station.panelTitle}...
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* 1. USUARIO */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>1. Usuario, Correo o Cédula</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Tabla: empleados</span>
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
                placeholder="ej: gerencia@milenia.rest o 1.098.765.432"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono placeholder-slate-500"
              />
            </div>

            {/* 2. CONTRASEÑA / PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>2. Contraseña o PIN de Acceso</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Ocultar' : 'Mostrar PIN'}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  placeholder="PIN o Clave de acceso"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 transition font-mono placeholder-slate-500"
                />
              </div>
            </div>

            {/* 3. ESTACIÓN DE TRABAJO */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. Estación de Trabajo Asignada</span>
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">Validación de Rol</span>
              </label>

              <div className="grid grid-cols-1 gap-2">
                {WORKSTATIONS.map((st) => {
                  const StIcon = getStationIcon(st.id);
                  const isSelected = stationId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setStationId(st.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        <StIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-slate-300'}`}>
                            {st.label}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold">
                            Activo
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {st.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Verificando en base de datos empleados...</span>
                  </>
                ) : (
                  <>
                    <span>Verificar Credenciales & Entrar al Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
