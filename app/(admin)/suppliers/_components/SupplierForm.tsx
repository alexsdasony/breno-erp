'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Supplier, SupplierPayload } from '../../../../src/types';

interface SupplierFormProps {
  supplier?: Supplier | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierPayload) => Promise<void>;
  isLoading?: boolean;
}

const TABS = [
  { id: 'identificacao', label: 'Identificação' },
  { id: 'localizacao', label: 'Localização' },
  { id: 'contato', label: 'Contato' },
  { id: 'financeiro', label: 'Financeiro' },
  { id: 'operacional', label: 'Operacional' },
];

export default function SupplierForm({ supplier, isOpen, onClose, onSubmit, isLoading = false }: SupplierFormProps) {
  const [activeTab, setActiveTab] = useState('identificacao');
  const [formData, setFormData] = useState<SupplierPayload>({
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
    data_cadastro: new Date().toISOString().split('T')[0],
    observacoes: '',
    segment_id: '',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        razao_social: supplier.razao_social || supplier.name || '',
        nome_fantasia: supplier.nome_fantasia || '',
        ramo_atividade: supplier.ramo_atividade || '',
        tipo_contribuinte: supplier.tipo_contribuinte || 'PJ',
        cpf_cnpj: supplier.cpf_cnpj || supplier.cnpj || supplier.cpf || '',
        inscricao_estadual: supplier.inscricao_estadual || '',
        inscricao_municipal: supplier.inscricao_municipal || '',
        uf: supplier.uf || '',
        cidade: supplier.cidade || '',
        cep: supplier.cep || '',
        endereco: supplier.endereco || supplier.address || '',
        numero: supplier.numero || '',
        complemento: supplier.complemento || '',
        bairro: supplier.bairro || '',
        pessoa_contato: supplier.pessoa_contato || supplier.contact_person || '',
        telefone_fixo: supplier.telefone_fixo || '',
        telefone_celular: supplier.telefone_celular || supplier.telefone || supplier.phone || '',
        email: supplier.email || '',
        site: supplier.site || '',
        banco_nome: supplier.banco_nome || '',
        banco_codigo: supplier.banco_codigo || '',
        agencia_numero: supplier.agencia_numero || '',
        agencia_digito: supplier.agencia_digito || '',
        conta_numero: supplier.conta_numero || '',
        conta_digito: supplier.conta_digito || '',
        pix_chave: supplier.pix_chave || '',
        condicao_pagamento: supplier.condicao_pagamento || supplier.payment_terms || '',
        status: supplier.status || 'ATIVO',
        data_cadastro: supplier.data_cadastro || new Date().toISOString().split('T')[0],
        observacoes: supplier.observacoes || '',
        segment_id: supplier.segment_id || '',
      });
    }
  }, [supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>
                <p className="text-sm text-gray-600">
                  {supplier ? 'Atualize as informações do fornecedor' : 'Preencha as informações do fornecedor'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-gray-50">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Identificação */}
                  {activeTab === 'identificacao' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="razao_social" className="block text-sm font-semibold text-gray-900">
                            Razão Social *
                          </label>
                          <input
                            id="razao_social"
                            type="text"
                            value={formData.razao_social}
                            onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                            placeholder="Digite a razão social"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="nome_fantasia" className="block text-sm font-semibold text-gray-900">
                            Nome Fantasia
                          </label>
                          <input
                            id="nome_fantasia"
                            type="text"
                            value={formData.nome_fantasia || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                            placeholder="Digite o nome fantasia"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="ramo_atividade" className="block text-sm font-semibold text-gray-900">
                            Ramo de Atividade
                          </label>
                          <input
                            id="ramo_atividade"
                            type="text"
                            value={formData.ramo_atividade || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, ramo_atividade: e.target.value }))}
                            placeholder="Ex: Comércio, Indústria, Serviços"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="tipo_contribuinte" className="block text-sm font-semibold text-gray-900">
                            Tipo de Contribuinte
                          </label>
                          <select
                            id="tipo_contribuinte"
                            value={formData.tipo_contribuinte}
                            onChange={(e) => setFormData(prev => ({ ...prev, tipo_contribuinte: e.target.value as any }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="PJ">Pessoa Jurídica</option>
                            <option value="PF">Pessoa Física</option>
                            <option value="MEI">MEI</option>
                            <option value="Outros">Outros</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cpf_cnpj" className="block text-sm font-semibold text-gray-900">
                            CPF/CNPJ *
                          </label>
                          <input
                            id="cpf_cnpj"
                            type="text"
                            value={formData.cpf_cnpj}
                            onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                            placeholder="Digite o CPF ou CNPJ"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="inscricao_estadual" className="block text-sm font-semibold text-gray-900">
                            Inscrição Estadual
                          </label>
                          <input
                            id="inscricao_estadual"
                            type="text"
                            value={formData.inscricao_estadual || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, inscricao_estadual: e.target.value }))}
                            placeholder="Digite a inscrição estadual"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="inscricao_municipal" className="block text-sm font-semibold text-gray-900">
                            Inscrição Municipal
                          </label>
                          <input
                            id="inscricao_municipal"
                            type="text"
                            value={formData.inscricao_municipal || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, inscricao_municipal: e.target.value }))}
                            placeholder="Digite a inscrição municipal"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Localização */}
                  {activeTab === 'localizacao' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="uf" className="block text-sm font-semibold text-gray-900">
                            UF
                          </label>
                          <select
                            id="uf"
                            value={formData.uf || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="">Selecione o estado</option>
                            <option value="AC">Acre</option>
                            <option value="AL">Alagoas</option>
                            <option value="AP">Amapá</option>
                            <option value="AM">Amazonas</option>
                            <option value="BA">Bahia</option>
                            <option value="CE">Ceará</option>
                            <option value="DF">Distrito Federal</option>
                            <option value="ES">Espírito Santo</option>
                            <option value="GO">Goiás</option>
                            <option value="MA">Maranhão</option>
                            <option value="MT">Mato Grosso</option>
                            <option value="MS">Mato Grosso do Sul</option>
                            <option value="MG">Minas Gerais</option>
                            <option value="PA">Pará</option>
                            <option value="PB">Paraíba</option>
                            <option value="PR">Paraná</option>
                            <option value="PE">Pernambuco</option>
                            <option value="PI">Piauí</option>
                            <option value="RJ">Rio de Janeiro</option>
                            <option value="RN">Rio Grande do Norte</option>
                            <option value="RS">Rio Grande do Sul</option>
                            <option value="RO">Rondônia</option>
                            <option value="RR">Roraima</option>
                            <option value="SC">Santa Catarina</option>
                            <option value="SP">São Paulo</option>
                            <option value="SE">Sergipe</option>
                            <option value="TO">Tocantins</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cidade" className="block text-sm font-semibold text-gray-900">
                            Cidade
                          </label>
                          <input
                            id="cidade"
                            type="text"
                            value={formData.cidade || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                            placeholder="Digite a cidade"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="cep" className="block text-sm font-semibold text-gray-900">
                            CEP
                          </label>
                          <input
                            id="cep"
                            type="text"
                            value={formData.cep || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                            placeholder="00000-000"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="endereco" className="block text-sm font-semibold text-gray-900">
                            Endereço
                          </label>
                          <input
                            id="endereco"
                            type="text"
                            value={formData.endereco || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                            placeholder="Digite o endereço"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="numero" className="block text-sm font-semibold text-gray-900">
                            Número
                          </label>
                          <input
                            id="numero"
                            type="text"
                            value={formData.numero || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                            placeholder="Digite o número"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="complemento" className="block text-sm font-semibold text-gray-900">
                            Complemento
                          </label>
                          <input
                            id="complemento"
                            type="text"
                            value={formData.complemento || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, complemento: e.target.value }))}
                            placeholder="Digite o complemento"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="bairro" className="block text-sm font-semibold text-gray-900">
                            Bairro
                          </label>
                          <input
                            id="bairro"
                            type="text"
                            value={formData.bairro || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                            placeholder="Digite o bairro"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contato */}
                  {activeTab === 'contato' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="pessoa_contato" className="block text-sm font-semibold text-gray-900">
                            Pessoa de Contato
                          </label>
                          <input
                            id="pessoa_contato"
                            type="text"
                            value={formData.pessoa_contato || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, pessoa_contato: e.target.value }))}
                            placeholder="Digite o nome da pessoa de contato"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="telefone_fixo" className="block text-sm font-semibold text-gray-900">
                            Telefone Fixo
                          </label>
                          <input
                            id="telefone_fixo"
                            type="tel"
                            value={formData.telefone_fixo || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, telefone_fixo: e.target.value }))}
                            placeholder="(00) 0000-0000"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="telefone_celular" className="block text-sm font-semibold text-gray-900">
                            Telefone Celular
                          </label>
                          <input
                            id="telefone_celular"
                            type="tel"
                            value={formData.telefone_celular || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, telefone_celular: e.target.value }))}
                            placeholder="(00) 00000-0000"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Digite o email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="site" className="block text-sm font-semibold text-gray-900">
                            Site
                          </label>
                          <input
                            id="site"
                            type="url"
                            value={formData.site || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, site: e.target.value }))}
                            placeholder="https://www.exemplo.com"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Financeiro */}
                  {activeTab === 'financeiro' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="banco_nome" className="block text-sm font-semibold text-gray-900">
                            Nome do Banco
                          </label>
                          <input
                            id="banco_nome"
                            type="text"
                            value={formData.banco_nome || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, banco_nome: e.target.value }))}
                            placeholder="Digite o nome do banco"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="banco_codigo" className="block text-sm font-semibold text-gray-900">
                            Código do Banco
                          </label>
                          <input
                            id="banco_codigo"
                            type="text"
                            value={formData.banco_codigo || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, banco_codigo: e.target.value }))}
                            placeholder="000"
                            maxLength={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="agencia_numero" className="block text-sm font-semibold text-gray-900">
                            Número da Agência
                          </label>
                          <input
                            id="agencia_numero"
                            type="text"
                            value={formData.agencia_numero || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, agencia_numero: e.target.value }))}
                            placeholder="Digite o número da agência"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="agencia_digito" className="block text-sm font-semibold text-gray-900">
                            Dígito da Agência
                          </label>
                          <input
                            id="agencia_digito"
                            type="text"
                            value={formData.agencia_digito || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, agencia_digito: e.target.value }))}
                            placeholder="0"
                            maxLength={1}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="conta_numero" className="block text-sm font-semibold text-gray-900">
                            Número da Conta
                          </label>
                          <input
                            id="conta_numero"
                            type="text"
                            value={formData.conta_numero || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, conta_numero: e.target.value }))}
                            placeholder="Digite o número da conta"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="conta_digito" className="block text-sm font-semibold text-gray-900">
                            Dígito da Conta
                          </label>
                          <input
                            id="conta_digito"
                            type="text"
                            value={formData.conta_digito || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, conta_digito: e.target.value }))}
                            placeholder="0"
                            maxLength={1}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="pix_chave" className="block text-sm font-semibold text-gray-900">
                            Chave PIX
                          </label>
                          <input
                            id="pix_chave"
                            type="text"
                            value={formData.pix_chave || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, pix_chave: e.target.value }))}
                            placeholder="Digite a chave PIX"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="condicao_pagamento" className="block text-sm font-semibold text-gray-900">
                            Condição de Pagamento
                          </label>
                          <input
                            id="condicao_pagamento"
                            type="text"
                            value={formData.condicao_pagamento || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, condicao_pagamento: e.target.value }))}
                            placeholder="Ex: 30 dias, 50% entrada"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operacional */}
                  {activeTab === 'operacional' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="status" className="block text-sm font-semibold text-gray-900">
                            Status
                          </label>
                          <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          >
                            <option value="ATIVO">Ativo</option>
                            <option value="INATIVO">Inativo</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="data_cadastro" className="block text-sm font-semibold text-gray-900">
                            Data de Cadastro
                          </label>
                          <input
                            id="data_cadastro"
                            type="date"
                            value={formData.data_cadastro}
                            onChange={(e) => setFormData(prev => ({ ...prev, data_cadastro: e.target.value }))}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="observacoes" className="block text-sm font-semibold text-gray-900">
                          Observações
                        </label>
                        <textarea
                          id="observacoes"
                          value={formData.observacoes || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                          placeholder="Digite observações adicionais"
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    💾
                    <span>{supplier ? 'Atualizar' : 'Criar'} Fornecedor</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
