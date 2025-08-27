import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { SalesKPIProps } from './types';

// Função auxiliar para formatação de moeda
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function SalesKPIs({ totalSales, totalRevenue, uniqueCustomers, averageTicket }: SalesKPIProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      {/* Total de Vendas */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-lg p-4 border flex items-center"
      >
        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
          <ShoppingBag className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total de Vendas</p>
          <p className="text-2xl font-bold">{totalSales}</p>
        </div>
      </motion.div>

      {/* Clientes Ativos */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-effect rounded-lg p-4 border flex items-center"
      >
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
          <Users className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Clientes Ativos</p>
          <p className="text-2xl font-bold">{uniqueCustomers}</p>
        </div>
      </motion.div>

      {/* Receita Total */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-lg p-4 border flex items-center"
      >
        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mr-4">
          <DollarSign className="w-6 h-6 text-purple-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Receita Total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
        </div>
      </motion.div>

      {/* Ticket Médio */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-lg p-4 border flex items-center"
      >
        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mr-4">
          <TrendingUp className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}