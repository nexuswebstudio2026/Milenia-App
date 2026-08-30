import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Store, 
  TrendingUp, 
  DollarSign, 
  Sparkles,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  UserCheck,
  Building2,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { MileniaAlly } from '../../services/mileniaAliadosService';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export interface CrmLead {
  id: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  stage: 'lead' | 'demo' | 'negociacion' | 'activo' | 'seguimiento';
  planInterest: string;
  estimatedValueCop: number;
  lastContactDate: string;
  nextFollowUpDate: string;
  notes: string[];
  assignedTo: string;
  source: 'WhatsApp' | 'Web Milenia' | 'Referido' | 'Feria Gastronómica' | 'Visita Comercial';
  createdAt: string;
}

const DEFAULT_LEADS: CrmLead[] = [
  {
    id: 'crm-001',
    restaurantName: 'Asadero & Brasa Santandereana',
    contactName: 'Carlos Mauricio Gómez',
    phone: '3158942301',
    email: 'gerencia@asaderobrasa.com',
    city: 'Bucaramanga',
    stage: 'demo',
    planInterest: 'Plan Máximo Integral Milenia',
    estimatedValueCop: 600000,
    lastContactDate: '2026-08-29',
    nextFollowUpDate: '2026-09-02',
    notes: ['Interesado en comandera móvil para 24 mesas y facturación electrónica DIAN.'],
    assignedTo: 'Andrés Camilo Vidal',
    source: 'WhatsApp',
    createdAt: '2026-08-20'
  },
  {
    id: 'crm-002',
    restaurantName: 'Trattoria Bella Napoli',
    contactName: 'Sofia Valderrama',
    phone: '3104556789',
    email: 'contacto@bellanapoli.co',
    city: 'Medellín',
    stage: 'negociacion',
    planInterest: 'Plan Máximo Integral Milenia',
    estimatedValueCop: 600000,
    lastContactDate: '2026-08-30',
    nextFollowUpDate: '2026-09-01',
    notes: ['Envió RUT para elaboración de contrato. Requiere 3 pantallas KDS de cocina.'],
    assignedTo: 'Equipo Comercial Milenia',
    source: 'Web Milenia',
    createdAt: '2026-08-18'
  },
  {
    id: 'crm-003',
    restaurantName: 'Sushi Bar Nikkei 85',
    contactName: 'Javier Tanaka',
    phone: '3187654321',
    email: 'jtanaka@nikkei85.com',
    city: 'Bogotá D.C.',
    stage: 'lead',
    planInterest: 'Plan Máximo Integral Milenia',
    estimatedValueCop: 600000,
    lastContactDate: '2026-08-28',
    nextFollowUpDate: '2026-09-03',
    notes: ['Preguntó por integración de carta digital QR autogestionable y pagos con Breve.'],
    assignedTo: 'Andrés Camilo Vidal',
    source: 'Referido',
    createdAt: '2026-08-28'
  }
];

const LOCAL_STORAGE_KEY = 'milenia_crm_leads_v1';

interface MileniaCrmSectionProps {
  aliados: MileniaAlly[];
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const MileniaCrmSection: React.FC<MileniaCrmSectionProps> = ({ aliados, showToast }) => {
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<CrmLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    restaurantName: '',
    contactName: '',
    phone: '',
    email: '',
    city: 'Bogotá D.C.',
    stage: 'lead' as CrmLead['stage'],
    planInterest: 'Plan Máximo Integral Milenia',
    estimatedValueCop: 600000,
    nextFollowUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    source: 'WhatsApp' as CrmLead['source'],
    initialNote: ''
  });

  // Load Leads
  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      if (db) {
        const snap = await getDocs(collection(db, 'crm_leads'));
        if (!snap.empty) {
          const list = snap.docs.map(d => ({ ...d.data(), id: d.id })) as CrmLead[];
          setLeads(list);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Error loading leads from Firestore:', e);
    }

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setLeads(JSON.parse(saved));
      } catch (_) {
        setLeads(DEFAULT_LEADS);
      }
    } else {
      setLeads(DEFAULT_LEADS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LEADS));
    }
    setLoading(false);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.restaurantName || !formData.phone) {
      showToast('Por favor completa el nombre del restaurante y teléfono.', 'error');
      return;
    }

    const isEdit = !!formData.id;
    const leadId = isEdit ? formData.id : `crm-${Date.now()}`;

    const leadToSave: CrmLead = {
      id: leadId,
      restaurantName: formData.restaurantName.trim(),
      contactName: formData.contactName.trim() || 'Contacto Comercial',
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      city: formData.city.trim() || 'Bogotá D.C.',
      stage: formData.stage,
      planInterest: formData.planInterest,
      estimatedValueCop: Number(formData.estimatedValueCop) || 600000,
      lastContactDate: new Date().toISOString().split('T')[0],
      nextFollowUpDate: formData.nextFollowUpDate,
      notes: isEdit 
        ? (selectedLead?.notes || [])
        : (formData.initialNote.trim() ? [formData.initialNote.trim()] : ['Prospecto registrado en el CRM Milenia']),
      assignedTo: 'Andrés Camilo Vidal',
      source: formData.source,
      createdAt: isEdit ? (selectedLead?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    try {
      if (db) {
        await setDoc(doc(db, 'crm_leads', leadId), leadToSave, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore error saving lead:', e);
    }

    const updated = isEdit 
      ? leads.map(l => l.id === leadId ? leadToSave : l)
      : [leadToSave, ...leads];

    setLeads(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    showToast(isEdit ? 'Oportunidad CRM actualizada con éxito' : 'Nuevo lead registrado en el CRM', 'success');
    setIsModalOpen(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;

    const note = `[${new Date().toLocaleDateString('es-CO')}] ${newNoteText.trim()}`;
    const updatedNotes = [note, ...(selectedLead.notes || [])];

    const updatedLead: CrmLead = {
      ...selectedLead,
      notes: updatedNotes,
      lastContactDate: new Date().toISOString().split('T')[0]
    };

    try {
      if (db) {
        await setDoc(doc(db, 'crm_leads', selectedLead.id), updatedLead, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore error updating note:', e);
    }

    const updatedList = leads.map(l => l.id === selectedLead.id ? updatedLead : l);
    setLeads(updatedList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    showToast('Bitácora de seguimiento actualizada', 'success');
    setNewNoteText('');
    setIsNoteModalOpen(false);
  };

  const handleDeleteLead = async (id: string) => {
    if (!window.confirm('¿Deseas eliminar este registro del CRM?')) return;
    try {
      if (db) {
        await deleteDoc(doc(db, 'crm_leads', id));
      }
    } catch (e) {
      console.warn('Error deleting lead from Firestore:', e);
    }

    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    showToast('Registro eliminado del CRM', 'info');
  };

  const handleUpdateStage = async (lead: CrmLead, newStage: CrmLead['stage']) => {
    const updated: CrmLead = {
      ...lead,
      stage: newStage,
      lastContactDate: new Date().toISOString().split('T')[0]
    };

    try {
      if (db) {
        await setDoc(doc(db, 'crm_leads', lead.id), updated, { merge: true });
      }
    } catch (e) {
      console.warn('Error updating stage:', e);
    }

    const updatedList = leads.map(l => l.id === lead.id ? updated : l);
    setLeads(updatedList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
    showToast(`Estado cambiado a: ${getStageBadge(newStage).label}`, 'success');
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.restaurantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Metrics
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.estimatedValueCop || 0), 0);
  const activeLeadsCount = leads.filter(l => l.stage !== 'activo').length;
  const closedCount = leads.filter(l => l.stage === 'activo').length + aliados.length;

  function getStageBadge(stage: CrmLead['stage']) {
    switch (stage) {
      case 'lead':
        return { label: 'Prospecto Nuevo', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' };
      case 'demo':
        return { label: 'Demo Agendada', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' };
      case 'negociacion':
        return { label: 'Negociación / RUT', bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' };
      case 'activo':
        return { label: 'Aliado Activo', bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' };
      case 'seguimiento':
        return { label: 'En Seguimiento', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' };
      default:
        return { label: stage, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <HeartHandshake className="w-7 h-7 text-amber-400" />
            <span>CRM & Gestión Comercial de Aliados</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pipeline de ventas, seguimiento comercial a restaurantes prospecto y conversiones al Plan Máximo Integral ($600.000 COP).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadLeads}
            title="Refrescar CRM"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setFormData({
                id: '',
                restaurantName: '',
                contactName: '',
                phone: '',
                email: '',
                city: 'Bogotá D.C.',
                stage: 'lead',
                planInterest: 'Plan Máximo Integral Milenia',
                estimatedValueCop: 600000,
                nextFollowUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
                source: 'WhatsApp',
                initialNote: ''
              });
              setSelectedLead(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Prospecto</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Oportunidades Abiertas</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{activeLeadsCount}</p>
          <p className="text-[11px] text-blue-400">Prospectos en proceso</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Valor Pipeline Mensual</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ${totalPipelineValue.toLocaleString('es-CO')} <span className="text-xs text-slate-500 font-normal">COP</span>
          </p>
          <p className="text-[11px] text-emerald-400">Estimado recurrente</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Aliados Activos (Total)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400">{aliados.length}</p>
          <p className="text-[11px] text-slate-400 font-mono">En plataforma Milenia</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Plan Comercial Oficial</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm font-black text-purple-300 truncate">Plan Máximo Integral</p>
          <p className="text-[11px] text-slate-400 font-mono">$600.000 COP / mes</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por restaurante, contacto o teléfono..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-amber-500 transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Etapa:
          </span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-hidden focus:border-amber-500 font-medium"
          >
            <option value="all">Todas las Etapas ({leads.length})</option>
            <option value="lead">Prospecto Nuevo</option>
            <option value="demo">Demo Agendada</option>
            <option value="negociacion">Negociación / RUT</option>
            <option value="activo">Aliado Activo</option>
            <option value="seguimiento">En Seguimiento</option>
          </select>
        </div>
      </div>

      {/* CRM Pipeline Leads List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLeads.map((lead) => {
          const badge = getStageBadge(lead.stage);
          const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
          const waUrl = `https://wa.me/57${cleanPhone}?text=Hola%20${encodeURIComponent(lead.contactName)},%20te%20escribo%20de%20Milenia%20respecto%20a%20la%20implementaci%C3%B3n%20del%20sistema%20para%20${encodeURIComponent(lead.restaurantName)}.`;

          return (
            <div
              key={lead.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-4 shadow-lg transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top status & city */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {lead.city}
                  </span>
                </div>

                {/* Restaurant & Contact */}
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">{lead.restaurantName}</h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lead.contactName}</span>
                  </p>
                </div>

                {/* Plan & Value */}
                <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Interés:</span>
                    <span className="text-amber-400 font-bold">{lead.planInterest}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Tarifa mensual:</span>
                    <span className="font-mono font-bold text-emerald-400">${lead.estimatedValueCop.toLocaleString('es-CO')} COP</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Próximo contacto:</span>
                    <span className="font-mono text-amber-300">{lead.nextFollowUpDate}</span>
                  </div>
                </div>

                {/* Latest Note */}
                {lead.notes && lead.notes.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Última Nota / Bitácora</span>
                      <span>{lead.notes.length} notas</span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic line-clamp-2">
                      "{lead.notes[0]}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons & Stage Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                
                {/* Stage dropdown */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Mover etapa:</span>
                  <select
                    value={lead.stage}
                    onChange={(e) => handleUpdateStage(lead, e.target.value as CrmLead['stage'])}
                    className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-bold text-[11px] focus:outline-hidden"
                  >
                    <option value="lead">Prospecto</option>
                    <option value="demo">Demo</option>
                    <option value="negociacion">Negociación</option>
                    <option value="activo">Aliado Activo</option>
                    <option value="seguimiento">Seguimiento</option>
                  </select>
                </div>

                {/* Communication buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setIsNoteModalOpen(true);
                    }}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bitácora</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedLead(lead);
                      setFormData({
                        id: lead.id,
                        restaurantName: lead.restaurantName,
                        contactName: lead.contactName,
                        phone: lead.phone,
                        email: lead.email,
                        city: lead.city,
                        stage: lead.stage,
                        planInterest: lead.planInterest,
                        estimatedValueCop: lead.estimatedValueCop,
                        nextFollowUpDate: lead.nextFollowUpDate,
                        source: lead.source,
                        initialNote: ''
                      });
                      setIsModalOpen(true);
                    }}
                    className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>Editar</span>
                  </button>
                </div>

              </div>

            </div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <HeartHandshake className="w-10 h-10 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">No se encontraron prospectos</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No hay registros comerciales con los filtros aplicados. Puedes registrar un nuevo restaurante prospecto haciendo clic en "Nuevo Prospecto".
          </p>
        </div>
      )}

      {/* MODAL: REGISTRAR / EDITAR LEAD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-amber-400" />
                <span>{formData.id ? 'Editar Oportunidad CRM' : 'Nuevo Prospecto Comercial'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Nombre del Restaurante / Establecimiento *</label>
                <input
                  type="text"
                  required
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                  placeholder="Ej: Parrilla Don Juan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nombre del Contacto / Dueño</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Ej: Juan Pérez"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Teléfono / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej: 3151234567"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="gerencia@restaurante.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Ciudad</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bogotá D.C."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Etapa Inicial</label>
                  <select
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value as CrmLead['stage'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-medium focus:outline-hidden"
                  >
                    <option value="lead">Prospecto Nuevo</option>
                    <option value="demo">Demo Agendada</option>
                    <option value="negociacion">Negociación / RUT</option>
                    <option value="activo">Aliado Activo</option>
                    <option value="seguimiento">En Seguimiento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Próximo Seguimiento</label>
                  <input
                    type="date"
                    value={formData.nextFollowUpDate}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {!formData.id && (
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Nota Inicial / Necesidad del Cliente</label>
                  <textarea
                    rows={2}
                    value={formData.initialNote}
                    onChange={(e) => setFormData({ ...formData, initialNote: e.target.value })}
                    placeholder="Interesado en facturación electrónica DIAN y comanderas móviles..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-500 resize-none"
                  />
                </div>
              )}

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                💡 <strong>Plan Oficial:</strong> Plan Máximo Integral Milenia ($600.000 COP / mes). Incluye POS Web, KDS Cocina, Comanderas, Factura DIAN, Menú QR y Soporte 24/7.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {formData.id ? 'Actualizar Prospecto' : 'Guardar en CRM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BITÁCORA DE NOTAS */}
      {isNoteModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>Bitácora de {selectedLead.restaurantName}</span>
                </h3>
                <p className="text-xs text-slate-400">Contacto: {selectedLead.contactName} ({selectedLead.phone})</p>
              </div>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <label className="text-xs text-slate-300 font-bold">Agregar nueva nota / seguimiento</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder="Ej: Se realizó demo virtual de la comandera. Quedaron conformes."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar</span>
                </button>
              </div>
            </form>

            {/* List of past notes */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Historial de Interacciones:</span>
              {selectedLead.notes && selectedLead.notes.length > 0 ? (
                selectedLead.notes.map((n, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    {n}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No hay notas registradas aún.</p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsNoteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
