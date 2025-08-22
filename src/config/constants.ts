// Configurações globais da aplicação
export const APP_CONFIG = {
  name: 'Breno ERP',
  version: '1.0.0',
  description: 'Sistema ERP completo para gestão empresarial',
};

// Configurações de API
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://qerubjitetqwfqqydhzv.supabase.co/functions/v1',
  timeout: 30000,
};

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qerubjitetqwfqqydhzv.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Status de transações
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Tipos de transação
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

// Status de produtos
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
};

// Status de vendas
export const SALE_STATUS = {
  PENDING: 'Pendente',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

// Métodos de pagamento
export const PAYMENT_METHODS = {
  CASH: 'dinheiro',
  CREDIT_CARD: 'cartão de crédito',
  DEBIT_CARD: 'cartão de débito',
  PIX: 'pix',
  BANK_TRANSFER: 'transferência bancária',
};

// Status de faturas
export const BILLING_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Status de contas a pagar
export const ACCOUNTS_PAYABLE_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
};

// Status de NFe
export const NFE_STATUS = {
  PENDING: 'pending',
  ISSUED: 'issued',
  CANCELLED: 'cancelled',
};

// Status de usuários
export const USER_STATUS = {
  ACTIVE: 'ativo',
  INACTIVE: 'inativo',
  SUSPENDED: 'suspenso',
};

// Roles de usuários
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager',
};

// Status de parceiros
export const PARTNER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pendente',
};

// Roles de parceiros
export const PARTNER_ROLES = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier',
};

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// URLs de desenvolvimento (apenas para testes)
export const DEV_URLS = [
  'http://localhost:3000',
  'http://localhost:5173'
];

// Configurações de validação
export const VALIDATION_CONFIG = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
};

// Configurações de formatação
export const FORMAT_CONFIG = {
  DATE_FORMAT: 'dd/MM/yyyy',
  DATETIME_FORMAT: 'dd/MM/yyyy HH:mm',
  CURRENCY_FORMAT: 'BRL',
  DECIMAL_PLACES: 2,
};

export default {
  APP_CONFIG,
  API_CONFIG,
  SUPABASE_CONFIG,
  TRANSACTION_STATUS,
  TRANSACTION_TYPES,
  PRODUCT_STATUS,
  SALE_STATUS,
  PAYMENT_METHODS,
  BILLING_STATUS,
  ACCOUNTS_PAYABLE_STATUS,
  NFE_STATUS,
  USER_STATUS,
  USER_ROLES,
  PARTNER_STATUS,
  PARTNER_ROLES,
  PAGINATION_CONFIG,
  DEV_URLS,
  VALIDATION_CONFIG,
  FORMAT_CONFIG,
}; 