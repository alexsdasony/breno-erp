import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar autenticação na inicialização
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = apiService.getToken();
        if (token) {
          // Verificar se o token é válido
          const isValid = await apiService.checkAuth();
          if (isValid) {
            // Tentar obter o perfil do usuário
            try {
              const profile = await apiService.getProfile();
              if (profile && profile.user) {
                setCurrentUser(profile.user);
                console.log('✅ Usuário autenticado restaurado:', profile.user.name);
              } else {
                console.warn('Profile response invalid, but token is valid');
                // Se não conseguimos obter o perfil mas o token é válido,
                // vamos tentar fazer login novamente com dados em cache
                const cachedUser = sessionStorage.getItem('cached_user');
                if (cachedUser) {
                  try {
                    const user = JSON.parse(cachedUser);
                    setCurrentUser(user);
                    console.log('✅ Usuário restaurado do cache:', user.name);
                  } catch (e) {
                    console.warn('Failed to parse cached user:', e);
                  }
                }
              }
            } catch (profileError) {
              console.warn('Failed to get profile, but token is valid:', profileError);
              // Token é válido mas não conseguimos obter o perfil
              // Vamos tentar restaurar do cache
              const cachedUser = sessionStorage.getItem('cached_user');
              if (cachedUser) {
                try {
                  const user = JSON.parse(cachedUser);
                  setCurrentUser(user);
                  console.log('✅ Usuário restaurado do cache após erro de perfil:', user.name);
                } catch (e) {
                  console.warn('Failed to parse cached user:', e);
                }
              }
            }
          } else {
            console.warn('Token invalid, clearing token');
            apiService.clearToken();
            sessionStorage.removeItem('cached_user');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Não limpar o token automaticamente em caso de erro de rede
        // Apenas limpar se for um erro de autenticação específico
        if (error && error.status === 401) {
          apiService.clearToken();
          sessionStorage.removeItem('cached_user');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const registerUser = async (name, email, password, segmentId = null) => {
    try {
      setLoading(true);
      const response = await apiService.register({ name, email, password, segmentId });
      
      if (response.user) {
        setCurrentUser(response.user);
        // Cache do usuário para persistência
        sessionStorage.setItem('cached_user', JSON.stringify(response.user));
        if (response.token) {
          apiService.setToken(response.token);
        }
        toast({
          title: "Conta criada!",
          description: "Sua conta foi criada com sucesso."
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Erro no cadastro",
        description: (error && error.message) || "Falha ao criar conta. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.login({ email, password });
      
      if (response.user) {
        setCurrentUser(response.user);
        // Cache do usuário para persistência
        sessionStorage.setItem('cached_user', JSON.stringify(response.user));
        if (response.token) {
          apiService.setToken(response.token);
        }
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${response.user.name}!`
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no login",
        description: (error && error.message) || "Email ou senha incorretos.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    try {
      await apiService.logout();
      setCurrentUser(null);
      // Limpar cache do usuário
      sessionStorage.removeItem('cached_user');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo se falhar no servidor, limpar localmente
      setCurrentUser(null);
      apiService.clearToken();
      sessionStorage.removeItem('cached_user');
    }
  };

  const updateUserProfile = async (name, email) => {
    try {
      setLoading(true);
      const response = await apiService.updateProfile({ name, email });
      
      if (response.user) {
        setCurrentUser(response.user);
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram atualizadas com sucesso."
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Erro na atualização",
        description: (error && error.message) || "Falha ao atualizar perfil. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const changeUserPassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      await apiService.changePassword({ currentPassword, newPassword });
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi alterada com sucesso."
      });
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Erro na alteração",
        description: (error && error.message) || "Falha ao alterar senha. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email, phone = null) => {
    try {
      setLoading(true);
      const response = await apiService.requestPasswordReset({ email, phone });
      toast({
        title: "Solicitação enviada!",
        description: "Instruções de recuperação foram enviadas para seu email."
      });
      return response;
    } catch (error) {
      console.error('Password reset request error:', error);
      toast({
        title: "Erro na solicitação",
        description: (error && error.message) || "Falha ao solicitar recuperação. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email, phone, resetCode, newPassword) => {
    try {
      setLoading(true);
      const response = await apiService.resetPassword({ 
        email, 
        phone, 
        resetCode, 
        newPassword 
      });
      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi redefinida com sucesso. Faça login com a nova senha."
      });
      return response;
    } catch (error) {
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
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    requestPasswordReset,
    resetPassword,
  };
};