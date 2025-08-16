import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useFinancial = () => {
  const addFinancialDocument = async (doc) => {
    try {
      const response = await apiService.createFinancialDocument(doc);
      toast({ title: 'Documento financeiro criado!' });
      return response.document || response.data;
    } catch (error) {
      console.error('Add financial document error:', error);
      toast({ title: 'Erro!', description: 'Falha ao criar documento financeiro.', variant: 'destructive' });
      throw error;
    }
  };

  const updateFinancialDocument = async (id, docData) => {
    try {
      const response = await apiService.updateFinancialDocument(id, docData);
      toast({ title: 'Documento financeiro atualizado!' });
      return response.document || response.data;
    } catch (error) {
      console.error('Update financial document error:', error);
      toast({ title: 'Erro!', description: 'Falha ao atualizar documento financeiro.', variant: 'destructive' });
      throw error;
    }
  };

  const deleteFinancialDocument = async (id) => {
    try {
      await apiService.deleteFinancialDocument(id);
      toast({ title: 'Documento financeiro excluído!', variant: 'destructive' });
    } catch (error) {
      console.error('Delete financial document error:', error);
      toast({ title: 'Erro!', description: 'Falha ao excluir documento financeiro.', variant: 'destructive' });
      throw error;
    }
  };

  const addSale = async (sale) => {
    try {
      const response = await apiService.createSale(sale);
      toast({ title: "Venda registrada!", description: "Nova venda foi adicionada ao sistema." });
      return response.sale;
    } catch (error) {
      console.error('Add sale error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao registrar venda. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateSale = async (id, saleData) => {
    try {
      const response = await apiService.updateSale(id, saleData);
      toast({ title: "Venda atualizada!" });
      return response.sale;
    } catch (error) {
      console.error('Update sale error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar venda. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteSale = async (id) => {
    try {
      await apiService.deleteSale(id);
      toast({ title: "Venda excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete sale error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir venda. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const addBilling = async (billing) => {
    try {
      const response = await apiService.createBilling(billing);
      toast({ title: "Cobrança Adicionada!", description: "Nova cobrança foi registrada com sucesso." });
      return response.billing;
    } catch (error) {
      console.error('Add billing error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar cobrança. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateBilling = async (id, billingData) => {
    try {
      const response = await apiService.updateBilling(id, billingData);
      toast({ title: "Cobrança atualizada!" });
      return response.billing;
    } catch (error) {
      console.error('Update billing error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar cobrança. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteBilling = async (id) => {
    try {
      await apiService.deleteBilling(id);
      toast({ title: "Cobrança excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete billing error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir cobrança. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addFinancialDocument,
    updateFinancialDocument,
    deleteFinancialDocument,
    addSale,
    updateSale,
    deleteSale,
    addBilling,
    updateBilling,
    deleteBilling
  };
};
