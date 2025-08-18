// Mock data types for dashboard
// SalesData: { month: string, revenue: number, orders: number, ticket: number }
// ReceivableStatus: { status: string, amount: number }
// PayableItem: { date: string, amount: number, supplier: string }
// TopCustomer: { name: string, orders: number, revenue: number, lastOrder: string }
// LowStockProduct: { sku: string, name: string, stock: number, minStock: number }
// SegmentShare: { segment: string, revenue: number }
// ConversionFunnel: { stage: string, value: number }

export const salesLast12Months = [
  { month: '2024-09', revenue: 98000, orders: 280, ticket: 350.00 },
  { month: '2024-10', revenue: 105000, orders: 295, ticket: 355.93 },
  { month: '2024-11', revenue: 112000, orders: 310, ticket: 361.29 },
  { month: '2024-12', revenue: 135000, orders: 350, ticket: 385.71 },
  { month: '2025-01', revenue: 120000, orders: 340, ticket: 352.94 },
  { month: '2025-02', revenue: 118000, orders: 335, ticket: 352.24 },
  { month: '2025-03', revenue: 125000, orders: 345, ticket: 362.32 },
  { month: '2025-04', revenue: 132000, orders: 355, ticket: 371.83 },
  { month: '2025-05', revenue: 128000, orders: 350, ticket: 365.71 },
  { month: '2025-06', revenue: 135000, orders: 360, ticket: 375.00 },
  { month: '2025-07', revenue: 142000, orders: 370, ticket: 383.78 },
  { month: '2025-08', revenue: 148000, orders: 380, ticket: 389.47 },
];

export const receivablesByStatus = [
  { status: 'Aberto', amount: 48000 },
  { status: 'Pago', amount: 220000 },
  { status: 'Vencido', amount: 15000 },
];

export const payablesNext30d = [
  { date: '2025-08-20', amount: 12000, supplier: 'Fornecedor A' },
  { date: '2025-08-25', amount: 8500, supplier: 'Fornecedor B' },
  { date: '2025-08-28', amount: 15600, supplier: 'Fornecedor C' },
  { date: '2025-09-02', amount: 9200, supplier: 'Fornecedor D' },
  { date: '2025-09-05', amount: 11300, supplier: 'Fornecedor E' },
];

export const topCustomers = [
  { name: 'Restaurante Sabor & Arte', orders: 28, revenue: 54000, lastOrder: '2025-08-12' },
  { name: 'Café Central Ltda', orders: 25, revenue: 48000, lastOrder: '2025-08-15' },
  { name: 'Hotel Vista Mar', orders: 22, revenue: 42000, lastOrder: '2025-08-10' },
  { name: 'Padaria Doce Lar', orders: 20, revenue: 38000, lastOrder: '2025-08-08' },
  { name: 'Restaurante Italiano Bella', orders: 18, revenue: 35000, lastOrder: '2025-08-14' },
  { name: 'Cantina Universitária', orders: 16, revenue: 32000, lastOrder: '2025-08-11' },
  { name: 'Cafeteria Express', orders: 15, revenue: 30000, lastOrder: '2025-08-13' },
  { name: 'Bar & Grill Downtown', orders: 14, revenue: 28000, lastOrder: '2025-08-09' },
];

export const lowStockProducts = [
  { sku: 'ABC-001', name: 'Copo 300ml Transparente', stock: 12, minStock: 20 },
  { sku: 'ABC-002', name: 'Prato Raso 20cm', stock: 8, minStock: 25 },
  { sku: 'ABC-003', name: 'Garfo Inox', stock: 15, minStock: 30 },
  { sku: 'ABC-004', name: 'Faca Inox', stock: 10, minStock: 30 },
  { sku: 'ABC-005', name: 'Colher Inox', stock: 18, minStock: 30 },
  { sku: 'ABC-006', name: 'Toalha de Mesa 1,5m', stock: 5, minStock: 15 },
  { sku: 'ABC-007', name: 'Guardanapo 30x30cm', stock: 22, minStock: 50 },
  { sku: 'ABC-008', name: 'Jarra 1L', stock: 3, minStock: 10 },
  { sku: 'ABC-009', name: 'Bandeja 40x30cm', stock: 7, minStock: 20 },
  { sku: 'ABC-010', name: 'Travessa Oval', stock: 4, minStock: 12 },
];

export const segmentsShare = [
  { segment: 'Food Service', revenue: 180000 },
  { segment: 'Varejo', revenue: 95000 },
  { segment: 'Hospitalidade', revenue: 85000 },
  { segment: 'Eventos', revenue: 65000 },
  { segment: 'Outros', revenue: 45000 },
];

export const conversionFunnel = [
  { stage: 'Leads', value: 1200 },
  { stage: 'Propostas', value: 320 },
  { stage: 'Pedidos', value: 210 },
  { stage: 'Faturados', value: 180 },
];
