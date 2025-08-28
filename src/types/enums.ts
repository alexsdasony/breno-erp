// =====================================================
// ENUMS CENTRALIZADOS - ALINHADOS COM SCHEMA DO BANCO
// =====================================================

// Status de usuários (alinhado com DB: 'ativo')
export const UserStatus = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso'
} as const;
export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// Status de clientes/parceiros (alinhado com DB: 'ativo')
export const CustomerStatus = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  SUSPENSO: 'suspenso',
  PENDENTE: 'pendente',
  EM_ANALISE: 'em_analise',
  APROVADO: 'aprovado',
  REPROVADO: 'reprovado'
} as const;
export type CustomerStatus = typeof CustomerStatus[keyof typeof CustomerStatus];

// Status de vendas (alinhado com DB: 'Pendente')
export const SaleStatus = {
  PENDENTE: 'Pendente',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
  COMPLETED: 'completed' // compatibilidade legada
} as const;
export type SaleStatus = typeof SaleStatus[keyof typeof SaleStatus];

// Status de contas a pagar (alinhado com DB: 'pending')
export const AccountsPayableStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;
export type AccountsPayableStatus = typeof AccountsPayableStatus[keyof typeof AccountsPayableStatus];

// Status de faturamento (alinhado com DB: 'Pendente')
export const BillingStatus = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado',
  // Compatibilidade legada
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
} as const;
export type BillingStatus = typeof BillingStatus[keyof typeof BillingStatus];

// Status de NFe (alinhado com DB: 'Emitida')
export const NFeStatus = {
  EMITIDA: 'Emitida',
  CANCELADA: 'Cancelada',
  PENDENTE: 'Pendente',
  // Compatibilidade legada
  PENDING: 'pending',
  ISSUED: 'issued',
  CANCELLED: 'cancelled'
} as const;
export type NFeStatus = typeof NFeStatus[keyof typeof NFeStatus];

// Status de produtos
export const ProductStatus = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  FORA_ESTOQUE: 'fora_estoque',
  // Compatibilidade legada
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
} as const;
export type ProductStatus = typeof ProductStatus[keyof typeof ProductStatus];

// Status de transações
export const TransactionStatus = {
  PENDENTE: 'pendente',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
  // Compatibilidade legada
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;
export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

// Tipos de transação
export const TransactionType = {
  RECEITA: 'receita',
  DESPESA: 'despesa',
  // Compatibilidade legada
  INCOME: 'income',
  EXPENSE: 'expense'
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

// Roles de usuários
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
  MANAGER: 'manager'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

// Roles de parceiros
export const PartnerRole = {
  CUSTOMER: 'customer',
  SUPPLIER: 'supplier'
} as const;
export type PartnerRole = typeof PartnerRole[keyof typeof PartnerRole];

// Métodos de pagamento (alinhado com DB)
export const PaymentMethod = {
  DINHEIRO: 'dinheiro',
  CARTAO_CREDITO: 'cartão de crédito',
  CARTAO_DEBITO: 'cartão de débito',
  PIX: 'pix',
  TRANSFERENCIA_BANCARIA: 'transferência bancária',
  // Compatibilidade legada
  CASH: 'dinheiro',
  CREDIT_CARD: 'cartão de crédito',
  DEBIT_CARD: 'cartão de débito',
  BANK_TRANSFER: 'transferência bancária'
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Tipo de pessoa
export const PersonType = {
  PF: 'pf',
  PJ: 'pj'
} as const;
export type PersonType = typeof PersonType[keyof typeof PersonType];

// Status de integração
export const IntegrationStatus = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  ERRO: 'erro',
  // Compatibilidade legada
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error'
} as const;
export type IntegrationStatus = typeof IntegrationStatus[keyof typeof IntegrationStatus];

// =====================================================
// MAPEADORES PARA COMPATIBILIDADE
// =====================================================

// Mapear valores legados em inglês para português
export const StatusMapper = {
  // User Status
  'active': UserStatus.ATIVO,
  'inactive': UserStatus.INATIVO,
  'suspended': UserStatus.SUSPENSO,
  
  // Customer Status
  'ativo': CustomerStatus.ATIVO,
  'inativo': CustomerStatus.INATIVO,
  'suspenso': CustomerStatus.SUSPENSO,
  'pendente': CustomerStatus.PENDENTE,
  'em_analise': CustomerStatus.EM_ANALISE,
  'aprovado': CustomerStatus.APROVADO,
  'reprovado': CustomerStatus.REPROVADO,
  
  // Sale Status
  'completed': SaleStatus.COMPLETED,
  'Pendente': SaleStatus.PENDENTE,
  'Concluída': SaleStatus.CONCLUIDA,
  'Cancelada': SaleStatus.CANCELADA,
  
  // Billing Status
  'pending': BillingStatus.PENDING,
  'paid': BillingStatus.PAID,
  'overdue': BillingStatus.OVERDUE,
  'cancelled': BillingStatus.CANCELLED,
  'Pago': BillingStatus.PAGO,
  'Atrasado': BillingStatus.ATRASADO,
  'Cancelado': BillingStatus.CANCELADO
} as const;

// Função utilitária para normalizar status
export function normalizeStatus(status: string | null | undefined, defaultStatus: string = 'ativo'): string {
  if (!status) return defaultStatus;
  return StatusMapper[status as keyof typeof StatusMapper] || status;
}

// =====================================================
// VALIDADORES
// =====================================================

export function isValidUserStatus(status: string): status is UserStatus {
  return Object.values(UserStatus).includes(status as UserStatus);
}

export function isValidCustomerStatus(status: string): status is CustomerStatus {
  return Object.values(CustomerStatus).includes(status as CustomerStatus);
}

export function isValidSaleStatus(status: string): status is SaleStatus {
  return Object.values(SaleStatus).includes(status as SaleStatus);
}

export function isValidAccountsPayableStatus(status: string): status is AccountsPayableStatus {
  return Object.values(AccountsPayableStatus).includes(status as AccountsPayableStatus);
}

export function isValidBillingStatus(status: string): status is BillingStatus {
  return Object.values(BillingStatus).includes(status as BillingStatus);
}

export function isValidNFeStatus(status: string): status is NFeStatus {
  return Object.values(NFeStatus).includes(status as NFeStatus);
}

export function isValidProductStatus(status: string): status is ProductStatus {
  return Object.values(ProductStatus).includes(status as ProductStatus);
}

export function isValidTransactionStatus(status: string): status is TransactionStatus {
  return Object.values(TransactionStatus).includes(status as TransactionStatus);
}

export function isValidPaymentMethod(method: string): method is PaymentMethod {
  return Object.values(PaymentMethod).includes(method as PaymentMethod);
}

export function isValidPersonType(type: string): type is PersonType {
  return Object.values(PersonType).includes(type as PersonType);
}

export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

export function isValidPartnerRole(role: string): role is PartnerRole {
  return Object.values(PartnerRole).includes(role as PartnerRole);
}

export function isValidIntegrationStatus(status: string): status is IntegrationStatus {
  return Object.values(IntegrationStatus).includes(status as IntegrationStatus);
}