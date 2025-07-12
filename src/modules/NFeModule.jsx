import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Send,
  Printer,
  Download,
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const NFeModule = () => {
  const { data, metrics, addNFe, updateNFe, deleteNFe, importData, toast } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNFe, setCurrentNFe] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    customerId: '',
    customerName: '',
    total: '', 
    status: 'Emitida', // Apenas valores aceitos pela constraint: 'Emitida' ou 'Cancelada'
    date: new Date().toISOString().split('T')[0] // Data atual como padrão
  });

  // Safe data access with fallbacks
  const safeNFeList = data.nfeList || [];
  const safeCustomers = data.customers || [];
  const safeMetrics = metrics || { totalNFe: 0 };

  const resetForm = () => {
    setFormData({
      number: '',
      customerId: '',
      customerName: '',
      total: '', 
      status: 'Emitida', // Apenas valores aceitos pela constraint: 'Emitida' ou 'Cancelada'
      date: new Date().toISOString().split('T')[0] // Data atual como padrão
    });
    setIsEditing(false);
    setCurrentNFe(null);
    setShowForm(false);
  };

  const handleEdit = (nfe) => {
    setCurrentNFe(nfe);
    setFormData({
      number: nfe.number,
      customerId: nfe.customer_id || '',
      customerName: nfe.customer_name || nfe.customerName,
      total: nfe.total,
      status: nfe.status,
      date: nfe.date
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (nfeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta NF-e?')) {
      try {
        await deleteNFe(nfeId);
      } catch (error) {
        console.error('Erro ao excluir NF-e:', error);
      }
    }
  };

  const handleView = (nfe) => {
    // Simular visualização da NF-e
    const nfeData = {
      ...nfe,
      items: [
        { description: 'Produto/Serviço 1', quantity: 1, unitPrice: parseFloat(nfe.total), total: parseFloat(nfe.total) }
      ]
    };
    
    const nfeWindow = window.open('', '_blank', 'width=800,height=600');
    nfeWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>NF-e ${nfe.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .nfe-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-emitida { background: #d4edda; color: #155724; }
            .status-pendente { background: #fff3cd; color: #856404; }
            .status-cancelada { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>NOTA FISCAL ELETRÔNICA</h1>
            <h2>Número: ${nfe.number}</h2>
          </div>
          
          <div class="nfe-info">
            <div>
              <strong>Cliente:</strong> ${nfe.customer_name || nfe.customerName}<br>
              <strong>Data de Emissão:</strong> ${formatDate(nfe.date)}<br>
              <strong>Status:</strong> 
              <span class="status status-${nfe.status.toLowerCase()}">${nfe.status}</span>
            </div>
            <div>
              <strong>Valor Total:</strong> R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}<br>
              <strong>Forma de Pagamento:</strong> À vista<br>
              <strong>Condições de Pagamento:</strong> Pagamento imediato
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Produto/Serviço</td>
                <td>1</td>
                <td>R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</td>
                <td>R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            <strong>Total: R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</strong>
          </div>
          
          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>Esta é uma visualização simulada da NF-e. Em um ambiente real, esta seria a DANFE (Documento Auxiliar da Nota Fiscal Eletrônica).</p>
          </div>
        </body>
      </html>
    `);
    nfeWindow.document.close();
  };

  const handleDownload = (nfe) => {
    // Simular download do XML da NF-e
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe${nfe.number}" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>${nfe.number}</cNF>
        <natOp>Venda de mercadoria</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>${nfe.number}</nNF>
        <dhEmi>${nfe.date}T10:00:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>2</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
      <dest>
        <xNome>${nfe.customer_name || nfe.customerName}</xNome>
        <enderDest>
          <xLgr>Endereço do Cliente</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01001-000</CEP>
          <cPais>1058</cPais>
          <xPais>BRASIL</xPais>
        </enderDest>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>001</cProd>
          <xProd>Produto/Serviço</xProd>
          <NCM>00000000</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1.0000</qCom>
          <vUnCom>${parseFloat(nfe.total).toFixed(2)}</vUnCom>
          <vProd>${parseFloat(nfe.total).toFixed(2)}</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>0</modBC>
              <vBC>${parseFloat(nfe.total).toFixed(2)}</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>${(parseFloat(nfe.total) * 0.18).toFixed(2)}</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>${parseFloat(nfe.total).toFixed(2)}</vBC>
          <vICMS>${(parseFloat(nfe.total) * 0.18).toFixed(2)}</vICMS>
          <vProd>${parseFloat(nfe.total).toFixed(2)}</vProd>
          <vNF>${parseFloat(nfe.total).toFixed(2)}</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NF-e-${nfe.number}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Concluído!",
      description: `XML da NF-e ${nfe.number} foi baixado com sucesso.`,
    });
  };

  const handlePrint = (nfe) => {
    // Simular impressão da DANFE
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DANFE - NF-e ${nfe.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .nfe-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DANFE - DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</h1>
            <h2>Número: ${nfe.number}</h2>
          </div>
          
          <div class="nfe-info">
            <div>
              <strong>Cliente:</strong> ${nfe.customer_name || nfe.customerName}<br>
              <strong>Data de Emissão:</strong> ${formatDate(nfe.date)}<br>
              <strong>Status:</strong> ${nfe.status}
            </div>
            <div>
              <strong>Valor Total:</strong> R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}<br>
              <strong>Forma de Pagamento:</strong> À vista<br>
              <strong>Condições de Pagamento:</strong> Pagamento imediato
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Produto/Serviço</td>
                <td>1</td>
                <td>R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</td>
                <td>R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="total">
            <strong>Total: R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}</strong>
          </div>
          
          <div class="no-print" style="margin-top: 40px; text-align: center;">
            <button onclick="window.print()">Imprimir DANFE</button>
            <button onclick="window.close()">Fechar</button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSendEmail = (nfe) => {
    // Simular envio por email
    const emailSubject = encodeURIComponent(`NF-e ${nfe.number} - ${nfe.customer_name || nfe.customerName}`);
    const emailBody = encodeURIComponent(`
Olá,

Segue em anexo a NF-e ${nfe.number} referente ao cliente ${nfe.customer_name || nfe.customerName}.

Dados da NF-e:
- Número: ${nfe.number}
- Data de Emissão: ${formatDate(nfe.date)}
- Valor Total: R$ ${parseFloat(nfe.total).toFixed(2).replace('.', ',')}
- Status: ${nfe.status}

Atenciosamente,
Sistema ERP
    `);
    
    const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
    window.open(mailtoLink);

    toast({
      title: "Email Preparado!",
      description: `Email com dados da NF-e ${nfe.number} foi preparado.`,
    });
  };

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = safeCustomers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setFormData({ ...formData, customerId: selectedCustomer.id, customerName: selectedCustomer.name });
    } else {
      setFormData({ ...formData, customerId: '', customerName: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Debug NFe - FormData completo:', formData);
    console.log('🔍 Debug NFe - Validação detalhada:', {
      number: formData.number,
      customerId: formData.customerId,
      total: formData.total,
      numberValid: !!formData.number && formData.number.trim() !== '',
      customerIdValid: !!formData.customerId && formData.customerId !== '',
      totalValid: !!formData.total && formData.total !== ''
    });
    
    // Validação mais rigorosa
    const numberValid = formData.number && formData.number.trim() !== '';
    const customerIdValid = formData.customerId && formData.customerId !== '';
    const totalValid = formData.total && formData.total !== '';
    
    if (!numberValid || !customerIdValid || !totalValid) {
      console.log('❌ Debug NFe - Validação falhou:', {
        numberValid,
        customerIdValid,
        totalValid
      });
      
      if (toast) {
        toast({
          title: "Erro",
          description: "Número NF-e, Cliente e Total são obrigatórios.",
          variant: "destructive"
        });
      } else {
        alert("Erro: Número NF-e, Cliente e Total são obrigatórios.");
      }
      return;
    }

    try {
      console.log('🔍 Debug NFe - Iniciando criação/edição');
      if (isEditing && currentNFe) {
        console.log('🔍 Debug NFe - Editando NF-e:', currentNFe.id);
        await updateNFe(currentNFe.id, formData);
      } else {
        console.log('🔍 Debug NFe - Criando nova NF-e');
        const result = await addNFe(formData);
        console.log('🔍 Debug NFe - Resultado:', result);
      }
      console.log('✅ Debug NFe - Operação concluída com sucesso');
      resetForm();
    } catch (error) {
      console.error('❌ Debug NFe - Erro na operação:', error);
      if (toast) {
        toast({
          title: "Erro",
          description: `Falha ao ${isEditing ? 'atualizar' : 'criar'} NF-e: ${error.message}`,
          variant: "destructive"
        });
      } else {
        alert(`Erro: Falha ao ${isEditing ? 'atualizar' : 'criar'} NF-e: ${error.message}`);
      }
    }
  };

  const nfeHeaders = ['number', 'customerName', 'date', 'total', 'status'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Emissão de NF-e
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie e emita suas Notas Fiscais Eletrônicas</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={importData} 
            expectedHeaders={nfeHeaders}
            moduleName="NF-es"
            importAction="nfeList"
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova NF-e
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de NF-es</p>
              <p className="text-2xl font-bold text-indigo-400">{safeMetrics.totalNFe || 0}</p>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-indigo-400" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NF-es Emitidas</p>
              <p className="text-2xl font-bold text-green-400">
                {safeNFeList.filter(nfe => nfe.status === 'Emitida').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NF-es Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {safeNFeList.filter(nfe => nfe.status === 'Pendente').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-6 border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? 'Editar NF-e' : 'Gerar Nova NF-e'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nfeNumber" className="block text-sm font-medium mb-2">Número NF-e</label>
                <input
                  id="nfeNumber"
                  name="number"
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="00001"
                />
              </div>
              <div>
                <label htmlFor="nfeDate" className="block text-sm font-medium mb-2">Data de Emissão</label>
                <input
                  id="nfeDate"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select
                  value={formData.customerId}
                  onChange={handleCustomerSelect}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um cliente</option>
                  {safeCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name} ({customer.cpf})</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Itens da NF-e (Simplificado)</label>
                <textarea
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Descreva os produtos/serviços. Em uma aplicação real, isso seria mais complexo."
                />
              </div>
              <div>
                <label htmlFor="nfeTotal" className="block text-sm font-medium mb-2">Valor Total</label>
                <input
                  id="nfeTotal"
                  name="total"
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0,00"
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Emitida">Emitida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  {isEditing ? 'Atualizar NF-e' : 'Gerar NF-e'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Nota: A emissão real de NF-e envolve integração com SEFAZ, certificados digitais e estruturas XML complexas. Este é um módulo simplificado para fins demonstrativos.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lista de NF-es</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Número</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Data Emissão</th>
                <th className="text-right p-3">Valor Total</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {safeNFeList.map(nfe => (
                <motion.tr
                  key={nfe.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 font-medium">{nfe.number}</td>
                  <td className="p-3">{nfe.customer_name || nfe.customerName}</td>
                  <td className="p-3">{formatDate(nfe.date)}</td>
                  <td className="p-3 text-right font-medium text-green-400">
                    {formatCurrency(nfe.total || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nfe.status === 'Emitida'
                        ? 'bg-green-500/20 text-green-400'
                        : nfe.status === 'Pendente'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {nfe.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Visualizar"
                        onClick={() => handleView(nfe)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Baixar XML"
                        onClick={() => handleDownload(nfe)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Imprimir DANFE"
                        onClick={() => handlePrint(nfe)}
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Enviar por Email"
                        onClick={() => handleSendEmail(nfe)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Editar"
                        onClick={() => handleEdit(nfe)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Excluir"
                        onClick={() => handleDelete(nfe.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {safeNFeList.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma NF-e encontrada</h3>
              <p className="text-sm mb-4">Não existem notas fiscais eletrônicas cadastradas no sistema.</p>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira NF-e
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NFeModule;