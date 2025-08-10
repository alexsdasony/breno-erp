import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

export const useCrud = () => {
  // Transactions
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

  // Partners (suppliers/customers unified)
  const addPartner = async (partner) => {
    try {
      const response = await apiService.createPartner(partner);
      toast({ title: 'Parceiro adicionado!' });
      return response.partner || response.data;
    } catch (error) {
      console.error('Add partner error:', error);
      toast({ title: 'Erro!', description: 'Falha ao adicionar parceiro.', variant: 'destructive' });
      throw error;
    }
  };

  const updatePartner = async (id, partnerData) => {
    try {
      const response = await apiService.updatePartner(id, partnerData);
      toast({ title: 'Parceiro atualizado!' });
      return response.partner || response.data;
    } catch (error) {
      console.error('Update partner error:', error);
      toast({ title: 'Erro!', description: 'Falha ao atualizar parceiro.', variant: 'destructive' });
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

  // Financial Documents
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

  // Customers -> redirecionado para Partners (role=customer)
  const addCustomer = async (customer) => {
    try {
      const partnerPayload = {
        name: customer.name,
        tax_id: customer.cnpj || customer.cpf || customer.tax_id || '',
        email: customer.email,
        phone: customer.phone || customer.celular || '',
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.cep || customer.zip_code,
        status: customer.status || 'active',
        segment_id: customer.segmentId || customer.segment_id,
        role: 'customer'
      };
      const response = await apiService.createPartner(partnerPayload);
      
      toast({ title: "Cliente adicionado!", description: "Novo cliente foi cadastrado com sucesso." });
      return response.partner || response.data;
    } catch (error) {
      console.error('Add customer error:', error);
      toast({ title: "Erro!", description: "Falha ao adicionar cliente.", variant: 'destructive' });
      throw error;
    }
  };

  const updateCustomer = async (id, customerData) => {
    try {
      const partnerPayload = {
        name: customerData.name,
        tax_id: customerData.cnpj || customerData.cpf || customerData.tax_id || '',
        email: customerData.email,
        phone: customerData.phone || customerData.celular || '',
        address: customerData.address,
        city: customerData.city,
        state: customerData.state,
        zip_code: customerData.cep || customerData.zip_code,
        status: customerData.status || 'active',
        segment_id: customerData.segmentId || customerData.segment_id
      };
      const response = await apiService.updatePartner(id, partnerPayload);
      
      toast({ title: "Cliente atualizado!" });
      return response.partner || response.data;
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
      const result = response.costCenter || response.cost_centers || response.cot_centers || response.data || response;
      toast({ title: "Centro de Custo Adicionado!" });
      return result;
    } catch (error) {
      console.error('Add cost center error:', error);
      toast({ 
        title: "Erro!", 
        description: (error && error.message) || "Falha ao adicionar centro de custo. Tente novamente.", 
        variant: 'destructive' 
      });
      throw error;
    }
  };

  const updateCostCenter = async (id, costCenterData) => {
    try {
      const response = await apiService.updateCostCenter(id, costCenterData);
      const result = response.costCenter || response.cost_centers || response.cot_centers || response.data || response;
      toast({ title: "Centro de Custo Atualizado!" });
      return result;
    } catch (error) {
      console.error('Update cost center error:', error);
      toast({ 
        title: "Erro!", 
        description: (error && error.message) || "Falha ao atualizar centro de custo. Tente novamente.", 
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

    // Partners
    addPartner, updatePartner, deletePartner,
    
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

    // Financial Documents
    addFinancialDocument, updateFinancialDocument, deleteFinancialDocument,
    
    // Segments
    addSegment, updateSegment, deleteSegment,
    
    // Integrations
    updateIntegrationSettings,
    
    // Import
    importData
  };
};