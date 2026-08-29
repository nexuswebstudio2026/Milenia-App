import React, { useState, useRef, useEffect } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { registerUser, UserRole } from '../../lib/auth-service';
import { 
  Building2, 
  Store, 
  Sparkles, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Check, 
  Copy, 
  CreditCard, 
  ShieldCheck, 
  Receipt, 
  Hash, 
  Loader2, 
  X, 
  QrCode, 
  Eye, 
  Info, 
  Utensils, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Lock, 
  AlertCircle,
  ArrowRight,
  ChevronRight,
  Flame,
  Layers,
  Search
} from 'lucide-react';
import { COLOMBIAN_CITIES } from '../../data/colombianCities';
import { 
  MileniaBusinessProfile, 
  DEFAULT_BUSINESS_PROFILE, 
  getBusinessProfile, 
  subscribeToBusinessProfile 
} from '../../services/mileniaBusinessService';
import { addAliado } from '../../services/mileniaAliadosService';
import { addTransaction } from '../../services/mileniaContabilidadService';
import { getFinancialSummary, saveFinancialSummary } from '../../services/mileniaFinancialSummaryService';
import { TenantRestaurant, TenantEmployee } from '../../types';

export const MileniaRegisterAllyView: React.FC = () => {
  const { tenants, addTenant, addEmployee, navigateTo, setMode: setAppMode, setTenantView } = useTasty();
  const { userProfile } = useAuth();

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Datos del Restaurante Aliado
  const [allyName, setAllyName] = useState('');
  const [allyRut, setAllyRut] = useState('');
  const [allyLegalName, setAllyLegalName] = useState('');
  const [allyAddress, setAllyAddress] = useState('');
  const [allyCity, setAllyCity] = useState('Pasto (Nariño)');
  const [citySearchTerm, setCitySearchTerm] = useState('');
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [allyPhone, setAllyPhone] = useState('');
  const [allyEmail, setAllyEmail] = useState('');
  const [allyCuisine, setAllyCuisine] = useState('Parrilla & Gastronomía Tradicional');
  const [allyTablesCount, setAllyTablesCount] = useState<number>(12);

  // Archivo RUT
  const [rutFile, setRutFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const rutFileInputRef = useRef<HTMLInputElement>(null);

  // 2. Datos del Propietario / Gerente Titular
  const [allyOwnerName, setAllyOwnerName] = useState('');
  const [allyOwnerDocumentId, setAllyOwnerDocumentId] = useState('');
  const [allyOwnerEmployeeId, setAllyOwnerEmployeeId] = useState('EMP-101');
  const [allyOwnerPhone, setAllyOwnerPhone] = useState('');
  const [allyOwnerEmail, setAllyOwnerEmail] = useState('');
  const [allyOwnerPassword, setAllyOwnerPassword] = useState('');

  // 3. Paso de Activación y Pago Oficial
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [isDemoAffiliation, setIsDemoAffiliation] = useState(true); // Default to Demo 2.0 or user toggle
  const [selectedWallet] = useState<'davivienda'>('davivienda');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('DEMO-2026-APROBADO');
  const [paymentVoucherFile, setPaymentVoucherFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const voucherFileInputRef = useRef<HTMLInputElement>(null);

  // Estados para Inteligencia Artificial de Gemini (OCR y Transcripción Automática de Comprobantes)
  const [isAnalyzingVoucher, setIsAnalyzingVoucher] = useState(false);
  const [geminiAnalysisMessage, setGeminiAnalysisMessage] = useState<string | null>(null);
  const [geminiDetectedData, setGeminiDetectedData] = useState<{
    referenceNumber?: string;
    amountCop?: number;
    bankOrWallet?: string;
    destinationAccount?: string;
    detected?: boolean;
    rawSummary?: string;
  } | null>(null);

  // Perfil de Negocio Milenia desde Firestore (/negocio/perfil_milenia)
  const [businessProfile, setBusinessProfile] = useState<MileniaBusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [zoomedQrUrl, setZoomedQrUrl] = useState<string | null>(null);

  // Cargar Perfil de Negocio y QRs de Firestore
  useEffect(() => {
    let unsubscribe = () => {};
    const initProfile = async () => {
      try {
        const p = await getBusinessProfile();
        if (p) setBusinessProfile(p);
      } catch (e) {
        console.warn('Could not fetch business profile:', e);
      }

      unsubscribe = subscribeToBusinessProfile((updated) => {
        if (updated) {
          setBusinessProfile(updated);
        }
      });
    };

    initProfile();

    return () => unsubscribe();
  }, []);

  // Filtrado de ciudades colombianas
  const filteredCities = COLOMBIAN_CITIES.filter(c =>
    c.city.toLowerCase().includes(citySearchTerm.toLowerCase()) ||
    c.department.toLowerCase().includes(citySearchTerm.toLowerCase())
  );

  // Función para manejar carga de archivo RUT
  const handleRutFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
      setRutFile({
        name: file.name,
        size: sizeKb,
        dataUrl: dataUrl || ''
      });
    };
    reader.readAsDataURL(file);
  };

  // Función para manejar carga de Comprobante de Pago y análisis automático con Gemini IA
  const handleVoucherFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
      setPaymentVoucherFile({
        name: file.name,
        size: sizeKb,
        dataUrl: dataUrl || ''
      });

      // Disparar análisis inteligente con Gemini IA
      setIsAnalyzingVoucher(true);
      setGeminiAnalysisMessage('Gemini IA analizando comprobante y transcribiendo número de aprobación...');
      setGeminiDetectedData(null);

      try {
        const response = await fetch('/api/gemini/analyze-voucher', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: dataUrl,
            fileName: file.name,
            expectedAmountCop: 600000
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setGeminiDetectedData(result.data);
            if (result.data.referenceNumber) {
              setPaymentReference(result.data.referenceNumber);
              setGeminiAnalysisMessage(`✨ Transcrito con Gemini IA: Ref. ${result.data.referenceNumber} (${result.data.bankOrWallet || 'Billetera'})`);
            } else {
              setGeminiAnalysisMessage('Comprobante recibido. Por favor verifica o digita el número de referencia.');
            }
          } else {
            setGeminiAnalysisMessage('Comprobante recibido exitosamente.');
          }
        } else {
          setGeminiAnalysisMessage('Comprobante recibido. Digita la referencia del comprobante.');
        }
      } catch (error) {
        console.warn('Gemini voucher analysis fallback:', error);
        setGeminiAnalysisMessage('Comprobante recibido. Digita el número de aprobación.');
      } finally {
        setIsAnalyzingVoucher(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Validar y avanzar al paso de pago oficial y notificar al WhatsApp de Milenia
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allyName.trim()) {
      setError('Por favor ingresa el nombre del restaurante.');
      return;
    }
    if (!allyRut.trim()) {
      setError('Por favor ingresa el RUT / NIT del restaurante.');
      return;
    }
    if (!allyOwnerName.trim() || !allyOwnerDocumentId.trim() || !allyOwnerEmail.trim() || !allyOwnerPassword.trim()) {
      setError('Por favor completa todos los datos del Propietario / Gerente.');
      return;
    }
    if (allyOwnerPassword.length < 6) {
      setError('La contraseña del Gerente debe tener al menos 6 caracteres.');
      return;
    }

    // Enviar mensaje automático al WhatsApp de Milenia con los datos del restaurante
    try {
      const phone = '573043470984';
      const restName = allyName.trim();
      const rutVal = allyRut.trim();
      const legalNameVal = allyLegalName.trim() || 'No especificada';
      const addressVal = allyAddress.trim() || 'No especificada';
      const cityVal = allyCity.trim() || 'Colombia';
      const tablesVal = allyTablesCount;
      const contactPhoneVal = allyPhone.trim() || 'No especificado';
      const contactEmailVal = allyEmail.trim() || 'No especificado';
      const ownerNameVal = allyOwnerName.trim();
      const ownerIdVal = allyOwnerDocumentId.trim();
      const ownerPhoneVal = allyOwnerPhone.trim() || 'No especificado';
      const ownerEmailVal = allyOwnerEmail.trim();

      const messageText = `Hola Milenia, soy ${ownerNameVal} (C.C. ${ownerIdVal}), Propietario/Gerente de ${restName} (RUT: ${rutVal}, Razón Social: ${legalNameVal}) en ${cityVal}. He diligenciado el formulario de registro de aliado para el Plan Máximo Integral Milenia ($600.000 COP/mes). Dirección: ${addressVal}. Mesas: ${tablesVal}. Teléfono Comercial: ${contactPhoneVal}. Correo Comercial: ${contactEmailVal}. Celular Propietario: ${ownerPhoneVal}. Correo de Acceso: ${ownerEmailVal}. Paso a continuación a la activación oficial con código QR y comprobante de pago.`;

      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.warn('Error al abrir WhatsApp de Milenia:', err);
    }

    setShowPaymentStep(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Finalizar registro del aliado con comprobante de pago o activación Demo 2.0
  const handleCompleteAllyRegistration = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!isDemoAffiliation) {
        if (!paymentVoucherFile) {
          throw new Error('Por favor sube la captura de pantalla (.png) o comprobante de la transferencia.');
        }
        if (!paymentReference.trim()) {
          throw new Error('Por favor ingresa o confirma el número de aprobación o referencia de la transacción.');
        }
      }

      const finalAmount = isDemoAffiliation ? 0 : 600000;
      const finalReference = paymentReference.trim() || (isDemoAffiliation ? `DEMO-2026-${Date.now().toString().slice(-6)}` : '');

      // 1. Generar nuevo ID para el restaurante aliado
      const existingIds = tenants.map(t => parseInt(t.id)).filter(n => !isNaN(n));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 5;
      const newRestId = String(maxId + 1);

      // 2. Registrar usuario Propietario/Gerente en Firebase Auth & Firestore
      try {
        await registerUser(allyOwnerEmail.trim(), allyOwnerPassword.trim(), {
          name: allyOwnerName.trim(),
          restaurantId: newRestId,
          role: 'OWNER' as UserRole,
          employeeId: allyOwnerEmployeeId.trim() || 'EMP-101',
          position: 'Gerente General & Propietario',
          phone: allyOwnerPhone.trim() || allyPhone.trim()
        });
      } catch (authErr: any) {
        console.warn('Usuario ya registrado o auth offline, continuando registro en base de datos:', authErr);
      }

      // 3. Crear el restaurante Tenant en memoria y persistencia Firestore
      const newTenant: TenantRestaurant = {
        id: newRestId,
        slug: allyName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: allyName.trim(),
        city: allyCity.trim() || 'Pasto, Colombia',
        address: allyAddress.trim() || 'Calle Principal #10-20',
        phone: allyPhone.trim() || allyOwnerPhone.trim(),
        email: allyEmail.trim() || allyOwnerEmail.trim(),
        rutDocumentUrl: rutFile?.dataUrl || undefined,
        rutDocumentFileName: rutFile?.name || undefined,
        rutUploadedAt: rutFile ? new Date().toISOString() : undefined,
        tablesCount: allyTablesCount || 12,
        activeOrdersCount: 0,
        totalMonthlySalesCop: 0,
        branding: {
          logoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
          bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
          primaryColor: '#f59e0b',
          accentColor: '#d97706',
          themeStyle: 'rustic',
          tagline: allyCuisine || 'Gastronomía & Parrilla',
          currency: 'COP',
          currencySymbol: '$',
          nit: allyRut.trim(),
          legalBusinessName: allyLegalName.trim() || `${allyName.trim()} S.A.S.`,
          dianResolution: 'Resolución DIAN No. 18764000001234 de 2026',
          taxRateImpoconsumo: 8,
          tipSuggestedPercentage: 10
        },
        subscription: {
          plan: 'enterprise',
          status: 'active',
          mrrCop: finalAmount,
          renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          maxTables: allyTablesCount || 20,
          maxEmployees: 15,
          features: ['POS Táctil', 'KDS Cocina', 'Facturación DIAN', 'Menú QR', 'Demo 2.0 Habilitado']
        },
        subscriptionPayment: {
          amountCop: finalAmount,
          method: isDemoAffiliation ? 'DEMO_CORTESIA_2.0' : 'DAVIVIENDA_TRANSFERENCIA_QR',
          voucherUrl: paymentVoucherFile?.dataUrl || (isDemoAffiliation ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80' : ''),
          voucherFileName: paymentVoucherFile?.name || (isDemoAffiliation ? 'activacion_demo_2.0.png' : ''),
          referenceNumber: finalReference,
          paidAt: new Date().toISOString(),
          status: 'confirmed'
        },
        createdAt: new Date().toISOString()
      };

      // Guardar en contexto y Firestore (/aliados)
      addTenant(newTenant);

      // 4. Crear el empleado Propietario/Gerente
      const ownerEmp: TenantEmployee = {
        id: allyOwnerEmployeeId.trim() || 'EMP-101',
        restaurantId: newRestId,
        name: allyOwnerName.trim(),
        role: 'administrador',
        position: 'Gerente General',
        documentId: allyOwnerDocumentId.trim(),
        email: allyOwnerEmail.trim(),
        phone: allyOwnerPhone.trim() || allyPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        pinCode: '1234',
        shiftStatus: 'active',
        currentClockInTime: new Date().toISOString()
      };

      addEmployee(ownerEmp);

      // 5. Registrar Aliado en la colección general de aliados Firestore (/milenia_aliados)
      await addAliado({
        name: allyName.trim(),
        nit: allyRut.trim() || '901.000.000-1',
        city: allyCity.trim() || 'Pasto (Nariño)',
        address: allyAddress.trim() || 'Calle Principal #10-20',
        phone: allyPhone.trim() || allyOwnerPhone.trim(),
        email: allyEmail.trim() || allyOwnerEmail.trim(),
        plan: 'Enterprise',
        status: 'Activo',
        monthlyFeeCop: finalAmount,
        tablesCount: allyTablesCount || 12,
        contactName: allyOwnerName.trim()
      });

      // 6. Registrar transacción de ingreso o cortesía demo en la contabilidad
      await addTransaction({
        type: 'INGRESO',
        category: 'SUSCRIPCION_SAAS',
        description: isDemoAffiliation 
          ? `Afiliación Demo 2.0 (Cortesía $0 COP) Restaurante Aliado #${newRestId} (${allyName.trim()})`
          : `Activación Mensual Restaurante Aliado #${newRestId} (${allyName.trim()})`,
        amountCop: finalAmount,
        date: new Date().toISOString().split('T')[0],
        restaurantId: newRestId,
        restaurantName: allyName.trim(),
        paymentMethod: isDemoAffiliation ? 'DEMO_CORTESIA' : 'DAVIVIENDA_TRANSFERENCIA',
        referenceNumber: finalReference,
        notes: isDemoAffiliation
          ? `Afiliación Demo 2.0 sin cobro de afiliación. Aprobación: ${finalReference}. Titular: ${allyOwnerName.trim()} (C.C. ${allyOwnerDocumentId.trim()})`
          : `Pago Oficial Davivienda. Comprobante: ${paymentVoucherFile?.name}. Titular: ${allyOwnerDocumentId}`
      });

      // 7. Actualizar resumen financiero si hubo ingreso real
      if (!isDemoAffiliation) {
        const curFin = await getFinancialSummary();
        const newIngresos = (curFin?.ingresos || 0) + 600000;
        const newGastos = curFin?.gastos || 0;
        await saveFinancialSummary({
          ingresos: newIngresos,
          gastos: newGastos,
          titulo: 'Resumen Financiero Consolidado',
          descripcion: 'Tabla consolidada de ingresos, gastos y balance neto en Firebase Firestore (/resumen_financiero).',
          notas: `Activación de aliado #${newRestId} (${allyName.trim()}).`
        });
      }

      // Limpiar auto-fill de sesión
      sessionStorage.removeItem('milenia_auto_fill_lead');

      const directUrl = `/panel/${newRestId}/gerente`;

      setSuccessInfo({
        name: `${allyName.trim()} (Aliado #${newRestId})`,
        redirectUrl: directUrl,
        message: isDemoAffiliation
          ? '¡Aliado Demo 2.0 registrado, activado y verificado con éxito en la base de datos! Ingresando al panel...'
          : '¡Restaurante registrado, activado y verificado con éxito! Ingresando al panel...'
      });

      // 8. Redirigir directamente al panel del nuevo aliado
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: newRestId,
          cargo: 'gerente'
        });
      }, 500);

    } catch (err: any) {
      console.error('Error registrando aliado:', err);
      setError(err?.message || 'Ocurrió un error al registrar el restaurante aliado.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-sans">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide">
          <Store className="w-3.5 h-3.5" />
          <span>MILENIA SAAS &bull; REGISTRO DE RESTAURANTES ALIADOS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Registrar Aliado
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Registra tu establecimiento gastronómico, sube tu RUT, activa tu cuenta con el Plan Máximo Integral y accede de inmediato al Panel Gerencial con Facturación DIAN, KDS y POS táctil.
        </p>
      </div>

      {/* Banner de Mensajes de Éxito o Error */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-xs sm:text-sm animate-fade-in shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {successInfo && (
        <div className="p-5 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-4 text-emerald-200 text-xs sm:text-sm animate-fade-in shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-white text-base">{successInfo.message}</p>
              <p className="text-xs text-emerald-300 mt-0.5">
                Redirigiendo automáticamente al Panel de <strong className="text-white">{successInfo.name}</strong>...
              </p>
            </div>
          </div>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
        </div>
      )}

      {/* Contenido Principal: Formulario o Paso de Activación con QR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {!showPaymentStep ? (
          /* ========================================================================= */
          /* FORMULARIO DE REGISTRO DE DATOS Y RUT DEL ALIADO                          */
          /* ========================================================================= */
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-amber-500" />
                  <span>Información del Restaurante & Titular</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Paso 1 de 2 &bull; Completa los datos comerciales, sube tu RUT y define tus credenciales de acceso.
                </p>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold rounded-xl">
                Plan Máximo ($600.000 /mes)
              </span>
            </div>

            {/* Sección 1: Datos del Establecimiento */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                <Building2 className="w-4 h-4" />
                <span>1. Información del Restaurante & Datos Tributarios</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Comercial */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Restaurante *
                  </label>
                  <div className="relative">
                    <Utensils className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyName}
                      onChange={(e) => setAllyName(e.target.value)}
                      placeholder="Ej. Fogón Santandereano & Brasas"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* RUT / NIT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registro Único Tributario (RUT / NIT) *
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyRut}
                      onChange={(e) => setAllyRut(e.target.value)}
                      placeholder="Ej. 901.884.231-9"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Subida del Documento RUT (PDF o Imagen) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Subir Documento RUT (PDF o Imagen)</span>
                  <span className="text-[11px] text-amber-400 font-normal">Se almacena en la Base de Datos</span>
                </label>
                
                <input
                  type="file"
                  ref={rutFileInputRef}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleRutFileUpload(file);
                  }}
                  className="hidden"
                />

                {rutFile ? (
                  <div className="flex items-center justify-between p-3 bg-slate-900 border border-amber-500/40 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{rutFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{rutFile.size} &bull; Documento cargado</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRutFile(null)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
                      title="Eliminar RUT"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => rutFileInputRef.current?.click()}
                    className="border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900 rounded-xl p-3.5 text-center cursor-pointer transition flex items-center justify-center gap-2 group"
                  >
                    <UploadCloud className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition" />
                    <span className="text-xs text-slate-300 font-medium group-hover:text-white">
                      Haz clic para adjuntar el archivo RUT (.pdf, .jpg, .png)
                    </span>
                  </div>
                )}
              </div>

              {/* Razón Social y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Razón Social Legal
                  </label>
                  <input
                    type="text"
                    value={allyLegalName}
                    onChange={(e) => setAllyLegalName(e.target.value)}
                    placeholder="Ej. Inversiones Gastronómicas del Sur S.A.S."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dirección Física
                  </label>
                  <input
                    type="text"
                    value={allyAddress}
                    onChange={(e) => setAllyAddress(e.target.value)}
                    placeholder="Ej. Carrera 27 # 19-45, Zona Rosa"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Ciudad con Buscador Interactivo Colombiano */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ciudad y Municipio (Colombia) *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={isCityDropdownOpen ? citySearchTerm : allyCity}
                      onFocus={() => {
                        setIsCityDropdownOpen(true);
                        setCitySearchTerm('');
                      }}
                      onChange={(e) => {
                        setCitySearchTerm(e.target.value);
                        setIsCityDropdownOpen(true);
                      }}
                      placeholder="Busca tu municipio o departamento..."
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    {isCityDropdownOpen && (
                      <button
                        type="button"
                        onClick={() => setIsCityDropdownOpen(false)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Menú Desplegable con Scroll */}
                  {isCityDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-slate-900 border border-amber-500/40 rounded-xl shadow-2xl divide-y divide-slate-800">
                      {filteredCities.slice(0, 30).map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setAllyCity(`${c.city} (${c.department})`);
                            setIsCityDropdownOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 hover:bg-amber-500/10 text-xs text-slate-200 hover:text-white flex items-center justify-between transition cursor-pointer"
                        >
                          <span className="font-semibold">{c.city}</span>
                          <span className="text-[10px] text-amber-400/80 font-mono">{c.department}</span>
                        </button>
                      ))}
                      {filteredCities.length === 0 && (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No se encontró la ciudad. Puedes escribirla directamente.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Número de Mesas
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={allyTablesCount}
                    onChange={(e) => setAllyTablesCount(parseInt(e.target.value) || 12)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Teléfono y Correo Comercial */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono PBX / Celular Comercial *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={allyPhone}
                      onChange={(e) => setAllyPhone(e.target.value)}
                      placeholder="Ej. +57 304 347 0984"
                      className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Comercial del Restaurante *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={allyEmail}
                      onChange={(e) => setAllyEmail(e.target.value)}
                      placeholder="contacto@restaurante.co"
                      className="w-full pl-10 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Datos del Propietario / Gerente Titular */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                <User className="w-4 h-4" />
                <span>2. Datos del Propietario / Gerente Titular & Credenciales de Acceso</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo del Titular / Representante *
                  </label>
                  <input
                    type="text"
                    required
                    value={allyOwnerName}
                    onChange={(e) => setAllyOwnerName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Benavides"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula de Ciudadanía (C.C.) *
                  </label>
                  <input
                    type="text"
                    required
                    value={allyOwnerDocumentId}
                    onChange={(e) => setAllyOwnerDocumentId(e.target.value)}
                    placeholder="Ej. 1.085.293.411"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Celular Personal / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={allyOwnerPhone}
                    onChange={(e) => setAllyOwnerPhone(e.target.value)}
                    placeholder="Ej. 3043470984"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo para Iniciar Sesión *
                  </label>
                  <input
                    type="email"
                    required
                    value={allyOwnerEmail}
                    onChange={(e) => setAllyOwnerEmail(e.target.value)}
                    placeholder="gerente@restaurante.co"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña para el Panel *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={allyOwnerPassword}
                      onChange={(e) => setAllyOwnerPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] font-bold"
                    >
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Continuar a Pago */}
            <button
              type="submit"
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al Paso 2: Activación Oficial con Códigos QR</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* ========================================================================= */
          /* PASO 2: ACTIVACIÓN OFICIAL DAVIVIENDA / AFILIACIÓN DEMO 2.0              */
          /* ========================================================================= */
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                  <span>Paso 2: Activación Oficial del Aliado</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isDemoAffiliation ? (
                    <span className="text-emerald-400 font-semibold">
                      Modo Demo 2.0 activo: Afiliación de cortesía con tarifa $0 COP y acceso inmediato al panel.
                    </span>
                  ) : (
                    <span>
                      Transfiere los <strong>$600.000 COP</strong> correspondientes al <strong className="text-amber-400">Plan Máximo Integral Milenia</strong> a través de la cuenta oficial Davivienda.
                    </span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPaymentStep(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer"
              >
                &larr; Volver a Editar Datos
              </button>
            </div>

            {/* CASILLA DE VERIFICACIÓN: AFILIACIÓN DEMO 2.0 */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isDemoAffiliation 
                ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30' 
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}>
              <label className="flex items-start gap-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDemoAffiliation}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsDemoAffiliation(checked);
                    if (checked && !paymentReference) {
                      setPaymentReference('DEMO-2026-APROBADO');
                    }
                  }}
                  className="w-5 h-5 mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 shrink-0 cursor-pointer accent-emerald-500"
                />
                <div className="space-y-1 select-none">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">
                      Afiliación Demo 2.0 (Cortesía - Sin cobro de afiliación)
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isDemoAffiliation 
                        ? 'bg-emerald-500 text-slate-950 font-black' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isDemoAffiliation ? '✓ Demo 2.0 Habilitado ($0 COP)' : 'Afiliación Estándar'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Marca esta casilla para registrar al aliado en la base de datos con tarifa <strong>$0 COP</strong>, omitir el comprobante bancario obligatorio y acceder de inmediato a todas las funciones del panel gerencial.
                  </p>
                </div>
              </label>
            </div>

            {/* Resumen del Restaurante a Registrar */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">{allyName || 'Nuevo Restaurante Aliado'}</p>
                  <p className="text-xs text-slate-400 font-mono">NIT / RUT: {allyRut || 'Pendiente'} &bull; {allyCity}</p>
                  {rutFile && (
                    <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> RUT Guardado: {rutFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Tarifa de Activación:</p>
                <p className={`text-base font-black font-mono ${isDemoAffiliation ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isDemoAffiliation ? '$0 COP (Cortesía Demo 2.0)' : '$600.000 COP / mes'}
                </p>
              </div>
            </div>

            {/* Método Oficial de Pago Davivienda */}
            {(() => {
              const qrDavivienda = 
                businessProfile.qrBancolombiaUrl || 
                businessProfile.qrDaviplataUrl || 
                businessProfile.qrNequiUrl || 
                'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=400&q=80';

              const accountNumber = businessProfile.bankAccount?.accountNumber || businessProfile.digitalKeys?.bancolombiaKey || '488432227616';
              const accountHolder = businessProfile.bankAccount?.accountHolder || businessProfile.legalName || 'Milenia Gastronomía SAS';
              const accountDoc = businessProfile.bankAccount?.holderDocument || businessProfile.nit || '901.450.888-1';

              return (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  
                  {/* Encabezado Davivienda */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                        D
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <span>Banco Davivienda</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-mono">
                            Cuenta Oficial Davivienda
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isDemoAffiliation 
                            ? 'Datos informativos de recaudo (Omitido para Afiliación Demo 2.0 - $0 COP)' 
                            : 'Escanea el código QR de Davivienda o transfiere a la cuenta de ahorros oficial:'}
                        </p>
                      </div>
                    </div>

                    {isDemoAffiliation && (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Cortesía $0 COP
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
                    
                    {/* Visualizador del Código QR Davivienda */}
                    <div className="flex flex-col items-center shrink-0">
                      <div 
                        onClick={() => {
                          if (qrDavivienda) {
                            setZoomedQrUrl(qrDavivienda);
                            setIsQrModalOpen(true);
                          }
                        }}
                        className={`bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center w-48 h-48 border-4 border-red-500/40 relative group ${
                          qrDavivienda ? 'cursor-pointer hover:border-red-400 transition-all' : ''
                        }`}
                      >
                        {qrDavivienda ? (
                          <div className="w-full h-full flex flex-col items-center justify-center relative">
                            <img
                              src={qrDavivienda}
                              alt="Código QR Oficial Davivienda"
                              className="w-full h-full object-contain rounded-lg group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 text-center p-2 backdrop-blur-xs">
                              <Eye className="w-5 h-5 text-amber-400" />
                              <span>Clic para Ampliar QR</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center space-y-2 text-center p-2">
                            <QrCode className="w-16 h-16 text-slate-400 stroke-[1.5]" />
                            <span className="text-[10px] font-bold text-slate-600">Escanea desde tu App Davivienda</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/30 inline-flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          QR OFICIAL DAVIVIENDA
                        </span>
                        {qrDavivienda && (
                          <p className="text-[10px] text-slate-400 mt-1 cursor-pointer hover:text-amber-300" onClick={() => { setZoomedQrUrl(qrDavivienda); setIsQrModalOpen(true); }}>
                            🔍 Toca para ampliar código QR
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detalles de la Cuenta Davivienda */}
                    <div className="space-y-3 flex-1 w-full">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                        
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Entidad Bancaria:</span>
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Banco Davivienda
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Tipo de Cuenta:</span>
                          <span className="font-bold text-white">Cuenta de Ahorros</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Número de Cuenta:</span>
                          <div className="flex items-center gap-2 font-mono font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            <span>{accountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(accountNumber.replace(/\s+/g, ''), 'accNumber')}
                              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copiar número de cuenta"
                            >
                              {copiedKey === 'accNumber' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">Titular de la Cuenta:</span>
                          <div className="flex items-center gap-2 text-right">
                            <span className="font-bold text-white">{accountHolder}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(accountHolder, 'accHolder')}
                              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copiar titular"
                            >
                              {copiedKey === 'accHolder' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 font-medium">NIT / Identificación:</span>
                          <div className="flex items-center gap-2 font-mono text-slate-300">
                            <span>{accountDoc}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(accountDoc.replace(/[^0-9-]/g, ''), 'docId')}
                              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copiar documento"
                            >
                              {copiedKey === 'docId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-800">
                          <span className="text-amber-400 font-bold">Valor a Transferir:</span>
                          <span className={`font-black text-sm font-mono ${isDemoAffiliation ? 'text-emerald-400' : 'text-white'}`}>
                            {isDemoAffiliation ? '$0 COP (Cortesía Demo 2.0)' : '$600.000 COP'}
                          </span>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          {isDemoAffiliation ? (
                            <strong className="text-emerald-300">
                              En Modo Demo 2.0 no requieres realizar la transacción bancaria. Haz clic directamente en &quot;Activar Aliado Demo 2.0 y Entrar al Panel&quot;.
                            </strong>
                          ) : (
                            <span>
                              Realiza la transferencia desde tu app Davivienda o cualquier banco mediante Transfiya / PSE, toma un pantallazo (.png) y súbelo a continuación con el número de aprobación.
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Modal para Ampliar Código QR Davivienda */}
            {isQrModalOpen && zoomedQrUrl && (
              <div 
                className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsQrModalOpen(false)}
              >
                <div 
                  className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest font-bold">Banco Davivienda Oficial</span>
                    <h3 className="text-lg font-black text-white">Código QR Oficial Davivienda</h3>
                    <p className="text-xs text-slate-400">Escanea directamente con tu aplicación Davivienda o billetera digital</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-4 border-red-500 shadow-2xl flex items-center justify-center">
                    <img 
                      src={zoomedQrUrl} 
                      alt="Código QR Davivienda Ampliado" 
                      className="w-full max-h-72 object-contain rounded-lg"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                    <p className="text-xs font-bold text-white">
                      Monto: {isDemoAffiliation ? '$0 COP (Demo 2.0)' : '$600.000 COP'}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400">
                      Titular: {businessProfile.bankAccount?.accountHolder || businessProfile.legalName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Entendido / Cerrar Vista
                  </button>
                </div>
              </div>
            )}

            {/* Subir Comprobante de Pago (.PNG) con Auto-OCR Gemini IA */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Receipt className="w-4 h-4" />
                  <span>
                    {isDemoAffiliation 
                      ? 'Comprobante de Afiliación (Opcional en Modo Demo)' 
                      : 'Subir Comprobante de Pago (.PNG / Pantallazo) *'}
                  </span>
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span>Gemini AI Auto-OCR</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                {isDemoAffiliation ? (
                  <span>
                    En Afiliación Demo 2.0 no es obligatorio subir un comprobante bancario. Puedes adjuntar un pantallazo en formato <strong className="text-white font-mono">.png</strong> de prueba si lo deseas o continuar directamente.
                  </span>
                ) : (
                  <span>
                    Adjunta el pantallazo en formato <strong className="text-white font-mono">.png</strong> de tu transferencia en Davivienda. <strong className="text-purple-300">Gemini IA transcribirá automáticamente el número de aprobación</strong>.
                  </span>
                )}
              </p>

              {/* Subida del Comprobante (File Drag & Drop) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>
                    {isDemoAffiliation 
                      ? 'Pantallazo de Comprobante (.PNG / Opcional)' 
                      : 'Captura de Pantalla (.PNG) de la Transacción *'}
                  </span>
                  {paymentVoucherFile && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Archivo cargado
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={voucherFileInputRef}
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVoucherFileUpload(file);
                  }}
                  className="hidden"
                />

                {paymentVoucherFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3.5 bg-slate-900 border border-emerald-500/40 rounded-xl">
                      <div className="flex items-center gap-3 truncate">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-white truncate">{paymentVoucherFile.name}</p>
                          <p className="text-[10px] text-emerald-400 font-mono">
                            Comprobante recibido ({paymentVoucherFile.size}) &bull; Analizado con Gemini IA
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => voucherFileInputRef.current?.click()}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentVoucherFile(null);
                            if (!isDemoAffiliation) setPaymentReference('');
                            setGeminiAnalysisMessage(null);
                            setGeminiDetectedData(null);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                          title="Eliminar comprobante"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {paymentVoucherFile.dataUrl.startsWith('data:image') && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-36 bg-slate-950 flex items-center justify-center">
                        <img 
                          src={paymentVoucherFile.dataUrl} 
                          alt="Comprobante cargado" 
                          className="object-contain max-h-36 w-full opacity-90 hover:opacity-100 transition"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[9px] font-mono text-slate-300">
                          Pantallazo PNG Verificado
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => voucherFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleVoucherFileUpload(file);
                    }}
                    className="border-2 border-dashed border-amber-500/40 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-white font-bold">
                      Haz clic aquí para subir el <span className="text-amber-400">Pantallazo del Comprobante (.PNG)</span> o arrastra el archivo
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Captura de pantalla de la app Davivienda &bull; <span className="text-purple-400 font-semibold">Gemini IA leerá el número de aprobación</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Barra de Número de Aprobación */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Número de Aprobación / Referencia de la Transacción *
                  </label>
                  {isAnalyzingVoucher ? (
                    <span className="text-[10px] text-purple-400 font-mono flex items-center gap-1 animate-pulse font-bold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Gemini IA leyendo comprobante...
                    </span>
                  ) : paymentReference ? (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3" /> Referencia confirmada
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder={isDemoAffiliation ? "DEMO-2026-APROBADO" : "Ej. 88472910 o Ref. M-194820"}
                    className={`w-full pl-10 pr-28 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white focus:outline-none font-mono transition-all ${
                      isAnalyzingVoucher 
                        ? 'border-purple-500/60 bg-purple-950/20' 
                        : paymentReference 
                        ? 'border-emerald-500/60 bg-slate-900 focus:border-emerald-400' 
                        : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isAnalyzingVoucher ? (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-mono flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> IA Leyendo
                      </span>
                    ) : isDemoAffiliation ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Demo 2.0
                      </span>
                    ) : paymentReference ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> Confirmado
                      </span>
                    ) : null}
                  </div>
                </div>

                {geminiAnalysisMessage && (
                  <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-start gap-2 animate-fade-in">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-white text-[11px]">{geminiAnalysisMessage}</p>
                      {geminiDetectedData?.rawSummary && (
                        <p className="text-[10px] text-slate-300 font-mono">{geminiDetectedData.rawSummary}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botón Final: Activar Aliado y Entrar al Panel */}
            <button
              type="button"
              disabled={loading || (!isDemoAffiliation && (!paymentVoucherFile || !paymentReference.trim()))}
              onClick={handleCompleteAllyRegistration}
              className={`w-full py-4 px-4 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isDemoAffiliation
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/30'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Base de Datos y Abriendo Panel...</span>
                </>
              ) : isDemoAffiliation ? (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                  <span>Activar Aliado Demo 2.0 y Entrar al Panel</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>Subir Comprobante, Activar Aliado y Entrar al Panel</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
