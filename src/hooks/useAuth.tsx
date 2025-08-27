import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import * as authService from '@/services/authService';
import { toast } from '@/components/ui/use-toast';

interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  success?: boolean;
  user?: any;
  token?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  segment_id?: string | null;
  status?: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (name: string, email: string, password: string, segmentId?: string | null) => Promise<boolean>;
  logoutUser: () => Promise<void>;
  updateUserProfile: (name: string, email: string) => Promise<boolean>;
  changeUserPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  requestPasswordReset: (email: string, phone?: string | null) => Promise<any>;
  resetPassword: (email: string, phone: string, resetCode: string, newPassword: string) => Promise<any>;
}

export const useAuth = (): AuthContextType => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicialização: tentar restaurar usuário autenticado
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = apiService.getToken();
        if (token) {
          try {
            // Verificar se o token ainda é válido fazendo uma chamada de teste
            const isValidToken = await authService.checkAuth();
            if (isValidToken) {
              // Token válido, tentar obter perfil
              const profile = await authService.getProfile();
              if (profile.data && profile.data.user) {
                setCurrentUser(profile.data.user);
                localStorage.setItem('cached_user', JSON.stringify(profile.data.user));
                console.log('✅ Usuário autenticado restaurado:', profile.data.user.name);
              } else {
                // Fallback para usuário em cache se perfil não disponível
                const cachedUser = localStorage.getItem('cached_user');
                if (cachedUser) {
                  try {
                    const user = JSON.parse(cachedUser);
                    setCurrentUser(user);
                    console.log('✅ Usuário restaurado do cache:', user.name);
                  } catch (parseError) {
                    console.error('Erro ao fazer parse do usuário em cache:', parseError);
                    apiService.clearToken();
                    localStorage.removeItem('cached_user');
                  }
                } else {
                  apiService.clearToken();
                }
              }
            } else {
              // Token inválido ou expirado
              console.warn('Token inválido ou expirado, limpando dados de autenticação');
              apiService.clearToken();
              localStorage.removeItem('cached_user');
            }
          } catch (error: any) {
            console.error('Erro ao verificar autenticação:', error);
            // Em caso de erro, limpar dados de autenticação
            apiService.clearToken();
            localStorage.removeItem('cached_user');
          }
        }
      } catch (error: any) {
        console.error('Erro na inicialização da autenticação:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const registerUser = async (name: string, email: string, password: string, segmentId: string | null = null): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.register({ name, email, password, segmentId });
      
      if (response.data?.success && response.data?.user) {
        setCurrentUser(response.data.user);
        // Cache do usuário para persistência
        localStorage.setItem('cached_user', JSON.stringify(response.data.user));
        if (response.data.token) {
          apiService.setToken(response.data.token);
        }
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso."
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Erro no cadastro",
        description: (error && error.message) || "Falha ao criar conta. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password }) as any;
      
      // Verificar se a resposta tem sucesso e dados do usuário
      if (response.success && response.user) {
        setCurrentUser(response.user);
        // Cache do usuário para persistência
        localStorage.setItem('cached_user', JSON.stringify(response.user));
        // Salvar token se fornecido
        if (response.token) {
          apiService.setToken(response.token);
        }
        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!"
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: (error && error.message) || "Credenciais inválidas. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setCurrentUser(null);
      apiService.clearToken();
      localStorage.removeItem('cached_user');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    }
  };

  const updateUserProfile = async (name: string, email: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.updateProfile({ name, email });
      
      if (response.data?.success && response.data?.user) {
        setCurrentUser(response.data.user);
        // Atualizar cache
        localStorage.setItem('cached_user', JSON.stringify(response.data.user));
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso."
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: (error && error.message) || "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changeUserPassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.changePassword({ currentPassword, newPassword });
      
      if (response.data?.success) {
        toast({
          title: "Senha alterada!",
          description: "Sua senha foi alterada com sucesso."
        });
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        title: "Erro ao alterar senha",
        description: (error && error.message) || "Falha ao alterar senha. Tente novamente.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string, phone: string | null = null) => {
    try {
      setLoading(true);
      const response = await authService.requestPasswordReset({ email, phone });
      
      toast({
        title: "Solicitação enviada!",
        description: "Verifique seu email para instruções de redefinição."
      });
      
      return response;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: "Erro na solicitação",
        description: (error && error.message) || "Falha ao solicitar redefinição. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, phone: string, resetCode: string, newPassword: string) => {
    try {
      setLoading(true);
      const response = await authService.resetPassword({ email, phone, resetCode, newPassword });
      
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi redefinida com sucesso."
      });
      
      return response;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Erro na redefinição",
        description: (error && error.message) || "Falha ao redefinir senha. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentUser,
    loading,
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    requestPasswordReset,
    resetPassword
  };
};

