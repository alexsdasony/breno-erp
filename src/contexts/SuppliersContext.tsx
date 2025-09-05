"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Interface simplificada para evitar problemas de importação
interface SimpleSupplier {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cpf_cnpj?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  status?: string;
  [key: string]: any;
}

export type SuppliersContextValue = {
  suppliers: SimpleSupplier[];
  loading: boolean;
  searchSuppliers: (query: string) => Promise<SimpleSupplier[]>;
  refresh: () => Promise<void>;
};

const SuppliersContext = createContext<SuppliersContextValue | undefined>(undefined);

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<SimpleSupplier[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Tentar carregar fornecedores da API, mas não falhar se der erro
      try {
        const { listSuppliers } = await import('@/services/suppliersService');
        const result = await listSuppliers({ page: 1, limit: 100 });
        const suppliers = result?.data?.suppliers || [];
        // Converter para SimpleSupplier para compatibilidade de tipos
        const simpleSuppliers: SimpleSupplier[] = suppliers.map(s => ({
          id: s.id,
          razao_social: s.razao_social || s.name || '',
          nome_fantasia: s.nome_fantasia || undefined,
          cpf_cnpj: s.cpf_cnpj || s.cnpj || s.cpf || '',
          email: s.email || '',
          telefone: s.telefone_celular || s.telefone || s.phone || '',
          endereco: s.endereco || s.address || '',
          status: s.status || (s.is_active ? 'ATIVO' : 'INATIVO')
        }));
        setSuppliers(simpleSuppliers);
      } catch (apiError) {
        console.warn('Erro ao carregar fornecedores da API, usando dados vazios:', apiError);
        setSuppliers([]);
      }
    } catch (e) {
      console.warn('Erro geral no contexto de fornecedores:', e);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const searchSuppliers = async (query: string): Promise<SimpleSupplier[]> => {
    if (!query.trim()) return [];
    
    try {
      const { getSuppliers } = await import('@/services/suppliersService');
      const result = await getSuppliers({ search: query });
      const suppliers = result?.data?.suppliers || [];
      // Converter para SimpleSupplier para compatibilidade de tipos
      return suppliers.map(s => ({
        id: s.id,
        razao_social: s.razao_social || s.name || '',
        nome_fantasia: s.nome_fantasia || undefined,
        cpf_cnpj: s.cpf_cnpj || s.cnpj || s.cpf || '',
        email: s.email || '',
        telefone: s.telefone_celular || s.telefone || s.phone || '',
        endereco: s.endereco || s.address || '',
        status: s.status || (s.is_active ? 'ATIVO' : 'INATIVO')
      }));
    } catch (e) {
      console.warn('Erro ao buscar fornecedores:', e);
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