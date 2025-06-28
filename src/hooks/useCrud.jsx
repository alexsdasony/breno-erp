import { toast } from '@/components/ui/use-toast';

export const useCrud = (setData) => {
  const addTransaction = (transaction) => {
    const newTransaction = { ...transaction, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    setData(prev => ({ ...prev, transactions: [newTransaction, ...prev.transactions] }));
    toast({ title: "Transação adicionada!", description: "Nova transação foi registrada com sucesso." });
  };
  const updateTransaction = (updatedTransaction) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)}));
    toast({ title: "Transação atualizada!" });
  };
  const deleteTransaction = (id) => {
    setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id)}));
    toast({ title: "Transação excluída!", variant: 'destructive' });
  };

  const addProduct = (product) => {
    const newProduct = { ...product, id: Date.now() };
    setData(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
    toast({ title: "Produto adicionado!", description: "Novo produto foi cadastrado no estoque." });
  };
  const updateProduct = (updatedProduct) => {
    setData(prev => ({ ...prev, products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)}));
    toast({ title: "Produto atualizado!" });
  };
  const deleteProduct = (id) => {
    setData(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id)}));
    toast({ title: "Produto excluído!", variant: 'destructive' });
  };

  const addSale = (sale) => {
    const newSale = { ...sale, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    setData(prev => ({ ...prev, sales: [newSale, ...prev.sales] }));
    toast({ title: "Venda registrada!", description: "Nova venda foi adicionada ao sistema." });
  };
  const updateSale = (updatedSale) => {
    setData(prev => ({ ...prev, sales: prev.sales.map(s => s.id === updatedSale.id ? updatedSale : s)}));
    toast({ title: "Venda atualizada!" });
  };
  const deleteSale = (id) => {
    setData(prev => ({ ...prev, sales: prev.sales.filter(s => s.id !== id)}));
    toast({ title: "Venda excluída!", variant: 'destructive' });
  };

  const addCustomer = (customer) => {
    const newCustomer = { ...customer, id: Date.now(), totalPurchases: 0, lastPurchaseDate: null };
    setData(prev => ({ ...prev, customers: [newCustomer, ...prev.customers] }));
    toast({ title: "Cliente adicionado!", description: "Novo cliente foi cadastrado com sucesso." });
  };
  const updateCustomer = (updatedCustomer) => {
    setData(prev => ({ ...prev, customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)}));
    toast({ title: "Cliente atualizado!" });
  };
  const deleteCustomer = (id) => {
    setData(prev => ({ ...prev, customers: prev.customers.filter(c => c.id !== id)}));
    toast({ title: "Cliente excluído!", variant: 'destructive' });
  };
  
  const addNFe = (nfe) => {
    const newNFe = { ...nfe, id: Date.now(), date: new Date().toISOString().split('T')[0] };
    setData(prev => ({ ...prev, nfeList: [newNFe, ...prev.nfeList] }));
    toast({ title: "NF-e Gerada!", description: "Nova NF-e foi adicionada à lista." });
  };
  const updateNFe = (updatedNFe) => {
    setData(prev => ({ ...prev, nfeList: prev.nfeList.map(n => n.id === updatedNFe.id ? updatedNFe : n)}));
    toast({ title: "NF-e atualizada!" });
  };
  const deleteNFe = (id) => {
    setData(prev => ({ ...prev, nfeList: prev.nfeList.filter(n => n.id !== id)}));
    toast({ title: "NF-e excluída!", variant: 'destructive' });
  };

  const addBilling = (billing) => {
    const newBilling = { ...billing, id: Date.now() };
    setData(prev => ({ ...prev, billings: [newBilling, ...prev.billings] }));
    toast({ title: "Cobrança Adicionada!", description: "Nova cobrança foi registrada com sucesso." });
  };
  const updateBilling = (updatedBilling) => {
    setData(prev => ({ ...prev, billings: prev.billings.map(b => b.id === updatedBilling.id ? updatedBilling : b)}));
    toast({ title: "Cobrança atualizada!" });
  };
  const deleteBilling = (id) => {
    setData(prev => ({ ...prev, billings: prev.billings.filter(b => b.id !== id)}));
    toast({ title: "Cobrança excluída!", variant: 'destructive' });
  };

  const addCostCenter = (costCenter) => {
    const newCostCenter = { ...costCenter, id: Date.now() };
    setData(prev => ({ ...prev, costCenters: [newCostCenter, ...prev.costCenters] }));
    toast({ title: "Centro de Custo Adicionado!" });
  };
  const updateCostCenter = (updatedCostCenter) => {
    setData(prev => ({ ...prev, costCenters: prev.costCenters.map(cc => cc.id === updatedCostCenter.id ? updatedCostCenter : cc)}));
    toast({ title: "Centro de Custo Atualizado!" });
  };
  const deleteCostCenter = (costCenterId) => {
    setData(prev => ({ ...prev, costCenters: prev.costCenters.filter(cc => cc.id !== costCenterId)}));
    toast({ title: "Centro de Custo Excluído!", variant: 'destructive' });
  };

  const addAccountPayable = (account) => {
    const newAccount = { ...account, id: Date.now(), amount: parseFloat(account.amount) };
    setData(prev => ({ ...prev, accountsPayable: [newAccount, ...prev.accountsPayable] }));
    toast({ title: "Conta a Pagar Adicionada!"});
  };
  const updateAccountPayable = (updatedAccount) => {
    setData(prev => ({ ...prev, accountsPayable: prev.accountsPayable.map(acc => acc.id === updatedAccount.id ? { ...updatedAccount, amount: parseFloat(updatedAccount.amount) } : acc)}));
    toast({ title: "Conta a Pagar Atualizada!" });
  };
  const deleteAccountPayable = (accountId) => {
    setData(prev => ({ ...prev, accountsPayable: prev.accountsPayable.filter(acc => acc.id !== accountId)}));
    toast({ title: "Conta a Pagar Excluída!", variant: 'destructive' });
  };

  const addSegment = (segment) => {
    const newSegment = { ...segment, id: Date.now() };
    setData(prev => ({ ...prev, segments: [newSegment, ...prev.segments] }));
    toast({ title: "Segmento Adicionado!" });
  };
  const updateSegment = (updatedSegment) => {
    setData(prev => ({ ...prev, segments: prev.segments.map(s => s.id === updatedSegment.id ? updatedSegment : s)}));
    toast({ title: "Segmento Atualizado!" });
  };
  const deleteSegment = (segmentId) => {
    setData(prev => ({ ...prev, segments: prev.segments.filter(s => s.id !== segmentId)}));
    toast({ title: "Segmento Excluído!", variant: 'destructive' });
  };

  const updateIntegrationSettings = (integrationName, settings) => {
    setData(prev => ({ ...prev, integrations: { ...prev.integrations, [integrationName]: settings }}));
  };

  const importData = (importedItems, type, segmentId) => {
    let newItems = [];
    let errors = 0;
    let success = 0;
    const itemProcessors = {
      transactions: item => ({ id: Date.now() + Math.random(), type: item.type || 'despesa', description: item.description || 'N/A', amount: parseFloat(item.amount) || 0, date: item.date || new Date().toISOString().split('T')[0], category: item.category || 'N/A', costCenter: item.type === 'despesa' ? (item.costCenter || null) : null, segmentId }),
      products: item => ({ id: Date.now() + Math.random(), name: item.name || 'N/A', stock: parseInt(item.stock) || 0, minStock: parseInt(item.minStock) || 0, price: parseFloat(item.price) || 0, category: item.category || 'N/A', segmentId }),
      sales: item => ({ id: Date.now() + Math.random(), customerId: parseInt(item.customerId) || null, customerName: item.customerName || 'N/A', product: item.product || 'N/A', quantity: parseInt(item.quantity) || 0, total: parseFloat(item.total) || 0, date: item.date || new Date().toISOString().split('T')[0], status: item.status || 'Pendente', segmentId }),
      customers: item => ({ id: Date.now() + Math.random(), name: item.name || 'N/A', cpf: item.cpf || 'N/A', email: item.email || 'N/A', phone: item.phone || '', address: item.address || '', city: item.city || '', state: item.state || '', totalPurchases: parseFloat(item.totalPurchases) || 0, lastPurchaseDate: item.lastPurchaseDate || null }),
      costCenters: item => ({ id: Date.now() + Math.random(), name: item.name || 'N/A', segmentId }),
      nfeList: item => ({ id: Date.now() + Math.random(), number: item.number || 'N/A', customerName: item.customerName || 'N/A', date: item.date || new Date().toISOString().split('T')[0], total: parseFloat(item.total) || 0, status: item.status || 'Pendente', segmentId }),
      billings: item => ({ id: Date.now() + Math.random(), customerId: parseInt(item.customerId) || null, customerName: item.customerName || 'N/A', amount: parseFloat(item.amount) || 0, dueDate: item.dueDate || new Date().toISOString().split('T')[0], status: item.status || 'Pendente', paymentDate: item.paymentDate || null, segmentId }),
      accountsPayable: item => ({ id: Date.now() + Math.random(), supplier: item.supplier || 'N/A', description: item.description || 'N/A', amount: parseFloat(item.amount) || 0, dueDate: item.dueDate || new Date().toISOString().split('T')[0], status: item.status || 'pending', segmentId }),
    };
    if (!itemProcessors[type]) {
      toast({ title: "Tipo de Importação Inválido", variant: "destructive" });
      return;
    }
    newItems = importedItems.map(itemProcessors[type]);
    setData(prev => ({ ...prev, [type]: [...newItems, ...prev[type]] }));
    success = newItems.length;
    toast({ title: "Importação Concluída", description: `${success} registros importados com sucesso para ${type}. ${errors > 0 ? `${errors} registros com erro.` : ''}` });
  };

  return {
    addTransaction, updateTransaction, deleteTransaction,
    addProduct, updateProduct, deleteProduct,
    addSale, updateSale, deleteSale,
    addCustomer, updateCustomer, deleteCustomer,
    addNFe, updateNFe, deleteNFe,
    addBilling, updateBilling, deleteBilling,
    addCostCenter, updateCostCenter, deleteCostCenter,
    addAccountPayable, updateAccountPayable, deleteAccountPayable,
    addSegment, updateSegment, deleteSegment,
    updateIntegrationSettings,
    importData
  };
};