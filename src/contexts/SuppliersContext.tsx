"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSuppliers } from '@/services/suppliersService';
import { Supplier } from '@/types';

export type SuppliersContextValue = {
  suppliers: Supplier[];
  loading: boolean;
  searchSuppliers: (query: string) => Promise<Supplier[]>;
  refresh: () => Promise<void>;
};

const SuppliersContext = createContext<SuppliersContextValue | undefined>(undefined);

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getSuppliers({ page: 1, limit: 100 });
      setSuppliers(result?.data?.suppliers || []);
    } catch (e) {
      // silencioso
      setSuppliers([]);
    } finally {
      setLoading(false);
    };
  };

  const searchSuppliers = async (query: string): Promise<Supplier[]> => {
    if (!query.trim()) return [];
    
    try {
      const result = await getSuppliers({ search: query });
      return result?.data?.suppliers || [];
    } catch (e) {
      console.error('Erro ao buscar fornecedores:', e);
      return [];
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <SuppliersContext.Provider value={{ suppliers, loading, searchSuppliers, refresh: load }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliersContext(): SuppliersContextValue {
  const ctx = useContext(SuppliersContext);
  if (!ctx) throw new Error('useSuppliersContext must be used within SuppliersProvider');
  return ctx;
}