import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const usePartners = () => {
  const addPartner = async (partner) => {
    try {
      const response = await apiService.createPartner(partner);
      toast({ title: 'Parceiro criado!', description: 'Novo parceiro foi cadastrado com sucesso.' });
      return response.partner;
    } catch (error) {
      console.error('Add partner error:', error);
      toast({ title: 'Erro!', description: 'Falha ao criar parceiro.', variant: 'destructive' });
      throw error;
    }
  };

  const updatePartner = async (id, partnerData) => {
    try {
      const response = await apiService.updatePartner(id, partnerData);
      toast({ title: 'Parceiro atualizado!' });
      return response.partner;
    } catch (error) {
      console.error('Update partner error:', error);
      toast({ title: "Erro!", description: "Falha ao atualizar parceiro.", variant: 'destructive' });
      throw error;
    }
  };

  const deletePartner = async (id) => {
    try {
      await apiService.deletePartner(id);
      toast({ title: 'Parceiro excluído!', variant: 'destructive' });
    } catch (error) {
      console.error('Delete partner error:', error);
      toast({ title: 'Erro!', description: 'Falha ao excluir parceiro.', variant: 'destructive' });
      throw error;
    }
  };

  // Customers -> redirecionado para Partners (role=customer)
  const addCustomer = async (customer) => {
    try {
      const response = await apiService.createCustomer(customer);
      toast({ title: "Cliente adicionado!", description: "Novo cliente foi cadastrado com sucesso." });
      return response.customer;
    } catch (error) {
      console.error('Add customer error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar cliente. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const response = await apiService.updateCustomer(id, customerData);
      toast({ title: "Cliente atualizado!" });
      return response.customer;
    } catch (error) {
      console.error('Update customer error:', error);
      toast({ title: "Erro!", description: "Falha ao atualizar cliente.", variant: 'destructive' });
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await apiService.deletePartner(id);
      toast({ title: "Cliente excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete customer error:', error);
      toast({ title: "Erro!", description: "Falha ao excluir cliente.", variant: 'destructive' });
      throw error;
    }
  };

  return {
    addPartner,
    updatePartner,
    deletePartner,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
};
