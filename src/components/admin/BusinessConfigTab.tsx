import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Store, 
  Sparkles, 
  Upload, 
  Trash2, 
  Plus, 
  Save, 
  Image as ImageIcon, 
  Star, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  FileText, 
  Camera, 
  Eye, 
  X, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Copy,
  Layers,
  Edit2,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  AtSign,
  Smartphone,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NegocioInfo, NegocioFoto, DiaAtencion } from '../../types';
import { 
  getNegocioInfoList, 
  saveNegocioInfo, 
  deleteNegocioInfo, 
  subscribeToNegocioInfo, 
  DEFAULT_NEGOCIO_INFO,
  NEGOCIO_INFO_COLLECTION
} from '../../services/negocioInfoService';
import { useTasty } from '../../context/TastyContext';
import { CityDepartmentPicker } from './CityDepartmentPicker';
import { HorariosScheduler } from './HorariosScheduler';

const PRESET_LOGOS = [
  { name: 'Gourmet Clásico', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80' },
  { name: 'Steakhouse & Grill', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80' },
  { name: 'Bistró Moderno', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&auto=format&fit=crop&q=80' },
  { name: 'Café & Coctelería', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80' }
];

const CATEGORIAS_FOTOS = ['General', 'Instalaciones', 'Platos', 'Bar', 'Terraza', 'Eventos', 'Equipo'];

export const BusinessConfigTab: React.FC = () => {
  const { showToast, config, updateConfig, currentTenant, updateTenantDetails, setNegocioInfo } = useTasty();

  const [negociosList, setNegociosList] = useState<NegocioInfo[]>([DEFAULT_NEGOCIO_INFO]);
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_NEGOCIO_INFO.id);
  const [currentForm, setCurrentForm] = useState<NegocioInfo>(DEFAULT_NEGOCIO_INFO);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'logo' | 'galeria' | 'sedes'>('info');
  const [galleryFilter, setGalleryFilter] = useState<string>('Todas');

  // Modal para agregar foto a la galería
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [newPhotoTitle, setNewPhotoTitle] = useState<string>('');
  const [newPhotoCat, setNewPhotoCat] = useState<string>('Instalaciones');
  const [newPhotoDesc, setNewPhotoDesc] = useState<string>('');
  const [newPhotoDestacada, setNewPhotoDestacada] = useState<boolean>(false);

  // Modal para crear nueva sede/negocio
  const [isNewSedeModalOpen, setIsNewSedeModalOpen] = useState<boolean>(false);
  const [newSedeName, setNewSedeName] = useState<string>('');
  const [newSedeCiudad, setNewSedeCiudad] = useState<string>('Bogotá D.C.');
  const [newSedeNit, setNewSedeNit] = useState<string>('');

  // Visor Lightbox para ver foto en grande
  const [lightboxPhoto, setLightboxPhoto] = useState<NegocioFoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Cargar lista de Firestore en el montaje y escuchar cambios
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const init = async () => {
      setLoading(true);
      const list = await getNegocioInfoList();
      if (list && list.length > 0) {
        setNegociosList(list);
        const active = list.find(n => n.activa) || list[0];
        setSelectedId(active.id);
        setCurrentForm(active);
      }

      unsubscribe = subscribeToNegocioInfo((updatedList) => {
        setNegociosList(updatedList);
        setSelectedId(prevId => {
          const matching = updatedList.find(n => n.id === prevId);
          if (matching) {
            setCurrentForm(matching);
            return matching.id;
          } else if (updatedList.length > 0) {
            setCurrentForm(updatedList[0]);
            return updatedList[0].id;
          }
          return prevId;
        });
        setLoading(false);
      });
    };

    init();

    return () => {
      unsubscribe();
    };
  }, []);

  // Cambiar de sede / perfil de negocio seleccionado
  const handleSelectNegocio = (id: string) => {
    const item = negociosList.find(n => n.id === id);
    if (item) {
      setSelectedId(item.id);
      setCurrentForm(item);
    }
  };

  // Guardar cambios en Firestore
  const handleSaveToFirestore = async () => {
    setSaving(true);
    try {
      const saved = await saveNegocioInfo(currentForm);
      
      // Sincronizar también con la configuración general de la app y el tenant activo
      if (currentForm.activa) {
        updateConfig({
          name: currentForm.nombre,
          tagline: currentForm.eslogan
        });
        setNegocioInfo(saved);
        if (currentTenant) {
          updateTenantDetails(currentTenant.id, {
            name: currentForm.nombre,
            city: currentForm.ciudad,
            address: currentForm.direccion,
            phone: currentForm.telefono,
            email: currentForm.email,
            branding: {
              ...currentTenant.branding,
              logoUrl: currentForm.logo,
              tagline: currentForm.eslogan,
              nit: currentForm.nit
            }
          });
        }
      }

      showToast('Configuración Guardada', `Datos de "${saved.nombre}" sincronizados en la tabla ${NEGOCIO_INFO_COLLECTION} de Firestore`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al Guardar', 'No se pudieron sincronizar los datos en Firebase.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Manejar carga de archivo de logo local (FileReader -> base64)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Archivo Pesado', 'Se recomienda una imagen menor a 2MB para un rendimiento óptimo.', 'warning');
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCurrentForm(prev => ({
        ...prev,
        logo: result
      }));
      showToast('Logo Cargado', 'Previsualiza tu logo y haz clic en "Guardar en Firestore" para persistirlo.', 'info');
    };
    reader.readAsDataURL(file);
  };

  // Manejar carga de foto para galería
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewPhotoUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // CRUD Galería: Agregar nueva foto
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) {
      showToast('URL Requerida', 'Ingresa una URL o sube una imagen para la foto.', 'error');
      return;
    }

    const newPhoto: NegocioFoto = {
      id: `foto-${Date.now()}`,
      url: newPhotoUrl.trim(),
      titulo: newPhotoTitle.trim() || `Foto ${currentForm.galeria.length + 1}`,
      categoria: newPhotoCat || 'Instalaciones',
      destacada: newPhotoDestacada,
      descripcion: newPhotoDesc.trim(),
      fecha: new Date().toISOString().split('T')[0]
    };

    const updatedGaleria = [newPhoto, ...currentForm.galeria];
    const updated = { ...currentForm, galeria: updatedGaleria };
    setCurrentForm(updated);

    // Guardar inmediatamente en Firestore
    saveNegocioInfo(updated);

    setIsPhotoModalOpen(false);
    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setNewPhotoDesc('');
    setNewPhotoDestacada(false);

    showToast('Foto Agregada', `"${newPhoto.titulo}" se agregó a la galería y se sincronizó en Firestore.`, 'success');
  };

  // CRUD Galería: Eliminar foto
  const handleDeletePhoto = (photoId: string) => {
    const updatedGaleria = currentForm.galeria.filter(p => p.id !== photoId);
    const updated = { ...currentForm, galeria: updatedGaleria };
    setCurrentForm(updated);
    saveNegocioInfo(updated);
    showToast('Foto Eliminada', 'La imagen fue removida de la galería en Firestore.', 'info');
  };

  // CRUD Galería: Alternar foto destacada
  const handleToggleDestacada = (photoId: string) => {
    const updatedGaleria = currentForm.galeria.map(p => {
      if (p.id === photoId) {
        return { ...p, destacada: !p.destacada };
      }
      return p;
    });
    const updated = { ...currentForm, galeria: updatedGaleria };
    setCurrentForm(updated);
    saveNegocioInfo(updated);
  };

  // CRUD Sede/Negocio: Crear nueva sede
  const handleCreateNewSede = async () => {
    if (!newSedeName.trim()) {
      showToast('Nombre Requerido', 'Debes ingresar el nombre de la sede o negocio.', 'error');
      return;
    }

    const newId = `negocio_${Date.now()}`;
    const newNegocio: NegocioInfo = {
      ...DEFAULT_NEGOCIO_INFO,
      id: newId,
      nombre: newSedeName.trim(),
      ciudad: newSedeCiudad.trim() || 'Bogotá D.C.',
      nit: newSedeNit.trim() || currentForm.nit,
      sede: newSedeName.trim(),
      activa: false,
      updatedAt: new Date().toISOString()
    };

    await saveNegocioInfo(newNegocio);
    setNegociosList(prev => [...prev, newNegocio]);
    setSelectedId(newId);
    setCurrentForm(newNegocio);
    setIsNewSedeModalOpen(false);
    setNewSedeName('');
    setNewSedeNit('');

    showToast('Sede Creada', `La sede "${newNegocio.nombre}" fue registrada en la tabla Firestore.`, 'success');
  };

  // CRUD Sede/Negocio: Eliminar sede
  const handleDeleteSede = async (id: string, name: string) => {
    if (negociosList.length <= 1) {
      showToast('Acción No Permitida', 'No puedes eliminar la única sede existente.', 'warning');
      return;
    }

    if (!confirm(`¿Estás seguro de eliminar el registro de "${name}" de la base de datos Firestore?`)) {
      return;
    }

    await deleteNegocioInfo(id);
    const updated = negociosList.filter(n => n.id !== id);
    setNegociosList(updated);
    if (selectedId === id) {
      setSelectedId(updated[0].id);
      setCurrentForm(updated[0]);
    }

    showToast('Sede Eliminada', `El registro de "${name}" fue eliminado de Firestore.`, 'info');
  };

  // Filtrado de fotos en galería
  const filteredFotos = currentForm.galeria.filter(foto => {
    if (galleryFilter === 'Todas') return true;
    return foto.categoria?.toLowerCase() === galleryFilter.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER & FIRESTORE STATUS BANNER                          */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <Store className="w-3 h-3" />
                Módulo Administrativo
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Colección Firestore: {NEGOCIO_INFO_COLLECTION}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Configuración e Información del Negocio
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Administra el nombre comercial, logo, eslogan, NIT oficial, datos de contacto y galería fotográfica guardados en Firebase.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              id="btn-nueva-sede"
              onClick={() => setIsNewSedeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              Nueva Sede / Perfil
            </button>

            <button
              id="btn-guardar-firestore"
              onClick={handleSaveToFirestore}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Guardando en Firebase...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar en Firestore
                </>
              )}
            </button>
          </div>
        </div>

        {/* SEDE / PERFIL SELECTOR BAR */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1.5 mr-1">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Perfil Seleccionado:
            </span>
            {negociosList.map((negocio) => (
              <button
                key={negocio.id}
                onClick={() => handleSelectNegocio(negocio.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  selectedId === negocio.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                }`}
              >
                <span>{negocio.nombre}</span>
                {negocio.activa && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                    selectedId === negocio.id ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    Activa
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>NIT: <strong className="text-slate-200">{currentForm.nit}</strong></span>
            <span>•</span>
            <span>Fotos en Galería: <strong className="text-amber-400">{currentForm.galeria?.length || 0}</strong></span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-NAVIGATION TABS                                           */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('info')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'info'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileText className="w-4 h-4" />
          1. Identidad & Datos Oficiales
        </button>

        <button
          onClick={() => setActiveSubTab('logo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'logo'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Camera className="w-4 h-4" />
          2. Logo de la Marca
        </button>

        <button
          onClick={() => setActiveSubTab('galeria')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer relative ${
            activeSubTab === 'galeria'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          3. Galería de Fotos
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-bold border border-slate-700">
            {currentForm.galeria.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('sedes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'sedes'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          4. Sedes Registradas ({negociosList.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: IDENTIDAD & DATOS COMERCIALES                          */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Store className="w-4 h-4 text-amber-400" />
                  Información Corporativa & Tributaria
                </h3>
                <p className="text-xs text-slate-400">
                  Valores impresos en facturación DIAN, comandas y página web.
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                ID: {currentForm.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre del Negocio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nombre Comercial del Negocio *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-nombre-negocio"
                    type="text"
                    value={currentForm.nombre}
                    onChange={(e) => setCurrentForm({ ...currentForm, nombre: e.target.value })}
                    placeholder="Ej. Tasty Restaurant & Bar Gourmet"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-bold"
                  />
                </div>
              </div>

              {/* Eslogan del Negocio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Eslogan o Lema Comercial
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                  <input
                    id="input-eslogan-negocio"
                    type="text"
                    value={currentForm.eslogan}
                    onChange={(e) => setCurrentForm({ ...currentForm, eslogan: e.target.value })}
                    placeholder="Ej. Experiencia Culinaria & Sabores de Vanguardia"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              {/* NIT */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  NIT / Identificación Tributaria *
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-nit-negocio"
                    type="text"
                    value={currentForm.nit}
                    onChange={(e) => setCurrentForm({ ...currentForm, nit: e.target.value })}
                    placeholder="Ej. 901.450.888-1"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Teléfono / WhatsApp de Contacto
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-telefono-negocio"
                    type="text"
                    value={currentForm.telefono}
                    onChange={(e) => setCurrentForm({ ...currentForm, telefono: e.target.value })}
                    placeholder="Ej. +57 304 347 0984"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              {/* Correo Electrónico Comercial */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email de Atención
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-email-negocio"
                    type="email"
                    value={currentForm.email}
                    onChange={(e) => setCurrentForm({ ...currentForm, email: e.target.value })}
                    placeholder="Ej. contacto@restaurante.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              {/* Dirección Física */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Dirección Física
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-direccion-negocio"
                    type="text"
                    value={currentForm.direccion}
                    onChange={(e) => setCurrentForm({ ...currentForm, direccion: e.target.value })}
                    placeholder="Ej. Calle 93 # 12-45, Chicó"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>

              {/* Ubicación Geográfica: Ciudad, Departamento y País con Barra de Búsqueda y Filtro */}
              <div className="md:col-span-2">
                <CityDepartmentPicker
                  ciudad={currentForm.ciudad}
                  departamento={currentForm.departamento}
                  pais={currentForm.pais || 'Colombia'}
                  onChange={(ciudad, departamento, pais) => {
                    setCurrentForm({
                      ...currentForm,
                      ciudad,
                      departamento,
                      pais
                    });
                  }}
                />
              </div>

              {/* Horarios de Atención: Selector de Días y Horas */}
              <div className="md:col-span-2">
                <HorariosScheduler
                  horarios={currentForm.horarios}
                  diasAtencion={currentForm.diasAtencion}
                  onChange={(formattedHorarios, dias) => {
                    setCurrentForm({
                      ...currentForm,
                      horarios: formattedHorarios,
                      diasAtencion: dias
                    });
                  }}
                />
              </div>

              {/* Sitio Web Oficial */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Sitio Web Oficial
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    id="input-web-negocio"
                    type="text"
                    value={currentForm.sitioWeb}
                    onChange={(e) => setCurrentForm({ ...currentForm, sitioWeb: e.target.value })}
                    placeholder="https://tastyrestaurant.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                  />
                </div>
              </div>

              {/* REDES SOCIALES Y CANALES DIGITALES: Facebook, Instagram, X, TikTok, Threads, WhatsApp */}
              <div className="md:col-span-2 pt-2 border-t border-slate-800">
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-amber-400" />
                    Redes Sociales & Canales Digitales Oficiales
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configura los enlaces directos y usuarios para Facebook, Instagram, X, TikTok, Threads y WhatsApp.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Facebook */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Facebook className="w-3.5 h-3.5 text-blue-500" />
                      Facebook
                    </label>
                    <input
                      id="input-facebook-negocio"
                      type="text"
                      value={currentForm.redesSociales?.facebook || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, facebook: e.target.value }
                      })}
                      placeholder="facebook.com/restaurante"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* 2. Instagram */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-pink-500" />
                      Instagram
                    </label>
                    <input
                      id="input-instagram-negocio"
                      type="text"
                      value={currentForm.redesSociales?.instagram || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, instagram: e.target.value }
                      })}
                      placeholder="@restaurante_oficial"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* 3. X (Twitter) */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-sky-400" />
                      X (Twitter)
                    </label>
                    <input
                      id="input-x-negocio"
                      type="text"
                      value={currentForm.redesSociales?.x || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, x: e.target.value }
                      })}
                      placeholder="@restaurante"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* 4. TikTok */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      TikTok
                    </label>
                    <input
                      id="input-tiktok-negocio"
                      type="text"
                      value={currentForm.redesSociales?.tiktok || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, tiktok: e.target.value }
                      })}
                      placeholder="@tasty_gourmet"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* 5. Threads */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <AtSign className="w-3.5 h-3.5 text-amber-400" />
                      Threads
                    </label>
                    <input
                      id="input-threads-negocio"
                      type="text"
                      value={currentForm.redesSociales?.threads || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, threads: e.target.value }
                      })}
                      placeholder="@restaurante_threads"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>

                  {/* 6. WhatsApp */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                      WhatsApp Business
                    </label>
                    <input
                      id="input-whatsapp-negocio"
                      type="text"
                      value={currentForm.redesSociales?.whatsapp || ''}
                      onChange={(e) => setCurrentForm({
                        ...currentForm,
                        redesSociales: { ...currentForm.redesSociales, whatsapp: e.target.value }
                      })}
                      placeholder="+57 304 347 0984"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción del Restaurante */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descripción Comercial & Concepto Gastronómico
                </label>
                <textarea
                  id="textarea-descripcion-negocio"
                  rows={3}
                  value={currentForm.descripcion}
                  onChange={(e) => setCurrentForm({ ...currentForm, descripcion: e.target.value })}
                  placeholder="Describe la propuesta gastronómica, platos insignia y experiencia del restaurante..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Última actualización: {currentForm.updatedAt ? new Date(currentForm.updatedAt).toLocaleString('es-CO') : 'Reciente'}
              </span>
              <button
                onClick={handleSaveToFirestore}
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Save className="w-4 h-4" />
                Guardar en Firestore
              </button>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl sticky top-24 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-400" />
                  Vista Previa en Vivo
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  Ficha Digital
                </span>
              </div>

              {/* Brand Card Mockup */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-4 shadow-inner relative overflow-hidden space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={currentForm.logo || DEFAULT_NEGOCIO_INFO.logo}
                    alt={currentForm.nombre}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md bg-slate-950 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_NEGOCIO_INFO.logo;
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="font-black text-white text-base truncate">
                      {currentForm.nombre || 'Nombre del Negocio'}
                    </h4>
                    <p className="text-amber-400 text-xs font-medium italic truncate">
                      "{currentForm.eslogan || 'Tu eslogan aquí'}"
                    </p>
                    <span className="inline-block text-[10px] font-mono text-slate-400 mt-0.5">
                      NIT: {currentForm.nit || '000.000.000-0'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{currentForm.direccion || 'Dirección'}, {currentForm.ciudad}{currentForm.departamento ? ` (${currentForm.departamento})` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="font-mono">{currentForm.telefono || 'Teléfono'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{currentForm.horarios || 'Horarios'}</span>
                  </div>
                  {currentForm.sitioWeb && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate font-mono text-[10px] text-amber-400">{currentForm.sitioWeb}</span>
                    </div>
                  )}
                </div>

                {/* Redes Sociales Preview Badges */}
                {currentForm.redesSociales && Object.values(currentForm.redesSociales).some(v => !!v) && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                    {currentForm.redesSociales.facebook && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/20 flex items-center gap-1 font-semibold">
                        <Facebook className="w-2.5 h-2.5" /> FB
                      </span>
                    )}
                    {currentForm.redesSociales.instagram && (
                      <span className="text-[10px] bg-pink-500/10 text-pink-400 px-2 py-0.5 rounded-md border border-pink-500/20 flex items-center gap-1 font-semibold">
                        <Instagram className="w-2.5 h-2.5" /> IG
                      </span>
                    )}
                    {currentForm.redesSociales.x && (
                      <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-md border border-sky-500/20 flex items-center gap-1 font-semibold">
                        <Twitter className="w-2.5 h-2.5" /> X
                      </span>
                    )}
                    {currentForm.redesSociales.tiktok && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 font-semibold">
                        <Smartphone className="w-2.5 h-2.5" /> TikTok
                      </span>
                    )}
                    {currentForm.redesSociales.threads && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1 font-semibold">
                        <AtSign className="w-2.5 h-2.5" /> Threads
                      </span>
                    )}
                    {currentForm.redesSociales.whatsapp && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1 font-semibold">
                        <MessageCircle className="w-2.5 h-2.5" /> WA
                      </span>
                    )}
                  </div>
                )}

                {/* Featured Photo Badge if available */}
                {currentForm.galeria && currentForm.galeria.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1.5">
                      Portada Galería:
                    </span>
                    <img
                      src={currentForm.galeria.find(g => g.destacada)?.url || currentForm.galeria[0]?.url}
                      alt="Portada"
                      className="w-full h-24 rounded-xl object-cover border border-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* DIAN Header Preview */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-slate-400 space-y-1">
                <div className="text-center font-bold text-slate-300">
                  {currentForm.nombre.toUpperCase()}
                </div>
                <div className="text-center text-slate-500">
                  NIT: {currentForm.nit}
                </div>
                <div className="text-center text-slate-400">
                  {currentForm.ciudad}{currentForm.departamento ? `, ${currentForm.departamento}` : ''} • {currentForm.telefono}
                </div>
                <div className="text-center text-[9px] text-amber-500/80">
                  {currentForm.resolucionDian || 'Resolución DIAN Habilitada'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: LOGO & GESTIÓN DE MULTIMEDIA                           */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'logo' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                Logo Oficial del Negocio
              </h3>
              <p className="text-xs text-slate-400">
                Sube una imagen desde tu computador o especifica la URL pública del logo de tu restaurante.
              </p>
            </div>
            <button
              onClick={handleSaveToFirestore}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              Guardar Logo en Firestore
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Visual Preview Box */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 border border-slate-800 rounded-2xl text-center space-y-4">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Previsualización en Pantalla
              </span>

              <div className="relative group">
                <img
                  src={currentForm.logo || DEFAULT_NEGOCIO_INFO.logo}
                  alt="Logo del negocio"
                  className="w-36 h-36 rounded-3xl object-cover border-4 border-amber-500/30 shadow-2xl bg-slate-900 group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_NEGOCIO_INFO.logo;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-xl shadow-lg">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">{currentForm.nombre}</h4>
                <p className="text-xs text-amber-400 font-medium italic">"{currentForm.eslogan}"</p>
              </div>

              {/* Upload Trigger Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-400" />
                Subir Logo desde el Equipo
              </button>
            </div>

            {/* Inputs & Presets */}
            <div className="md:col-span-7 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  URL Directa del Logo (Web o CDN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentForm.logo}
                    onChange={(e) => setCurrentForm({ ...currentForm, logo: e.target.value })}
                    placeholder="https://ejemplo.com/logo-restaurante.png"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition font-mono"
                  />
                  <button
                    onClick={() => setCurrentForm({ ...currentForm, logo: DEFAULT_NEGOCIO_INFO.logo })}
                    className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Restablecer logo"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  O Elige una Plantilla de Logo Gastronómico
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_LOGOS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentForm({ ...currentForm, logo: preset.url });
                        showToast('Plantilla Seleccionada', `Aplicaste el estilo "${preset.name}".`, 'info');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer group ${
                        currentForm.logo === preset.url
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-14 h-14 rounded-lg object-cover mx-auto mb-2 group-hover:scale-105 transition"
                      />
                      <span className="text-[11px] font-bold text-slate-300 block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300/90 space-y-1">
                <strong className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" /> Consejo de Marca:
                </strong>
                <p>
                  Para una visualización nítida tanto en la carta digital como en las facturas DIAN y comandas térmicas, se recomienda una imagen cuadrada (1:1) de al menos 400x400 píxeles con fondo transparente o contrastado.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: GALERÍA DE FOTOS (CRUD COMPLETO)                       */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'galeria' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" />
                  CRUD de Galería
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  ({currentForm.galeria.length} fotos registradas)
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Galería Fotográfica del Restaurante
              </h3>
              <p className="text-xs text-slate-400">
                Sube fotos de tus platos, instalaciones, terraza y bar para deslumbrar a tus clientes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-agregar-foto-galeria"
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                Agregar Nueva Foto
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setGalleryFilter('Todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
                galleryFilter === 'Todas'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              Todas ({currentForm.galeria.length})
            </button>
            {CATEGORIAS_FOTOS.map((cat) => {
              const count = currentForm.galeria.filter(f => f.categoria?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <button
                  key={cat}
                  onClick={() => setGalleryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    galleryFilter === cat
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  {count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/30 font-mono">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Photos Grid */}
          {filteredFotos.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl p-8 space-y-3">
              <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-bold text-sm">No hay fotos en esta categoría</p>
              <p className="text-slate-500 text-xs max-w-sm mx-auto">
                Haz clic en "Agregar Nueva Foto" para incluir imágenes de platos, instalaciones o eventos.
              </p>
              <button
                onClick={() => setIsPhotoModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Subir Primera Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFotos.map((foto) => (
                <motion.div
                  key={foto.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg group hover:border-slate-700 transition flex flex-col"
                >
                  {/* Photo Container */}
                  <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={foto.url}
                      alt={foto.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500 cursor-pointer"
                      onClick={() => setLightboxPhoto(foto)}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80';
                      }}
                    />

                    {/* Category Tag */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-800 shadow">
                        {foto.categoria || 'General'}
                      </span>
                    </div>

                    {/* Featured Star Toggle */}
                    <button
                      onClick={() => handleToggleDestacada(foto.id)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition cursor-pointer ${
                        foto.destacada
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                          : 'bg-slate-950/70 text-slate-400 hover:text-amber-400'
                      }`}
                      title={foto.destacada ? 'Foto destacada (Portada)' : 'Marcar como destacada'}
                    >
                      <Star className={`w-4 h-4 ${foto.destacada ? 'fill-current' : ''}`} />
                    </button>

                    {/* Overlay on hover */}
                    <div 
                      onClick={() => setLightboxPhoto(foto)}
                      className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer pointer-events-none"
                    >
                      <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-1.5 shadow">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        Ver en Grande
                      </span>
                    </div>
                  </div>

                  {/* Photo Details & Actions */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm truncate">{foto.titulo}</h4>
                        {foto.destacada && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            Portada
                          </span>
                        )}
                      </div>
                      {foto.descripcion && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {foto.descripcion}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{foto.fecha || 'Reciente'}</span>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLightboxPhoto(foto)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                          title="Ver detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePhoto(foto.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition cursor-pointer"
                          title="Eliminar foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SEDES Y PERFILES REGISTRADOS                           */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'sedes' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                Sedes y Perfiles de Negocio en Firebase Firestore
              </h3>
              <p className="text-xs text-slate-400">
                Gestiona múltiples sedes o puntos de venta almacenados en la colección <code className="text-amber-400 font-mono">{NEGOCIO_INFO_COLLECTION}</code>.
              </p>
            </div>
            <button
              onClick={() => setIsNewSedeModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              Nueva Sede
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {negociosList.map((negocio) => (
              <div
                key={negocio.id}
                className={`p-5 rounded-2xl border transition relative space-y-3 ${
                  selectedId === negocio.id
                    ? 'bg-amber-500/5 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={negocio.logo || DEFAULT_NEGOCIO_INFO.logo}
                      alt={negocio.nombre}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm leading-snug">{negocio.nombre}</h4>
                      <span className="text-[11px] text-amber-400 font-medium italic block">{negocio.sede || 'Sede Principal'}</span>
                    </div>
                  </div>
                  {negocio.activa && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">
                      Activa
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                  <div><strong>NIT:</strong> <span className="font-mono text-slate-300">{negocio.nit}</span></div>
                  <div><strong>Ciudad:</strong> <span className="text-slate-300">{negocio.ciudad}</span></div>
                  <div><strong>Fotos:</strong> <span className="text-amber-400 font-bold">{negocio.galeria?.length || 0}</span></div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      handleSelectNegocio(negocio.id);
                      setActiveSubTab('info');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedId === negocio.id
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {selectedId === negocio.id ? 'Editando Ahora' : 'Seleccionar'}
                  </button>

                  {negociosList.length > 1 && (
                    <button
                      onClick={() => handleDeleteSede(negocio.id, negocio.nombre)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition cursor-pointer"
                      title="Eliminar Sede"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: AGREGAR FOTO A LA GALERÍA                              */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isPhotoModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  Agregar Foto a la Galería
                </h3>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Photo Preview if URL exists */}
              {newPhotoUrl ? (
                <div className="relative h-44 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={newPhotoUrl}
                    alt="Previsualización"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setNewPhotoUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-950/80 text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Cambiar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-slate-800 rounded-2xl text-center space-y-2">
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => photoFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    Subir Imagen del Equipo
                  </button>
                  <p className="text-[11px] text-slate-500">o ingresa un enlace web en el campo inferior</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    URL de la Imagen *
                  </label>
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Título de la Foto
                    </label>
                    <input
                      type="text"
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                      placeholder="Ej. Salón Principal VIP"
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Categoría
                    </label>
                    <select
                      value={newPhotoCat}
                      onChange={(e) => setNewPhotoCat(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {CATEGORIAS_FOTOS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Descripción Breve
                  </label>
                  <input
                    type="text"
                    value={newPhotoDesc}
                    onChange={(e) => setNewPhotoDesc(e.target.value)}
                    placeholder="Ej. Espacio para 40 comensales con cava de vinos..."
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="destacada-chk"
                    checked={newPhotoDestacada}
                    onChange={(e) => setNewPhotoDestacada(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
                  />
                  <label htmlFor="destacada-chk" className="text-xs text-slate-300 cursor-pointer font-medium">
                    Marcar como Foto Destacada (Portada)
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddPhoto}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Guardar Foto en Firestore
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREAR NUEVA SEDE / PERFIL DE NEGOCIO                   */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {isNewSedeModalOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  Registrar Nueva Sede o Negocio
                </h3>
                <button
                  onClick={() => setIsNewSedeModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nombre del Negocio o Sede *
                  </label>
                  <input
                    type="text"
                    value={newSedeName}
                    onChange={(e) => setNewSedeName(e.target.value)}
                    placeholder="Ej. Tasty Sede Zona T / Chicó Norte"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    NIT / Identificación Tributaria
                  </label>
                  <input
                    type="text"
                    value={newSedeNit}
                    onChange={(e) => setNewSedeNit(e.target.value)}
                    placeholder="Ej. 901.450.888-1"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={newSedeCiudad}
                    onChange={(e) => setNewSedeCiudad(e.target.value)}
                    placeholder="Ej. Medellín, Colombia"
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsNewSedeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateNewSede}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Crear Sede en Firestore
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: LIGHTBOX PARA VER FOTO EN ALTA DEFINICIÓN              */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {lightboxPhoto && (
          <div 
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl relative"
            >
              <div className="relative max-h-[70vh] bg-slate-950 flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxPhoto.url}
                  alt={lightboxPhoto.titulo}
                  className="max-h-[70vh] w-full object-contain"
                />
                <button
                  onClick={() => setLightboxPhoto(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {lightboxPhoto.categoria || 'General'}
                    </span>
                    {lightboxPhoto.destacada && (
                      <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> Portada
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-1">{lightboxPhoto.titulo}</h3>
                  {lightboxPhoto.descripcion && (
                    <p className="text-xs text-slate-400 mt-1">{lightboxPhoto.descripcion}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      handleToggleDestacada(lightboxPhoto.id);
                      setLightboxPhoto(prev => prev ? { ...prev, destacada: !prev.destacada } : null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      lightboxPhoto.destacada
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${lightboxPhoto.destacada ? 'fill-current' : ''}`} />
                    {lightboxPhoto.destacada ? 'Destacada' : 'Marcar Destacada'}
                  </button>
                  <button
                    onClick={() => {
                      handleDeletePhoto(lightboxPhoto.id);
                      setLightboxPhoto(null);
                    }}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                    title="Eliminar Foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
