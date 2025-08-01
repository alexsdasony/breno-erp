// API Service - Centralized HTTP client for backend communication
// Usando APENAS o novo backend Supabase local
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Cache em memória para token - SEM localStorage
let tokenCache = null;
let isRedirectingToLogin = false;

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
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
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
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
        if (!isRedirectingToLogin) {
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
    return this.post('/transactions', transactionData);
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
    return this.get('/customers', params);
  }

  async createCustomer(customerData) {
    return this.post('/customers', customerData);
  }

  async updateCustomer(id, customerData) {
    return this.put(`/customers/${id}`, customerData);
  }

  async deleteCustomer(id) {
    return this.delete(`/customers/${id}`);
  }

  async getCustomerById(id) {
    return this.get(`/customers/${id}`);
  }

  // Products endpoints - Usando APENAS o backend
  async getProducts(params = {}) {
    return this.get('/products', params);
  }

  async createProduct(productData) {
    return this.post('/products', productData);
  }

  async updateProduct(id, productData) {
    return this.put(`/products/${id}`, productData);
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