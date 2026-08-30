import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  Crown, 
  Lock, 
  Save, 
  X,
  Sparkles,
  KeyRound,
  IdCard,
  UserX
} from 'lucide-react';
import { 
  AllyUser, 
  getAllUsers, 
  saveUserToAllyDatabase, 
  deleteGlobalUser,
  subscribeToAllUsers,
  INITIAL_ALLY_USERS
} from '../../services/tenantUsersService';
import { MileniaAlly, getAliados } from '../../services/mileniaAliadosService';
import { db, doc, setDoc } from '../../firebaseConfig';
import { UserRole } from '../../lib/auth-service';

interface MileniaEmpleadosSectionProps {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const MileniaEmpleadosSection: React.FC<MileniaEmpleadosSectionProps> = ({ showToast }) => {
  const [users, setUsers] = useState<AllyUser[]>(INITIAL_ALLY_USERS);
  const [aliados, setAliados] = useState<MileniaAlly[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlly, setFilterAlly] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AllyUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AllyUser | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    documentId: '',
    phone: '',
    role: 'STAFF' as UserRole,
    position: 'Cajero / Atención',
    restaurantId: '1',
    status: 'active' as 'active' | 'inactive'
  });

  // Load Data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const allyList = await getAliados();
        setAliados(allyList);

        const allUsers = await getAllUsers();
        if (allUsers.length > 0) {
          setUsers(allUsers);
        }
      } catch (err) {
        console.warn('Error loading employees:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Subscribe to updates
    const unsubscribe = subscribeToAllUsers((updatedList) => {
      if (updatedList.length > 0) {
        setUsers(updatedList);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.documentId && u.documentId.includes(searchTerm)) ||
      (u.position && u.position.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAlly = filterAlly === 'all' || String(u.restaurantId) === String(filterAlly);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;

    return matchesSearch && matchesAlly && matchesRole && matchesStatus;
  });

  // Metrics
  const totalEmployees = users.length;
  const activeEmployees = users.filter(u => u.status === 'active').length;
  const ownersCount = users.filter(u => u.role === 'OWNER' || (u.role as string) === 'owner').length;
  const operationalCount = users.filter(u => u.role === 'STAFF' || (u.role as string) === 'staff').length;

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      documentId: '',
      phone: '',
      role: 'STAFF',
      position: 'Cajero / Atención al Cliente',
      restaurantId: aliados.length > 0 ? String(aliados[0].id) : '1',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AllyUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      documentId: user.documentId || user.employeeId || '',
      phone: user.phone || '',
      role: user.role,
      position: user.position || 'Colaborador Milenia',
      restaurantId: String(user.restaurantId || '1'),
      status: user.status
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      const uid = editingUser ? editingUser.uid : `user-${Date.now()}`;

      const userPayload: AllyUser = {
        uid,
        name: formData.name.trim(),
        email: cleanEmail,
        documentId: formData.documentId.trim() || '10000000',
        employeeId: formData.documentId.trim() || '10000000',
        phone: formData.phone.trim(),
        role: formData.role,
        position: formData.position.trim(),
        restaurantId: String(formData.restaurantId),
        status: formData.status,
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveUserToAllyDatabase(userPayload);

      setUsers(prev => {
        const idx = prev.findIndex(u => u.uid === uid);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = userPayload;
          return updated;
        }
        return [userPayload, ...prev];
      });

      setIsModalOpen(false);
      showToast(
        editingUser ? 'Empleado Actualizado' : 'Empleado Registrado',
        `El usuario ${userPayload.name} fue guardado en Firestore.`,
        'success'
      );
    } catch (err) {
      console.error('Error saving user:', err);
      showToast('Error', 'No se pudo guardar el empleado en Firestore.', 'error');
    } finally {
      setSavingUser(false);
    }
  };

  const handleToggleStatus = async (user: AllyUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const updatedUser: AllyUser = {
        ...user,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      await saveUserToAllyDatabase(updatedUser);
      setUsers(prev => prev.map(u => u.uid === user.uid ? updatedUser : u));
      showToast('Estado Actualizado', `Usuario ${user.name} ahora está ${newStatus === 'active' ? 'Activo' : 'Inactivo'}.`, 'info');
    } catch (err) {
      showToast('Error', 'No se pudo actualizar el estado del usuario.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteGlobalUser(deletingUser.uid, deletingUser.restaurantId);
      setUsers(prev => prev.filter(u => u.uid !== deletingUser.uid));
      setDeletingUser(null);
      showToast('Usuario Eliminado', `El usuario ${deletingUser.name} ha sido eliminado de Firestore.`, 'success');
    } catch (err) {
      showToast('Error', 'No se pudo eliminar el usuario de la base de datos.', 'error');
    }
  };

  const getAllyName = (restId: string) => {
    const found = aliados.find(a => String(a.id) === String(restId));
    return found ? found.name : `Restaurante #${restId}`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              Gestión de Personal & Equipos de Trabajo &bull; Milenia SaaS
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Módulo de Empleados & Usuarios</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Administración de cuentas de acceso, roles gerenciales, personal de caja, capitanes de meseros y credenciales sincronizadas con la colección <span className="text-amber-400 font-mono font-bold">/users</span> en Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Empleado</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Total Personal */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Personal</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{totalEmployees}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Usuarios registrados en el sistema
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Colección:</span>
            <span className="text-amber-400 font-bold">/users (Firestore)</span>
          </div>
        </div>

        {/* Metric 2: Usuarios Activos */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Personal Activo</span>
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">{activeEmployees}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Con acceso habilitado al sistema
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Disponibilidad:</span>
            <span className="text-emerald-400 font-bold">100% Online</span>
          </div>
        </div>

        {/* Metric 3: Propietarios & Gerentes */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Propietarios / CEO</span>
            <div className="p-2.5 bg-purple-500/20 text-purple-400 rounded-2xl">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-purple-300">{ownersCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Roles OWNER con control maestro
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Privilegios:</span>
            <span className="text-purple-400 font-bold">Supervisión Total</span>
          </div>
        </div>

        {/* Metric 4: Personal Operativo */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Equipo Operativo</span>
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">{operationalCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Caja, KDS Cocina, Meseros y Reparto
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Puntos de Atención:</span>
            <span className="text-blue-400 font-bold">POS & KDS Activos</span>
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula, correo o cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by Ally */}
          <div>
            <select
              value={filterAlly}
              onChange={(e) => setFilterAlly(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Restaurantes ({aliados.length})</option>
              {aliados.map(ally => (
                <option key={ally.id} value={ally.id}>{ally.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Role */}
          <div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Roles</option>
              <option value="OWNER">Propietario / Gerente General (OWNER)</option>
              <option value="STAFF">Personal Operativo (STAFF)</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="all">Todos los Estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

        </div>
      </div>

      {/* Employees Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-sm">Directorio de Empleados y Cuentas de Usuario</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredUsers.length} colaboradores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Cédula / Documento</th>
                <th className="py-3 px-4">Restaurante Asignado</th>
                <th className="py-3 px-4">Rol & Cargo</th>
                <th className="py-3 px-4">Contacto</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                    No se encontraron colaboradores que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-slate-800/40 transition">
                    
                    {/* Nombre y Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          user.role === 'OWNER' || (user.role as string) === 'owner'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {(user.role === 'OWNER' || (user.role as string) === 'owner') && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cédula */}
                    <td className="py-3.5 px-4 font-mono text-slate-300 font-bold">
                      {user.documentId || user.employeeId || '1085312034'}
                    </td>

                    {/* Restaurante */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-medium truncate max-w-[150px]">{getAllyName(user.restaurantId)}</span>
                      </div>
                    </td>

                    {/* Rol & Cargo */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${
                          user.role === 'OWNER' || (user.role as string) === 'owner'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        }`}>
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-400">{user.position || 'Operativo'}</span>
                      </div>
                    </td>

                    {/* Contacto */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      {user.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin teléfono</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                          user.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                        }`}
                        title="Clic para cambiar estado"
                      >
                        {user.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Activo</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-400" />
                            <span>Inactivo</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition cursor-pointer"
                          title="Editar Empleado"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-rose-400 rounded-lg transition cursor-pointer"
                          title="Eliminar Empleado"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: REGISTRAR / EDITAR EMPLEADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingUser ? 'Editar Datos del Empleado' : 'Registrar Nuevo Empleado'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Sincronización en tabla /users</p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Daniela Morales Pantoja"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cédula de Ciudadanía / ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="1085312034"
                    value={formData.documentId}
                    onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Teléfono WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+57 315 000 0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="empleado@milenia.co"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Restaurante / Aliado *</label>
                  <select
                    value={formData.restaurantId}
                    onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    {aliados.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Rol en la Plataforma *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="STAFF">Personal Operativo (STAFF)</option>
                    <option value="OWNER">Propietario / Gerente (OWNER)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Estado de Acceso *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Activo (Habilitado)</option>
                    <option value="inactive">Inactivo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Cargo / Posición Operativa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Capitana de Meseros / Cajero Principal"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                >
                  {savingUser ? 'Guardando...' : (editingUser ? 'Actualizar en Firestore' : 'Registrar en Firestore')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN DE EMPLEADO */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">¿Eliminar Empleado?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar al usuario <strong className="text-white">{deletingUser.name}</strong> ({deletingUser.email}) de la tabla <span className="font-mono text-amber-400">/users</span>? Esta acción revoca inmediatamente sus credenciales de acceso.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-500/20"
              >
                Sí, Eliminar de Firestore
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
