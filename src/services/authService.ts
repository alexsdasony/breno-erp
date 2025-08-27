import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'

export async function register(userData: any): Promise<ApiResponse> {
  const response = await apiService.post('/auth/register', userData);
  return response as ApiResponse;
}

export async function login(credentials: any): Promise<ApiResponse> {
  const response = await apiService.post<ApiResponse>('/auth', credentials);
  
  if (response.data?.token) {
    apiService.setToken(response.data.token);
  }
  
  return response as ApiResponse;
}

export async function logout(): Promise<ApiResponse> {
  try {
    await apiService.post('/auth/logout', {});
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    apiService.clearToken();
  }
  return { data: { success: true } } as ApiResponse;
}

export async function getProfile(): Promise<ApiResponse> {
  // Evitar chamada se não houver token de usuário
  if (!apiService.getToken()) {
    throw { message: 'Not authenticated', status: 401 };
  }
  const response = await apiService.get('/auth/profile');
  return response as ApiResponse;
}

export async function checkAuth(): Promise<boolean> {
  // Se não há token, já retorna false sem chamar a rede
  if (!apiService.getToken()) return false;
  // Verificar token usando /auth/profile silenciosamente
  try {
    const profile: any = await apiService.get('/auth/profile');
    return Boolean(profile && profile.user && profile.success !== false);
  } catch (_err) {
    return false;
  }
}

export async function updateProfile(userData: any): Promise<ApiResponse> {
  const response = await apiService.put('/auth/profile', userData);
  return response as ApiResponse;
}

export async function changePassword(passwordData: any): Promise<ApiResponse> {
  const response = await apiService.put('/auth/password', passwordData);
  return response as ApiResponse;
}

export async function requestPasswordReset(data: any): Promise<ApiResponse> {
  const response = await apiService.post('/auth/forgot-password', data);
  return response as ApiResponse;
}

export async function resetPassword(data: any): Promise<ApiResponse> {
  const response = await apiService.post('/auth/reset-password', data);
  return response as ApiResponse;
}