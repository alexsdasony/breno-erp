import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useCrud = () => {
  // Transactions
  const addTransaction = async (transaction) => {
    try {
      const response = await apiService.createTransaction(transaction);
      toast({ title: "Transação adicionada!", description: "Nova transação foi registrada com sucesso." });
      return response.transaction;
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
      toast({ title: "Transação atualizada!" });
      return response.transaction;
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

  // Products
  const addProduct = async (product) => {
    try {
      const response = await apiService.createProduct(product);
      toast({ title: "Produto adicionado!", description: "Novo produto foi cadastrado no estoque." });
      return response.product;
    } catch (error) {
      console.error('Add product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await apiService.updateProduct(id, productData);
      toast({ title: "Produto atualizado!" });
      return response.product;
    } catch (error) {
      console.error('Update product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiService.deleteProduct(id);
      toast({ title: "Produto excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete product error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir produto. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Sales
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

  // Customers
  const addCustomer = async (customer) => {
    try {
      const response = await apiService.createCustomer(customer);
      toast({ title: "Cliente adicionado!", description: "Novo cliente foi cadastrado com sucesso." });
      return response.customer;
    } catch (error) {
      console.error('Add customer error:', error);
      let errorMessage = "Falha ao adicionar cliente. Tente novamente.";
      
      if (error.message.includes('email already exists') || error.message.includes('Customer with this email already exists')) {
        errorMessage = "Cliente com este email já existe.";
      } else if (error.message.includes('document already exists') || error.message.includes('Customer with this document already exists')) {
        errorMessage = "Cliente com este documento já existe.";
      }
      
      toast({ 
        title: "Erro!", 
        description: errorMessage, 
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
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar cliente. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteCustomer = async (id) => {
    try {
      await apiService.deleteCustomer(id);
      toast({ title: "Cliente excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete customer error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir cliente. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // NFe
  const addNFe = async (nfe) => {
    try {
      const response = await apiService.createNFe(nfe);
      toast({ title: "NF-e Gerada!", description: "Nova NF-e foi adicionada à lista." });
      return response.nfe;
    } catch (error) {
      console.error('Add NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao criar NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateNFe = async (id, nfeData) => {
    try {
      const response = await apiService.updateNFe(id, nfeData);
      toast({ title: "NF-e atualizada!" });
      return response.nfe;
    } catch (error) {
      console.error('Update NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteNFe = async (id) => {
    try {
      await apiService.deleteNFe(id);
      toast({ title: "NF-e excluída!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete NFe error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir NF-e. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Billings
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

  // Cost Centers
  const addCostCenter = async (costCenter) => {
    try {
      const response = await apiService.createCostCenter(costCenter);
      toast({ title: "Centro de Custo Adicionado!" });
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

  // Accounts Payable
  const addAccountPayable = async (account) => {
    try {
      const response = await apiService.createAccountPayable(account);
      toast({ title: "Conta a Pagar Adicionada!" });
      return response.account;
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
      return response.account;
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

  // Segments
  const addSegment = async (segment) => {
    try {
      const response = await apiService.createSegment(segment);
      toast({ title: "Segmento Adicionado!" });
      return response.segment;
    } catch (error) {
      console.error('Add segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao adicionar segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateSegment = async (id, segmentData) => {
    try {
      const response = await apiService.updateSegment(id, segmentData);
      toast({ title: "Segmento Atualizado!" });
      return response.segment;
    } catch (error) {
      console.error('Update segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao atualizar segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const deleteSegment = async (id) => {
    try {
      await apiService.deleteSegment(id);
      toast({ title: "Segmento Excluído!", variant: 'destructive' });
    } catch (error) {
      console.error('Delete segment error:', error);
      toast({ 
        title: "Erro!", 
        description: "Falha ao excluir segmento. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  // Integrations
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

  // Import Data
  const importData = async (importedItems, type) => {
    try {
      let response;
      
      switch (type) {
        case 'transactions':
          response = await apiService.importTransactions(importedItems);
          break;
        default:
          toast({ title: "Tipo de Importação Inválido", variant: "destructive" });
          return;
      }
      
      const success = response.imported || importedItems.length;
      const errors = response.errors || 0;
      
      toast({
        title: "Importação Concluída",
        description: `${success} registros importados com sucesso para ${type}. ${errors > 0 ? `${errors} registros com erro.` : ''}`,
      });
      
      return response;
    } catch (error) {
      console.error('Import data error:', error);
      toast({
        title: "Erro na Importação!",
        description: "Falha ao importar dados. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    // Transactions
    addTransaction, updateTransaction, deleteTransaction,
    
    // Products
    addProduct, updateProduct, deleteProduct,
    
    // Sales
    addSale, updateSale, deleteSale,
    
    // Customers
    addCustomer, updateCustomer, deleteCustomer,
    
    // NFe
    addNFe, updateNFe, deleteNFe,
    
    // Billings
    addBilling, updateBilling, deleteBilling,
    
    // Cost Centers
    addCostCenter, updateCostCenter, deleteCostCenter,
    
    // Accounts Payable
    addAccountPayable, updateAccountPayable, deleteAccountPayable,
    
    // Segments
    addSegment, updateSegment, deleteSegment,
    
    // Integrations
    updateIntegrationSettings,
    
    // Import
    importData
  };
};