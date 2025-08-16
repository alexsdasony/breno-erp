import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useAdmin = () => {
  const loadUsers = async (params = {}) => {
    try {
      const response = await apiService.getUsers(params);
      return response.users || response.data || [];
    } catch (error) {
      console.error('Load users error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao carregar usuários. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await apiService.createUser(userData);
      toast({ title: "Usuário Criado!", description: "Novo usuário foi cadastrado com sucesso." });
      return response.user;
    } catch (error) {
      console.error('Create user error:', error);
      toast({ 
        title: "Erro!", 
        description: (error && error.message) || "Falha ao criar usuário. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateUser = async (id, userData) => {
    try {
      const response = await apiService.updateUser(id, userData);
      toast({ title: "Usuário Atualizado!" });
      return response.user;
    } catch (error) {
      console.error('Update user error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar usuário. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteUser = async (id) => {
    try {
      await apiService.deleteUser(id);
      toast({ title: "Usuário Excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete user error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir usuário. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateIntegrationSettings = async (integrationName, settings) => {
    try {
      const response = await apiService.updateIntegration(integrationName, settings);
      toast({ title: "Integração Atualizada!" });
      return response;
    } catch (error) {
      console.error('Update integration error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar integração. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const importData = async (importedItems, type) => {
    try {
      let response;
      switch (type) {
        case 'transactions':
          response = await apiService.importTransactions(importedItems);
          break;
        case 'products':
          response = await apiService.importProducts(importedItems);
          break;
        case 'partners':
          response = await apiService.importPartners(importedItems);
          break;
        default:
          throw new Error(`Tipo de importação não suportado: ${type}`);
      }
      
      toast({ 
        title: "Dados Importados!", 
        description: `${importedItems.length} itens foram importados com sucesso.` 
      });
      return response;
    } catch (error) {
      console.error('Import data error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao importar dados. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    updateIntegrationSettings,
    importData
  };
};
