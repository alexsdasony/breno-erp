"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Product } from '@/types';
import { listProducts } from '@/services/productsService';

export type ProductsContextValue = {
  products: Product[];
  loading: boolean;
  searchProducts: (query: string) => Promise<Product[]>;
  refresh: () => Promise<void>;
};

const ProductsContext = createContext<ProductsContextValue | undefined>(undefined);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listProducts({ page: 1, limit: 100 });
      const productsList = res?.data?.products || [];
      setProducts(productsList);
    } catch (e) {
      // silencioso
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    
    try {
      const res = await listProducts({ search: query });
      return res?.data?.products || [];
    } catch (e) {
      console.error('Erro ao buscar produtos:', e);
      return [];
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, searchProducts, refresh: load }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProductsContext(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProductsContext must be used within ProductsProvider');
  return ctx;
}