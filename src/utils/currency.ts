/**
 * Utility for formatting currency in Colombian Pesos (COP)
 */
export function formatCop(amount: number): string {
  if (isNaN(amount)) return '$ 0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
}

export function formatCopPlain(amount: number): string {
  if (isNaN(amount)) return '0';
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
}
