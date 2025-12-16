import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

// Validação de data - função compartilhada
export function isValidDate(dateStr: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return false;
  if (dateStr.includes('undefined')) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= lastDayOfMonth;
}

// Interface para filtros financeiros
export interface FinancialFilters {
  segmentId?: string | null;
  dateStart?: string | null;
  dateEnd?: string | null;
  direction?: string | null;
  status?: string | null;
  partner?: string | null;
}

// Função única para aplicar TODOS os filtros financeiros
// Deve ser aplicada ANTES de .range(), .order(), ou qualquer paginação
export function applyFinancialFilters<T extends PostgrestFilterBuilder<any, any, any>>(
  query: T,
  filters: FinancialFilters
): T {
  let filteredQuery = query;

  // 1. Filtro de segmento
  if (filters.segmentId && filters.segmentId !== 'null' && filters.segmentId !== '0' && filters.segmentId !== '') {
    filteredQuery = filteredQuery.eq('segment_id', filters.segmentId) as T;
    console.log('✅ [applyFinancialFilters] Segmento aplicado:', filters.segmentId);
  }

  // 2. Filtros de data - CRÍTICO: aplicar ANTES de qualquer outra operação
  const validDateStart = filters.dateStart && isValidDate(filters.dateStart) ? filters.dateStart : null;
  const validDateEnd = filters.dateEnd && isValidDate(filters.dateEnd) ? filters.dateEnd : null;

  if (validDateStart) {
    filteredQuery = filteredQuery.gte('issue_date', validDateStart) as T;
    console.log('✅ [applyFinancialFilters] Data inicial aplicada:', validDateStart);
  }
  if (validDateEnd) {
    filteredQuery = filteredQuery.lte('issue_date', validDateEnd) as T;
    console.log('✅ [applyFinancialFilters] Data final aplicada:', validDateEnd);
  }

  // 3. Filtro de tipo (direction)
  if (filters.direction && (filters.direction === 'receivable' || filters.direction === 'payable')) {
    filteredQuery = filteredQuery.eq('direction', filters.direction) as T;
    console.log('✅ [applyFinancialFilters] Tipo aplicado:', filters.direction);
  }

  // 4. Filtro de status
  if (filters.status && filters.status !== '') {
    filteredQuery = filteredQuery.eq('status', filters.status) as T;
    console.log('✅ [applyFinancialFilters] Status aplicado:', filters.status);
  }

  // 5. Filtro de parceiro (requer query adicional para buscar IDs)
  // Nota: Este filtro precisa ser aplicado separadamente pois requer join com partners
  // Por enquanto, retornamos a query e o caller pode aplicar o filtro de parceiro depois

  return filteredQuery;
}



