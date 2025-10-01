'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCustomers } from '@/services/customersService';
import type { Customer } from '@/types';

interface CustomerAutocompleteProps {
  value: string;
  onChange: (customerId: string, customerName: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  initialCustomerName?: string;
}

export default function CustomerAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Digite o nome do cliente...",
  className = "",
  required = false,
  initialCustomerName = ""
}: CustomerAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(initialCustomerName);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Atualizar searchTerm quando initialCustomerName mudar
  useEffect(() => {
    if (initialCustomerName) {
      setSearchTerm(initialCustomerName);
    }
  }, [initialCustomerName]);

  // Buscar clientes quando o termo de busca mudar
  useEffect(() => {
    if (!searchTerm.trim()) {
      setCustomers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchCustomers(searchTerm);
        setCustomers(results);
        setIsOpen(true);
      } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Limpar seleção quando value mudar externamente
  useEffect(() => {
    if (!value) {
      setSelectedCustomer(null);
      setSearchTerm('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    
    if (!newValue) {
      setSelectedCustomer(null);
      onChange('', '');
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchTerm(customer.name);
    setIsOpen(false);
    onChange(customer.id, customer.name);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setSearchTerm('');
    setIsOpen(false);
    onChange('', '');
  };

  const handleFocus = () => {
    if (customers.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          required={required}
        />
        {selectedCustomer && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {loading ? (
              <div className="p-3 text-center text-muted-foreground">
                Buscando clientes...
              </div>
            ) : customers.length > 0 ? (
              customers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleCustomerSelect(customer)}
                  className="w-full px-3 py-2 text-left hover:bg-muted/50 flex items-center space-x-3"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email} • {customer.phone}
                    </div>
                  </div>
                </button>
              ))
            ) : searchTerm.trim() ? (
              <div className="p-3 text-center text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {customer.email} • {customer.phone}
                    </div>
                  </div>
                </button>
              ))
            ) : searchTerm.trim() ? (
              <div className="p-3 text-center text-muted-foreground">
                Nenhum cliente encontrado
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
