// API Service - Centralized HTTP client for backend communication
// Usa NEXT_PUBLIC_API_URL para Edge Functions do Supabase
import { API_CONFIG, SUPABASE_CONFIG } from '@/config/constants';

const API_BASE_URL = API_CONFIG.baseURL;

// Cache em memória para token - COM sessionStorage para persistência
let tokenCache: string | null = null;
let isRedirectingToLogin = false;

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

interface Partner {
  id: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status?: string;
  segment_id?: string | null;
  role?: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  cpf: string;
  cnpj: string;
  status: string;
  segment_id: string | null;
}

class ApiService {
  private baseURL: string;
  private token: string | null;
  private supabaseAnonKey: string | undefined;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
    this.supabaseAnonKey = SUPABASE_CONFIG.anonKey;
  }

  // Helpers: map customers <-> partners
  partnerToCustomer(partner: Partner | null): Customer | null {
    if (!partner) return null;
    const taxId = partner.tax_id || '';
    const isCpf = taxId && taxId.replace(/\D/g, '').length <= 11;
    return {
      id: partner.id,
      name: partner.name,
      email: partner.email || '',
      phone: partner.phone || '',
      address: partner.address || '',
      city: partner.city || '',
      state: partner.state || '',
      cep: partner.zip_code || '',
      cpf: isCpf ? taxId : '',
      cnpj: !isCpf ? taxId : '',
      status: partner.status || 'pendente',
      segment_id: partner.segment_id || null,
    };
  }

  customerToPartnerPayload(customerData: any, role: string = 'customer'): any {
    const tax_id = customerData?.cpf?.trim() || customerData?.cnpj?.trim() || customerData?.tax_id || '';
    return {
      name: customerData.name,
      tax_id,
      email: customerData.email || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      city: customerData.city || '',
      state: customerData.state || '',
      zip_code: customerData.cep || customerData.zip_code || '',
      status: customerData.status || 'active',
      segment_id: customerData.segment_id || customerData.segmentId || null,
      role,
    };
  }

  // Set authentication token - COM sessionStorage para persistência
  setToken(token: string): void {
    this.token = token;
    tokenCache = token;
    // Usar sessionStorage para persistir durante a sessão
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('auth_token', token);
      } catch (error) {
        console.warn('Erro ao salvar token no sessionStorage:', error);
      }
    }
  }

  // Get authentication token - COM sessionStorage para persistência
  getToken(): string | null {
    if (tokenCache) return tokenCache;
    
    // Tentar recuperar do sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const storedToken = sessionStorage.getItem('auth_token');
        if (storedToken) {
          tokenCache = storedToken;
          return storedToken;
        }
      } catch (error) {
        console.warn('Erro ao recuperar token do sessionStorage:', error);
      }
    }
    
    return null;
  }

  // Clear token - COM sessionStorage para persistência
  clearToken(): void {
    this.token = null;
    tokenCache = null;
    // Limpar do sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('auth_token');
      } catch (error) {
        console.warn('Erro ao limpar token do sessionStorage:', error);
      }
    }
  }

  // Generic request method
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const isEdgeFunctions = this.baseURL === '/api' || (typeof this.baseURL === 'string' && this.baseURL.includes('supabase.co'));
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Para Edge Functions do Supabase use as chaves de projeto.
        ...(this.supabaseAnonKey && { 'Authorization': `Bearer ${this.supabaseAnonKey}` }),
        ...(this.supabaseAnonKey && { 'apikey': this.supabaseAnonKey }),
        // Sempre envie X-User-Token quando houver token de usuário, inclusive para Edge Functions (CORS já permite este header)
        ...(token ? { 'X-User-Token': token } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      // Handle token expiration
      if (response.status === 401) {
        this.clearToken();
        if (!isRedirectingToLogin && typeof window !== 'undefined') {
          isRedirectingToLogin = true;
          window.location.href = '/login';
        }
        // Lançar erro estruturado (evita {} no console)
        throw { message: 'Authentication failed', status: 401 };
      }

      // Tentar parsear JSON com fallback seguro
      let data: any = null;
      try {
        data = await response.json();
      } catch {
        // Corpo vazio ou inválido
        data = null;
      }
      
      if (!response.ok) {
        const errorMessage = (data && (data.error || data.message)) || `HTTP error! status: ${response.status}`;
        const error = {
          message: errorMessage,
          status: response.status,
          data: data
        };
        throw error;
      }
      
      return data as T;
    } catch (error: any) {
      // Evitar logs ruidosos em 401 (já redireciona)
      if (error?.status !== 401) {
        console.error(`API Error (${endpoint}):`, error);
      }
      throw error;
    } finally {
      if (isRedirectingToLogin) {
        setTimeout(() => { isRedirectingToLogin = false; }, 2000);
      }
    }
  }

  // GET request
  get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints - Usando APENAS o backend
  async register(userData: any): Promise<ApiResponse> {
    return this.post('/auth/register', userData);
  }

  async login(credentials: any): Promise<ApiResponse> {
    const response = await this.post<ApiResponse>('/auth', credentials);
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse> {
    try {
      await this.post('/auth/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
    return { data: { success: true } };
  }

  async getProfile(): Promise<ApiResponse> {
    // Evitar chamada se não houver token de usuário
    if (!this.getToken()) {
      throw { message: 'Not authenticated', status: 401 };
    }
    return this.get('/auth/profile');
  }

  async checkAuth(): Promise<boolean> {
    // Se não há token, já retorna false sem chamar a rede
    if (!this.getToken()) return false;
    // Verificar token usando /auth/profile silenciosamente
    try {
      const profile: any = await this.get('/auth/profile');
      return Boolean(profile && profile.user && profile.success !== false);
    } catch (_err) {
      return false;
    }
  }

  async updateProfile(userData: any): Promise<ApiResponse> {
    return this.put('/auth/profile', userData);
  }

  async changePassword(passwordData: any): Promise<ApiResponse> {
    return this.put('/auth/password', passwordData);
  }

  async requestPasswordReset(data: any): Promise<ApiResponse> {
    return this.post('/auth/forgot-password', data);
  }

  async resetPassword(data: any): Promise<ApiResponse> {
    return this.post('/auth/reset-password', data);
  }

  // Segments endpoints - Usando APENAS o backend
  async getSegments(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/segments', params);
  }

  async createSegment(segmentData: any): Promise<ApiResponse> {
    return this.post('/segments', segmentData);
  }

  async updateSegment(id: string, segmentData: any): Promise<ApiResponse> {
    return this.put(`/segments/${id}`, segmentData);
  }

  async deleteSegment(id: string): Promise<ApiResponse> {
    return this.delete(`/segments/${id}`);
  }

  // Payment Methods endpoints - Usando APENAS o backend
  async getPaymentMethods(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/payment-methods', params);
  }

  async createPaymentMethod(data: any): Promise<ApiResponse> {
    const payload = {
      name: data.name,
      nfe_code: data.nfe_code ?? data.nfeCode ?? null,
    };
    return this.post('/payment-methods', payload);
  }

  async updatePaymentMethod(id: string, data: any): Promise<ApiResponse> {
    const payload = {
      name: data.name ?? null,
      nfe_code: data.nfe_code ?? data.nfeCode ?? null,
    };
    return this.put(`/payment-methods/${id}`, payload);
  }

  async deletePaymentMethod(id: string): Promise<ApiResponse> {
    return this.delete(`/payment-methods/${id}`);
  }

  // Transactions endpoints - Usando APENAS o backend
  async getTransactions(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/transactions', params);
  }

  async createTransaction(transactionData: any): Promise<ApiResponse> {
    // Mapear camelCase do front para snake_case esperado pelo banco
    const payload = {
      type: transactionData.type,
      description: transactionData.description,
      amount: transactionData.amount,
      date: transactionData.date,
      category: transactionData.category,
      cost_center: transactionData.costCenter ?? null,
      segment_id: transactionData.segmentId ?? transactionData.segment_id ?? null,
    };
    return this.post('/transactions', payload);
  }

  async updateTransaction(id: string, transactionData: any): Promise<ApiResponse> {
    const payload = {
      type: transactionData.type,
      description: transactionData.description,
      amount: transactionData.amount,
      date: transactionData.date,
      category: transactionData.category,
      cost_center: transactionData.costCenter ?? transactionData.cost_center ?? null,
      segment_id: transactionData.segmentId ?? transactionData.segment_id ?? null,
    };
    return this.put(`/transactions/${id}`, payload);
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    return this.delete(`/transactions/${id}`);
  }

  async importTransactions(transactions: any[]): Promise<ApiResponse> {
    return this.post('/transactions/import', { transactions });
  }

  // Customers endpoints - Usando APENAS o backend
  async getCustomers(params: Record<string, any> = {}): Promise<{ customers: Customer[] }> {
    const response = await this.get<{ partners?: Partner[]; data?: Partner[] }>('/partners', { ...params, role: 'customer' });
    const partners = response.partners || response.data || [];
    const customers = partners.map((p) => this.partnerToCustomer(p)).filter(Boolean) as Customer[];
    return { customers };
  }

  async createCustomer(customerData: any): Promise<{ customer: Customer }> {
    const payload = this.customerToPartnerPayload(customerData, 'customer');
    const created = await this.post<{ partner?: Partner; data?: Partner }>('/partners', payload);
    const partner = created.partner || created.data || created;
    return { customer: this.partnerToCustomer(partner as Partner)! };
  }

  async updateCustomer(id: string, customerData: any): Promise<{ customer: Customer }> {
    const payload = this.customerToPartnerPayload(customerData, 'customer');
    const updated = await this.put<{ partner?: Partner; data?: Partner }>(`/partners/${id}`, payload);
    const partner = updated.partner || updated.data || updated;
    return { customer: this.partnerToCustomer(partner as Partner)! };
  }

  async deleteCustomer(id: string): Promise<ApiResponse> {
    return this.delete(`/partners/${id}`);
  }

  async getCustomerById(id: string): Promise<{ customer: Customer }> {
    const response = await this.get<{ partner?: Partner; data?: Partner }>(`/partners/${id}`);
    const partner = response.partner || response.data || response;
    return { customer: this.partnerToCustomer(partner as Partner)! };
  }

  // Products endpoints - Usando APENAS o backend
  async getProducts(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/products', params);
  }

  async createProduct(productData: any): Promise<ApiResponse> {
    // Mapear camelCase do front para snake_case do backend
    const payload = {
      name: productData.name,
      price: productData.price,
      category: productData.category ?? null,
      stock: productData.stock ?? productData.stock_quantity ?? 0,
      min_stock: productData.minStock ?? productData.minimum_stock ?? 0,
      segment_id: productData.segment_id ?? productData.segmentId ?? null,
      code: productData.code ?? null,
      description: productData.description ?? null,
      cost_price: productData.cost_price ?? productData.costPrice ?? null,
      supplier: productData.supplier ?? null,
    };
    return this.post('/products', payload);
  }

  async updateProduct(id: string, productData: any): Promise<ApiResponse> {
    const payload = {
      name: productData.name || null,
      price: parseFloat(productData.price) || 0,
      category: productData.category || null,
      stock_quantity: parseInt(productData.stock) || parseInt(productData.stock_quantity) || 0,
      minimum_stock: parseInt(productData.minStock) || parseInt(productData.minimum_stock) || 0,
      segment_id: productData.segment_id || productData.segmentId || null,
      code: productData.code || null,
      description: productData.description || null,
      cost_price: parseFloat(productData.cost) || parseFloat(productData.cost_price) || parseFloat(productData.costPrice) || 0,
      supplier: productData.supplier || null,
    };
    return this.put(`/products/${id}`, payload);
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    return this.delete(`/products/${id}`);
  }

  async getLowStockProducts(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/products', { ...params, low_stock: 'true' });
  }

  // Sales endpoints - Usando APENAS o backend
  async getSales(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/sales', params);
  }

  async createSale(saleData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: saleData.customer_id || saleData.customerId,
      customer_name: saleData.customer_name || saleData.customerName || '',
      sale_date: saleData.sale_date || saleData.saleDate || new Date().toISOString().split('T')[0],
      total_amount: saleData.total_amount || saleData.totalAmount || 0,
      discount: saleData.discount || 0,
      final_amount: saleData.final_amount || saleData.finalAmount || 0,
      payment_method: saleData.payment_method || saleData.paymentMethod || 'dinheiro',
      status: saleData.status || 'Pendente',
      notes: saleData.notes || '',
      segment_id: saleData.segment_id || saleData.segmentId || null,
      items: saleData.items || []
    };
    return this.post('/sales', payload);
  }

  async updateSale(id: string, saleData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: saleData.customer_id || saleData.customerId || null,
      customer_name: saleData.customer_name || saleData.customerName || null,
      sale_date: saleData.sale_date || saleData.saleDate || null,
      total_amount: parseFloat(saleData.total_amount || saleData.totalAmount) || 0,
      final_amount: parseFloat(saleData.final_amount || saleData.finalAmount) || 0,
      discount: parseFloat(saleData.discount) || 0,
      payment_method: saleData.payment_method || saleData.paymentMethod || null,
      status: saleData.status || 'pending',
      notes: saleData.notes || null,
      segment_id: saleData.segment_id || saleData.segmentId || null,
    };
    return this.put(`/sales/${id}`, payload);
  }

  async deleteSale(id: string): Promise<ApiResponse> {
    return this.delete(`/sales/${id}`);
  }

  // Billings endpoints - Usando APENAS o backend
  async getBillings(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/billings', params);
  }

  async createBilling(billingData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: billingData.customer_id || billingData.customerId,
      customer_name: billingData.customer_name || billingData.customerName || '',
      invoice_number: billingData.invoice_number || billingData.invoiceNumber || '',
      issue_date: billingData.issue_date || billingData.issueDate,
      due_date: billingData.due_date || billingData.dueDate,
      amount: billingData.amount || 0,
      tax_amount: billingData.tax_amount || billingData.taxAmount || 0,
      total_amount: billingData.total_amount || billingData.totalAmount || 0,
      status: billingData.status || 'pending',
      payment_method: billingData.payment_method || billingData.paymentMethod || null,
      notes: billingData.notes || null,
      segment_id: billingData.segment_id || billingData.segmentId || null
    };
    return this.post('/billings', payload);
  }

  async updateBilling(id: string, billingData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: billingData.customer_id || billingData.customerId || null,
      customer_name: billingData.customer_name || billingData.customerName || null,
      invoice_number: billingData.invoice_number || billingData.invoiceNumber || null,
      issue_date: billingData.issue_date || billingData.issueDate || null,
      due_date: billingData.due_date || billingData.dueDate || null,
      amount: parseFloat(billingData.amount) || 0,
      tax_amount: parseFloat(billingData.tax_amount || billingData.taxAmount) || 0,
      total_amount: parseFloat(billingData.total_amount || billingData.totalAmount) || 0,
      status: billingData.status || 'pending',
      payment_method: billingData.payment_method || billingData.paymentMethod || null,
      notes: billingData.notes || null,
      segment_id: billingData.segment_id || billingData.segmentId || null,
    };
    return this.put(`/billings/${id}`, payload);
  }

  async deleteBilling(id: string): Promise<ApiResponse> {
    return this.delete(`/billings/${id}`);
  }

  // Cost Centers endpoints - Usando APENAS o backend
  async getCostCenters(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/cost-centers', params);
  }

  async createCostCenter(costCenterData: any): Promise<ApiResponse> {
    // Mapear novos campos com fallback camelCase -> snake_case
    const seg = costCenterData.segment_id ?? costCenterData.segmentId ?? null;
    const manager = costCenterData.manager_id ?? costCenterData.managerId ?? null;
    const status = costCenterData.status ?? 'active';
    const rawBudget = costCenterData.budget ?? costCenterData.budget_amount ?? null;
    const budget = rawBudget === null || rawBudget === undefined ? 0 : parseFloat(String(rawBudget)) || 0;
    const payload: Record<string, any> = {
      name: costCenterData.name,
      segment_id: seg || null,
      description: costCenterData.description ?? null,
      budget,
      status,
      manager_id: manager || null,
    };
    return this.post('/cost-centers', payload);
  }

  async updateCostCenter(id: string, costCenterData: any): Promise<ApiResponse> {
    // Enviar apenas campos permitidos e definidos com mapeamento correto
    const payload: Record<string, any> = {};
    if (typeof costCenterData.name === 'string') payload.name = costCenterData.name;
    const seg = costCenterData.segment_id ?? costCenterData.segmentId;
    if (seg !== undefined) payload.segment_id = seg || null;
    if (costCenterData.description !== undefined) payload.description = costCenterData.description ?? null;
    if (costCenterData.status !== undefined) payload.status = costCenterData.status;
    if (costCenterData.manager_id !== undefined || costCenterData.managerId !== undefined) {
      payload.manager_id = (costCenterData.manager_id ?? costCenterData.managerId) || null;
    }
    if (costCenterData.budget !== undefined || costCenterData.budget_amount !== undefined) {
      const rawBudget = costCenterData.budget ?? costCenterData.budget_amount;
      payload.budget = rawBudget === null || rawBudget === undefined ? 0 : parseFloat(String(rawBudget)) || 0;
    }
    return this.put(`/cost-centers/${id}`, payload);
  }

  async deleteCostCenter(id: string): Promise<ApiResponse> {
    return this.delete(`/cost-centers/${id}`);
  }

  // Chart of Accounts endpoints - Usando APENAS o backend
  async getChartOfAccounts(params: Record<string, any> = {}) {
    return this.get('/chart-of-accounts', params);
  }

  async createChartOfAccount(accountData: any) {
    return this.post('/chart-of-accounts', accountData);
  }

  async updateChartOfAccount(id: number | string, accountData: any) {
    return this.put(`/chart-of-accounts/${id}`, accountData);
  }

  async deleteChartOfAccount(id: number | string) {
    return this.delete(`/chart-of-accounts/${id}`);
  }

  // Accounts Payable endpoints - Usando APENAS o backend
  async getAccountsPayable(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/accounts-payable', params);
  }

  async createAccountPayable(accountData: any): Promise<ApiResponse> {
    const payload = {
      description: accountData.description,
      amount: accountData.amount,
      due_date: accountData.due_date || accountData.dueDate,
      supplier_id: accountData.supplier_id || accountData.supplierId || null,
      supplier_name: accountData.supplier_name || accountData.supplierName || '',
      category: accountData.category || null,
      status: accountData.status || 'pending',
      segment_id: accountData.segment_id || accountData.segmentId || null,
      notes: accountData.notes || null,
      payment_date: accountData.payment_date || accountData.paymentDate || null,
      payment_method: accountData.payment_method || accountData.paymentMethod || null
    };
    return this.post('/accounts-payable', payload);
  }

  async updateAccountPayable(id: string, accountData: any): Promise<ApiResponse> {
    const payload = {
      description: accountData.description || null,
      amount: parseFloat(accountData.amount) || 0,
      due_date: accountData.due_date || accountData.dueDate || null,
      supplier_id: accountData.supplier_id || accountData.supplierId || null,
      supplier_name: accountData.supplier_name || accountData.supplierName || null,
      status: accountData.status || 'pending',
      payment_date: accountData.payment_date || accountData.paymentDate || null,
      payment_method: accountData.payment_method || accountData.paymentMethod || null,
      notes: accountData.notes || null,
      segment_id: accountData.segment_id || accountData.segmentId || null,
    };
    return this.put(`/accounts-payable/${id}`, payload);
  }

  async deleteAccountPayable(id: string): Promise<ApiResponse> {
    return this.delete(`/accounts-payable/${id}`);
  }

  // NFe endpoints - Usando APENAS o backend
  async getNFes(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/nfe', params);
  }

  async createNFe(nfeData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: nfeData.customer_id || nfeData.customerId,
      customer_name: nfeData.customer_name || nfeData.customerName || '',
      invoice_number: nfeData.invoice_number || nfeData.invoiceNumber || '',
      issue_date: nfeData.issue_date || nfeData.issueDate || new Date().toISOString().split('T')[0],
      total_amount: nfeData.total_amount || nfeData.totalAmount || 0,
      tax_amount: nfeData.tax_amount || nfeData.taxAmount || 0,
      status: nfeData.status || 'pending',
      xml_content: nfeData.xml_content || nfeData.xmlContent || null,
      access_key: nfeData.access_key || nfeData.accessKey || null,
      segment_id: nfeData.segment_id || nfeData.segmentId || null,
      notes: nfeData.notes || null
    };
    return this.post('/nfe', payload);
  }

  async updateNFe(id: string, nfeData: any): Promise<ApiResponse> {
    const payload = {
      customer_id: nfeData.customer_id || nfeData.customerId || null,
      customer_name: nfeData.customer_name || nfeData.customerName || null,
      invoice_number: nfeData.invoice_number || nfeData.invoiceNumber || null,
      issue_date: nfeData.issue_date || nfeData.issueDate || null,
      total_amount: parseFloat(nfeData.total_amount || nfeData.totalAmount) || 0,
      tax_amount: parseFloat(nfeData.tax_amount || nfeData.taxAmount) || 0,
      status: nfeData.status || 'pending',
      xml_content: nfeData.xml_content || nfeData.xmlContent || null,
      access_key: nfeData.access_key || nfeData.accessKey || null,
      segment_id: nfeData.segment_id || nfeData.segmentId || null,
    };
    return this.put(`/nfe/${id}`, payload);
  }

  async deleteNFe(id: string): Promise<ApiResponse> {
    return this.delete(`/nfe/${id}`);
  }

  // Integrations endpoints - Usando APENAS o backend
  async getIntegrations(): Promise<ApiResponse> {
    return this.get('/integrations');
  }

  async updateIntegration(name: string, configData: any): Promise<ApiResponse> {
    return this.put(`/integrations/${name}`, configData);
  }

  async testIntegration(name: string): Promise<ApiResponse> {
    return this.post(`/integrations/${name}/test`, {});
  }

  // Metrics endpoints - Usando APENAS o backend
  async getDashboardMetrics(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/metrics', params);
  }

  async getFinancialMetrics(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/metrics/financial', params);
  }

  async getSalesMetrics(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/metrics/sales', params);
  }

  // Partners endpoints - Usando APENAS o backend
  async getPartners(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/partners', params);
  }

  async createPartner(partnerData: any): Promise<ApiResponse> {
    const payload = {
      name: partnerData.name,
      tax_id: partnerData.tax_id || partnerData.taxId || '',
      email: partnerData.email || '',
      phone: partnerData.phone || '',
      address: partnerData.address || '',
      city: partnerData.city || '',
      state: partnerData.state || '',
      zip_code: partnerData.zip_code || partnerData.zipCode || '',
      notes: partnerData.notes || '',
      status: partnerData.status || 'active',
      segment_id: partnerData.segment_id || partnerData.segmentId || null,
      roles: partnerData.roles || (partnerData.role ? [partnerData.role] : undefined),
    };
    return this.post('/partners', payload);
  }

  async updatePartner(id: string, partnerData: any): Promise<ApiResponse> {
    const payload = {
      name: partnerData.name,
      tax_id: partnerData.tax_id || partnerData.taxId,
      email: partnerData.email,
      phone: partnerData.phone,
      address: partnerData.address,
      city: partnerData.city,
      state: partnerData.state,
      zip_code: partnerData.zip_code || partnerData.zipCode,
      notes: partnerData.notes,
      status: partnerData.status,
      segment_id: partnerData.segment_id || partnerData.segmentId || null,
    };
    return this.put(`/partners/${id}`, payload);
  }

  async deletePartner(id: string): Promise<ApiResponse> {
    return this.delete(`/partners/${id}`);
  }

  // Financial Documents endpoints - Usando APENAS o backend
  async getFinancialDocuments(params: Record<string, any> = {}): Promise<ApiResponse> {
    return this.get('/financial-documents', params);
  }

  async createFinancialDocument(docData: any): Promise<ApiResponse> {
    // Map front-end fields to DB schema
    const direction = docData.direction
      ?? (docData.type === 'expense' ? 'payable' : docData.type === 'income' ? 'receivable' : undefined);
    const statusOut = docData.status === 'pending' ? 'open' : docData.status ?? 'open';
    const payload: Record<string, any> = {
      direction,
      description: docData.description ?? null,
      amount: docData.amount != null ? Number(docData.amount) : 0,
      issue_date: docData.issue_date ?? docData.date ?? null,
      due_date: docData.due_date ?? null,
      status: statusOut,
      partner_id: docData.partner_id ?? null,
      segment_id: docData.segment_id ?? docData.segmentId ?? null,
    };
    if (docData.payment_method_id) payload.payment_method_id = docData.payment_method_id;
    return this.post('/financial-documents', payload);
  }

  async updateFinancialDocument(id: string, docData: any): Promise<ApiResponse> {
    const direction = docData.direction
      ?? (docData.type === 'expense' ? 'payable' : docData.type === 'income' ? 'receivable' : undefined);
    const statusOut = docData.status === 'pending' ? 'open' : docData.status;
    const payload: Record<string, any> = {
      ...(direction ? { direction } : {}),
      ...(docData.description !== undefined ? { description: docData.description } : {}),
      ...(docData.amount !== undefined ? { amount: Number(docData.amount) } : {}),
      ...(docData.issue_date !== undefined || docData.date !== undefined ? { issue_date: docData.issue_date ?? docData.date ?? null } : {}),
      ...(docData.due_date !== undefined ? { due_date: docData.due_date } : {}),
      ...(docData.status !== undefined ? { status: statusOut } : {}),
      ...(docData.partner_id !== undefined ? { partner_id: docData.partner_id } : {}),
      ...(docData.segment_id !== undefined || docData.segmentId !== undefined ? { segment_id: docData.segment_id ?? docData.segmentId } : {}),
    };
    if (docData.payment_method_id !== undefined) payload.payment_method_id = docData.payment_method_id;
    return this.put(`/financial-documents/${id}`, payload);
  }

  async deleteFinancialDocument(id: string): Promise<ApiResponse> {
    return this.delete(`/financial-documents/${id}`);
  }

  // Users endpoints (admin only) - Usando APENAS o backend
  async getUsers(params: Record<string, any> = {}): Promise<ApiResponse> {
    const resp: any = await this.get('/users', params);
    // Normalize shape to always have data.users while preserving original fields
    if (!resp.data) resp.data = {};
    if (Array.isArray(resp.users) && !Array.isArray(resp.data.users)) {
      resp.data.users = resp.users;
    }
    return resp;
  }

  async getUserById(id: string): Promise<ApiResponse> {
    const response = await this.get(`/users/${id}`);
    // Normalizar resposta para compatibilidade
    if (response.data?.uers && !response.data?.user) {
      response.data.user = response.data.uers;
      delete response.data.uers;
    }
    return response;
  }

  async createUser(userData: any): Promise<ApiResponse> {
    return this.post('/users', userData);
  }

  async updateUser(id: string, userData: any): Promise<ApiResponse> {
    const response = await this.put(`/users/${id}`, userData);
    if (response.data?.uers && !response.data?.user) {
      response.data.user = response.data.uers;
      delete response.data.uers;
    }
    return response;
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.delete(`/users/${id}`);
  }

  // Receita Federal - Usando APENAS o backend
  async consultarReceita(cpf: string): Promise<ApiResponse> {
    return this.get(`/receita/consulta/${cpf}`);
  }

  async consultarReceitaCNPJ(cnpj: string): Promise<ApiResponse> {
    return this.get(`/receita/consulta-cnpj/${cnpj}`);
  }

  // Suppliers/Fornecedores
  async getSuppliers(): Promise<ApiResponse> {
    return this.get('/suppliers');
  }

  async createSupplier(supplierData: any): Promise<ApiResponse> {
    return this.post('/suppliers', supplierData);
  }

  async updateSupplier(id: string, supplierData: any): Promise<ApiResponse> {
    return this.put(`/suppliers/${id}`, supplierData);
  }

  async deleteSupplier(id: string): Promise<ApiResponse> {
    return this.delete(`/suppliers/${id}`);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService; 