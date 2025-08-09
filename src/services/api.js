// API Service - Centralized HTTP client for backend communication
// Usa VITE_API_URL quando definido (Edge Functions em prod). Caso contrário, usa backend local via '/api'.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Cache em memória para token - SEM localStorage
let tokenCache = null;
let isRedirectingToLogin = false;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
    this.supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  }

  // Helpers: map customers <-> partners
  partnerToCustomer(partner) {
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
      segment_id: partner.segment_id || partner.segmentId || null,
    };
  }

  customerToPartnerPayload(customerData, role = 'customer') {
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

  // Set authentication token - SEM localStorage
  setToken(token) {
    this.token = token;
    tokenCache = token;
    // NÃO usar localStorage
  }

  // Get authentication token - SEM localStorage
  getToken() {
    return tokenCache;
  }

  // Clear token - SEM localStorage
  clearToken() {
    this.token = null;
    tokenCache = null;
    // NÃO usar localStorage
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const isEdgeFunctions = typeof this.baseURL === 'string' && this.baseURL.includes('supabase.co/functions');
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // Para Edge Functions do Supabase use as chaves de projeto.
        ...(this.supabaseAnonKey && { 'Authorization': `Bearer ${this.supabaseAnonKey}` }),
        ...(this.supabaseAnonKey && { 'apikey': this.supabaseAnonKey }),
        // O header X-User-Token é apenas para nosso backend local. Evita CORS nos Edge Functions.
        ...(!isEdgeFunctions && token ? { 'X-User-Token': token } : {}),
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
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    } finally {
      if (isRedirectingToLogin) {
        setTimeout(() => { isRedirectingToLogin = false; }, 2000);
      }
    }
  }

  // GET request
  get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  // PUT request
  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  // DELETE request
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth endpoints - Usando APENAS o backend
  async register(userData) {
    return this.post('/auth/register', userData);
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials);
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
    return { success: true };
  }

  async getProfile() {
    return this.get('/auth/profile');
  }

  async updateProfile(userData) {
    return this.put('/auth/profile', userData);
  }

  async changePassword(passwordData) {
    return this.put('/auth/password', passwordData);
  }

  async requestPasswordReset(data) {
    return this.post('/auth/forgot-password', data);
  }

  async resetPassword(data) {
    return this.post('/auth/reset-password', data);
  }

  // Segments endpoints - Usando APENAS o backend
  async getSegments(params = {}) {
    return this.get('/segments', params);
  }

  async createSegment(segmentData) {
    return this.post('/segments', segmentData);
  }

  async updateSegment(id, segmentData) {
    return this.put(`/segments/${id}`, segmentData);
  }

  async deleteSegment(id) {
    return this.delete(`/segments/${id}`);
  }

  // Transactions endpoints - Usando APENAS o backend
  async getTransactions(params = {}) {
    return this.get('/transactions', params);
  }

  async createTransaction(transactionData) {
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

  async updateTransaction(id, transactionData) {
    return this.put(`/transactions/${id}`, transactionData);
  }

  async deleteTransaction(id) {
    return this.delete(`/transactions/${id}`);
  }

  async importTransactions(transactions) {
    return this.post('/transactions/import', { transactions });
  }

  // Customers endpoints - Usando APENAS o backend
  async getCustomers(params = {}) {
    const response = await this.get('/partners', { ...params, role: 'customer' });
    const partners = response.partners || response.data || [];
    const customers = partners.map((p) => this.partnerToCustomer(p));
    return { customers };
  }

  async createCustomer(customerData) {
    const payload = this.customerToPartnerPayload(customerData, 'customer');
    const created = await this.post('/partners', payload);
    const partner = created.partner || created.data || created;
    return { customer: this.partnerToCustomer(partner) };
  }

  async updateCustomer(id, customerData) {
    const payload = this.customerToPartnerPayload(customerData, 'customer');
    const updated = await this.put(`/partners/${id}`, payload);
    const partner = updated.partner || updated.data || updated;
    return { customer: this.partnerToCustomer(partner) };
  }

  async deleteCustomer(id) {
    return this.delete(`/partners/${id}`);
  }

  async getCustomerById(id) {
    const response = await this.get(`/partners/${id}`);
    const partner = response.partner || response.data || response;
    return { customer: this.partnerToCustomer(partner) };
  }

  // Products endpoints - Usando APENAS o backend
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async createProduct(productData) {
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

  async updateProduct(id, productData) {
    const payload = {
      name: productData.name,
      price: productData.price,
      category: productData.category ?? null,
      stock: productData.stock ?? productData.stock_quantity,
      min_stock: productData.minStock ?? productData.minimum_stock,
      segment_id: productData.segment_id ?? productData.segmentId,
      code: productData.code,
      description: productData.description,
      cost_price: productData.cost_price ?? productData.costPrice,
      supplier: productData.supplier,
    };
    return this.put(`/products/${id}`, payload);
  }

  async deleteProduct(id) {
    return this.delete(`/products/${id}`);
  }

  async getLowStockProducts(params = {}) {
    return this.get('/products', { ...params, low_stock: 'true' });
  }

  // Sales endpoints - Usando APENAS o backend
  async getSales(params = {}) {
    return this.get('/sales', params);
  }

  async createSale(saleData) {
    return this.post('/sales', saleData);
  }

  async updateSale(id, saleData) {
    return this.put(`/sales/${id}`, saleData);
  }

  async deleteSale(id) {
    return this.delete(`/sales/${id}`);
  }

  // Billings endpoints - Usando APENAS o backend
  async getBillings(params = {}) {
    return this.get('/billings', params);
  }

  async createBilling(billingData) {
    return this.post('/billings', billingData);
  }

  async updateBilling(id, billingData) {
    return this.put(`/billings/${id}`, billingData);
  }

  async deleteBilling(id) {
    return this.delete(`/billings/${id}`);
  }

  // Cost Centers endpoints - Usando APENAS o backend
  async getCostCenters(params = {}) {
    return this.get('/cost-centers', params);
  }

  async createCostCenter(costCenterData) {
    return this.post('/cost-centers', costCenterData);
  }

  async updateCostCenter(id, costCenterData) {
    return this.put(`/cost-centers/${id}`, costCenterData);
  }

  async deleteCostCenter(id) {
    return this.delete(`/cost-centers/${id}`);
  }

  // Accounts Payable endpoints - Usando APENAS o backend
  async getAccountsPayable(params = {}) {
    return this.get('/accounts-payable', params);
  }

  async createAccountPayable(accountData) {
    return this.post('/accounts-payable', accountData);
  }

  async updateAccountPayable(id, accountData) {
    return this.put(`/accounts-payable/${id}`, accountData);
  }

  async deleteAccountPayable(id) {
    return this.delete(`/accounts-payable/${id}`);
  }

  // NFe endpoints - Usando APENAS o backend
  async getNFes(params = {}) {
    return this.get('/nfe', params);
  }

  async createNFe(nfeData) {
    return this.post('/nfe', nfeData);
  }

  async updateNFe(id, nfeData) {
    return this.put(`/nfe/${id}`, nfeData);
  }

  async deleteNFe(id) {
    return this.delete(`/nfe/${id}`);
  }

  // Integrations endpoints - Usando APENAS o backend
  async getIntegrations() {
    return this.get('/integrations');
  }

  async updateIntegration(name, configData) {
    return this.put(`/integrations/${name}`, configData);
  }

  async testIntegration(name) {
    return this.post(`/integrations/${name}/test`);
  }

  // Metrics endpoints - Usando APENAS o backend
  async getDashboardMetrics(params = {}) {
    return this.get('/metrics', params);
  }

  async getFinancialMetrics(params = {}) {
    return this.get('/metrics/financial', params);
  }

  async getSalesMetrics(params = {}) {
    return this.get('/metrics/sales', params);
  }

  // Schema endpoint - Usando APENAS o backend
  async getDatabaseSchema(params = {}) {
    // Endpoint convencional: /schema (aceita retornar JSON ou SQL)
    return this.get('/schema', params);
  }

  // Partners endpoints - Usando APENAS o backend
  async getPartners(params = {}) {
    return this.get('/partners', params);
  }
  async createPartner(partnerData) {
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
  async updatePartner(id, partnerData) {
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
  async deletePartner(id) {
    return this.delete(`/partners/${id}`);
  }

  // Financial Documents endpoints - Usando APENAS o backend
  async getFinancialDocuments(params = {}) {
    return this.get('/financial-documents', params);
  }
  async createFinancialDocument(docData) {
    return this.post('/financial-documents', docData);
  }
  async updateFinancialDocument(id, docData) {
    return this.put(`/financial-documents/${id}`, docData);
  }
  async deleteFinancialDocument(id) {
    return this.delete(`/financial-documents/${id}`);
  }

  // Users endpoints (admin only) - Usando APENAS o backend
  async getUsers(params = {}) {
    return this.get('/users', params);
  }

  async getUserById(id) {
    return this.get(`/users/${id}`);
  }

  async createUser(userData) {
    return this.post('/users', userData);
  }

  async updateUser(id, userData) {
    return this.put(`/users/${id}`, userData);
  }

  async deleteUser(id) {
    return this.delete(`/users/${id}`);
  }

  // Receita Federal - Usando APENAS o backend
  async consultarReceita(cpf) {
    return this.get(`/receita/consulta/${cpf}`);
  }

  async consultarReceitaCNPJ(cnpj) {
    return this.get(`/receita/consulta-cnpj/${cnpj}`);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService; 