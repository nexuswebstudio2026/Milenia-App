import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  KeyRound, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  RefreshCw, 
  Mail, 
  IdCard, 
  Briefcase, 
  Phone,
  Database,
  Building2
} from 'lucide-react';
import { useTasty } from '../../context/TastyContext';
import { 
  AllyUser, 
  getAllyUsers, 
  saveUserToAllyDatabase, 
  deleteAllyUser, 
  subscribeToAllyUsers 
} from '../../services/tenantUsersService';

export const AllyUsersManagement: React.FC = () => {
  const { currentTenant, showToast } = useTasty();
  const [users, setUsers] = useState<AllyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    documentId: '',
    role: 'STAFF' as 'OWNER' | 'STAFF',
    position: 'Mesero / Atención',
    phone: '',
    status: 'active' as 'active' | 'inactive'
  });

  const loadUsers = async () => {
    setLoading(true);
    const data = await getAllyUsers(currentTenant.id);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
    const unsubscribe = subscribeToAllyUsers(currentTenant.id, (updated) => {
      setUsers(updated);
    });
    return () => unsubscribe();
  }, [currentTenant.id]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim()) {
      showToast('Error', 'Nombre y Correo son obligatorios', 'error');
      return;
    }

    setSaving(true);
    const uid = `user-${Date.now()}`;
    const docId = newUser.documentId.trim() || '101';

    const userPayload: AllyUser = {
      uid,
      name: newUser.name.trim(),
      email: newUser.email.trim().toLowerCase(),
      restaurantId: String(currentTenant.id),
      role: newUser.role,
      employeeId: docId,
      documentId: docId,
      position: newUser.position.trim(),
      phone: newUser.phone.trim(),
      status: newUser.status,
      createdAt: new Date().toISOString()
    };

    try {
      await saveUserToAllyDatabase(userPayload);
      showToast('Usuario Registrado', `${userPayload.name} guardado en Firestore.`, 'success');
      setIsNewUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        documentId: '',
        role: 'STAFF',
        position: 'Mesero / Atención',
        phone: '',
        status: 'active'
      });
      loadUsers();
    } catch (err: any) {
      showToast('Error', 'No se pudo guardar el usuario en la base de datos.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el acceso de ${name}?`)) {
      await deleteAllyUser(currentTenant.id, uid);
      showToast('Usuario Eliminado', `Registro de ${name} retirado de Firestore.`, 'info');
      loadUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.documentId?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || String(u.role).toUpperCase() === roleFilter.toUpperCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                FIRESTORE &bull; /aliados/{currentTenant.id}/usuarios
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <Database className="w-3 h-3" />
                <span>Base de Datos Sincronizada</span>
              </span>
            </div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>Tabla de Usuarios Registrados en {currentTenant.name}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Gestiona los accesos, roles (Owner vs Staff) y cédulas registradas para el Aliado ID #{currentTenant.id}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadUsers}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition cursor-pointer"
              title="Refrescar datos desde Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-2xl transition flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Registrar Usuario</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o cédula..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">Todos los Roles</option>
              <option value="OWNER">Propietarios (Owner)</option>
              <option value="STAFF">Colaboradores (Staff)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Database Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Usuario / Colaborador</th>
                <th className="py-3.5 px-4 font-semibold">Cédula / Documento</th>
                <th className="py-3.5 px-4 font-semibold">Rol Asignado</th>
                <th className="py-3.5 px-4 font-semibold">Cargo / Posición</th>
                <th className="py-3.5 px-4 font-semibold">Ruta de Destino</th>
                <th className="py-3.5 px-4 font-semibold">Estado</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No se encontraron usuarios registrados para este aliado.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isOwner = String(u.role).toUpperCase() === 'OWNER' || String(u.role).toUpperCase() === 'ADMIN';
                  const destPath = isOwner 
                    ? `/${currentTenant.id}/admin` 
                    : `/${currentTenant.id}/dashboard/${u.documentId || '101'}`;

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{u.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {u.documentId || u.employeeId || 'Sin cédula'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-black uppercase border ${
                          isOwner 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                            : 'bg-teal-500/20 text-teal-300 border-teal-500/30'
                        }`}>
                          {isOwner ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          <span>{isOwner ? 'OWNER (Dueño)' : 'STAFF (Operativo)'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {u.position || 'Colaborador'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-amber-300 font-semibold">
                        {destPath}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.status === 'active' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>{u.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(u.uid, u.name)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                          title="Eliminar usuario"
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
      </div>

      {/* Modal: Registrar Nuevo Usuario */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registrar Usuario en {currentTenant.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Tabla Firestore /aliados/{currentTenant.id}/usuarios</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Camilo Vidal Canchón"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="camilovidal.1704@gmail.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cédula / ID Empleado *</label>
                  <input
                    type="text"
                    required
                    placeholder="1085312034"
                    value={newUser.documentId}
                    onChange={(e) => setNewUser({ ...newUser, documentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Rol en el Sistema *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OWNER">OWNER (Propietario / Admin)</option>
                    <option value="STAFF">STAFF (Cajero / Mesero / Cocina)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Cargo / Posición</label>
                  <input
                    type="text"
                    placeholder="Ej. Gerente, Chef, Cajero"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Teléfono / WhatsApp (Opcional)</label>
                <input
                  type="text"
                  placeholder="+57 304 347 0984"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  {saving ? 'Guardando en Firestore...' : 'Guardar en Base de Datos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
