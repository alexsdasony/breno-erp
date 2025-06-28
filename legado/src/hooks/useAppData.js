import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from '@/components/ui/use-toast';
import { initialData as appInitialData } from '@/config/initialData';

const AppDataContext = createContext();

const defaultInitialData = {
  transactions: [],
  products: [],
  sales: [],
  customers: [],
  costCenters: [
    { id: 1, name: 'Administrativo' }, { id: 2, name: 'Vendas' },
    { id: 3, name: 'Marketing' }, { id: 4, name: 'Estoque' },
    { id: 5, name: 'Operacional' }
  ],
  nfeList: [],
  integrations: {
    imobzi: { apiKey: '', enabled: false }
  },
  billings: [
    { id: 1, customerId: 1, customerName: 'João Silva', amount: 150.00, dueDate: '2024-02-10', status: 'Paga', paymentDate: '2024-02-08' },
    { id: 2, customerId: 2, customerName: 'Maria Santos', amount: 200.00, dueDate: '2024-02-15', status: 'Pendente', paymentDate: null },
  ],
  users: [], 
};

export const AppDataProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('erpData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        ...defaultInitialData,
        ...parsedData,
        users: parsedData.users || [], 
      };
    }
    return defaultInitialData;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('erpCurrentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    localStorage.setItem('erpData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('erpCurrentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('erpCurrentUser');
    }
  }, [currentUser]);

  const registerUser = (name, email, password) => {
    const existingUser = data.users.find(user => user.email === email);
    if (existingUser) {
      return false; 
    }
    const newUser = { id: Date.now(), name, email, password };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return true;
  };

  const loginUser = (email, password) => {
    const user = data.users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const updateUserProfile = (name, email) => {
    if (!currentUser) return false;

    const emailExists = data.users.some(user => user.email === email && user.id !== currentUser.id);
    if (emailExists) {
      return false; 
    }

    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id ? { ...user, name, email } : user
      ),
    }));
    setCurrentUser(prev => ({ ...prev, name, email }));
    return true;
  };

  const changeUserPassword = (currentPassword, newPassword) => {
    if (!currentUser || currentUser.password !== currentPassword) {
      return false;
    }
    setData(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id ? { ...user, password: newPassword } : user
      ),
    }));
    setCurrentUser(prev => ({ ...prev, password: newPassword }));
    return true;
  };


  const addTransaction = (transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions]
    }));
    toast({
      title: "Transação adicionada!",
      description: "Nova transação foi registrada com sucesso."
    });
  };

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now()
    };
    setData(prev => ({
      ...prev,
      products: [newProduct, ...prev.products]
    }));
    toast({
      title: "Produto adicionado!",
      description: "Novo produto foi cadastrado no estoque."
    });
  };

  const addSale = (sale) => {
    const newSale = {
      ...sale,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      sales: [newSale, ...prev.sales]
    }));
    toast({
      title: "Venda registrada!",
      description: "Nova venda foi adicionada ao sistema."
    });
  };

  const addCustomer = (customer) => {
    const newCustomer = {
      ...customer,
      id: Date.now(),
      totalPurchases: 0,
      lastPurchaseDate: null
    };
    setData(prev => ({
      ...prev,
      customers: [newCustomer, ...prev.customers]
    }));
    toast({
      title: "Cliente adicionado!",
      description: "Novo cliente foi cadastrado com sucesso."
    });
  };
  
  const addNFe = (nfe) => {
    const newNFe = {
      ...nfe,
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      nfeList: [newNFe, ...prev.nfeList]
    }));
    toast({
      title: "NF-e Gerada!",
      description: "Nova NF-e foi adicionada à lista."
    });
  };

  const addBilling = (billing) => {
    const newBilling = {
      ...billing,
      id: Date.now(),
    };
    setData(prev => ({
      ...prev,
      billings: [newBilling, ...prev.billings]
    }));
    toast({
      title: "Cobrança Adicionada!",
      description: "Nova cobrança foi registrada com sucesso."
    });
  };

  const addCostCenter = (costCenter) => {
    const newCostCenter = {
      ...costCenter,
      id: Date.now(),
    };
    setData(prev => ({
      ...prev,
      costCenters: [newCostCenter, ...prev.costCenters]
    }));
    toast({
      title: "Centro de Custo Adicionado!",
      description: "Novo centro de custo foi registrado com sucesso."
    });
  };

  const updateCostCenter = (updatedCostCenter) => {
    setData(prev => ({
      ...prev,
      costCenters: prev.costCenters.map(cc => 
        cc.id === updatedCostCenter.id ? updatedCostCenter : cc
      )
    }));
    toast({
      title: "Centro de Custo Atualizado!",
      description: "O centro de custo foi atualizado com sucesso."
    });
  };

  const deleteCostCenter = (costCenterId) => {
    setData(prev => ({
      ...prev,
      costCenters: prev.costCenters.filter(cc => cc.id !== costCenterId)
    }));
    toast({
      title: "Centro de Custo Excluído!",
      description: "O centro de custo foi excluído com sucesso."
    });
  };

  const updateIntegrationSettings = (integrationName, settings) => {
    setData(prev => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [integrationName]: settings
      }
    }));
  };

  const importData = (importedItems, type) => {
    let newItems = [];
    let errors = 0;
    let success = 0;

    switch (type) {
      case 'transactions':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          type: item.type || 'despesa',
          description: item.description || 'N/A',
          amount: parseFloat(item.amount) || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          category: item.category || 'N/A',
          costCenter: item.type === 'despesa' ? (item.costCenter || null) : null,
        }));
        setData(prev => ({ ...prev, transactions: [...newItems, ...prev.transactions] }));
        break;
      case 'products':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || 'N/A',
          stock: parseInt(item.stock) || 0,
          minStock: parseInt(item.minStock) || 0,
          price: parseFloat(item.price) || 0,
          category: item.category || 'N/A',
        }));
        setData(prev => ({ ...prev, products: [...newItems, ...prev.products] }));
        break;
      case 'sales':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          customerId: parseInt(item.customerId) || null,
          customerName: item.customerName || 'N/A',
          product: item.product || 'N/A',
          quantity: parseInt(item.quantity) || 0,
          total: parseFloat(item.total) || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          status: item.status || 'Pendente',
        }));
        setData(prev => ({ ...prev, sales: [...newItems, ...prev.sales] }));
        break;
      case 'customers':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || 'N/A',
          cpf: item.cpf || 'N/A',
          email: item.email || 'N/A',
          phone: item.phone || '',
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          totalPurchases: parseFloat(item.totalPurchases) || 0,
          lastPurchaseDate: item.lastPurchaseDate || null,
        }));
        setData(prev => ({ ...prev, customers: [...newItems, ...prev.customers] }));
        break;
      case 'costCenters':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          name: item.name || 'N/A',
        }));
        setData(prev => ({ ...prev, costCenters: [...newItems, ...prev.costCenters] }));
        break;
      case 'nfeList':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          number: item.number || 'N/A',
          customerName: item.customerName || 'N/A',
          date: item.date || new Date().toISOString().split('T')[0],
          total: parseFloat(item.total) || 0,
          status: item.status || 'Pendente',
        }));
        setData(prev => ({ ...prev, nfeList: [...newItems, ...prev.nfeList] }));
        break;
      case 'billings':
        newItems = importedItems.map(item => ({
          id: Date.now() + Math.random(),
          customerId: parseInt(item.customerId) || null,
          customerName: item.customerName || 'N/A',
          amount: parseFloat(item.amount) || 0,
          dueDate: item.dueDate || new Date().toISOString().split('T')[0],
          status: item.status || 'Pendente',
          paymentDate: item.paymentDate || null,
        }));
        setData(prev => ({ ...prev, billings: [...newItems, ...prev.billings] }));
        break;
      default:
        toast({ title: "Tipo de Importação Inválido", variant: "destructive" });
        return;
    }
    success = newItems.length;
    toast({
      title: "Importação Concluída",
      description: `${success} registros importados com sucesso para ${type}. ${errors > 0 ? `${errors} registros com erro.` : ''}`,
    });
  };

  const value = {
    data,
    setData,
    currentUser,
    registerUser,
    loginUser,
    logoutUser,
    updateUserProfile,
    changeUserPassword,
    addTransaction,
    addProduct,
    addSale,
    addCustomer,
    addNFe,
    addBilling,
    addCostCenter,
    updateCostCenter,
    deleteCostCenter,
    updateIntegrationSettings,
    importData
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};