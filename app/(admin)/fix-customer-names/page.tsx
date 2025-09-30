'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, CreditCard, Save, RefreshCw } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tax_id: string | null;
  created_at: string;
  suggestedName: string | null;
}

export default function FixCustomerNamesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [editingNames, setEditingNames] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/fix-customer-names');
      const data = await response.json();
      
      if (data.success) {
        setCustomers(data.customers);
        // Inicializar nomes editáveis
        const initialNames: Record<string, string> = {};
        data.customers.forEach((customer: Customer) => {
          initialNames[customer.id] = customer.suggestedName || customer.name;
        });
        setEditingNames(initialNames);
      } else {
        console.error('Erro ao carregar clientes:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerName = async (customerId: string, newName: string) => {
    try {
      setUpdating(customerId);
      const response = await fetch('/api/fix-customer-names', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          newName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Atualizar a lista local
        setCustomers(prev => 
          prev.map(customer => 
            customer.id === customerId 
              ? { ...customer, name: newName }
              : customer
          )
        );
        console.log(`✅ Cliente ${customerId} atualizado para: ${newName}`);
      } else {
        console.error('Erro ao atualizar cliente:', data.error);
        alert(`Erro ao atualizar cliente: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      alert('Erro ao atualizar cliente');
    } finally {
      setUpdating(null);
    }
  };

  const handleNameChange = (customerId: string, newName: string) => {
    setEditingNames(prev => ({
      ...prev,
      [customerId]: newName
    }));
  };

  const handleSave = (customerId: string) => {
    const newName = editingNames[customerId];
    if (newName && newName.trim() !== '') {
      updateCustomerName(customerId, newName.trim());
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-white">Corrigir Nomes de Clientes</h1>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-2">
              Clientes com nome "CLIENTE" encontrados: {customers.length}
            </h2>
            <p className="text-white/80">
              Estes clientes tiveram seus nomes alterados para "CLIENTE" devido a um problema no sistema. 
              Use as informações abaixo para identificar e corrigir os nomes.
            </p>
          </div>
        </motion.div>

        {/* Lista de clientes */}
        <div className="space-y-4">
          {customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações do cliente */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Cliente #{index + 1}
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-white/80">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email || 'Email não informado'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/80">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone || 'Telefone não informado'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/80">
                      <CreditCard className="w-4 h-4" />
                      <span>{customer.tax_id || 'CPF/CNPJ não informado'}</span>
                    </div>
                    
                    <div className="text-white/60 text-xs">
                      Criado em: {new Date(customer.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                {/* Campo de edição */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">
                    Nome Correto:
                  </label>
                  <input
                    type="text"
                    value={editingNames[customer.id] || ''}
                    onChange={(e) => handleNameChange(customer.id, e.target.value)}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="Digite o nome correto"
                  />
                  
                  {customer.suggestedName && (
                    <p className="text-xs text-white/60">
                      Sugestão baseada no email: <strong>{customer.suggestedName}</strong>
                    </p>
                  )}
                </div>

                {/* Botão de salvar */}
                <div className="flex items-end">
                  <Button
                    onClick={() => handleSave(customer.id)}
                    disabled={updating === customer.id || !editingNames[customer.id]?.trim()}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {updating === customer.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Nome
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {customers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-2">
                ✅ Nenhum cliente com problema encontrado!
              </h3>
              <p className="text-white/80">
                Todos os clientes têm nomes corretos. O problema foi resolvido.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
