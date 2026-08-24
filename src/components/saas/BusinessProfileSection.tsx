import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  QrCode, 
  KeyRound, 
  Landmark, 
  Smartphone, 
  Upload, 
  Check, 
  Copy, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { 
  MileniaBusinessProfile, 
  getBusinessProfile, 
  saveBusinessProfile, 
  subscribeToBusinessProfile,
  DEFAULT_BUSINESS_PROFILE
} from '../../services/mileniaBusinessService';
import { formatCop } from '../../utils/currency';

interface BusinessProfileSectionProps {
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const BusinessProfileSection: React.FC<BusinessProfileSectionProps> = ({ showToast }) => {
  const [profile, setProfile] = useState<MileniaBusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<{ [key: string]: boolean }>({});

  const qrNequiInputRef = useRef<HTMLInputElement>(null);
  const qrDaviplataInputRef = useRef<HTMLInputElement>(null);
  const qrBancolombiaInputRef = useRef<HTMLInputElement>(null);
  const qrBreveInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let unsubscribe = () => {};
    const init = async () => {
      setLoading(true);
      const data = await getBusinessProfile();
      setProfile(data);
      setLoading(false);

      unsubscribe = subscribeToBusinessProfile((updated) => {
        setProfile(updated);
      });
    };

    init();
    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast('Copiado', `${label} copiado al portapapeles.`, 'success');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleKeyVisibility = (keyName: string) => {
    setVisibleKeys(prev => ({ ...prev, [keyName]: !prev[keyName] }));
  };

  // Convert uploaded image to Data URL for instant rendering & Firestore persistence
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    field: 'qrNequiUrl' | 'qrDaviplataUrl' | 'qrBancolombiaUrl' | 'qrBreveUrl',
    name: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Archivo no válido', 'Por favor selecciona un archivo de imagen (PNG, JPG, WEBP).', 'warning');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Archivo muy grande', 'El tamaño máximo permitido es 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfile(prev => ({
        ...prev,
        [field]: dataUrl
      }));
      showToast('Código QR Cargado', `QR de ${name} listo para guardar en Firestore.`, 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveBusinessProfile(profile);
      showToast('Perfil de Negocio Guardado', 'Información de Milenia, Códigos QR y Llaves Breve actualizadas en Firestore (/negocio).', 'success');
    } catch (err) {
      showToast('Error', 'No se pudo guardar la información del negocio.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-mono text-slate-400">Cargando perfil de negocio Milenia desde Firestore...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>TABLA FIRESTORE /negocio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Perfil del Negocio Milenia
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Datos corporativos oficiales de la plataforma Milenia, códigos QR de recaudo para aliados gastronómicos y llaves Breve interoperables (Banco de la República / Redes Digitales).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-950/70 border border-amber-500/20 text-right">
              <p className="text-[10px] text-slate-400 font-mono uppercase">NIT Corporativo</p>
              <p className="text-sm font-mono font-bold text-amber-400">{profile.nit || '901.450.888-1'}</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* ========================================================================= */}
        {/* 1. INFORMACIÓN CORPORATIVA GENERAL DE MILENIA                             */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Datos e Información Oficial de Milenia</h2>
              <p className="text-xs text-slate-400 font-mono">Identidad legal, contacto y presencia comercial</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Razón Social Legal *</label>
              <input
                type="text"
                required
                value={profile.legalName}
                onChange={(e) => setProfile({ ...profile, legalName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Nombre Comercial / Marca *</label>
              <input
                type="text"
                required
                value={profile.brandName}
                onChange={(e) => setProfile({ ...profile, brandName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">NIT / RUT *</label>
              <input
                type="text"
                required
                value={profile.nit}
                onChange={(e) => setProfile({ ...profile, nit: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Correo Electrónico de Contacto *</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Teléfono WhatsApp de Atención *</label>
              <input
                type="text"
                required
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Sitio Web Oficial</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-medium mb-1">Dirección Corporativa</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Ciudad y País</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-400 font-medium mb-1">Descripción del Negocio</label>
              <textarea
                rows={2}
                value={profile.description}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-amber-500 transition"
              ></textarea>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CÓDIGOS QR DE PAGO (NEQUI, DAVIPLATA, CUENTA BANCARIA, BREVE)         */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Códigos QR de Pago y Recaudo</h2>
                <p className="text-xs text-slate-400 font-mono">Sube las imágenes de los códigos QR para Nequi, Daviplata, Bancolombia y Breve</p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
              Soporte PNG, JPG & WEBP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* QR NEQUI */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4 hover:border-purple-500/40 transition">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-purple-400 tracking-wider font-mono">NEQUI</span>
                <span className="text-[10px] text-slate-500 font-mono">Billetera</span>
              </div>

              <div className="w-36 h-36 rounded-2xl bg-slate-900 border-2 border-dashed border-purple-500/30 flex items-center justify-center overflow-hidden relative group">
                {profile.qrNequiUrl ? (
                  <img 
                    src={profile.qrNequiUrl} 
                    alt="QR Nequi" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500 p-2">
                    <QrCode className="w-8 h-8 opacity-60 text-purple-400" />
                    <span className="text-[10px]">Sin código QR</span>
                  </div>
                )}

                <div 
                  onClick={() => qrNequiInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-purple-400 text-xs font-bold cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  <span>Cambiar QR</span>
                </div>
              </div>

              <input
                ref={qrNequiInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'qrNequiUrl', 'Nequi')}
              />

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => qrNequiInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profile.qrNequiUrl ? 'Reemplazar QR' : 'Subir QR Nequi'}</span>
                </button>
                {profile.qrNequiUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, qrNequiUrl: '' })}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>

            {/* QR DAVIPLATA */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4 hover:border-rose-500/40 transition">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-rose-400 tracking-wider font-mono">DAVIPLATA</span>
                <span className="text-[10px] text-slate-500 font-mono">Billetera</span>
              </div>

              <div className="w-36 h-36 rounded-2xl bg-slate-900 border-2 border-dashed border-rose-500/30 flex items-center justify-center overflow-hidden relative group">
                {profile.qrDaviplataUrl ? (
                  <img 
                    src={profile.qrDaviplataUrl} 
                    alt="QR Daviplata" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500 p-2">
                    <QrCode className="w-8 h-8 opacity-60 text-rose-400" />
                    <span className="text-[10px]">Sin código QR</span>
                  </div>
                )}

                <div 
                  onClick={() => qrDaviplataInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-rose-400 text-xs font-bold cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  <span>Cambiar QR</span>
                </div>
              </div>

              <input
                ref={qrDaviplataInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'qrDaviplataUrl', 'Daviplata')}
              />

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => qrDaviplataInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profile.qrDaviplataUrl ? 'Reemplazar QR' : 'Subir QR Daviplata'}</span>
                </button>
                {profile.qrDaviplataUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, qrDaviplataUrl: '' })}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>

            {/* QR BANCOLOMBIA / CUENTA */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4 hover:border-amber-500/40 transition">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 tracking-wider font-mono">BANCOLOMBIA</span>
                <span className="text-[10px] text-slate-500 font-mono">Cuenta Bancaria</span>
              </div>

              <div className="w-36 h-36 rounded-2xl bg-slate-900 border-2 border-dashed border-amber-500/30 flex items-center justify-center overflow-hidden relative group">
                {profile.qrBancolombiaUrl ? (
                  <img 
                    src={profile.qrBancolombiaUrl} 
                    alt="QR Bancolombia" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500 p-2">
                    <QrCode className="w-8 h-8 opacity-60 text-amber-400" />
                    <span className="text-[10px]">Sin código QR</span>
                  </div>
                )}

                <div 
                  onClick={() => qrBancolombiaInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-amber-400 text-xs font-bold cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  <span>Cambiar QR</span>
                </div>
              </div>

              <input
                ref={qrBancolombiaInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'qrBancolombiaUrl', 'Bancolombia')}
              />

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => qrBancolombiaInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profile.qrBancolombiaUrl ? 'Reemplazar QR' : 'Subir QR Bancario'}</span>
                </button>
                {profile.qrBancolombiaUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, qrBancolombiaUrl: '' })}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>

            {/* QR BREVE / SISTEMA INTEROPERABLE BANCO DE LA REPÚBLICA */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-between text-center space-y-4 hover:border-emerald-500/40 transition">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-black text-emerald-400 tracking-wider font-mono">BREVE / QR ÚNICO</span>
                <span className="text-[10px] text-emerald-400/80 font-mono font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">2026</span>
              </div>

              <div className="w-36 h-36 rounded-2xl bg-slate-900 border-2 border-dashed border-emerald-500/30 flex items-center justify-center overflow-hidden relative group">
                {profile.qrBreveUrl ? (
                  <img 
                    src={profile.qrBreveUrl} 
                    alt="QR Breve Interoperable" 
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-slate-500 p-2">
                    <Sparkles className="w-8 h-8 opacity-60 text-emerald-400" />
                    <span className="text-[10px]">QR Interoperable Breve</span>
                  </div>
                )}

                <div 
                  onClick={() => qrBreveInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 text-emerald-400 text-xs font-bold cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  <span>Cambiar QR</span>
                </div>
              </div>

              <input
                ref={qrBreveInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'qrBreveUrl', 'Breve Interoperable')}
              />

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => qrBreveInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{profile.qrBreveUrl ? 'Reemplazar QR' : 'Subir QR Breve'}</span>
                </button>
                {profile.qrBreveUrl && (
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, qrBreveUrl: '' })}
                    className="text-[10px] text-rose-400 hover:underline cursor-pointer"
                  >
                    Quitar imagen
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LLAVES DE BREVE & BILLETERAS DIGITALES (INTEROPERABILIDAD 2026)        */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Llaves de Breve y Billeteras Digitales</h2>
                <p className="text-xs text-slate-400 font-mono">Llaves alfanuméricas, identificadores Transfiya y sistema interoperable Breve</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Interoperabilidad BanRep
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            
            {/* LLAVE BREVE SISTEMA INTEROPERABLE */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">Llave Breve Interoperable (ID Comercial)</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Breve BanRep 2026
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys['breve'] ? 'text' : 'password'}
                    value={profile.digitalKeys?.qrBreveInteroperableKey || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      digitalKeys: { ...profile.digitalKeys, qrBreveInteroperableKey: e.target.value }
                    })}
                    placeholder="BREVE-MILENIA-901450888-COL"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('breve')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {visibleKeys['breve'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(profile.digitalKeys?.qrBreveInteroperableKey || '', 'Llave Breve')}
                  className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedKey === 'Llave Breve' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>Copiar</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Esta llave permite a cualquier restaurante o usuario pagar a Milenia desde cualquier banco o app utilizando el sistema nacional Breve.
              </p>
            </div>

            {/* LLAVE NEQUI */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-purple-400" />
                  <span>Llave / Teléfono Nequi</span>
                </span>
                <span className="text-[10px] text-purple-400 font-mono">Billetera</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys['nequi'] ? 'text' : 'password'}
                    value={profile.digitalKeys?.nequiKey || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      digitalKeys: { ...profile.digitalKeys, nequiKey: e.target.value }
                    })}
                    placeholder="3043470984"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-purple-300 font-mono text-xs focus:outline-none focus:border-purple-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('nequi')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {visibleKeys['nequi'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(profile.digitalKeys?.nequiKey || '', 'Llave Nequi')}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'Llave Nequi' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LLAVE DAVIPLATA */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <span>Llave / Teléfono Daviplata</span>
                </span>
                <span className="text-[10px] text-rose-400 font-mono">Billetera</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys['daviplata'] ? 'text' : 'password'}
                    value={profile.digitalKeys?.daviplataKey || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      digitalKeys: { ...profile.digitalKeys, daviplataKey: e.target.value }
                    })}
                    placeholder="3043470984"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-rose-300 font-mono text-xs focus:outline-none focus:border-rose-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('daviplata')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {visibleKeys['daviplata'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(profile.digitalKeys?.daviplataKey || '', 'Llave Daviplata')}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'Llave Daviplata' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LLAVE TRANSFIYA */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Llave Transfiya (Celular Vinculado)</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">Red ACH</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys['transfiya'] ? 'text' : 'password'}
                    value={profile.digitalKeys?.transfiyaKey || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      digitalKeys: { ...profile.digitalKeys, transfiyaKey: e.target.value }
                    })}
                    placeholder="3043470984"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-cyan-300 font-mono text-xs focus:outline-none focus:border-cyan-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('transfiya')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {visibleKeys['transfiya'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(profile.digitalKeys?.transfiyaKey || '', 'Llave Transfiya')}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'Llave Transfiya' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* LLAVE DALE / MOVII / OTRAS */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Llave Dale / Movii</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Billetera</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={visibleKeys['dale'] ? 'text' : 'password'}
                    value={profile.digitalKeys?.daleKey || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      digitalKeys: { ...profile.digitalKeys, daleKey: e.target.value }
                    })}
                    placeholder="3043470984"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('dale')}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-white cursor-pointer"
                  >
                    {visibleKeys['dale'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(profile.digitalKeys?.daleKey || '', 'Llave Dale')}
                  className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'Llave Dale' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CUENTA BANCARIA PRINCIPAL DE RECAUDO MILENIA                           */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Cuenta Bancaria Principal</h2>
              <p className="text-xs text-slate-400 font-mono">Datos bancarios para transferencias directas y consignaciones de suscripciones</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Entidad Bancaria *</label>
              <input
                type="text"
                required
                value={profile.bankAccount?.bankName || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  bankAccount: { ...profile.bankAccount, bankName: e.target.value }
                })}
                placeholder="Bancolombia"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Tipo de Cuenta *</label>
              <select
                value={profile.bankAccount?.accountType || 'Ahorros'}
                onChange={(e) => setProfile({
                  ...profile,
                  bankAccount: { ...profile.bankAccount, accountType: e.target.value as any }
                })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 transition"
              >
                <option value="Ahorros">Cuenta de Ahorros</option>
                <option value="Corriente">Cuenta Corriente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Número de Cuenta *</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={profile.bankAccount?.accountNumber || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    bankAccount: { ...profile.bankAccount, accountNumber: e.target.value }
                  })}
                  placeholder="912-847291-04"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono focus:outline-none focus:border-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(profile.bankAccount?.accountNumber || '', 'Número de Cuenta')}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Titular de la Cuenta *</label>
              <input
                type="text"
                required
                value={profile.bankAccount?.accountHolder || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  bankAccount: { ...profile.bankAccount, accountHolder: e.target.value }
                })}
                placeholder="Andrés Camilo Vidal Canchón / Milenia S.A.S."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Documento / Cédula / NIT Titular *</label>
              <input
                type="text"
                required
                value={profile.bankAccount?.holderDocument || ''}
                onChange={(e) => setProfile({
                  ...profile,
                  bankAccount: { ...profile.bankAccount, holderDocument: e.target.value }
                })}
                placeholder="1085312034"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Botón de Guardado */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Guardando en Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Perfil de Negocio en Firestore (/negocio)</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
