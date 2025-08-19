// Hooks principais
export { useAppData, AppDataProvider } from './useAppData';
export { useAuth } from './useAuth';

// Hooks específicos por domínio
export { useTransactions } from './useTransactions';
export { useProducts } from './useProducts';
export { usePartners } from './usePartners';
export { useSegments } from './useSegments';
export { useFinancial } from './useFinancial';
export { useDocuments } from './useDocuments';
export { useCostCenters } from './useCostCenters';
export { useAdmin } from './useAdmin';
export { useDataLoader } from './useDataLoader';
export { useMetrics } from './useMetrics';

// Hook combinado
export { useCrudRefactored } from './useCrudRefactored';

// Hooks legados (para compatibilidade)
export { useAppData } from './useAppData';
export { useCrud } from './useCrud';
