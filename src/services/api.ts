// API Service - Centralized HTTP client for backend communication
// Usa NEXT_PUBLIC_API_URL para Edge Functions do Supabase
import { API_CONFIG, SUPABASE_CONFIG } from '@/config/constants';

// Definição da interface ApiResponse para uso em toda a aplicação
export interface ApiResponse<T = any> {
  data?: T;
  error?: string | null;
  message?: string;
  status?: number;
  success?: boolean;
}

const API_BASE_URL = API_CONFIG.baseURL;

// Cache em memória para token - COM sessionStorage para persistência
let tokenCache: string | null = null;
let isRedirectingToLogin = false;

/**
 * Classe ApiService - Serviço centralizado para comunicação com o backend
 * Implementa métodos genéricos HTTP (get, post, put, delete) com tipagem forte
 */
class ApiService {
  private baseURL: string;
  private token: string | null;
  private supabaseAnonKey: string | undefined;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = this.getToken();
    this.supabaseAnonKey = SUPABASE_CONFIG.anonKey;
  }

  /**
   * Define o token de autenticação e o armazena no localStorage
   * @param token Token de autenticação
   */
  setToken(token: string): void {
    this.token = token;
    tokenCache = token;
    // Usar localStorage para persistir até logout explícito ou fechamento do browser
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_token', token);
      } catch (error) {
        console.warn('Erro ao salvar token no localStorage:', error);
      }
    }
  }

  /**
   * Obtém o token de autenticação do cache ou do localStorage
   * @returns Token de autenticação ou null se não existir
   */
  getToken(): string | null {
    if (tokenCache) return tokenCache;
    
    // Tentar recuperar do localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          tokenCache = storedToken;
          return storedToken;
        }
      } catch (error) {
        console.warn('Erro ao ler token do localStorage:', error);
      }
    }
    return null;
  }

  /**
   * Remove o token de autenticação do cache e do localStorage
   */
  clearToken(): void {
    this.token = null;
    tokenCache = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('auth_token');
      } catch (error) {
        console.warn('Erro ao remover token do localStorage:', error);
      }
    }
  }

  /**
   * Método genérico para realizar requisições HTTP
   * @param endpoint Endpoint da API
   * @param options Opções da requisição
   * @returns Promise com resposta tipada
   */
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    console.log('API Request:', { endpoint, url, hasToken: !!token, tokenLength: token?.length });
    
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

  /**
   * Realiza uma requisição GET
   * @param endpoint Endpoint da API
   * @param params Parâmetros da query string
   * @returns Promise com resposta tipada
   */
  get<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  /**
   * Realiza uma requisição POST
   * @param endpoint Endpoint da API
   * @param data Dados a serem enviados no corpo da requisição
   * @returns Promise com resposta tipada
   */
  post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Realiza uma requisição PUT
   * @param endpoint Endpoint da API
   * @param data Dados a serem enviados no corpo da requisição
   * @returns Promise com resposta tipada
   */
  put<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * Realiza uma requisição DELETE
   * @param endpoint Endpoint da API
   * @returns Promise com resposta tipada
   */
  delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * Instância singleton do ApiService para uso em toda a aplicação
 * Fornece métodos HTTP genéricos com tipagem forte:
 * - get<T>(): Promise<T>
 * - post<T>(): Promise<T>
 * - put<T>(): Promise<T>
 * - delete<T>(): Promise<T>
 */
const apiService = new ApiService();
export default apiService;