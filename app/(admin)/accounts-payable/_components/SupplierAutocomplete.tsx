'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Supplier {
  id: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
}

interface SupplierAutocompleteProps {
  value: string;
  onChange: (supplierId: string, supplierName: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SupplierAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Buscar fornecedor...",
  className = ""
}: SupplierAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Buscar fornecedores
  const searchSuppliers = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setFilteredSuppliers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/partners?q=${encodeURIComponent(searchQuery)}&role=supplier&limit=20`);
      const data = await response.json();
      
      if (data.success && data.partners) {
        const supplierList = data.partners.map((partner: any) => ({
          id: partner.id,
          name: partner.name,
          tax_id: partner.tax_id,
          email: partner.email,
          phone: partner.phone
        }));
        
        setSuppliers(supplierList);
        setFilteredSuppliers(supplierList);
      }
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar fornecedores localmente
  const filterSuppliers = (searchQuery: string) => {
    if (!searchQuery) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.tax_id && supplier.tax_id.includes(searchQuery)) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    
    setFilteredSuppliers(filtered);
  };

  // Debounce da busca
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchSuppliers(query);
      } else {
        filterSuppliers(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Carregar fornecedor selecionado
  useEffect(() => {
    if (value && !selectedSupplier) {
      // Buscar fornecedor pelo ID
      const fetchSupplier = async () => {
        try {
          const response = await fetch(`/api/partners/${value}`);
          const data = await response.json();
          
          if (data.success && data.partner) {
            const supplier = {
              id: data.partner.id,
              name: data.partner.name,
              tax_id: data.partner.tax_id,
              email: data.partner.email,
              phone: data.partner.phone
            };
            setSelectedSupplier(supplier);
            setQuery(supplier.name);
          }
        } catch (error) {
          console.error('Erro ao carregar fornecedor:', error);
        }
      };

      fetchSupplier();
    }
  }, [value, selectedSupplier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setShowDropdown(true);
    
    if (!newQuery) {
      setSelectedSupplier(null);
      onChange('', '');
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setQuery(supplier.name);
    setShowDropdown(false);
    onChange(supplier.id, supplier.name);
  };

  const handleClear = () => {
    setQuery('');
    setSelectedSupplier(null);
    setShowDropdown(false);
    onChange('', '');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (filteredSuppliers.length > 0 || loading) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground flex items-center">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
              Buscando fornecedores...
            </div>
          ) : (
            filteredSuppliers.map((supplier) => (
              <button
                key={supplier.id}
                type="button"
                onClick={() => handleSupplierSelect(supplier)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-none flex items-center"
              >
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{supplier.name}</div>
                  {supplier.tax_id && (
                    <div className="text-xs text-muted-foreground">
                      {supplier.tax_id}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="text-xs text-muted-foreground truncate">
                      {supplier.email}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
          
          {!loading && filteredSuppliers.length === 0 && query.length >= 2 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhum fornecedor encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
