import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import apiService from '@/services/api';
import { SalesFormProps, FormData, SaleItemUI } from './types';
import { Sale, SaleItem, Customer, Product } from '@/types';
import { useCustomersContext } from '@/contexts/CustomersContext';
import { useProductsContext } from '@/contexts/ProductsContext';
import { usePaymentMethodsContext } from '@/contexts/PaymentMethodsContext';

// Removendo as declarações de módulos que causam erros de tipagem

// Funções auxiliares
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export function SalesForm({ editingSale, onSubmit, onCancel }: SalesFormProps) {
  // Estados do formulário
  const [formData, setFormData] = useState<FormData>({
    customer_id: '',
    customer_name: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_method: 'dinheiro',
    status: 'Pendente',
    notes: '',
  });

  // Estados para itens da venda
  const [saleItems, setSaleItems] = useState<SaleItemUI[]>([]);
  const [newItem, setNewItem] = useState<SaleItemUI>({
    id: '',
    sale_id: '',
    product_id: '',
    productName: '',
    quantity: 1,
    unit_price: 0,
    total: 0,
    totalPrice: 0,
  });

  // Usando os contextos
  const { searchCustomers, loading: loadingCustomers } = useCustomersContext();
  const { searchProducts, loading: loadingProducts } = useProductsContext();
  const { paymentMethods, loading: loadingPaymentMethods } = usePaymentMethodsContext();
  
  // Debug: Log dos métodos de pagamento
  React.useEffect(() => {
    console.log('💳 Métodos de pagamento carregados:', paymentMethods);
    console.log('💳 Loading métodos de pagamento:', loadingPaymentMethods);
  }, [paymentMethods, loadingPaymentMethods]);
  
  // Definir primeiro método de pagamento como padrão quando carregar
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !editingSale && formData.payment_method === 'dinheiro') {
      setFormData(prev => ({
        ...prev,
        payment_method: paymentMethods[0].id
      }));
    }
  }, [paymentMethods, editingSale]);
  
  // Estados para autocomplete
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Estados para autocomplete manual
  const [customerQuery, setCustomerQuery] = useState<string>('');
  const [productQuery, setProductQuery] = useState<string>('');
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showProductList, setShowProductList] = useState(false);
  
  // Refs para autocomplete
  const customerInputRef = useRef<HTMLInputElement | null>(null);
  const productInputRef = useRef<HTMLInputElement | null>(null);

  // Cálculo do subtotal
  const subtotal = saleItems.reduce((acc, item) => acc + item.totalPrice, 0);

  // Não precisamos mais carregar métodos de pagamento, pois estamos usando o contexto

  // Preencher o formulário quando estiver editando uma venda
  useEffect(() => {
    if (editingSale) {
      setFormData({
        customer_id: editingSale.customer_id || '',
        customer_name: editingSale.customer_name || '',
        sale_date: editingSale.date || new Date().toISOString().split('T')[0],
        payment_method: (editingSale as any).payment_method || 'dinheiro',
        status: editingSale.status || 'Pendente',
        notes: (editingSale as any).notes || '',
      });

      // Mapear itens da venda para o formato do componente
      if (editingSale.items && editingSale.items.length > 0) {
        const mappedItems = editingSale.items.map((item, index) => ({
          id: `existing-${index}`,
          sale_id: item.sale_id,
          product_id: item.product_id,
          productName: `Produto ${index + 1}`, // Idealmente, buscar o nome do produto
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total,
          totalPrice: item.quantity * item.unit_price,
        }));
        setSaleItems(mappedItems);
      }

      // Buscar dados do cliente se necessário
      if (editingSale.customer_id && !customers.some(c => c.id === editingSale.customer_id)) {
        handleCustomerSearch(editingSale.customer_name || '');
      }
    }
  }, [editingSale]);

  // Funções para manipulação do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funções para busca de clientes usando o contexto
  const handleCustomerSearch = async (query: string) => {
    if (!query) {
      setCustomers([]);
      return;
    }
    try {
      const customersList = await searchCustomers(query);
      setCustomers(customersList);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error);
      setCustomers([]);
    }
  };

  // Autocomplete para clientes
  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomers([]);
      return;
    }
    
    const timer = setTimeout(() => {
      handleCustomerSearch(customerQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [customerQuery]);

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer.id,
      customer_name: customer.name,
    }));
    setCustomerQuery(customer.name);
    setShowCustomerList(false);
  };

  // Funções para busca de produtos usando o contexto
  const handleProductSearch = async (query: string) => {
    if (!query) {
      setProducts([]);
      return;
    }
    try {
      const productsList = await searchProducts(query);
      setProducts(productsList);
    } catch (error: any) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    }
  };

  // Autocomplete para produtos
  useEffect(() => {
    if (!productQuery.trim()) {
      setProducts([]);
      return;
    }
    
    const timer = setTimeout(() => {
      handleProductSearch(productQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [productQuery]);

  const handleProductSelect = (product: Product) => {
    setNewItem(prev => ({
      ...prev,
      product_id: product.id,
      productName: product.name,
      unit_price: product.price || 0,
      totalPrice: prev.quantity * (product.price || 0),
    }));
    setProductQuery(product.name);
    setShowProductList(false);
  };

  // Funções para atualizar preços
  const updateTotalPrice = (item: SaleItemUI): number => {
    return item.quantity * item.unit_price;
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseInt(e.target.value) || 0;
    setNewItem(prev => ({
      ...prev,
      quantity,
      totalPrice: quantity * prev.unit_price,
    }));
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = parseFloat(e.target.value) || 0;
    setNewItem(prev => ({
      ...prev,
      unit_price: unitPrice,
      totalPrice: prev.quantity * unitPrice,
    }));
  };

  // Funções para gerenciar itens da venda
  const addItemToSale = () => {
    if (!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0) {
      return;
    }

    const newItemWithId = {
      ...newItem,
      id: `item-${Date.now()}`,
    };

    setSaleItems(prev => [...prev, newItemWithId]);
    setNewItem({
      id: '',
      sale_id: '',
      product_id: '',
      productName: '',
      quantity: 1,
      unit_price: 0,
      total: 0,
      totalPrice: 0,
    });
  };

  const removeItemFromSale = (itemId: string) => {
    setSaleItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Função para submeter o formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
    if (!formData.customer_id || saleItems.length === 0) {
      alert('Por favor, selecione um cliente e adicione pelo menos um produto.');
      return;
    }

    // Preparar dados para envio
    const saleData = {
      id: editingSale?.id,
      customer_id: formData.customer_id,
      customer_name: formData.customer_name,
      date: formData.sale_date,
      status: formData.status,
      payment_method: formData.payment_method,
      notes: formData.notes,
      total_amount: subtotal,
      items: saleItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    onSubmit(formData, saleItems);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">Cliente</label>
          <div className="relative">
            <input
              ref={customerInputRef}
              className="w-full p-3 pr-10 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              value={customerQuery}
              onChange={(e) => { setCustomerQuery(e.target.value); setShowCustomerList(true); }}
              onFocus={() => setShowCustomerList(true)}
              placeholder="Digite para buscar cliente..."
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {formData.customer_id && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, customer_id: '', customer_name: '' }));
                    setCustomerQuery('');
                  }}
                  className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
                  title="Limpar seleção"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowCustomerList(!showCustomerList)}
                className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
              >
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showCustomerList ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          {showCustomerList && (customers.length > 0 || loadingCustomers) && (
            <div className="absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-md border bg-background shadow">
              {loadingCustomers && (
                <div className="px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
              )}
              {!loadingCustomers && customers.map((customer) => (
                <button
                  type="button"
                  key={customer.id}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50 ${formData.customer_id === customer.id ? 'bg-muted/30' : ''}`}
                  onClick={() => handleCustomerSelect(customer)}
                >
                  <span className="text-sm">{customer.name}</span>
                </button>
              ))}
              {!loadingCustomers && customers.length === 0 && customerQuery.trim() !== '' && (
                <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum cliente encontrado</div>
              )}
            </div>
          )}
          {formData.customer_id && (
            <p className="mt-1 text-xs text-muted-foreground">Selecionado: {formData.customer_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Data da Venda</label>
          <input
              type="date"
              name="sale_date"
              value={formData.sale_date}
              onChange={handleInputChange}
              className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            />
        </div>

        <div>
          <label className="block text-sm font-medium">Método de Pagamento</label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleInputChange}
            className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
            disabled={loadingPaymentMethods}
          >
            {loadingPaymentMethods ? (
              <option value="">Carregando métodos de pagamento...</option>
            ) : (
              <>
                <option value="">Selecione um método de pagamento</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
          >
            <option value="Pendente">Pendente</option>
            <option value="Pago">Pago</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Observações</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Observações sobre a venda..."
            className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors min-h-[100px]"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium mb-4">Adicionar Produtos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium">Produto</label>
            <div className="relative">
              <input
                ref={productInputRef}
                className="w-full p-3 pr-10 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                value={productQuery}
                onChange={(e) => { setProductQuery(e.target.value); setShowProductList(true); }}
                onFocus={() => setShowProductList(true)}
                placeholder="Digite para buscar produto..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {newItem.product_id && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewItem(prev => ({
                        ...prev,
                        product_id: '',
                        productName: '',
                        unit_price: 0,
                        totalPrice: 0,
                      }));
                      setProductQuery('');
                    }}
                    className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
                    title="Limpar seleção"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowProductList(!showProductList)}
                  className="p-1 hover:bg-muted-foreground/10 rounded-full transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showProductList ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            {showProductList && (products.length > 0 || loadingProducts) && (
              <div className="absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-md border bg-background shadow">
                {loadingProducts && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
                )}
                {!loadingProducts && products.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50 ${newItem.product_id === product.id ? 'bg-muted/30' : ''}`}
                    onClick={() => handleProductSelect(product)}
                  >
                    <span className="text-sm">{product.name}</span>
                    <span className="text-sm text-muted-foreground">{formatCurrency(product.price || 0)}</span>
                  </button>
                ))}
                {!loadingProducts && products.length === 0 && productQuery.trim() !== '' && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">Nenhum produto encontrado</div>
                )}
              </div>
            )}
            {newItem.product_id && (
              <p className="mt-1 text-xs text-muted-foreground">Selecionado: {newItem.productName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Quantidade</label>
            <input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const quantity = parseInt(e.target.value) || 0;
                  setNewItem(prev => ({
                    ...prev,
                    quantity,
                    totalPrice: quantity * prev.unit_price,
                  }));
                }}
                className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
          </div>

          <div>
            <label className="block text-sm font-medium">Preço Unitário</label>
            <input
                type="number"
                step="0.01"
                min="0"
                value={newItem.unit_price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const unitPrice = parseFloat(e.target.value) || 0;
                  setNewItem(prev => ({
                    ...prev,
                    unit_price: unitPrice,
                    totalPrice: prev.quantity * unitPrice,
                  }));
                }}
                className="w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              />
          </div>
        </div>

        <Button 
          type="button" 
          onClick={addItemToSale} 
          disabled={!newItem.product_id || newItem.quantity <= 0 || newItem.unit_price <= 0}
          className="mb-6"
        >
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>

        {saleItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Lista de Produtos</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {saleItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{item.productName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{item.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{formatCurrency(item.totalPrice)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItemFromSale(item.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">Subtotal:</td>
                    <td className="px-4 py-2 font-bold">{formatCurrency(subtotal)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 mt-8">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {editingSale ? 'Salvar Alterações' : 'Criar Venda'}
        </Button>
      </div>
    </form>
  );
}