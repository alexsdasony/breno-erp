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
              } else {
                console.warn('Profile response invalid, but token is valid');
              }
            } catch (profileError) {
              console.warn('Failed to get profile, but token is valid:', profileError);
              // Token é válido mas não conseguimos obter o perfil
              // Isso pode acontecer se o endpoint /auth/profile não existir
            }
          } else {
            console.warn('Token invalid, clearing token');
            apiService.clearToken();
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        apiService.clearToken();
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
        description: error.message || "Falha ao criar conta. Tente novamente.",
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
        description: error.message || "Email ou senha incorretos.",
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
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo se falhar no servidor, limpar localmente
      setCurrentUser(null);
      apiService.clearToken();
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
        description: error.message || "Falha ao atualizar perfil. Tente novamente.",
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
        description: error.message || "Falha ao alterar senha. Tente novamente.",
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
        description: error.message || "Falha ao solicitar recuperação. Tente novamente.",
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
        description: error.message || "Falha ao redefinir senha. Tente novamente.",
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