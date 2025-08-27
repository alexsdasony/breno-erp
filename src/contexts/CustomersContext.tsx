"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Customer } from '@/types';
import { getCustomers } from '@/services/customersService';

export type CustomersContextValue = {
  customers: Customer[];
  loading: boolean;
  searchCustomers: (query: string) => Promise<Customer[]>;
  refresh: () => Promise<void>;
};

const CustomersContext = createContext<CustomersContextValue | undefined>(undefined);

export function CustomersProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const response = await getCustomers({ page: 1, limit: 100 });
      const { customers } = response.data || {};
      setCustomers(customers || []);
    } catch (e) {
      // silencioso
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchCustomers = async (query: string): Promise<Customer[]> => {
    if (!query.trim()) return [];
    
    try {
      const response = await getCustomers({ search: query });
      const { customers } = response.data || {};
      return customers || [];
    } catch (e) {
      console.error('Erro ao buscar clientes:', e);
      return [];
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <CustomersContext.Provider value={{ customers, loading, searchCustomers, refresh: load }}>
      {children}
    </CustomersContext.Provider>
  );
}

export function useCustomersContext(): CustomersContextValue {
  const ctx = useContext(CustomersContext);
  if (!ctx) throw new Error('useCustomersContext must be used within CustomersProvider');
  return ctx;
}