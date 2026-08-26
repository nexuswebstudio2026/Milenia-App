import { 
  db, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from '../firebaseConfig';

export interface MileniaFinancialSummary {
  id: string;
  titulo: string;
  ingresos: number;
  gastos: number;
  balanceNeto: number;
  margenNeto: number;
  descripcion?: string;
  notas?: string;
  updatedAt: string;
  updatedBy?: string;
}

export const DEFAULT_FINANCIAL_SUMMARY: MileniaFinancialSummary = {
  id: 'principal',
  titulo: 'Resumen Financiero Consolidado',
  ingresos: 0,
  gastos: 0,
  balanceNeto: 0,
  margenNeto: 0,
  descripcion: 'Tabla consolidada de ingresos, gastos y balance neto en Firebase Firestore (/resumen_financiero).',
  notas: 'Valores iniciales en cero ($0 COP). El balance neto es calculado automáticamente como ingresos menos gastos.',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Propietario Milenia'
};

const COLLECTION_NAME = 'resumen_financiero';
const DOC_ID = 'principal';
const LOCAL_STORAGE_KEY = 'milenia_resumen_financiero_cache_v1';

/**
 * Obtiene el resumen financiero desde Firestore (/resumen_financiero/principal)
 * Si no existe, inicializa con valores en CERO (0) en la base de datos.
 */
export async function getFinancialSummary(): Promise<MileniaFinancialSummary> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data() as MileniaFinancialSummary;
      const ingresos = Number(data.ingresos) || 0;
      const gastos = Number(data.gastos) || 0;
      const balanceNeto = ingresos - gastos;
      const margenNeto = ingresos > 0 ? ((balanceNeto / ingresos) * 100) : 0;

      const normalized: MileniaFinancialSummary = {
        ...data,
        id: DOC_ID,
        ingresos,
        gastos,
        balanceNeto,
        margenNeto: Number(margenNeto.toFixed(1))
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
      return normalized;
    }

    // Si no existe el documento en Firestore, lo crea con valores en CERO
    await setDoc(docRef, DEFAULT_FINANCIAL_SUMMARY, { merge: true });
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_FINANCIAL_SUMMARY));
    return DEFAULT_FINANCIAL_SUMMARY;
  } catch (error) {
    console.warn('Error al leer /resumen_financiero de Firestore:', error);
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
    return DEFAULT_FINANCIAL_SUMMARY;
  }
}

/**
 * Guarda o actualiza el resumen financiero en Firestore (/resumen_financiero/principal)
 * Calcula automáticamente: balanceNeto = ingresos - gastos
 */
export async function saveFinancialSummary(payload: {
  ingresos: number;
  gastos: number;
  titulo?: string;
  descripcion?: string;
  notas?: string;
}): Promise<MileniaFinancialSummary> {
  const ingresos = Math.max(0, Number(payload.ingresos) || 0);
  const gastos = Math.max(0, Number(payload.gastos) || 0);
  const balanceNeto = ingresos - gastos;
  const margenNeto = ingresos > 0 ? Number(((balanceNeto / ingresos) * 100).toFixed(1)) : 0;

  const data: MileniaFinancialSummary = {
    id: DOC_ID,
    titulo: payload.titulo || 'Resumen Financiero Consolidado',
    ingresos,
    gastos,
    balanceNeto,
    margenNeto,
    descripcion: payload.descripcion || 'Tabla consolidada de ingresos, gastos y balance neto en Firebase Firestore (/resumen_financiero).',
    notas: payload.notas || '',
    updatedAt: new Date().toISOString(),
    updatedBy: 'Propietario Milenia'
  };

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.warn('Error al guardar /resumen_financiero en Firestore:', error);
  }

  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  return data;
}

/**
 * Restablece los valores financieros a Cero ($0 COP) en Firestore
 */
export async function resetFinancialSummaryToZero(): Promise<MileniaFinancialSummary> {
  return saveFinancialSummary({
    ingresos: 0,
    gastos: 0,
    titulo: 'Resumen Financiero Consolidado',
    descripcion: 'Valores restablecidos a cero ($0 COP) en Firestore.',
    notas: 'Ingresos: $0 | Gastos: $0 | Balance Neto: $0'
  });
}

/**
 * Suscripción en tiempo real a la tabla /resumen_financiero/principal de Firestore
 */
export function subscribeToFinancialSummary(onUpdate: (summary: MileniaFinancialSummary) => void) {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as MileniaFinancialSummary;
        const ingresos = Number(data.ingresos) || 0;
        const gastos = Number(data.gastos) || 0;
        const balanceNeto = ingresos - gastos;
        const margenNeto = ingresos > 0 ? Number(((balanceNeto / ingresos) * 100).toFixed(1)) : 0;

        const normalized: MileniaFinancialSummary = {
          ...data,
          id: DOC_ID,
          ingresos,
          gastos,
          balanceNeto,
          margenNeto
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
        onUpdate(normalized);
      } else {
        // Si no existe, invoca con el valor en cero
        onUpdate(DEFAULT_FINANCIAL_SUMMARY);
      }
    }, (err) => {
      console.warn('Error en snapshot listener de /resumen_financiero:', err);
    });
  } catch (e) {
    console.warn('No se pudo iniciar listener en /resumen_financiero:', e);
    return () => {};
  }
}
