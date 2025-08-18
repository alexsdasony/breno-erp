// API Service - Centralized HTTP client for backend communication
// Usa NEXT_PUBLIC_API_URL para Edge Functions do Supabase
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://qerubjitetqwfqqydhzv.supabase.co/functions/v1';

// Cache em memória para token - COM sessionStorage para persistência
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

  // Set authentication token - COM sessionStorage para persistência
  setToken(token) {
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
  getToken() {
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
  clearToken() {
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
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const isEdgeFunctions = this.baseURL === '/api' || (typeof this.baseURL === 'string' && this.baseURL.includes('supabase.co'));
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
        const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
        const error = {
          message: errorMessage,
          status: response.status,
          data: data
        };
        throw error;
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
    const response = await this.post('/auth', credentials);
    
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

  async checkAuth() {
    // Verificar se o token é válido usando um endpoint simples
    try {
      await this.get('/segments');
      return true;
    } catch (error) {
      console.warn('Auth check failed:', error);
      return false;
    }
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

  async updateSale(id, saleData) {
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

  async deleteSale(id) {
    return this.delete(`/sales/${id}`);
  }

  // Billings endpoints - Usando APENAS o backend
  async getBillings(params = {}) {
    return this.get('/billings', params);
  }

  async createBilling(billingData) {
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

  async updateBilling(id, billingData) {
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

  async deleteBilling(id) {
    return this.delete(`/billings/${id}`);
  }

  // Cost Centers endpoints - Usando APENAS o backend
  async getCostCenters(params = {}) {
    return this.get('/cost-centers', params);
  }

  async createCostCenter(costCenterData) {
    const payload = {
      name: costCenterData.name,
      description: costCenterData.description || null,
      code: costCenterData.code || null,
      budget: costCenterData.budget || 0,
      status: costCenterData.status || 'active',
      segment_id: costCenterData.segment_id || costCenterData.segmentId || null
    };
    return this.post('/cost-centers', payload);
  }

  async updateCostCenter(id, costCenterData) {
    const payload = {
      name: costCenterData.name || null,
      description: costCenterData.description || null,
      segment_id: costCenterData.segment_id || costCenterData.segmentId || null,
    };
    return this.put(`/cost-centers/${id}`, payload);
  }

  async deleteCostCenter(id) {
    return this.delete(`/cost-centers/${id}`);
  }

  // Accounts Payable endpoints - Usando APENAS o backend
  async getAccountsPayable(params = {}) {
    return this.get('/accounts-payable', params);
  }

  async createAccountPayable(accountData) {
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

  async updateAccountPayable(id, accountData) {
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

  async deleteAccountPayable(id) {
    return this.delete(`/accounts-payable/${id}`);
  }

  // NFe endpoints - Usando APENAS o backend
  async getNFes(params = {}) {
    return this.get('/nfe', params);
  }

  async createNFe(nfeData) {
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

  async updateNFe(id, nfeData) {
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
    const response = await this.get(`/users/${id}`);
    // Normalizar resposta para compatibilidade
    if (response.uers && !response.user) {
      response.user = response.uers;
      delete response.uers;
    }
    return response;
  }

  async createUser(userData) {
    // Solução temporária: criar usuário diretamente no Supabase
    // já que a função Edge não foi atualizada
    try {
      const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password, // Será hasheada pelo Supabase
          role: userData.role || 'user',
          segment_id: userData.segment_id || null,
          status: userData.status || 'ativo'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar usuário');
      }

      const data = await response.json();
      return {
        success: true,
        user: data[0], // Supabase retorna array
        message: 'Usuário criado com sucesso'
      };
    } catch (error) {
      console.error('Erro na criação direta:', error);
      // Fallback para a função Edge (mesmo com erro)
      const response = await this.post('/users', userData);
      // Normalizar resposta para compatibilidade
      if (response.uers && !response.user) {
        response.user = response.uers;
        delete response.uers;
      }
      return response;
    }
  }

  async updateUser(id, userData) {
    // Solução temporária: atualizar usuário diretamente no Supabase
    try {
      const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar usuário');
      }

      const data = await response.json();
      return {
        success: true,
        user: data[0],
        message: 'Usuário atualizado com sucesso'
      };
    } catch (error) {
      console.error('Erro na atualização direta:', error);
      // Fallback para a função Edge
      const response = await this.put(`/users/${id}`, userData);
      if (response.uers && !response.user) {
        response.user = response.uers;
        delete response.uers;
      }
      return response;
    }
  }

  async deleteUser(id) {
    // Solução temporária: deletar usuário diretamente no Supabase
    try {
      const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';
      
      const response = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar usuário');
      }

      return {
        success: true,
        message: 'Usuário deletado com sucesso'
      };
    } catch (error) {
      console.error('Erro na exclusão direta:', error);
      // Fallback para a função Edge
    return this.delete(`/users/${id}`);
    }
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