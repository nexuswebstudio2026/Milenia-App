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
  UserX,
  DollarSign,
  Calendar,
  Layers,
  Check,
  Headphones
} from 'lucide-react';
import { 
  MileniaEmpleado,
  getMileniaEmpleados,
  saveMileniaEmpleado,
  deleteMileniaEmpleado,
  subscribeToMileniaEmpleados,
  INITIAL_MILENIA_EMPLEADOS
} from '../../services/mileniaEmpleadosService';
import { MileniaAlly, getAliados } from '../../services/mileniaAliadosService';

interface MileniaEmpleadosSectionProps {
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const MileniaEmpleadosSection: React.FC<MileniaEmpleadosSectionProps> = ({ showToast }) => {
  const [empleados, setEmpleados] = useState<MileniaEmpleado[]>(INITIAL_MILENIA_EMPLEADOS);
  const [aliados, setAliados] = useState<MileniaAlly[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlly, setFilterAlly] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<MileniaEmpleado | null>(null);
  const [deletingEmpleado, setDeletingEmpleado] = useState<MileniaEmpleado | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State (Exact fields requested by user: Nombre, Cédula, Teléfono, Correo, Restaurante Aliado, Personal Operativo)
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    documentId: '',
    phone: '',
    email: '',
    assignedAllyId: 'all',
    assignedAllyName: 'Todos los Aliados (Cobertura Global)',
    operationalRole: 'Soporte Técnico POS & Hardware',
    department: 'Soporte & Operaciones' as MileniaEmpleado['department'],
    status: 'active' as 'active' | 'inactive' | 'vacation',
    salaryCop: 2200000,
    hireDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Load Data
  useEffect(() => {
    loadData();

    // Subscribe to Firestore changes in real-time
    const unsubscribe = subscribeToMileniaEmpleados((list) => {
      if (list && list.length > 0) {
        setEmpleados(list);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [empList, allyList] = await Promise.all([
        getMileniaEmpleados(),
        getAliados()
      ]);
      if (empList.length > 0) setEmpleados(empList);
      setAliados(allyList);
    } catch (err: any) {
      console.warn('Error loading Milenia empleados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingEmpleado(null);
    setFormData({
      id: '',
      name: '',
      documentId: '',
      phone: '',
      email: '',
      assignedAllyId: 'all',
      assignedAllyName: 'Todos los Aliados (Cobertura Global)',
      operationalRole: 'Soporte Técnico POS & Comanderas',
      department: 'Soporte & Operaciones',
      status: 'active',
      salaryCop: 2200000,
      hireDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: MileniaEmpleado) => {
    setEditingEmpleado(emp);
    setFormData({
      id: emp.id,
      name: emp.name,
      documentId: emp.documentId,
      phone: emp.phone,
      email: emp.email,
      assignedAllyId: emp.assignedAllyId || 'all',
      assignedAllyName: emp.assignedAllyName || 'Todos los Aliados (Cobertura Global)',
      operationalRole: emp.operationalRole,
      department: emp.department,
      status: emp.status,
      salaryCop: emp.salaryCop || 2200000,
      hireDate: emp.hireDate || new Date().toISOString().split('T')[0],
      notes: emp.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.documentId.trim()) {
      showToast('Campos requeridos', 'Por favor ingresa el nombre y la cédula del colaborador.', 'warning');
      return;
    }

    setSaving(true);
    try {
      // Find ally name if specific ally is selected
      let finalAllyName = 'Todos los Aliados (Cobertura Global)';
      if (formData.assignedAllyId !== 'all') {
        const found = aliados.find(a => String(a.id) === String(formData.assignedAllyId));
        if (found) finalAllyName = found.name;
      }

      const payload: Partial<MileniaEmpleado> = {
        id: editingEmpleado ? editingEmpleado.id : `emp-${Date.now()}`,
        name: formData.name.trim(),
        documentId: formData.documentId.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        assignedAllyId: formData.assignedAllyId,
        assignedAllyName: finalAllyName,
        operationalRole: formData.operationalRole.trim(),
        department: formData.department,
        status: formData.status,
        salaryCop: Number(formData.salaryCop) || 0,
        hireDate: formData.hireDate,
        notes: formData.notes.trim()
      };

      const saved = await saveMileniaEmpleado(payload);

      setEmpleados(prev => {
        const index = prev.findIndex(e => e.id === saved.id);
        if (index >= 0) {
          const copy = [...prev];
          copy[index] = saved;
          return copy;
        }
        return [saved, ...prev];
      });

      setIsModalOpen(false);
      showToast(
        editingEmpleado ? 'Empleado Actualizado' : 'Empleado Registrado en Milenia',
        `Colaborador ${saved.name} guardado exitosamente en la colección /empleados de Firebase.`,
        'success'
      );
    } catch (err: any) {
      showToast('Error al guardar', err.message || 'No se pudo guardar el empleado en Firestore', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (emp: MileniaEmpleado) => {
    const nextStatus = emp.status === 'active' ? 'inactive' : 'active';
    try {
      const updated = await saveMileniaEmpleado({
        ...emp,
        status: nextStatus
      });
      setEmpleados(prev => prev.map(e => e.id === emp.id ? updated : e));
      showToast(
        'Estado Modificado',
        `El colaborador ${emp.name} ahora está ${nextStatus === 'active' ? 'Activo' : 'Inactivo'}.`,
        'info'
      );
    } catch (err: any) {
      showToast('Error', 'No se pudo actualizar el estado en Firestore', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingEmpleado) return;
    try {
      await deleteMileniaEmpleado(deletingEmpleado.id);
      setEmpleados(prev => prev.filter(e => e.id !== deletingEmpleado.id));
      showToast('Empleado Eliminado', `El colaborador ${deletingEmpleado.name} ha sido retirado de Firestore.`, 'success');
      setDeletingEmpleado(null);
    } catch (err: any) {
      showToast('Error al eliminar', err.message || 'No se pudo eliminar el empleado', 'error');
    }
  };

  // Filter Logic
  const filteredEmpleados = empleados.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      emp.name.toLowerCase().includes(term) ||
      emp.documentId.includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.phone.includes(term) ||
      emp.operationalRole.toLowerCase().includes(term) ||
      emp.assignedAllyName.toLowerCase().includes(term);

    const matchesAlly = filterAlly === 'all' || String(emp.assignedAllyId) === String(filterAlly);
    const matchesDept = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || emp.status === filterStatus;

    return matchesSearch && matchesAlly && matchesDept && matchesStatus;
  });

  // Metrics
  const totalEmployees = empleados.length;
  const activeEmployees = empleados.filter(e => e.status === 'active').length;
  const supportOpsCount = empleados.filter(e => e.department === 'Soporte & Operaciones').length;
  const totalPayrollEstimate = empleados.reduce((acc, e) => acc + (e.salaryCop || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-slate-100">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              Equipo Corporativo &bull; Personal Operativo de Milenia
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Personal Operativo & Empleados Milenia</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Registro del equipo interno de Milenia: especialistas en soporte de hardware POS, técnicos de comanderas, asesores comerciales y gestores de cuentas de los restaurantes aliados. Sincronizado en tiempo real con la colección <span className="text-amber-400 font-mono font-bold">/empleados</span> en Firebase Firestore.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Sincronizar empleados con Firebase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-400' : ''}`} />
              <span>{loading ? 'Sincronizando...' : 'Sincronizar'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Empleado Milenia</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Total Equipo Milenia */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Equipo Milenia</span>
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{totalEmployees}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Colaboradores internos de Milenia
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Base de datos:</span>
            <span className="text-amber-400 font-bold">/empleados (Firestore)</span>
          </div>
        </div>

        {/* Metric 2: Personal Activo */}
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
              En operaciones y atención a aliados
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Disponibilidad:</span>
            <span className="text-emerald-400 font-bold">En Servicio</span>
          </div>
        </div>

        {/* Metric 3: Soporte Técnico & Despliegues */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Soporte & Despliegues</span>
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl">
              <Headphones className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-300">{supportOpsCount}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Atención POS, comanderas y redes
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Cobertura:</span>
            <span className="text-blue-400 font-bold">{aliados.length} Restaurantes</span>
          </div>
        </div>

        {/* Metric 4: Nómina Estimada */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xl hover:border-orange-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Nómina Operativa</span>
            <div className="p-2.5 bg-orange-500/20 text-orange-400 rounded-2xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-400">
              ${totalPayrollEstimate.toLocaleString('es-CO')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gasto operativo mensual COP
            </p>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Presupuesto:</span>
            <span className="text-orange-400 font-bold">Control CEO</span>
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
              placeholder="Buscar por nombre, cédula, cargo o aliado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Filter by Ally / Coverage */}
          <div>
            <select
              value={filterAlly}
              onChange={(e) => setFilterAlly(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Aliados Asignados</option>
              <option value="all">Cobertura Global (Todos)</option>
              {aliados.map(ally => (
                <option key={ally.id} value={ally.id}>{ally.name}</option>
              ))}
            </select>
          </div>

          {/* Filter by Department */}
          <div>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Departamentos</option>
              <option value="Soporte & Operaciones">Soporte & Operaciones</option>
              <option value="Comercial & Crecimiento">Comercial & Crecimiento</option>
              <option value="Tecnología & Redes">Tecnología & Redes</option>
              <option value="Administración & Finanzas">Administración & Finanzas</option>
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
              <option value="vacation">En Vacaciones</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

        </div>
      </div>

      {/* Employees Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-white text-sm">Directorio de Empleados y Personal Operativo de Milenia</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {filteredEmpleados.length} colaboradores en nómina Milenia
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Empleado Milenia</th>
                <th className="py-3 px-4">Cédula / Documento</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Restaurante Aliado Asignado</th>
                <th className="py-3 px-4">Personal Operativo / Cargo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmpleados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No se encontraron colaboradores que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                filteredEmpleados.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                    
                    {/* Nombre y Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-xs shrink-0 shadow-inner">
                          {emp.name ? emp.name.substring(0, 2).toUpperCase() : 'ML'}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{emp.name}</span>
                          </div>
                          <div className="text-[10px] text-amber-400/80 font-mono font-semibold">{emp.employeeCode}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cédula */}
                    <td className="py-3.5 px-4 font-mono text-slate-200 font-bold">
                      <div className="flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>{emp.documentId}</span>
                      </div>
                    </td>

                    {/* Teléfono */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        <span>{emp.phone}</span>
                      </div>
                    </td>

                    {/* Correo */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-blue-400" />
                        <span className="truncate max-w-[150px]">{emp.email}</span>
                      </div>
                    </td>

                    {/* Restaurante Aliado Asignado */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="font-medium truncate max-w-[170px]" title={emp.assignedAllyName}>
                          {emp.assignedAllyName}
                        </span>
                      </div>
                    </td>

                    {/* Personal Operativo / Cargo */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-300 font-mono">
                          {emp.operationalRole}
                        </span>
                        <span className="text-[10px] text-slate-400">{emp.department}</span>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition cursor-pointer ${
                          emp.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : emp.status === 'vacation'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        }`}
                        title="Clic para cambiar estado"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          emp.status === 'active' ? 'bg-emerald-400' : emp.status === 'vacation' ? 'bg-amber-400' : 'bg-rose-400'
                        }`} />
                        <span>
                          {emp.status === 'active' ? 'Activo' : emp.status === 'vacation' ? 'Vacaciones' : 'Inactivo'}
                        </span>
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 transition cursor-pointer"
                          title="Editar datos del empleado"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingEmpleado(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700 transition cursor-pointer"
                          title="Eliminar de Firestore"
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

      {/* MODAL: REGISTRAR / EDITAR EMPLEADO MILENIA */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingEmpleado ? 'Editar Empleado Milenia' : 'Registrar Nuevo Empleado de Milenia'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">Tabla Firestore: <strong className="text-amber-400">/empleados</strong></p>
                </div>
              </div>

              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              
              {/* 1. Nombre */}
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Completo del Empleado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Andrés Felipe Morales"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 2. Cédula y Teléfono */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Cédula de Ciudadanía / Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1098765432"
                    value={formData.documentId}
                    onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Teléfono / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="+57 304 347 0984"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 3. Correo y Restaurante Aliado Asignado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="empleado@milenia.app"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Restaurante Aliado Asignado *</label>
                  <select
                    value={formData.assignedAllyId}
                    onChange={(e) => setFormData({ ...formData, assignedAllyId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos los Aliados (Cobertura Global Milenia)</option>
                    {aliados.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Personal Operativo / Cargo y Departamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Personal Operativo / Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Soporte Técnico POS & Impresoras"
                    value={formData.operationalRole}
                    onChange={(e) => setFormData({ ...formData, operationalRole: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Área / Departamento *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Soporte & Operaciones">Soporte & Operaciones</option>
                    <option value="Comercial & Crecimiento">Comercial & Crecimiento</option>
                    <option value="Tecnología & Redes">Tecnología & Redes</option>
                    <option value="Administración & Finanzas">Administración & Finanzas</option>
                  </select>
                </div>
              </div>

              {/* 5. Estado y Salario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Estado de Disponibilidad *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Activo (En Operación)</option>
                    <option value="vacation">En Vacaciones</option>
                    <option value="inactive">Inactivo (Retirado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Salario Base Mensual (COP)</label>
                  <input
                    type="number"
                    placeholder="2200000"
                    value={formData.salaryCop}
                    onChange={(e) => setFormData({ ...formData, salaryCop: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Notas / Observaciones Operativas</label>
                <textarea
                  rows={2}
                  placeholder="Observaciones de cobertura, especialidad técnica o responsabilidades..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl transition shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando en Firebase...' : (editingEmpleado ? 'Actualizar en Firestore' : 'Guardar en Firestore')}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {deletingEmpleado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold text-white">¿Eliminar Empleado de Milenia?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              ¿Estás seguro de eliminar a <strong className="text-white">{deletingEmpleado.name}</strong> ({deletingEmpleado.operationalRole}) de la tabla <span className="font-mono text-amber-400">/empleados</span> en Firebase Firestore?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingEmpleado(null)}
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
