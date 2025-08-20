import React, { useState, useEffect } from 'react';
import { useAppData } from '../hooks/useAppData';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import '../styles/suppliers.css';

const SuppliersModule = () => {
  const { data, activeSegmentId, loadSuppliers, createSupplier, updateSupplier, deleteSupplier } = useAppData();
  const [activeTab, setActiveTab] = useState('lista');
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('razao_social');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'edit', 'delete'
  
  // Form data for create/edit
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    ramo_atividade: '',
    tipo_contribuinte: 'PJ',
    cpf_cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    uf: '',
    cidade: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    pessoa_contato: '',
    telefone_fixo: '',
    telefone_celular: '',
    email: '',
    site: '',
    banco_nome: '',
    banco_codigo: '',
    agencia_numero: '',
    agencia_digito: '',
    conta_numero: '',
    conta_digito: '',
    pix_chave: '',
    condicao_pagamento: '',
    status: 'ATIVO',
    observacoes: ''
  });

  useEffect(() => {
    loadSuppliersData();
  }, [activeSegmentId]);

  const loadSuppliersData = async () => {
    try {
      setLoading(true);
      const result = await loadSuppliers();
      setSuppliers(result.suppliers || []);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedSupplier) {
        await updateSupplier(selectedSupplier.id, formData);
      } else {
        await createSupplier(formData);
      }
      await loadSuppliersData();
      resetForm();
      setActiveTab('lista');
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      razao_social: supplier.razao_social || '',
      nome_fantasia: supplier.nome_fantasia || '',
      ramo_atividade: supplier.ramo_atividade || '',
      tipo_contribuinte: supplier.tipo_contribuinte || 'PJ',
      cpf_cnpj: supplier.cpf_cnpj || '',
      inscricao_estadual: supplier.inscricao_estadual || '',
      inscricao_municipal: supplier.inscricao_municipal || '',
      uf: supplier.uf || '',
      cidade: supplier.cidade || '',
      cep: supplier.cep || '',
      endereco: supplier.endereco || '',
      numero: supplier.numero || '',
      complemento: supplier.complemento || '',
      bairro: supplier.bairro || '',
      pessoa_contato: supplier.pessoa_contato || '',
      telefone_fixo: supplier.telefone_fixo || '',
      telefone_celular: supplier.telefone_celular || '',
      email: supplier.email || '',
      site: supplier.site || '',
      banco_nome: supplier.banco_nome || '',
      banco_codigo: supplier.banco_codigo || '',
      agencia_numero: supplier.agencia_numero || '',
      agencia_digito: supplier.agencia_digito || '',
      conta_numero: supplier.conta_numero || '',
      conta_digito: supplier.conta_digito || '',
      pix_chave: supplier.pix_chave || '',
      condicao_pagamento: supplier.condicao_pagamento || '',
      status: supplier.status || 'ATIVO',
      observacoes: supplier.observacoes || ''
    });
    setActiveTab('cadastro');
  };

  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setModalType('view');
    setShowModal(true);
  };

  const handleDelete = (supplier) => {
    setSelectedSupplier(supplier);
    setModalType('delete');
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      await deleteSupplier(selectedSupplier.id);
      await loadSuppliersData();
      setShowModal(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      razao_social: '',
      nome_fantasia: '',
      ramo_atividade: '',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '',
      inscricao_estadual: '',
      inscricao_municipal: '',
      uf: '',
      cidade: '',
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      pessoa_contato: '',
      telefone_fixo: '',
      telefone_celular: '',
      email: '',
      site: '',
      banco_nome: '',
      banco_codigo: '',
      agencia_numero: '',
      agencia_digito: '',
      conta_numero: '',
      conta_digito: '',
      pix_chave: '',
      condicao_pagamento: '',
      status: 'ATIVO',
      observacoes: ''
    });
    setSelectedSupplier(null);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedSuppliers = (suppliers || [])
    .filter(supplier => 
      supplier.razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nome_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cpf_cnpj?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const comparison = aValue.toString().localeCompare(bValue.toString());
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const tabs = [
    { id: 'lista', name: 'Lista de Fornecedores', icon: '📋' },
    { id: 'cadastro', name: 'Cadastro/Edição', icon: '✏️' },
    { id: 'detalhes', name: 'Detalhes', icon: '👁️' },
    { id: 'edicao', name: 'Edição Avançada', icon: '🔧' },
    { id: 'exclusao', name: 'Exclusão', icon: '🗑️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lista':
        return (
          <div className="space-y-4">
            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar fornecedores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab('cadastro');
                }}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Novo Fornecedor
              </button>
            </div>

            {/* Tabela */}
            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '800px' }}>
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        { key: 'razao_social', label: 'Razão Social', width: 'w-1/4' },
                        { key: 'nome_fantasia', label: 'Nome Fantasia', width: 'w-1/6' },
                        { key: 'cpf_cnpj', label: 'CPF/CNPJ', width: 'w-1/6' },
                        { key: 'email', label: 'Email', width: 'w-1/6' },
                        { key: 'cidade', label: 'Cidade', width: 'w-1/8' },
                        { key: 'status', label: 'Status', width: 'w-1/12' },
                        { key: 'actions', label: 'Ações', width: 'w-1/12' }
                      ].map(({ key, label, width }) => (
                        <th
                          key={key}
                          className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${width} ${
                            key === 'actions' ? '' : 'select-none'
                          }`}
                          onClick={() => key !== 'actions' && handleSort(key)}
                        >
                          <div className="flex items-center space-x-1">
                            <span>{label}</span>
                            {key !== 'actions' && sortField === key && (
                              sortDirection === 'asc' ? 
                                <ArrowUpIcon className="h-4 w-4" /> : 
                                <ArrowDownIcon className="h-4 w-4" />
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Carregando...
                        </td>
                      </tr>
                    ) : filteredAndSortedSuppliers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          Nenhum fornecedor encontrado
                        </td>
                      </tr>
                    ) : (
                      filteredAndSortedSuppliers.map((supplier) => (
                        <tr key={supplier.id} className="hover:bg-gray-50">
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {supplier.razao_social}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.nome_fantasia || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.cpf_cnpj}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.email || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {supplier.cidade || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              supplier.status === 'ATIVO' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {supplier.status}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleView(supplier)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Visualizar"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(supplier)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(supplier)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'cadastro':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h3>
              <button
                onClick={() => setActiveTab('lista')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Lista
              </button>
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <form onSubmit={handleSubmit} className="suppliers-form space-y-6 min-w-full">
              {/* Identificação */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-md font-medium text-gray-900 mb-4">Identificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Razão Social *</label>
                    <input
                      type="text"
                      required
                      value={formData.razao_social}
                      onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome Fantasia</label>
                    <input
                      type="text"
                      value={formData.nome_fantasia}
                      onChange={(e) => setFormData({...formData, nome_fantasia: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ramo de Atividade</label>
                    <input
                      type="text"
                      value={formData.ramo_atividade}
                      onChange={(e) => setFormData({...formData, ramo_atividade: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Contribuinte</label>
                    <select
                      value={formData.tipo_contribuinte}
                      onChange={(e) => setFormData({...formData, tipo_contribuinte: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="PJ">Pessoa Jurídica</option>
                      <option value="PF">Pessoa Física</option>
                      <option value="MEI">MEI</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF/CNPJ *</label>
                    <input
                      type="text"
                      required
                      value={formData.cpf_cnpj}
                      onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={formData.inscricao_estadual}
                      onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-md font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">UF</label>
                    <input
                      type="text"
                      maxLength="2"
                      value={formData.uf}
                      onChange={(e) => setFormData({...formData, uf: e.target.value.toUpperCase()})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade}
                      onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <input
                      type="text"
                      maxLength="8"
                      value={formData.cep}
                      onChange={(e) => setFormData({...formData, cep: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <input
                      type="text"
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <input
                      type="text"
                      value={formData.complemento}
                      onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input
                      type="text"
                      value={formData.bairro}
                      onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contato */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-md font-medium text-gray-900 mb-4">Contato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pessoa de Contato</label>
                    <input
                      type="text"
                      value={formData.pessoa_contato}
                      onChange={(e) => setFormData({...formData, pessoa_contato: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone Fixo</label>
                    <input
                      type="text"
                      value={formData.telefone_fixo}
                      onChange={(e) => setFormData({...formData, telefone_fixo: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone Celular</label>
                    <input
                      type="text"
                      value={formData.telefone_celular}
                      onChange={(e) => setFormData({...formData, telefone_celular: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ color: '#111827', backgroundColor: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Site</label>
                    <input
                      type="url"
                      value={formData.site}
                      onChange={(e) => setFormData({...formData, site: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Bancários */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-md font-medium text-gray-900 mb-4">Dados Bancários</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Banco</label>
                    <input
                      type="text"
                      value={formData.banco_nome}
                      onChange={(e) => setFormData({...formData, banco_nome: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Código do Banco</label>
                    <input
                      type="text"
                      maxLength="3"
                      value={formData.banco_codigo}
                      onChange={(e) => setFormData({...formData, banco_codigo: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Agência</label>
                    <input
                      type="text"
                      value={formData.agencia_numero}
                      onChange={(e) => setFormData({...formData, agencia_numero: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dígito da Agência</label>
                    <input
                      type="text"
                      maxLength="1"
                      value={formData.agencia_digito}
                      onChange={(e) => setFormData({...formData, agencia_digito: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Conta</label>
                    <input
                      type="text"
                      value={formData.conta_numero}
                      onChange={(e) => setFormData({...formData, conta_numero: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dígito da Conta</label>
                    <input
                      type="text"
                      maxLength="1"
                      value={formData.conta_digito}
                      onChange={(e) => setFormData({...formData, conta_digito: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chave PIX</label>
                    <input
                      type="text"
                      value={formData.pix_chave}
                      onChange={(e) => setFormData({...formData, pix_chave: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Condição de Pagamento</label>
                    <input
                      type="text"
                      value={formData.condicao_pagamento}
                      onChange={(e) => setFormData({...formData, condicao_pagamento: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status e Observações */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-md font-medium text-gray-900 mb-4">Status e Observações</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea
                      rows="3"
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('lista')}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : (selectedSupplier ? 'Atualizar' : 'Cadastrar')}
                </button>
              </div>
            </form>
            </div>
          </div>
        );

      case 'detalhes':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Detalhes do Fornecedor</h3>
              <button
                onClick={() => setActiveTab('lista')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Lista
              </button>
            </div>
            <div className="text-center text-gray-500">
              Selecione um fornecedor da lista para visualizar os detalhes
            </div>
          </div>
        );

      case 'edicao':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Edição Avançada</h3>
              <button
                onClick={() => setActiveTab('lista')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Lista
              </button>
            </div>
            <div className="text-center text-gray-500">
              Funcionalidade de edição avançada em desenvolvimento
            </div>
          </div>
        );

      case 'exclusao':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Exclusão de Fornecedores</h3>
              <button
                onClick={() => setActiveTab('lista')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Voltar para Lista
              </button>
            </div>
            <div className="text-center text-gray-500">
              Use os botões de exclusão na lista para remover fornecedores
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">


      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fornecedores</h2>
          <p className="text-gray-600">Gerencie seus fornecedores e parceiros comerciais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            {modalType === 'view' && selectedSupplier && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Fornecedor</h3>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Razão Social:</span> {selectedSupplier.razao_social}
                  </div>
                  <div>
                    <span className="font-medium">Nome Fantasia:</span> {selectedSupplier.nome_fantasia || '-'}
                  </div>
                  <div>
                    <span className="font-medium">CPF/CNPJ:</span> {selectedSupplier.cpf_cnpj}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {selectedSupplier.email || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Telefone:</span> {selectedSupplier.telefone_fixo || selectedSupplier.telefone_celular || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Cidade:</span> {selectedSupplier.cidade || '-'}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedSupplier.status === 'ATIVO' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedSupplier.status}
                    </span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}

            {modalType === 'delete' && selectedSupplier && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
                <p className="text-gray-600 mb-4">
                  Tem certeza que deseja excluir o fornecedor <strong>{selectedSupplier.razao_social}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersModule;


