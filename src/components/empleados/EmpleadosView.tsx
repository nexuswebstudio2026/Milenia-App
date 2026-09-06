import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Shield, 
  ChefHat, 
  KeyRound, 
  UserCheck, 
  Wine, 
  Search, 
  Database,
  Phone,
  Mail,
  Lock,
  DollarSign,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import { Empleado, EmpleadoRole, TurnoStatus } from '../../types/empleado';
import { 
  subscribeToEmpleados, 
  createEmpleado, 
  deleteEmpleado, 
  toggleTurnoEmpleado 
} from '../../services/empleadosService';

interface EmpleadosViewProps {
  title?: string;
  subtitle?: string;
  onSelectEmployee?: (empleado: Empleado) => void;
}

export const EmpleadosView: React.FC<EmpleadosViewProps> = ({
  title = 'Gestión de Empleados & Personal',
  subtitle = 'Tabla en tiempo real sincronizada con Firestore para asignación de turnos y estaciones'
}) => {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [showPins, setShowPins] = useState(false);

  // Form state for creating new employee
  const [nombre, setNombre] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [cargo, setCargo] = useState('');
  const [rol, setRol] = useState<EmpleadoRole>('sala');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pinAcceso, setPinAcceso] = useState('1234');
  const [salarioBase, setSalarioBase] = useState<number>(2400000);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEmpleados((items) => {
      setEmpleados(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreateEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !documentoIdentidad.trim()) return;

    setSubmitting(true);
    try {
      await createEmpleado({
        nombre: nombre.trim(),
        documentoIdentidad: documentoIdentidad.trim(),
        cargo: cargo.trim() || getRoleDefaultCargo(rol),
        rol,
        email: email.trim() || `${nombre.toLowerCase().replace(/\s+/g, '.')}@milenia.rest`,
        telefono: telefono.trim(),
        pinAcceso: pinAcceso.trim() || '0000',
        estadoTurno: 'activo',
        salarioBase: Number(salarioBase) || 0,
        restauranteId: 'rest_milenia_principal',
        fechaIngreso: new Date().toISOString().split('T')[0]
      });

      setNotification(`Colaborador ${nombre} registrado exitosamente en la base de datos.`);
      setTimeout(() => setNotification(null), 3500);

      // Reset form
      setNombre('');
      setDocumentoIdentidad('');
      setCargo('');
      setEmail('');
      setTelefono('');
      setPinAcceso('1234');
      setShowAddForm(false);
    } catch (err) {
      console.error('Error creando empleado:', err);
      setNotification('Error guardando en Firestore. Verifique conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTurno = async (id: string, currentStatus: TurnoStatus) => {
    const nextStatus: TurnoStatus = 
      currentStatus === 'activo' ? 'descanso' : currentStatus === 'descanso' ? 'inactivo' : 'activo';
    try {
      await toggleTurnoEmpleado(id, nextStatus);
    } catch (e) {
      console.error('Error alternando turno:', e);
    }
  };

  const handleDelete = async (id: string, empNombre: string) => {
    if (!window.confirm(`¿Confirmas eliminar a ${empNombre} de la base de datos de empleados?`)) return;
    try {
      await deleteEmpleado(id);
      setNotification(`Empleado ${empNombre} eliminado de la base de datos.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error('Error eliminando empleado:', e);
    }
  };

  const getRoleDefaultCargo = (r: EmpleadoRole): string => {
    switch (r) {
      case 'gerente': return 'Gerente General & Operaciones';
      case 'sala': return 'Capitán de Sala & Servicio';
      case 'cocina': return 'Cocinero de Partida (KDS)';
      case 'cajero': return 'Cajero Principal & Facturación';
      case 'sommelier': return 'Sommelier & Cava';
      case 'admin': return 'Administrador de Sistema';
      default: return 'Colaborador';
    }
  };

  const roleBadges: Record<EmpleadoRole, { label: string; icon: any; color: string }> = {
    gerente: { label: 'Gerente / Admin', icon: Shield, color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    admin: { label: 'Administrador', icon: Shield, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    sala: { label: 'Sala / Servicio', icon: UserCheck, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    cocina: { label: 'Cocina / KDS', icon: ChefHat, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    cajero: { label: 'Cajero / POS', icon: KeyRound, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    sommelier: { label: 'Sommelier / Cava', icon: Wine, color: 'bg-amber-600/10 text-amber-400 border-amber-600/30' },
    staff: { label: 'Staff General', icon: Users, color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }
  };

  const filteredEmpleados = empleados.filter(emp => {
    const matchesRole = filterRole === 'todos' || emp.rol === filterRole;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      emp.nombre.toLowerCase().includes(q) ||
      emp.documentoIdentidad.toLowerCase().includes(q) ||
      emp.cargo.toLowerCase().includes(q) ||
      emp.email.toLowerCase().includes(q);
    return matchesRole && matchesQuery;
  });

  const activeCount = empleados.filter(e => e.estadoTurno === 'activo').length;
  const breakCount = empleados.filter(e => e.estadoTurno === 'descanso').length;
  const inactiveCount = empleados.filter(e => e.estadoTurno === 'inactivo').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1.5">
                <Database className="w-3 h-3" />
                <span>Colección Firestore: /empleados</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {empleados.length} Registros Activos
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>{title}</span>
              <span className="text-amber-400 font-serif italic text-lg">• Control de Acceso</span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowPins(!showPins)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
              title="Mostrar u ocultar PINs de acceso para terminales"
            >
              {showPins ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-slate-400" />}
              <span>{showPins ? 'Ocultar PINs' : 'Ver PINs'}</span>
            </button>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <UserPlus className="w-4 h-4" />
              <span>{showAddForm ? 'Cerrar Formulario' : 'Registrar Colaborador'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stat Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800/80 mt-5">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Total Personal</div>
              <div className="text-lg font-black text-white">{empleados.length}</div>
            </div>
            <Users className="w-4 h-4 text-amber-400" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">En Turno Activo</div>
              <div className="text-lg font-black text-emerald-400">{activeCount}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">En Descanso</div>
              <div className="text-lg font-black text-amber-400">{breakCount}</div>
            </div>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Inactivos</div>
              <div className="text-lg font-black text-slate-400">{inactiveCount}</div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          </div>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Collapsible Form: Add New Employee */}
      {showAddForm && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Registrar Nuevo Empleado en Base de Datos</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Almacenamiento persistente Firestore</span>
          </div>

          <form onSubmit={handleCreateEmpleado} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nombre Completo *</label>
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Daniel Morales"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Documento / Cédula *</label>
              <input
                type="text"
                required
                value={documentoIdentidad}
                onChange={(e) => setDocumentoIdentidad(e.target.value)}
                placeholder="Ej: 1.098.765.432"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Rol Operativo / Estación</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value as EmpleadoRole)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="gerente">Gerente / Administración</option>
                <option value="sala">Capitán / Servicio Sala</option>
                <option value="cocina">Cocinero / KDS Cocina</option>
                <option value="cajero">Cajero / Facturación DIAN</option>
                <option value="sommelier">Sommelier / Cava</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Cargo Específico</label>
              <input
                type="text"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                placeholder="Ej: Jefe de Partida Fríos"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Correo Electrónico (Usuario)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colaborador@milenia.rest"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">PIN / Clave de Acceso (Terminal)</label>
              <input
                type="text"
                value={pinAcceso}
                onChange={(e) => setPinAcceso(e.target.value)}
                placeholder="Ej: 2026"
                maxLength={8}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Teléfono Móvil</label>
              <input
                type="text"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 123 4567"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Salario Base Mensual (COP)</label>
              <input
                type="number"
                value={salarioBase}
                onChange={(e) => setSalarioBase(Number(e.target.value))}
                step={50000}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando en Firestore...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Guardar Colaborador</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'gerente', label: 'Gerencia' },
            { id: 'sala', label: 'Sala' },
            { id: 'cocina', label: 'Cocina' },
            { id: 'cajero', label: 'Caja' },
            { id: 'sommelier', label: 'Sommelier' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterRole(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                filterRole === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o rol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Colaborador / Identidad</th>
                <th className="py-3 px-4">Estación / Rol</th>
                <th className="py-3 px-4">Usuario & Contacto</th>
                <th className="py-3 px-4 text-center">PIN Acceso</th>
                <th className="py-3 px-4 text-center">Estado Turno</th>
                <th className="py-3 px-4 text-right">Salario Base</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-amber-400" />
                    <span>Cargando tabla de empleados desde Firestore...</span>
                  </td>
                </tr>
              ) : filteredEmpleados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No se encontraron colaboradores que coincidan con el filtro.
                  </td>
                </tr>
              ) : (
                filteredEmpleados.map(emp => {
                  const roleConfig = roleBadges[emp.rol] || roleBadges.staff;
                  const RoleIcon = roleConfig.icon;

                  return (
                    <tr 
                      key={emp.id} 
                      className="hover:bg-slate-800/50 transition duration-150 group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-amber-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-300 text-xs shadow-inner">
                            {emp.nombre.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-amber-300 transition">
                              {emp.nombre}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              CC: {emp.documentoIdentidad}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Station & Role */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.color}`}>
                            <RoleIcon className="w-3 h-3" />
                            <span>{roleConfig.label}</span>
                          </span>
                          <div className="text-[11px] text-slate-400 font-medium truncate max-w-[160px]">
                            {emp.cargo}
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[11px] text-slate-300 truncate max-w-[190px]">
                            {emp.email}
                          </div>
                          <div className="font-mono text-[10px] text-slate-500">
                            {emp.telefono || 'Sin teléfono'}
                          </div>
                        </div>
                      </td>

                      {/* Access PIN */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs">
                          {showPins ? emp.pinAcceso : '••••'}
                        </span>
                      </td>

                      {/* Turno Status with click to toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleTurno(emp.id, emp.estadoTurno)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold inline-flex items-center gap-1.5 transition cursor-pointer border ${
                            emp.estadoTurno === 'activo'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : emp.estadoTurno === 'descanso'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                          title="Clic para alternar estado: Activo -> Descanso -> Inactivo"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            emp.estadoTurno === 'activo' ? 'bg-emerald-400 animate-pulse' : emp.estadoTurno === 'descanso' ? 'bg-amber-400' : 'bg-slate-500'
                          }`} />
                          <span className="capitalize">{emp.estadoTurno}</span>
                        </button>
                      </td>

                      {/* Salary */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        ${emp.salarioBase.toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(emp.id, emp.nombre)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                          title="Eliminar colaborador"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <div>
            Mostrando {filteredEmpleados.length} de {empleados.length} colaboradores
          </div>
          <div className="flex items-center gap-3">
            <span>Haz clic en el estado para alternar turno</span>
            <span>•</span>
            <span className="text-amber-400">Terminales operativas sincronizadas</span>
          </div>
        </div>
      </div>

    </div>
  );
};
