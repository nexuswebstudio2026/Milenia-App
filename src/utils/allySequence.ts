/**
 * Utilidades centralizadas para la gestión y consecutivo estricto de Aliados Gastronómicos en Milenia SaaS
 * Garantiza que el primer aliado sea siempre el número 1 (#001), el segundo sea el 2 (#002), el tercero el 3 (#003), etc.
 */

export interface AllySequenceInfo {
  nextNumber: number;
  nextAllyNumber: string;
  nextId: string;
}

/**
 * Extrae el valor numérico entero de un identificador o número de aliado
 * Soporta formatos como: '#001', '1', 'aliado-1', 'Aliado #1', '#1788', etc.
 */
export function extractAllyNumber(raw: any): number {
  if (raw === null || raw === undefined) return 0;
  
  if (typeof raw === 'number') {
    // Si es un timestamp grande (ej. 1788... o Date.now()), no es un número consecutivo válido
    if (raw > 10000) return 0;
    return raw > 0 ? Math.floor(raw) : 0;
  }

  const str = String(raw).trim();
  if (!str) return 0;

  // Si tiene formato '#001' o '#1'
  const hashMatch = str.match(/#(\d+)/);
  if (hashMatch) {
    const num = parseInt(hashMatch[1], 10);
    // Si es un timestamp de 4+ dígitos generado por error (como 1788 de Date.now()), descartarlo si es mayor a 1000
    if (num > 1000) return 0;
    return isNaN(num) ? 0 : num;
  }

  // Si tiene formato 'aliado-1' o 'aliado-001'
  const aliadoMatch = str.match(/aliado-(\d+)/i);
  if (aliadoMatch) {
    const num = parseInt(aliadoMatch[1], 10);
    if (num > 1000) return 0;
    return isNaN(num) ? 0 : num;
  }

  // Si es directamente un número en string como '1', '2', '001'
  const directNum = parseInt(str, 10);
  if (!isNaN(directNum) && directNum > 0) {
    if (directNum > 1000) return 0;
    return directNum;
  }

  return 0;
}

/**
 * Formatea un número entero a la convención estándar de Milenia (#001, #002, #010, etc.)
 */
export function formatAllyNumber(num: number): string {
  const safeNum = Math.max(1, Math.floor(num || 1));
  return `#${String(safeNum).padStart(3, '0')}`;
}

/**
 * Obtiene la etiqueta amigable para mostrar en UI (ej: 'Aliado #001' o 'Aliado 1')
 */
export function formatAllyDisplay(allyNumber?: string | number, id?: string | number): string {
  const num = extractAllyNumber(allyNumber) || extractAllyNumber(id) || 1;
  return `Aliado ${formatAllyNumber(num)}`;
}

/**
 * Calcula el siguiente consecutivo estricto basado en la lista actual de aliados en la base de datos
 * Si no hay aliados -> 1 (#001)
 * Si hay 1 aliado -> 2 (#002)
 * Si hay N aliados -> N+1 (#(N+1))
 */
export function calculateNextAllySequence(allies: any[] = []): AllySequenceInfo {
  if (!Array.isArray(allies) || allies.length === 0) {
    return {
      nextNumber: 1,
      nextAllyNumber: '#001',
      nextId: '1'
    };
  }

  const existingNumbers = allies
    .map(a => {
      const numFromField = extractAllyNumber(a.allyNumber);
      if (numFromField > 0) return numFromField;
      
      const numFromId = extractAllyNumber(a.id);
      if (numFromId > 0) return numFromId;

      return 0;
    })
    .filter(n => n > 0);

  let maxNumber = 0;
  if (existingNumbers.length > 0) {
    maxNumber = Math.max(...existingNumbers);
  } else {
    // Si había aliados pero ninguno tenía número válido (por ejemplo tenían IDs de timestamps), usamos el total
    maxNumber = allies.length;
  }

  const nextNumber = maxNumber + 1;
  return {
    nextNumber,
    nextAllyNumber: formatAllyNumber(nextNumber),
    nextId: String(nextNumber)
  };
}

/**
 * Normaliza un array de aliados asegurando que sus consecutivos estén en orden estricto (1, 2, 3...)
 */
export function sanitizeAllySequenceList<T extends { id?: string; allyNumber?: string; createdAt?: string }>(allies: T[]): T[] {
  if (!Array.isArray(allies) || allies.length === 0) return [];

  return allies.map((ally, index) => {
    const naturalSeq = index + 1;
    const currentNum = extractAllyNumber(ally.allyNumber) || extractAllyNumber(ally.id);
    const finalNum = currentNum > 0 && currentNum <= allies.length ? currentNum : naturalSeq;
    const formattedNum = formatAllyNumber(finalNum);

    return {
      ...ally,
      allyNumber: formattedNum,
      id: ally.id && !ally.id.startsWith('aliado-17') && ally.id !== '1788' ? String(ally.id) : String(finalNum)
    };
  });
}
