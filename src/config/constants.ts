// Configurações globais da aplicação
export const APP_CONFIG = {
  name: 'Breno ERP',
  version: '1.0.0',
  description: 'Sistema ERP completo para gestão empresarial',
};

// Configurações de API
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000,
};

// Configurações do Supabase
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qerubjitetqwfqqydhzv.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU',
};

// Configurações de segurança
export const SECURITY_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa600fcc77ebe4c610026a24bfc95c4ce4cad1e353a4a9246562c1d90e35f01a1d',
};

// DEPRECATED: Use enums centralizados em src/types/enums.ts
// Mantido apenas para compatibilidade legada
import {
  TransactionStatus,
  TransactionType,
  ProductStatus,
  SaleStatus,
  PaymentMethod,
  BillingStatus,
  AccountsPayableStatus,
  NFeStatus,
  UserStatus,
  UserRole,
  CustomerStatus,
  PartnerRole
} from '@/types/enums';

// @deprecated - Use TransactionStatus do enums.ts
export const TRANSACTION_STATUS = {
  PENDING: TransactionStatus.PENDING,
  COMPLETED: TransactionStatus.COMPLETED,
  CANCELLED: TransactionStatus.CANCELLED,
};

// @deprecated - Use TransactionType do enums.ts
export const TRANSACTION_TYPES = {
  INCOME: TransactionType.INCOME,
  EXPENSE: TransactionType.EXPENSE,
};

// @deprecated - Use ProductStatus do enums.ts
export const PRODUCT_STATUS = {
  ACTIVE: ProductStatus.ACTIVE,
  INACTIVE: ProductStatus.INACTIVE,
  OUT_OF_STOCK: ProductStatus.OUT_OF_STOCK,
};

// @deprecated - Use SaleStatus do enums.ts
export const SALE_STATUS = {
  PENDING: SaleStatus.PENDENTE,
  COMPLETED: SaleStatus.CONCLUIDA,
  CANCELLED: SaleStatus.CANCELADA,
};

// @deprecated - Use PaymentMethod do enums.ts
export const PAYMENT_METHODS = {
  CASH: PaymentMethod.CASH,
  CREDIT_CARD: PaymentMethod.CREDIT_CARD,
  DEBIT_CARD: PaymentMethod.DEBIT_CARD,
  PIX: PaymentMethod.PIX,
  BANK_TRANSFER: PaymentMethod.BANK_TRANSFER,
};

// @deprecated - Use BillingStatus do enums.ts
export const BILLING_STATUS = {
  PENDING: BillingStatus.PENDING,
  PAID: BillingStatus.PAID,
  OVERDUE: BillingStatus.OVERDUE,
  CANCELLED: BillingStatus.CANCELLED,
};

// @deprecated - Use AccountsPayableStatus do enums.ts
export const ACCOUNTS_PAYABLE_STATUS = {
  PENDING: AccountsPayableStatus.PENDING,
  PAID: AccountsPayableStatus.PAID,
  OVERDUE: AccountsPayableStatus.OVERDUE,
  CANCELLED: AccountsPayableStatus.CANCELLED,
};

// @deprecated - Use NFeStatus do enums.ts
export const NFE_STATUS = {
  PENDING: NFeStatus.PENDING,
  ISSUED: NFeStatus.ISSUED,
  CANCELLED: NFeStatus.CANCELLED,
};

// @deprecated - Use UserStatus do enums.ts
export const USER_STATUS = {
  ACTIVE: UserStatus.ATIVO,
  INACTIVE: UserStatus.INATIVO,
  SUSPENDED: UserStatus.SUSPENSO,
};

// @deprecated - Use UserRole do enums.ts
export const USER_ROLES = {
  ADMIN: UserRole.ADMIN,
  USER: UserRole.USER,
  MANAGER: UserRole.MANAGER,
};

// @deprecated - Use CustomerStatus do enums.ts
export const PARTNER_STATUS = {
  ACTIVE: CustomerStatus.ATIVO,
  INACTIVE: CustomerStatus.INATIVO,
  PENDING: CustomerStatus.PENDENTE,
};

// @deprecated - Use PartnerRole do enums.ts
export const PARTNER_ROLES = {
  CUSTOMER: PartnerRole.CUSTOMER,
  SUPPLIER: PartnerRole.SUPPLIER,
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
  SECURITY_CONFIG,
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