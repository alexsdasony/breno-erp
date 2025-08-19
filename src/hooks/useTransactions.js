import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useTransactions = () => {
  const addTransaction = async (transaction) => {
    try {
      const response = await apiService.createTransaction(transaction);
      const created = response.transaction || response.transactions || response.data || response;
      toast({ title: "Transação adicionada!", description: "Nova transação foi registrada com sucesso." });
      return created;
    } catch (error) {
      console.error('Add transaction error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar transação. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await apiService.updateTransaction(id, transactionData);
      const updated = response.transaction || response.transactions || response.data || response;
      toast({ title: "Transação atualizada!" });
      return updated;
    } catch (error) {
      console.error('Update transaction error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar transação. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await apiService.deleteTransaction(id);
      toast({ title: "Transação excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir transação. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction
  };
};
