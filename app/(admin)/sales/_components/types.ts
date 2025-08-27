import { Sale, SaleItem, Product, Customer } from '@/types';

export interface SaleItemUI extends SaleItem {
  id: string;
  productName: string;
  totalPrice: number;
}

export interface FormData {
  customer_id: string;
  customer_name: string;
  sale_date: string;
  payment_method: string;
  status: string;
  notes: string;
}





export interface PaymentMethod {
  id: string;
  name: string;
  [key: string]: any;
}

export interface SalesViewProps {
  // Adicione props conforme necessário
}

export interface SalesKPIProps {
  totalSales: number;
  totalRevenue: number;
  uniqueCustomers: number;
  averageTicket: number;
}

export interface SalesFormProps {
  editingSale: Sale | null;
  onSubmit: (formData: FormData, saleItems: SaleItemUI[]) => void;
  onCancel: () => void;
}

export interface SalesListProps {
  items: Sale[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  onEdit: (sale: Sale) => void;
  onView: (sale: Sale) => void;
  onDelete: (id: string) => void;
}

export interface SaleViewModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}