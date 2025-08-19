import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useCostCenters = () => {
  const addCostCenter = async (costCenter) => {
    try {
      const response = await apiService.createCostCenter(costCenter);
      toast({ title: "Centro de Custo Adicionado!", description: "Novo centro de custo foi registrado com sucesso." });
      return response.costCenter;
    } catch (error) {
      console.error('Add cost center error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar centro de custo. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateCostCenter = async (id, costCenterData) => {
    try {
      const response = await apiService.updateCostCenter(id, costCenterData);
      toast({ title: "Centro de Custo Atualizado!" });
      return response.costCenter;
    } catch (error) {
      console.error('Update cost center error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar centro de custo. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteCostCenter = async (id) => {
    try {
      await apiService.deleteCostCenter(id);
      toast({ title: "Centro de Custo Excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete cost center error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir centro de custo. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const addAccountPayable = async (account) => {
    try {
      const response = await apiService.createAccountPayable(account);
      toast({ title: "Conta a Pagar Adicionada!", description: "Nova conta a pagar foi registrada com sucesso." });
      return response.accountPayable;
    } catch (error) {
      console.error('Add account payable error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar conta a pagar. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateAccountPayable = async (id, accountData) => {
    try {
      const response = await apiService.updateAccountPayable(id, accountData);
      toast({ title: "Conta a Pagar Atualizada!" });
      return response.accountPayable;
    } catch (error) {
      console.error('Update account payable error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar conta a pagar. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteAccountPayable = async (id) => {
    try {
      await apiService.deleteAccountPayable(id);
      toast({ title: "Conta a Pagar Excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete account payable error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir conta a pagar. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    addAccountPayable,
    updateAccountPayable,
    deleteAccountPayable
  };
};
