import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SaleViewModalProps } from './types';
import { Sale } from '@/types';

// Funções auxiliares
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'concluída':
      return <div className="w-2 h-2 rounded-full bg-green-400 mr-1" />;
    case 'pendente':
      return <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />;
    case 'cancelada':
      return <div className="w-2 h-2 rounded-full bg-red-400 mr-1" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-400 mr-1" />;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'cartão de crédito':
      return <div className="w-2 h-2 rounded-full bg-blue-400 mr-1" />;
    case 'cartão de débito':
      return <div className="w-2 h-2 rounded-full bg-green-400 mr-1" />;
    case 'dinheiro':
      return <div className="w-2 h-2 rounded-full bg-yellow-400 mr-1" />;
    case 'pix':
      return <div className="w-2 h-2 rounded-full bg-purple-400 mr-1" />;
    default:
      return <div className="w-2 h-2 rounded-full bg-gray-400 mr-1" />;
  }
};

export function SaleViewModal({ sale, isOpen, onClose }: SaleViewModalProps) {
  if (!sale) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-xl p-6 border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Detalhes da Venda</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="text-lg font-medium">{sale.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Data</label>
                  <p>{formatDate(sale.date || '')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
                  <div className="flex items-center">
                    {getPaymentMethodIcon((sale as any).payment_method || 'dinheiro')}
                    <span className="ml-1 capitalize">{(sale as any).payment_method || 'dinheiro'}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center">
                    {getStatusIcon(sale.status || '')}
                    <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 
                      sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {sale.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Resumo Financeiro
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(Number(sale.total_amount || 0))}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}