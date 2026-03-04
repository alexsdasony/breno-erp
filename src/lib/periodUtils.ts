/**
 * Retorna dateStart e dateEnd (YYYY-MM-DD) a partir do período selecionado.
 * Usado por Dashboard, Financeiro, Vendas, Cobranças e Contas a pagar.
 */
export type Period =
  | 'current_month'
  | '7d'
  | '30d'
  | '90d'
  | '6mo'
  | '1yr'
  | 'last-year'
  | 'custom'
  | 'year-2021'
  | 'year-2022'
  | 'year-2023'
  | 'year-2024'
  | 'year-2025';

export function getDateRangeFromPeriod(
  period: Period,
  customStart?: string,
  customEnd?: string
): { dateStart: string; dateEnd: string } {
  const now = new Date();
  const toYYYYMMDD = (d: Date) => d.toISOString().split('T')[0];

  if (period === 'custom' && customStart && customEnd) {
    return { dateStart: customStart, dateEnd: customEnd };
  }

  switch (period) {
    case 'current_month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { dateStart: toYYYYMMDD(first), dateEnd: toYYYYMMDD(last) };
    }
    case '7d': {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { dateStart: toYYYYMMDD(start), dateEnd: toYYYYMMDD(now) };
    }
    case '30d': {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { dateStart: toYYYYMMDD(start), dateEnd: toYYYYMMDD(now) };
    }
    case '90d': {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { dateStart: toYYYYMMDD(start), dateEnd: toYYYYMMDD(now) };
    }
    case '6mo': {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      return { dateStart: toYYYYMMDD(start), dateEnd: toYYYYMMDD(now) };
    }
    case '1yr': {
      const start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return { dateStart: toYYYYMMDD(start), dateEnd: toYYYYMMDD(now) };
    }
    case 'last-year': {
      const first = new Date(now.getFullYear() - 1, 0, 1);
      const last = new Date(now.getFullYear() - 1, 11, 31);
      return { dateStart: toYYYYMMDD(first), dateEnd: toYYYYMMDD(last) };
    }
    default:
      if (period.startsWith('year-')) {
        const year = parseInt(period.split('-')[1], 10);
        const first = new Date(year, 0, 1);
        const last = new Date(year, 11, 31);
        return { dateStart: toYYYYMMDD(first), dateEnd: toYYYYMMDD(last) };
      }
  }

  // fallback: mês atual
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { dateStart: toYYYYMMDD(first), dateEnd: toYYYYMMDD(last) };
}
