'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSales } from '../_hooks/useSales';
import { Sale } from '@/types';
import { SalesKPIs } from './SalesKPIs';
import { SalesForm } from './SalesForm';
import { SalesList } from './SalesList';
import { SaleViewModal } from './SaleViewModal';
import { FormData, SaleItemUI } from './types';

export default function SalesView() {
  // Estados principais
  const { items, loading, hasMore, loadMore, create, update, remove } = useSales();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Cálculos para KPIs
  const totalSales = items.length;
  const totalRevenue = items.reduce((acc, sale) => acc + Number(sale.total_amount || 0), 0);
  const uniqueCustomers = new Set(items.map(sale => sale.customer_id)).size;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Funções de manipulação de vendas
  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      await remove(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  const handleSubmit = async (formData: FormData, saleItems: SaleItemUI[]) => {
    try {
      // Preparar dados para envio
      const saleData: Partial<Sale> = {
        customer_id: formData.customer_id,
        customer_name: formData.customer_name,
        date: formData.sale_date,
        status: formData.status,
        total_amount: saleItems.reduce((acc, item) => acc + item.totalPrice, 0),
        items: saleItems.map(item => ({
          id: item.id,
          sale_id: '',
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.totalPrice,
        })),
      };

      // Adicionar campos adicionais
      (saleData as any).payment_method = formData.payment_method;
      (saleData as any).notes = formData.notes;

      if (editingSale) {
        await update(editingSale.id, saleData);
      } else {
        await create(saleData);
      }

      handleCancel();
    } catch (error: any) {
      console.error('Erro ao salvar venda:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Button>
      </div>

      {/* KPIs */}
      <SalesKPIs 
        totalSales={totalSales}
        totalRevenue={totalRevenue}
        uniqueCustomers={uniqueCustomers}
        averageTicket={averageTicket}
      />

      {/* Formulário de Venda */}
      {showForm && (
        <SalesForm 
          editingSale={editingSale}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {/* Lista de Vendas */}
      <SalesList 
        items={items}
        loading={loading}
        hasMore={hasMore}
        loadMore={loadMore}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
      />

      {/* Modal de Visualização */}
      <SaleViewModal 
        sale={selectedSale}
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
}
