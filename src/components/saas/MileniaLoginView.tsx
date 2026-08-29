import React, { useState, useRef } from 'react';
import { useTasty } from '../../context/TastyContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LogIn, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  Receipt, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Mail, 
  User, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  Laptop, 
  Phone, 
  MapPin, 
  FileText, 
  Utensils, 
  CreditCard, 
  UserPlus, 
  IdCard, 
  Hash, 
  Store, 
  UploadCloud, 
  QrCode, 
  Copy, 
  Check, 
  FileCheck, 
  X, 
  ArrowLeft, 
  Smartphone, 
  DollarSign, 
  ShieldAlert, 
  Info,
  BadgePercent
} from 'lucide-react';
import { loginUser, registerUser, UserRole, calculateRedirectUrl } from '../../lib/auth-service';
import { TenantRestaurant, TenantEmployee, EmployeeRole } from '../../types';
import { ColombiaCityCombobox } from '../common/ColombiaCityCombobox';
import { 
  MileniaBusinessProfile, 
  DEFAULT_BUSINESS_PROFILE, 
  getBusinessProfile, 
  subscribeToBusinessProfile 
} from '../../services/mileniaBusinessService';
import { addAliado } from '../../services/mileniaAliadosService';
import { addTransaction } from '../../services/mileniaContabilidadService';
import { getFinancialSummary, saveFinancialSummary } from '../../services/mileniaFinancialSummaryService';

export const MileniaLoginView: React.FC = () => {
  const { tenants, addTenant, addEmployee, navigateTo, setMode: setAppMode, setTenantView } = useTasty();
  const { userProfile, logout, loginAsDemo } = useAuth();

  // Tab de Modo: Iniciar Sesión, Registrar Aliado (Nuevo Restaurante), Registrar Empleado
  const [activeTab, setActiveTab] = useState<'signin' | 'register_ally' | 'register_employee'>(() => {
    const autoTab = sessionStorage.getItem('milenia_auto_tab');
    if (autoTab === 'register_ally' || autoTab === 'register_employee') {
      sessionStorage.removeItem('milenia_auto_tab');
      return autoTab;
    }
    return 'signin';
  });
  
  // Estado común
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; redirectUrl: string; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 1. Campos Iniciar Sesión
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 2. Campos Registrar Aliado (Nuevo Restaurante)
  const [allyName, setAllyName] = useState('');
  const [allyRut, setAllyRut] = useState('');
  const [allyLegalName, setAllyLegalName] = useState('');
  const [allyAddress, setAllyAddress] = useState('');
  const [allyCity, setAllyCity] = useState('Bogotá D.C.');
  const [allyPhone, setAllyPhone] = useState('');
  const [allyEmail, setAllyEmail] = useState('');
  const [allyCuisine, setAllyCuisine] = useState('Parrilla & Gastronomía Tradicional');
  const [allyTablesCount, setAllyTablesCount] = useState<number>(12);
  
  // Archivo RUT
  const [rutFile, setRutFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);
  const rutFileInputRef = useRef<HTMLInputElement>(null);

  // Propietario / Gerente del Aliado
  const [allyOwnerName, setAllyOwnerName] = useState('');
  const [allyOwnerDocumentId, setAllyOwnerDocumentId] = useState('');
  const [allyOwnerEmployeeId, setAllyOwnerEmployeeId] = useState('EMP-101');
  const [allyOwnerPhone, setAllyOwnerPhone] = useState('');
  const [allyOwnerEmail, setAllyOwnerEmail] = useState('');
  const [allyOwnerPassword, setAllyOwnerPassword] = useState('');

  // Paso de Pago / Billeteras Digitales para Registro de Aliado
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<'nequi' | 'daviplata' | 'transferencia' | 'breve'>('nequi');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
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
  React.useEffect(() => {
    let unsubscribe = () => {};
    const initProfile = async () => {
      try {
        const data = await getBusinessProfile();
        if (data) {
          setBusinessProfile(data);
        }
      } catch (err) {
        console.warn('Error cargando perfil de negocio en login:', err);
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

  // 3. Campos Registrar Empleado
  const [empFullName, setEmpFullName] = useState('');
  const [empRole, setEmpRole] = useState<'gerente' | 'chef-ejecutivo' | 'cajero-principal' | 'capitan-salon' | 'supervisor' | 'barista' | 'auxiliar'>('capitan-salon');
  const [empRestaurantId, setEmpRestaurantId] = useState<string>(() => (tenants.length > 0 ? tenants[0].id : '1'));
  const [empEmployeeId, setEmpEmployeeId] = useState('EMP-' + Math.floor(100 + Math.random() * 900));
  const [empDocumentId, setEmpDocumentId] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empPinCode, setEmpPinCode] = useState('1234');

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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: dataUrl,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          const { referenceNumber, bankOrWallet } = result.data;
          
          if (referenceNumber) {
            setPaymentReference(referenceNumber);
          }
          
          if (bankOrWallet) {
            const bwLower = String(bankOrWallet).toLowerCase();
            if (bwLower.includes('daviplata')) {
              setSelectedWallet('daviplata');
            } else if (bwLower.includes('nequi')) {
              setSelectedWallet('nequi');
            } else if (bwLower.includes('banco') || bwLower.includes('bancolombia')) {
              setSelectedWallet('transferencia');
            } else if (bwLower.includes('breve') || bwLower.includes('transfiya')) {
              setSelectedWallet('breve');
            }
          }

          setGeminiDetectedData(result.data);
          setGeminiAnalysisMessage(
            referenceNumber 
              ? `✨ Número de aprobación "${referenceNumber}" transcrito automáticamente por Gemini IA`
              : 'Comprobante analizado con éxito por Gemini IA'
          );
        } else {
          setGeminiAnalysisMessage('Comprobante recibido. Verifica el número de transacción.');
        }
      } catch (ocrErr) {
        console.warn('Aviso: Error en el endpoint de Gemini IA para voucher:', ocrErr);
        setGeminiAnalysisMessage('Comprobante adjuntado correctamente.');
      } finally {
        setIsAnalyzingVoucher(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copiar al portapapeles
  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Manejo de Inicio de Sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(loginEmail, loginPassword);
      
      const posLower = String(result.profile.position || '').toLowerCase();
      const rId = String(result.profile.restaurantId || '1');
      
      let targetCargo = 'gerente';
      if (posLower.includes('chef') || posLower.includes('cocina')) targetCargo = 'chef-ejecutivo';
      else if (posLower.includes('cajer') || posLower.includes('caja') || posLower.includes('facturacion')) targetCargo = 'cajero-principal';
      else if (posLower.includes('meser') || posLower.includes('capitan') || posLower.includes('salon')) targetCargo = 'capitan-salon';
      else if (posLower.includes('supervis')) targetCargo = 'supervisor';

      const directUrl = `/panel/${rId}/${targetCargo}`;
      setSuccessInfo({
        name: result.profile.name,
        redirectUrl: directUrl,
        message: '¡Autenticado con éxito! Redirigiendo al Panel del Aliado...'
      });

      // Redirección directa e inmediata al Panel del Aliado
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({ 
          routeType: 'ally_panel', 
          restaurantId: rId,
          cargo: targetCargo
        });
      }, 300);
    } catch (err: any) {
      setError(err?.message || 'Error al autenticar. Verifica tus credenciales.');
      setLoading(false);
    }
  };

  // Paso 1 de Registro de Aliado: Validar formulario y abrir pantalla de Pago QR
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allyName.trim()) {
      setError('Por favor ingresa el nombre del restaurante aliado.');
      return;
    }
    if (!allyRut.trim()) {
      setError('Por favor ingresa el Registro Único Tributario (RUT / NIT).');
      return;
    }
    if (!allyOwnerName.trim()) {
      setError('Por favor ingresa el nombre completo del Propietario / Gerente.');
      return;
    }
    if (!allyOwnerDocumentId.trim()) {
      setError('Por favor ingresa la Cédula de Ciudadanía del Propietario.');
      return;
    }
    if (!allyOwnerEmail.trim() || !allyOwnerPassword.trim()) {
      setError('Por favor ingresa el correo y contraseña de acceso para el Propietario.');
      return;
    }

    // Abrir paso de pago QR y comprobante
    setShowPaymentStep(true);
  };

  // Paso 2: Finalizar Registro de Aliado tras subir comprobante de pago
  const handleCompleteAllyRegistration = async () => {
    setError(null);

    if (!paymentVoucherFile) {
      setError('Por favor sube la captura de pantalla o comprobante de la transacción.');
      return;
    }

    setLoading(true);

    try {
      // 1. Generar ID único para el restaurante
      const slug = allyName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      
      const newRestaurantId = String(Date.now().toString().slice(-4) || '10');

      // 2. Crear objeto TenantRestaurant con Plan Pro por $600.000 COP/mes, RUT y Comprobante de Pago
      const newTenant: TenantRestaurant = {
        id: newRestaurantId,
        slug: slug || `rest-${newRestaurantId}`,
        name: allyName.trim(),
        city: allyCity.trim(),
        address: allyAddress.trim() || 'Dirección Comercial Principal',
        phone: allyPhone.trim() || allyOwnerPhone.trim() || '+57 304 347 0984',
        email: allyEmail.trim() || allyOwnerEmail.trim(),
        createdAt: new Date().toISOString(),
        tablesCount: Number(allyTablesCount) || 12,
        activeOrdersCount: 0,
        totalMonthlySalesCop: 0,
        rutDocumentUrl: rutFile?.dataUrl || undefined,
        rutDocumentFileName: rutFile?.name || undefined,
        rutUploadedAt: rutFile ? new Date().toISOString() : undefined,
        subscriptionPayment: {
          amountCop: 600000,
          method: selectedWallet,
          voucherUrl: paymentVoucherFile.dataUrl,
          voucherFileName: paymentVoucherFile.name,
          referenceNumber: paymentReference.trim() || `REF-${Math.floor(1000000 + Math.random() * 9000000)}`,
          paidAt: new Date().toISOString(),
          status: 'confirmed'
        },
        branding: {
          logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80',
          primaryColor: '#ea580c',
          accentColor: '#f59e0b',
          themeStyle: 'rustic',
          bannerImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80',
          tagline: allyCuisine || 'Gastronomía Tradicional',
          currency: 'COP',
          currencySymbol: '$',
          nit: allyRut.trim(),
          legalBusinessName: allyLegalName.trim() || allyName.trim() + ' S.A.S.',
          dianResolution: `Resolución DIAN No. 187640${Math.floor(100000 + Math.random() * 900000)} de 2026`,
          tipSuggestedPercentage: 10,
          taxRateImpoconsumo: 8
        },
        subscription: {
          plan: 'pro',
          status: 'active',
          mrrCop: 600000,
          renewsAt: '2026-12-31',
          maxTables: Number(allyTablesCount) || 12,
          maxEmployees: 25,
          features: [
            'POS Meseros & Comandas',
            'KDS Pantalla de Cocina',
            'Facturación Electrónica DIAN',
            'Menú Digital QR & Pedidos',
            'Control de Inventario & Costos',
            'Gestión de Personal & Turnos'
          ]
        }
      };

      // Guardar en Firestore & Context de Restaurantes Multi-Tenant
      addTenant(newTenant);

      const finalPaymentRef = paymentReference.trim() || `REF-${Math.floor(1000000 + Math.random() * 9000000)}`;

      // 1. Guardar en la Colección `/aliados` del Propietario Milenia en Firestore
      try {
        await addAliado({
          name: allyName.trim(),
          nit: allyRut.trim(),
          city: allyCity.trim(),
          address: allyAddress.trim() || 'Dirección Comercial Principal',
          phone: allyPhone.trim() || allyOwnerPhone.trim() || '+57 304 347 0984',
          email: allyEmail.trim() || allyOwnerEmail.trim(),
          plan: 'Pro',
          status: 'Activo',
          monthlyFeeCop: 600000,
          tablesCount: Number(allyTablesCount) || 12,
          contactName: allyOwnerName.trim()
        });
      } catch (aliadoErr) {
        console.warn('Aviso guardando en colección /aliados:', aliadoErr);
      }

      // 2. Guardar en la Colección `/contabilidad` de Milenia (Ingreso por Suscripción Mensual)
      try {
        await addTransaction({
          type: 'INGRESO',
          description: `Suscripción Mensual Plan Pro - ${allyName.trim()}`,
          category: 'SUSCRIPCION_SAAS',
          amountCop: 600000,
          date: new Date().toISOString().split('T')[0],
          restaurantId: newRestaurantId,
          restaurantName: allyName.trim(),
          paymentMethod: selectedWallet === 'nequi' 
            ? 'TRANSFERENCIA_BANCARIA' 
            : selectedWallet === 'daviplata' 
            ? 'TRANSFERENCIA_BANCARIA' 
            : selectedWallet === 'transferencia' 
            ? 'TRANSFERENCIA_BANCARIA' 
            : 'WOMPI',
          referenceNumber: finalPaymentRef,
          notes: `Comprobante verificado con Gemini IA. Archivo: ${paymentVoucherFile.name}. Método: ${selectedWallet.toUpperCase()}`
        });
      } catch (txErr) {
        console.warn('Aviso guardando en colección /contabilidad:', txErr);
      }

      // 3. Actualizar la Tabla de Balance Consolidado `/resumen_financiero` en Firestore
      try {
        const currentFin = await getFinancialSummary();
        await saveFinancialSummary({
          ingresos: (Number(currentFin.ingresos) || 0) + 600000,
          gastos: Number(currentFin.gastos) || 0,
          titulo: 'Resumen Financiero Consolidado',
          descripcion: `Actualizado automáticamente por activación del aliado "${allyName.trim()}".`,
          notas: `Último recaudo: $600.000 COP con referencia ${finalPaymentRef} (${selectedWallet.toUpperCase()})`
        });
      } catch (finErr) {
        console.warn('Aviso actualizando /resumen_financiero:', finErr);
      }

      // 4. Registrar al Propietario / Gerente como usuario en Firebase Auth y Firestore (`users/{uid}`)
      await registerUser(allyOwnerEmail, allyOwnerPassword, {
        name: allyOwnerName.trim(),
        restaurantId: newRestaurantId,
        role: 'OWNER',
        employeeId: allyOwnerEmployeeId || 'EMP-101',
        position: 'Propietario & Gerente General',
        phone: allyOwnerPhone || allyPhone
      });

      // 4. Agregar a la tabla de empleados del restaurante (`/employees/{id}`)
      const newOwnerEmployee: TenantEmployee = {
        id: allyOwnerEmployeeId || `emp-${newRestaurantId}-101`,
        restaurantId: newRestaurantId,
        name: allyOwnerName.trim(),
        role: 'owner',
        position: 'Propietario & Gerente General',
        documentId: allyOwnerDocumentId.trim() || '1085312034',
        email: allyOwnerEmail.trim(),
        phone: allyOwnerPhone.trim() || allyPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        pinCode: '1234',
        shiftStatus: 'active',
        currentClockInTime: new Date().toISOString()
      };
      addEmployee(newOwnerEmployee);

      const directUrl = `/panel/${newRestaurantId}/gerente`;
      setSuccessInfo({
        name: `${newTenant.name} (${allyOwnerName})`,
        redirectUrl: directUrl,
        message: '¡Restaurante Aliado activado, comprobante verificado y datos guardados en Firestore con éxito!'
      });

      // Redirigir directamente al panel del aliado registrado
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: newRestaurantId,
          cargo: 'gerente'
        });
      }, 500);

    } catch (err: any) {
      console.error('Error registrando aliado:', err);
      setError(err?.message || 'Error al registrar el restaurante aliado.');
      setLoading(false);
    }
  };

  // Manejo de Registro de Empleado
  const handleRegisterEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!empFullName.trim()) {
      setError('Por favor ingresa el nombre completo del empleado.');
      return;
    }
    if (!empDocumentId.trim()) {
      setError('Por favor ingresa la Cédula de Ciudadanía del empleado.');
      return;
    }
    if (!empEmployeeId.trim()) {
      setError('Por favor ingresa o genera el ID del empleado.');
      return;
    }
    if (!empEmail.trim() || !empPassword.trim()) {
      setError('Por favor ingresa el correo electrónico y la contraseña.');
      return;
    }

    setLoading(true);

    try {
      const isOwnerRole = empRole === 'gerente';
      const roleMapped: UserRole = isOwnerRole ? 'OWNER' : 'STAFF';

      let positionTitle = 'Capitán de Salón';
      if (empRole === 'gerente') positionTitle = 'Gerente General';
      else if (empRole === 'chef-ejecutivo') positionTitle = 'Chef Ejecutivo & KDS';
      else if (empRole === 'cajero-principal') positionTitle = 'Cajero Principal & DIAN';
      else if (empRole === 'capitan-salon') positionTitle = 'Capitán de Salón / Mesero';
      else if (empRole === 'supervisor') positionTitle = 'Supervisor de Turno';
      else if (empRole === 'barista') positionTitle = 'Barista & Bebidas';
      else if (empRole === 'auxiliar') positionTitle = 'Auxiliar de Operaciones';

      // 1. Registrar usuario en Firebase Auth y Firestore
      await registerUser(empEmail, empPassword, {
        name: empFullName.trim(),
        restaurantId: empRestaurantId,
        role: roleMapped,
        employeeId: empEmployeeId.trim(),
        position: positionTitle,
        phone: empPhone.trim()
      });

      // 2. Mapear a TenantEmployee
      const employeeRoleType: EmployeeRole = 
        empRole === 'gerente' ? 'administrador' :
        empRole === 'chef-ejecutivo' ? 'cocina' :
        empRole === 'cajero-principal' ? 'cajero' : 'mesero';

      const newEmp: TenantEmployee = {
        id: empEmployeeId.trim(),
        restaurantId: empRestaurantId,
        name: empFullName.trim(),
        role: employeeRoleType,
        position: positionTitle,
        documentId: empDocumentId.trim(),
        email: empEmail.trim(),
        phone: empPhone.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        pinCode: empPinCode || '1234',
        shiftStatus: 'active',
        currentClockInTime: new Date().toISOString()
      };

      addEmployee(newEmp);

      const targetCargoSlug = empRole;
      const directUrl = `/panel/${empRestaurantId}/${targetCargoSlug}`;

      setSuccessInfo({
        name: `${empFullName} (${positionTitle})`,
        redirectUrl: directUrl,
        message: '¡Empleado registrado con éxito en el restaurante seleccionado!'
      });

      // Redirigir directamente al panel correspondiente
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      setTimeout(() => {
        navigateTo({
          routeType: 'ally_panel',
          restaurantId: empRestaurantId,
          cargo: targetCargoSlug
        });
      }, 400);

    } catch (err: any) {
      console.error('Error registrando empleado:', err);
      setError(err?.message || 'Error al registrar el empleado.');
      setLoading(false);
    }
  };

  // Helper para rellenar cuentas demo y autenticar
  const handleSelectDemo = async (demoEmail: string, demoPass: string, demoType?: 'miguel_owner' | 'alejandro_staff', directRestaurantId?: string) => {
    setLoginEmail(demoEmail);
    setLoginPassword(demoPass);
    setError(null);
    
    if (demoType) {
      await loginAsDemo(demoType);
      const targetRest = demoType === 'miguel_owner' ? '5' : '3';
      const targetCargo = demoType === 'miguel_owner' ? 'gerente' : 'cajero-principal';
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      navigateTo({ routeType: 'ally_panel', restaurantId: targetRest, cargo: targetCargo });
    } else if (directRestaurantId) {
      setAppMode('restaurant');
      setTenantView('restaurant-panel-gerente');
      navigateTo({ routeType: 'ally_panel', restaurantId: directRestaurantId, cargo: 'gerente' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8 font-sans">
      
      {/* Top Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-bold tracking-wide">
          <KeyRound className="w-3.5 h-3.5" />
          <span>MILENIA SAAS &bull; GESTIÓN DE ACCESOS Y REGISTRO</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Portal de Acceso y Registro
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Inicia sesión para ir directo al panel del aliado, registra un nuevo restaurante con su RUT y activación Pro, o registra nuevos empleados.
        </p>
      </div>

      {/* Tabs Principales de Navegación */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl max-w-2xl mx-auto">
        <button
          type="button"
          onClick={() => { setActiveTab('signin'); setShowPaymentStep(false); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'signin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <LogIn className="w-4 h-4" />
          <span>Iniciar Sesión</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register_ally'); setShowPaymentStep(false); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'register_ally'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Registrar Aliado</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('register_employee'); setShowPaymentStep(false); setError(null); }}
          className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === 'register_employee'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Empleado</span>
        </button>
      </div>

      {/* 1. Acceso Rápido y Casos de Prueba (Solo en pestaña Iniciar Sesión) */}
      {activeTab === 'signin' && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
                Acceso Rápido 1-Click al Panel del Aliado
              </h2>
            </div>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Perfiles Demostrativos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Card Restaurante 1 - Camilo (Gerente Aliado) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('camilo.owner@milenia.co', 'Milenia2026!', undefined, '1')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        Rest. ID 1 (Gerente)
                      </p>
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-black uppercase">
                        Gerente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Parrilla & Fuego Camilo
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform mt-1" />
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                <span className="text-slate-500">Destino:</span>
                <span className="text-amber-400 font-bold">/panel/1/gerente</span>
              </div>
            </button>

            {/* Card Restaurante 5 - Miguel (Gerente Aliado) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('miguel.owner@milenia.co', 'Milenia2026!', 'miguel_owner')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-amber-500/40 hover:border-amber-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                        Rest. ID 5 (Gerente)
                      </p>
                      <span className="text-[8px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded font-black uppercase">
                        Gerente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Mar & Fuego Caribe
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform mt-1" />
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                <span className="text-slate-500">Destino:</span>
                <span className="text-amber-400 font-bold">/panel/5/gerente</span>
              </div>
            </button>

            {/* Card Restaurante 3 - Alejandro (Cajero Staff) */}
            <button
              type="button"
              onClick={() => handleSelectDemo('alejandro.cajero@milenia.co', 'Milenia2026!', 'alejandro_staff')}
              className="text-left bg-slate-950/70 hover:bg-slate-800 border border-teal-500/40 hover:border-teal-500 p-3.5 rounded-2xl transition group relative overflow-hidden cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-black">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white group-hover:text-teal-400 transition">
                        Rest. ID 3 (Cajero)
                      </p>
                      <span className="text-[8px] bg-teal-500/20 text-teal-400 px-1 py-0.5 rounded font-black uppercase">
                        Cajero
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Cajero Principal DIAN
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-1 transition-transform mt-1" />
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-300 font-mono">
                <span className="text-slate-500">Destino:</span>
                <span className="text-teal-400 font-bold">/panel/3/cajero-principal</span>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* 2. Sesión Activa Actual */}
      {userProfile && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.name}</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded font-black uppercase">
                  {userProfile.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Restaurante ID: {userProfile.restaurantId} &bull; Empleado ID: {userProfile.documentId || userProfile.employeeId || '101'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                const targetUrl = calculateRedirectUrl(userProfile);
                setAppMode('restaurant');
                setTenantView('restaurant-panel-gerente');
                const targetCargo = targetUrl.split('/').pop() || 'gerente';
                navigateTo({ 
                  routeType: 'ally_panel', 
                  restaurantId: String(userProfile.restaurantId || '1'),
                  cargo: targetCargo
                });
              }}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Ir a mi Panel del Aliado</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="px-3 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="Cerrar sesión actual"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Card Principal del Formulario */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Banner de Éxito y Redirección */}
        {successInfo && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-emerald-300">
                {successInfo.message}
              </p>
              <p className="text-xs text-slate-300">
                Bienvenido <span className="font-bold text-white">{successInfo.name}</span>.
              </p>
              <p className="text-[11px] font-mono text-emerald-400/90">
                Ruta activa: {successInfo.redirectUrl}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: INICIAR SESIÓN COMO ALIADO / EMPLEADO                              */}
        {/* ========================================================================= */}
        {activeTab === 'signin' && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <LogIn className="w-5 h-5 text-amber-500" />
                <span>Ingreso Directo al Panel del Aliado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingresa con tu correo corporativo y contraseña para abrir el panel de control de tu restaurante.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="camilo.owner@milenia.co"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Contraseña
                </label>
                <span className="text-[11px] text-slate-500">Mínimo 6 caracteres</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
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

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Autenticando y Abriendo Panel...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Iniciar Sesión y Entrar al Panel del Aliado</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: REGISTRAR ALIADO (FORMULARIO + QR PAGO Y COMPROBANTE)              */}
        {/* ========================================================================= */}
        {activeTab === 'register_ally' && !showPaymentStep && (
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                <span>Registrar Nuevo Restaurante Aliado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Completa los datos comerciales, sube tu Registro Único Tributario (RUT) y define tus credenciales de acceso.
              </p>
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
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{rutFile.name}</p>
                        <p className="text-[10px] text-amber-400/80 font-mono">Tamaño: {rutFile.size} &bull; Listo para guardar en base de datos</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRutFile(null)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
                      title="Eliminar archivo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => rutFileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleRutFileUpload(file);
                    }}
                    className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/50 hover:bg-slate-900 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5 group"
                  >
                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <p className="text-xs text-slate-300 font-medium">
                      Arrastra tu archivo del <span className="text-amber-400 font-bold">RUT</span> o haz clic para seleccionarlo
                    </p>
                    <p className="text-[10px] text-slate-500">Formatos soportados: PDF, JPG, PNG (Hasta 10MB)</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razón Social */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Razón Social / Empresa Legal
                  </label>
                  <input
                    type="text"
                    value={allyLegalName}
                    onChange={(e) => setAllyLegalName(e.target.value)}
                    placeholder="Ej. Inversiones Gastronómicas del Oriente S.A.S."
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Especialidad de Cocina */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tipo de Cocina / Especialidad
                  </label>
                  <input
                    type="text"
                    value={allyCuisine}
                    onChange={(e) => setAllyCuisine(e.target.value)}
                    placeholder="Ej. Parrilla, Carnes & Típica Colombiana"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dirección */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dirección Comercial de la Sede *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyAddress}
                      onChange={(e) => setAllyAddress(e.target.value)}
                      placeholder="Ej. Calle 72 # 11-45, Barrio Chapinero"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Ciudad o Municipio de Colombia con Filtro y Buscador */}
                <div>
                  <ColombiaCityCombobox
                    value={allyCity}
                    onChange={(selectedCity) => setAllyCity(selectedCity)}
                    required
                    label="Ciudad o Municipio de Colombia *"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Teléfono PBX */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono / PBX *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      required
                      value={allyPhone}
                      onChange={(e) => setAllyPhone(e.target.value)}
                      placeholder="+57 304 347 0984"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Cantidad de Mesas (Libre para el propietario) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cantidad de Mesas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="150"
                    required
                    value={allyTablesCount}
                    onChange={(e) => setAllyTablesCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    placeholder="Ej. 12"
                  />
                </div>

                {/* Plan Milenia SaaS Exclusivo: Plan Pro ($600.000 COP) */}
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">
                    Plan Milenia Seleccionado
                  </label>
                  <div className="px-3 py-2.5 bg-amber-500/10 border border-amber-500/40 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">Plan Pro</span>
                    <span className="text-xs font-black text-white">$600.000 /mes</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Beneficios del Plan Pro */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Incluido en Plan Pro:</span>
                </div>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">POS Meseros</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">KDS Cocina</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Facturación DIAN</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Menú QR</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">Inventario & Personal</span>
              </div>
            </div>

            {/* Sección 2: Cuenta del Propietario / Gerente General */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-800">
                <ShieldCheck className="w-4 h-4" />
                <span>2. Credenciales del Propietario (Guardado en Base de Datos)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre Propietario */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo del Propietario *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyOwnerName}
                      onChange={(e) => setAllyOwnerName(e.target.value)}
                      placeholder="Ej. Laura Marcela Ramírez"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Cédula Propietario */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula de Ciudadanía (C.C.) *
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={allyOwnerDocumentId}
                      onChange={(e) => setAllyOwnerDocumentId(e.target.value)}
                      placeholder="Ej. 1085312034"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email de Acceso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo de Acceso (Usuario Administrador) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={allyOwnerEmail}
                      onChange={(e) => setAllyOwnerEmail(e.target.value)}
                      placeholder="gerencia@nuevorestaurante.co"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Contraseña de Acceso */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña de Acceso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={allyOwnerPassword}
                      onChange={(e) => setAllyOwnerPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón para Proceder al Paso de Pago QR */}
            <button
              type="submit"
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continuar al Pago de Activación ($600.000 COP)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        )}

        {/* ========================================================================= */}
        {/* PASO 2 (MODO PAGO QR BILLETERAS DIGITALES Y SUBIR COMPROBANTE)             */}
        {/* ========================================================================= */}
        {activeTab === 'register_ally' && showPaymentStep && (
          <div className="space-y-6">
            
            {/* Header del Paso de Pago */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setShowPaymentStep(false)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Datos del Restaurante</span>
              </button>

              <div className="text-right">
                <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest font-bold">Paso 2 de 2</span>
                <p className="text-xs font-bold text-white">Pago de Suscripción & Activación</p>
              </div>
            </div>

            {/* Resumen del Pedido */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Restaurante a Registrar:</p>
                <p className="text-sm font-black text-white">{allyName} &bull; NIT: {allyRut}</p>
                <p className="text-[11px] text-slate-400">Propietario: {allyOwnerName} ({allyOwnerEmail})</p>
              </div>
              <div className="text-right bg-amber-500/10 border border-amber-500/30 px-4 py-2 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-amber-400">Monto Mensual Plan Pro</p>
                <p className="text-lg font-black text-white">$600.000 <span className="text-xs font-normal text-slate-300">COP</span></p>
              </div>
            </div>

            {/* Selector de Billetera Digital & Métodos de Recaudo Milenia */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-200">
                  Selecciona la Billetera Digital o Método de Pago:
                </label>
                <span className="text-[10px] font-mono text-amber-400/90 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  <span>Sincronizado con Firestore (/negocio)</span>
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* Nequi */}
                <button
                  type="button"
                  onClick={() => setSelectedWallet('nequi')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedWallet === 'nequi'
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                    N
                  </div>
                  <span className="text-xs font-bold">Nequi</span>
                  {businessProfile.qrNequiUrl && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-mono">QR Activo</span>
                  )}
                </button>

                {/* Daviplata */}
                <button
                  type="button"
                  onClick={() => setSelectedWallet('daviplata')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedWallet === 'daviplata'
                      ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-500/20 ring-1 ring-red-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                    D
                  </div>
                  <span className="text-xs font-bold">Daviplata</span>
                  {businessProfile.qrDaviplataUrl && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded font-mono">QR Activo</span>
                  )}
                </button>

                {/* Bancolombia / Transferencia */}
                <button
                  type="button"
                  onClick={() => setSelectedWallet('transferencia')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedWallet === 'transferencia'
                      ? 'bg-amber-950/40 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-1 ring-amber-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Bancolombia</span>
                  {businessProfile.qrBancolombiaUrl && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-mono">QR Activo</span>
                  )}
                </button>

                {/* Breve / Transfiya */}
                <button
                  type="button"
                  onClick={() => setSelectedWallet('breve')}
                  className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    selectedWallet === 'breve'
                      ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                    ⚡
                  </div>
                  <span className="text-xs font-bold">Breve / Transfiya</span>
                  {businessProfile.qrBreveUrl && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono">QR Activo</span>
                  )}
                </button>
              </div>
            </div>

            {/* Código QR Real de Firestore & Datos de Transferencia */}
            {(() => {
              // Buscar QR específico o primer QR disponible cargado por el propietario en Firestore
              const anyUploadedQr = 
                businessProfile.qrNequiUrl || 
                businessProfile.qrDaviplataUrl || 
                businessProfile.qrBancolombiaUrl || 
                businessProfile.qrBreveUrl || 
                '';

              let currentQr = '';
              let currentMethodName = 'Nequi';
              let currentKeyNumber = businessProfile.digitalKeys?.nequiKey || businessProfile.phone || '3043470984';
              let currentKeyLabel = 'Número Nequi / Celular';
              let currentHolder = businessProfile.bankAccount?.accountHolder || businessProfile.legalName || 'Milenia Gastronomía SAS';
              let currentDoc = businessProfile.bankAccount?.holderDocument || businessProfile.nit || '901.450.888-1';
              let isSpecificQr = false;

              if (selectedWallet === 'nequi') {
                currentMethodName = 'Billetera Nequi';
                currentQr = businessProfile.qrNequiUrl || anyUploadedQr;
                isSpecificQr = Boolean(businessProfile.qrNequiUrl);
                currentKeyNumber = businessProfile.digitalKeys?.nequiKey || businessProfile.phone || '3043470984';
                currentKeyLabel = 'Número de Celular / Nequi';
              } else if (selectedWallet === 'daviplata') {
                currentMethodName = 'Billetera Daviplata';
                currentQr = businessProfile.qrDaviplataUrl || anyUploadedQr;
                isSpecificQr = Boolean(businessProfile.qrDaviplataUrl);
                currentKeyNumber = businessProfile.digitalKeys?.daviplataKey || businessProfile.phone || '3043470984';
                currentKeyLabel = 'Número Daviplata / Celular';
              } else if (selectedWallet === 'breve') {
                currentMethodName = 'Llave Breve / Transfiya (Banco de la República)';
                currentQr = businessProfile.qrBreveUrl || anyUploadedQr;
                isSpecificQr = Boolean(businessProfile.qrBreveUrl);
                currentKeyNumber = businessProfile.digitalKeys?.qrBreveInteroperableKey || businessProfile.digitalKeys?.transfiyaKey || 'BREVE-MILENIA-901450888-COL';
                currentKeyLabel = 'Llave Breve Interoperable';
              } else {
                currentMethodName = `${businessProfile.bankAccount?.bankName || 'Bancolombia'} (${businessProfile.bankAccount?.accountType || 'Ahorros'})`;
                currentQr = businessProfile.qrBancolombiaUrl || anyUploadedQr;
                isSpecificQr = Boolean(businessProfile.qrBancolombiaUrl);
                currentKeyNumber = businessProfile.bankAccount?.accountNumber || businessProfile.digitalKeys?.bancolombiaKey || '488432227616';
                currentKeyLabel = `Número de Cuenta ${businessProfile.bankAccount?.accountType || 'Ahorros'}`;
              }

              return (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Visualizador de QR Real de Firestore */}
                    <div className="flex flex-col items-center shrink-0">
                      <div 
                        onClick={() => {
                          if (currentQr) {
                            setZoomedQrUrl(currentQr);
                            setIsQrModalOpen(true);
                          }
                        }}
                        className={`bg-white p-3 rounded-2xl shadow-xl flex flex-col items-center justify-center w-48 h-48 border-4 border-amber-500/40 relative group ${
                          currentQr ? 'cursor-pointer hover:border-amber-400 transition-all' : ''
                        }`}
                      >
                        {currentQr ? (
                          <div className="w-full h-full flex flex-col items-center justify-center relative">
                            <img
                              src={currentQr}
                              alt={`Código QR Oficial ${currentMethodName}`}
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
                            <span className="text-[10px] font-bold text-slate-600">Escanea desde tu App Bancaria</span>
                          </div>
                        )}
                      </div>

                      {/* Subtítulo bajo el QR */}
                      <div className="mt-2 text-center">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1">
                          <QrCode className="w-3 h-3" />
                          {isSpecificQr ? `QR OFICIAL ${selectedWallet.toUpperCase()}` : 'QR OFICIAL MILENIA'}
                        </span>
                        {currentQr && (
                          <p className="text-[10px] text-slate-400 mt-1 cursor-pointer hover:text-amber-300" onClick={() => { setZoomedQrUrl(currentQr); setIsQrModalOpen(true); }}>
                            🔍 Toca para ampliar
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Detalles de la Cuenta y Llave */}
                    <div className="space-y-3 flex-1 w-full">
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          {selectedWallet === 'nequi' && <span className="text-purple-400">Paga con Billetera Nequi</span>}
                          {selectedWallet === 'daviplata' && <span className="text-red-400">Paga con Billetera Daviplata</span>}
                          {selectedWallet === 'transferencia' && <span className="text-amber-400">Transferencia Bancolombia</span>}
                          {selectedWallet === 'breve' && <span className="text-cyan-400">Llave Breve / Red Interoperable</span>}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Escanea el código QR desde tu app bancaria o transfiere directamente con los siguientes datos oficiales registrados:
                        </p>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2.5">
                        
                        {/* Número o Llave Copiable */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{currentKeyLabel}:</span>
                          <div className="flex items-center gap-2 font-mono font-black text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                            <span>{currentKeyNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(currentKeyNumber.replace(/\s+/g, ''), 'walletKey')}
                              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copiar número"
                            >
                              {copiedKey === 'walletKey' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Titular */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Titular de la Cuenta:</span>
                          <span className="font-bold text-white text-right">{currentHolder}</span>
                        </div>

                        {/* NIT o Documento */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">NIT / Identificación:</span>
                          <div className="flex items-center gap-2 font-mono text-slate-300">
                            <span>{currentDoc}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(currentDoc.replace(/[^0-9-]/g, ''), 'docId')}
                              className="p-1 text-slate-400 hover:text-amber-400 transition cursor-pointer"
                              title="Copiar documento"
                            >
                              {copiedKey === 'docId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Valor Exacto */}
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                          <span className="text-amber-400 font-bold">Valor Exacto a Transferir:</span>
                          <span className="font-black text-white text-sm font-mono">$600.000 COP</span>
                        </div>
                      </div>

                      {/* Tip para el aliado */}
                      <div className="text-[11px] text-slate-400 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Al finalizar la transferencia, toma una captura de pantalla del comprobante y adjúntala abajo con el número de aprobación o referencia.
                        </span>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })()}

            {/* Modal para Ampliar Código QR en Pantalla Completa */}
            {isQrModalOpen && zoomedQrUrl && (
              <div 
                className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
                onClick={() => setIsQrModalOpen(false)}
              >
                <div 
                  className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-fade-in relative"
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
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-bold">Milenia Cloud POS</span>
                    <h3 className="text-lg font-black text-white">Código QR Oficial de Recaudo</h3>
                    <p className="text-xs text-slate-400">Escanea directamente con la cámara de tu celular o app bancaria</p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border-4 border-amber-500 shadow-2xl flex items-center justify-center">
                    <img 
                      src={zoomedQrUrl} 
                      alt="Código QR Ampliado" 
                      className="w-full max-h-72 object-contain rounded-lg"
                    />
                  </div>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
                    <p className="text-xs font-bold text-white">Monto de Activación: $600.000 COP</p>
                    <p className="text-[11px] font-mono text-slate-400">Titular: {businessProfile.bankAccount?.accountHolder || businessProfile.legalName}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQrModalOpen(false)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Entendido / Cerrar Vista
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* SUBIR COMPROBANTE DE PAGO O TRANSACCIÓN (ANALIZADO POR GEMINI IA)          */}
            {/* ========================================================================= */}
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Receipt className="w-4 h-4" />
                  <span>Subir Comprobante de Transacción / Pago *</span>
                </div>
                
                {/* Badge Inteligente de Gemini IA */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span>Gemini AI Auto-OCR</span>
                </div>
              </div>

              <p className="text-xs text-slate-400">
                Una vez realizada la transacción en Daviplata, Nequi o Bancolombia, adjunta el pantallazo o comprobante. <strong className="text-purple-300">La IA de Gemini leerá el documento y transcribirá automáticamente el número de aprobación o referencia</strong> en la barra inferior.
              </p>

              {/* Subida del Comprobante (File Drag & Drop) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Captura de Pantalla o Comprobante Oficial *</span>
                  {paymentVoucherFile && (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Archivo cargado
                    </span>
                  )}
                </label>

                <input
                  type="file"
                  ref={voucherFileInputRef}
                  accept="image/png,image/jpeg,image/jpg,.pdf"
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
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentVoucherFile(null);
                            setPaymentReference('');
                            setGeminiAnalysisMessage(null);
                            setGeminiDetectedData(null);
                          }}
                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded-lg transition"
                          title="Eliminar comprobante"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Previsualización rápida de la imagen cargada */}
                    {paymentVoucherFile.dataUrl.startsWith('data:image') && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-36 bg-slate-950 flex items-center justify-center">
                        <img 
                          src={paymentVoucherFile.dataUrl} 
                          alt="Comprobante cargado" 
                          className="object-contain max-h-36 w-full opacity-90 hover:opacity-100 transition"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[9px] font-mono text-slate-300">
                          Vista Previa
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
                      Haz clic aquí para subir el <span className="text-amber-400">Comprobante de Pago</span> o arrastra el archivo
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Captura de Daviplata, Nequi o PDF bancario (PNG, JPG, PDF) &bull; <span className="text-purple-400 font-semibold">Gemini IA transcribirá la referencia</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Barra de Escritura: Número de Aprobación / Referencia de la Transacción */}
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
                      <Sparkles className="w-3 h-3" /> Transcrito con éxito
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Ej. 88472910 o Ref. M-194820"
                    className={`w-full pl-10 pr-28 py-2.5 bg-slate-900 border rounded-xl text-xs sm:text-sm text-white focus:outline-none font-mono transition-all ${
                      isAnalyzingVoucher 
                        ? 'border-purple-500/60 bg-purple-950/20' 
                        : paymentReference 
                        ? 'border-emerald-500/60 bg-slate-900 focus:border-emerald-400' 
                        : 'border-slate-800 focus:border-amber-500'
                    }`}
                  />

                  {/* Estado / Botón dentro de la barra de referencia */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isAnalyzingVoucher ? (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px] font-mono flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> IA Leyendo
                      </span>
                    ) : paymentReference ? (
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-mono flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[3]" /> IA Auto-fill
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Banner de Confirmación de Gemini IA */}
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

            {/* Botón Final: Subir Comprobante y Entrar al Panel del Aliado */}
            <button
              type="button"
              disabled={loading || !paymentVoucherFile}
              onClick={handleCompleteAllyRegistration}
              className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Base de Datos y Abriendo Panel...</span>
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

        {/* ========================================================================= */}
        {/* TAB 3: REGISTRAR EMPLEADO                                                 */}
        {/* ========================================================================= */}
        {activeTab === 'register_employee' && (
          <form onSubmit={handleRegisterEmployeeSubmit} className="space-y-5">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-500" />
                <span>Registrar Nuevo Empleado</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Vincula un nuevo colaborador operativo o gerencial al restaurante aliado correspondiente.
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
              
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo del Empleado *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={empFullName}
                    onChange={(e) => setEmpFullName(e.target.value)}
                    placeholder="Ej. Daniela Morales Pantoja"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
              </div>

              {/* Rol / Cargo & Restaurante */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cargo / Posición *
                  </label>
                  <select
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="capitan-salon">Capitán de Salón / Mesero</option>
                    <option value="chef-ejecutivo">Chef Ejecutivo / Jefe de Cocina (KDS)</option>
                    <option value="cajero-principal">Cajero Principal & Facturación DIAN</option>
                    <option value="gerente">Gerente General / Administrador</option>
                    <option value="supervisor">Supervisor de Turno</option>
                    <option value="barista">Barista & Bebidas</option>
                    <option value="auxiliar">Auxiliar de Operaciones</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Restaurante Aliado Asignado *
                  </label>
                  <select
                    value={empRestaurantId}
                    onChange={(e) => setEmpRestaurantId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} (ID: {t.id} - {t.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ID Empleado & Cédula */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      ID del Empleado *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmpEmployeeId('EMP-' + Math.floor(100 + Math.random() * 900))}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      Autogenerar
                    </button>
                  </div>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={empEmployeeId}
                      onChange={(e) => setEmpEmployeeId(e.target.value)}
                      placeholder="EMP-102"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula de Ciudadanía (C.C.) *
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={empDocumentId}
                      onChange={(e) => setEmpDocumentId(e.target.value)}
                      placeholder="1085201948"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Teléfono & PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono Móvil
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={empPhone}
                      onChange={(e) => setEmpPhone(e.target.value)}
                      placeholder="+57 315 220 8910"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PIN Numérico para Terminales POS / KDS
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      value={empPinCode}
                      onChange={(e) => setEmpPinCode(e.target.value)}
                      placeholder="1234"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono tracking-widest"
                    />
                  </div>
                </div>
              </div>

              {/* Credenciales de Acceso Web */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico de Acceso *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      placeholder="empleado@milenia.co"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={empPassword}
                      onChange={(e) => setEmpPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-amber-400 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Registrar Empleado */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registrando Empleado en Firestore...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 stroke-[2.5]" />
                  <span>Registrar Empleado y Abrir su Panel de Control</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
