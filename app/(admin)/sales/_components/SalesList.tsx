import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Eye, Edit, Trash2, ShoppingCart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalesListProps } from './types';
import { Sale } from '../_hooks/useSales';

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

export function SalesList({ items, loading, hasMore, loadMore, onEdit, onView, onDelete }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filtrar itens com base no termo de busca e status
  const filteredItems = items.filter((sale) => {
    // Verificar se customer_name existe antes de usar toLowerCase
    const matchesSearch = !searchTerm || (sale.customer_name && sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));
    // Verificar se status existe antes de usar toLowerCase
    const matchesStatus = filterStatus === 'all' || (sale.status && sale.status.toLowerCase() === filterStatus.toLowerCase());
    return matchesSearch && matchesStatus;
  });
  
  console.log('Items recebidos:', items);
  console.log('Items filtrados:', filteredItems);

  const handleCreateFirstSale = () => {
    // Aqui você pode adicionar a lógica para criar a primeira venda
    // Por exemplo, chamar uma função que foi passada como prop
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-effect rounded-lg p-4 border"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Lista de Vendas</h3>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              style={{ minWidth: '200px' }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os status</option>
            <option value="pendente">Pendente</option>
            <option value="concluída">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pagamento</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total</th>
              <th className="text-center p-3 text-sm font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((sale, index) => (
              <motion.tr
                key={sale.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium">{sale.customer_name || 'Cliente'}</div>
                      <div className="text-sm text-muted-foreground">Itens: {sale.items?.length ?? 1}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-sm">{formatDate(sale.date || '')}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon((sale as any).payment_method || 'dinheiro')}
                    <span className="text-sm capitalize">{(sale as any).payment_method || 'dinheiro'}</span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(sale.status || 'Pendente')}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 
                      sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {sale.status || 'Pendente'}
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <div className="font-medium">{formatCurrency(Number(sale.total_amount || 0))}</div>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(sale)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(sale)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(sale.id?.toString() || '')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {items.length === 0 ? (
              <div>
                <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma venda encontrada.</p>
                <Button onClick={handleCreateFirstSale}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Venda
                </Button>
              </div>
            ) : (
              'Nenhuma venda encontrada com os filtros aplicados.'
            )}
          </div>
        )}
      </div>

      {/* Paginação */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={() => void loadMore()} 
            disabled={loading}
            variant="outline"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Carregando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Carregar Mais Vendas
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
}