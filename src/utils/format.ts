// Formatação de moeda brasileira
export const formatCurrencyBR = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue || 0);
};

// Formatação de data brasileira
export const formatDateBR = (iso: string | Date): string => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

// Formatação de mês/ano
export const formatMonthYear = (iso: string | Date): string => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

// Formatação de números
export const formatNumber = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR').format(numValue || 0);
};

// Formatação de percentual
export const formatPercent = (value: number | string): string => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${(numValue || 0).toFixed(2)}%`;
};
