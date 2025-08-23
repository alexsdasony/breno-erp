'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Save, 
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building,
  Briefcase,
  Home,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

// Desabilitar prerender para esta página
export const dynamic = 'force-dynamic';

type CustomerFormViewProps = { id?: number };

function CustomerFormView({ id }: CustomerFormViewProps) {
  const router = useRouter();
  const { data, activeSegmentId } = useAppData();
  
  const [activeTab, setActiveTab] = useState('dados-pessoais');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado completo do formulário com todos os campos
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    tipoPessoa: 'pf',
    cpf: '',
    cnpj: '',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    profissao: '',
    
    // Dados Profissionais
    empresa: '',
    cargo: '',
    dataAdmissao: '',
    telefoneComercial: '',
    
    // Contato
    email: '',
    phone: '',
    celular: '',
    
    // Endereço
    address: '',
    city: '',
    state: '',
    cep: '',
    numero: '',
    complemento: '',
    bairro: '',
    tipoImovel: '',
    
    // Patrimônio
    possuiPatrimonio: false,
    valorPatrimonio: '',
    descricaoPatrimonio: '',
    
    // Sistema
    status: 'active',
    observacoes: '',
    responsavelCadastro: '',
    dataCadastro: new Date().toISOString().split('T')[0],
    segmentId: activeSegmentId || (data.segments?.length > 0 ? data.segments[0].id : '')
  });

  // Atualizar segmentId quando activeSegmentId ou segments mudarem
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      segmentId: activeSegmentId || (data.segments?.length > 0 ? data.segments[0].id : '')
    }));
  }, [activeSegmentId, data.segments]);

  // Carregar dados do cliente se estiver editando
  useEffect(() => {
    if (id && data.partners) {
      const customer = data.partners.find(p => p.id === id);
      if (customer) {
        setIsEditing(true);
        setFormData({
          name: customer.name || '',
          tipoPessoa: customer.tipo_pessoa || 'pf',
          cpf: customer.cpf || '',
          cnpj: customer.cnpj || '',
          rg: customer.rg || '',
          dataNascimento: customer.data_nascimento || '',
          estadoCivil: customer.estado_civil || '',
          profissao: customer.profissao || '',
          empresa: customer.empresa || '',
          cargo: customer.cargo || '',
          dataAdmissao: customer.data_admissao || '',
          telefoneComercial: customer.telefone_comercial || '',
          email: customer.email || '',
          phone: customer.phone || '',
          celular: customer.celular || '',
          address: customer.address || '',
          city: customer.city || '',
          state: customer.state || '',
          cep: customer.cep || '',
          numero: customer.numero || '',
          complemento: customer.complemento || '',
          bairro: customer.bairro || '',
          tipoImovel: customer.tipo_imovel || '',
          possuiPatrimonio: customer.possui_patrimonio || false,
          valorPatrimonio: customer.valor_patrimonio || '',
          descricaoPatrimonio: customer.descricao_patrimonio || '',
          status: customer.status || 'active',
          observacoes: customer.observacoes || '',
          responsavelCadastro: customer.responsavel_cadastro || '',
          dataCadastro: customer.data_cadastro || new Date().toISOString().split('T')[0],
          segmentId: customer.segment_id || activeSegmentId || (data.segments?.length > 0 ? data.segments[0].id : '')
        });
      }
    }
  }, [id, data.partners, activeSegmentId, data.segments]);

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Erro', description: 'O nome deve ter pelo menos 2 caracteres.', variant: 'destructive' });
      return false;
    }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      toast({ title: 'Erro', description: 'Informe um e-mail válido.', variant: 'destructive' });
      return false;
    }
    if (formData.tipoPessoa === 'pf' && (!formData.cpf || formData.cpf.length < 11)) {
      toast({ title: 'Erro', description: 'CPF é obrigatório para pessoa física.', variant: 'destructive' });
      return false;
    }
    if (formData.tipoPessoa === 'pj' && (!formData.cnpj || formData.cnpj.length < 14)) {
      toast({ title: 'Erro', description: 'CNPJ é obrigatório para pessoa jurídica.', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      // TODO: Integrar serviço de clientes/parceiros (create/update) via apiService
      toast({
        title: 'Sucesso',
        description: isEditing ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!'
      });
      router.push('/customers');
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({ title: 'Erro', description: 'Falha ao salvar cliente. Tente novamente.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/customers');
  };

  const segments = data.segments || [];

  const tabs = [
    { id: 'dados-pessoais', label: 'Dados Pessoais', icon: User },
    { id: 'dados-profissionais', label: 'Dados Profissionais', icon: Briefcase },
    { id: 'contato', label: 'Contato', icon: Phone },
    { id: 'endereco', label: 'Endereço', icon: MapPin },
    { id: 'patrimonio', label: 'Patrimônio', icon: CreditCard },
    { id: 'sistema', label: 'Sistema', icon: Building }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dados-pessoais':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Segmento *</label>
              <select 
                id="customer-segment-select"
                value={formData.segmentId} 
                onChange={(e) => setFormData({...formData, segmentId: e.target.value})} 
                required 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              >
                <option value="">Selecione um segmento</option>
                {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Nome Completo *</label>
              <input
                id="customer-name-input"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300" 
                placeholder="Nome completo"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Tipo de Pessoa *</label>
              <select
                id="customer-person-type-select"
                value={formData.tipoPessoa}
                onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value, cpf: '', cnpj: ''})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                required
              >
                <option value="pf">Pessoa Física (CPF)</option>
                <option value="pj">Pessoa Jurídica (CNPJ)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                {formData.tipoPessoa === 'pf' ? 'CPF *' : 'CNPJ *'}
              </label>
              <input
                id="customer-document-input"
                type="text"
                value={formData.tipoPessoa === 'pf' ? formData.cpf : formData.cnpj}
                onChange={(e) => {
                  if (formData.tipoPessoa === 'pf') {
                    setFormData({...formData, cpf: e.target.value});
                  } else {
                    setFormData({...formData, cnpj: e.target.value});
                  }
                }}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder={formData.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">RG</label>
              <input
                id="customer-rg-input"
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData({...formData, rg: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="00.000.000-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Data de Nascimento</label>
              <input
                id="customer-birth-date-input"
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Estado Civil</label>
              <select
                id="customer-marital-status-select"
                value={formData.estadoCivil}
                onChange={(e) => setFormData({...formData, estadoCivil: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              >
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="separado">Separado(a)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Profissão</label>
              <input
                id="customer-profession-input"
                type="text"
                value={formData.profissao}
                onChange={(e) => setFormData({...formData, profissao: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Sua profissão"
              />
            </div>
          </div>
        );

      case 'dados-profissionais':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Empresa</label>
              <input
                id="customer-company-input"
                type="text"
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Nome da empresa"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Cargo</label>
              <input
                id="customer-position-input"
                type="text"
                value={formData.cargo}
                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Seu cargo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Data de Admissão</label>
              <input
                id="customer-hire-date-input"
                type="date"
                value={formData.dataAdmissao}
                onChange={(e) => setFormData({...formData, dataAdmissao: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Telefone Comercial</label>
              <input
                id="customer-work-phone-input"
                type="tel"
                value={formData.telefoneComercial}
                onChange={(e) => setFormData({...formData, telefoneComercial: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="(11) 1234-5678"
              />
            </div>
          </div>
        );

      case 'contato':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">E-mail *</label>
              <input
                id="customer-email-input"
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300" 
                placeholder="cliente@email.com" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Telefone Residencial</label>
              <input
                id="customer-phone-input"
                type="tel" 
                value={formData.phone} 
                onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300" 
                placeholder="(11) 1234-5678" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Celular</label>
              <input
                id="customer-mobile-input"
                type="tel"
                value={formData.celular}
                onChange={(e) => setFormData({...formData, celular: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        );

      case 'endereco':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">Endereço</label>
              <input
                id="customer-address-input"
                type="text"
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300" 
                placeholder="Rua, Avenida, etc." 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Número</label>
              <input
                id="customer-address-number-input"
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({...formData, numero: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Complemento</label>
              <input
                id="customer-address-complement-input"
                type="text"
                value={formData.complemento}
                onChange={(e) => setFormData({...formData, complemento: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Apto 45, Bloco B"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Bairro</label>
              <input
                id="customer-neighborhood-input"
                type="text"
                value={formData.bairro}
                onChange={(e) => setFormData({...formData, bairro: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Centro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Cidade</label>
              <input
                id="customer-city-input"
                type="text"
                value={formData.city} 
                onChange={(e) => setFormData({...formData, city: e.target.value})} 
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300" 
                placeholder="Nome da cidade" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Estado</label>
              <select
                id="customer-state-select"
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              >
                <option value="">Selecione...</option>
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
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">CEP</label>
              <input
                id="customer-cep-input"
                type="text"
                value={formData.cep}
                onChange={(e) => setFormData({...formData, cep: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="00000-000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Tipo de Imóvel</label>
              <select
                id="customer-property-type-select"
                value={formData.tipoImovel}
                onChange={(e) => setFormData({...formData, tipoImovel: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              >
                <option value="">Selecione...</option>
                <option value="proprio">Próprio</option>
                <option value="alugado">Alugado</option>
                <option value="financiado">Financiado</option>
                <option value="cedido">Cedido</option>
              </select>
            </div>
          </div>
        );

      case 'patrimonio':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  id="customer-has-assets-checkbox"
                  type="checkbox"
                  checked={formData.possuiPatrimonio}
                  onChange={(e) => setFormData({...formData, possuiPatrimonio: e.target.checked})}
                  className="rounded border-gray-300 bg-muted"
                />
                <span className="text-sm font-medium text-gray-300">Possui Patrimônio</span>
              </label>
            </div>
            {formData.possuiPatrimonio && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Valor do Patrimônio</label>
                  <input
                    id="customer-assets-value-input"
                    type="number"
                    value={formData.valorPatrimonio}
                    onChange={(e) => setFormData({...formData, valorPatrimonio: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                    placeholder="0,00"
                    step="0.01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-300">Descrição do Patrimônio</label>
                  <textarea
                    id="customer-assets-description-textarea"
                    value={formData.descricaoPatrimonio}
                    onChange={(e) => setFormData({...formData, descricaoPatrimonio: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                    rows={4}
                    placeholder="Descreva os bens patrimoniais..."
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'sistema':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
              <select
                id="customer-status-select"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="suspended">Suspenso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Data de Cadastro</label>
              <input
                id="customer-registration-date-input"
                type="date"
                value={formData.dataCadastro}
                onChange={(e) => setFormData({...formData, dataCadastro: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Responsável pelo Cadastro</label>
              <input
                id="customer-registration-responsible-input"
                type="text"
                value={formData.responsavelCadastro}
                onChange={(e) => setFormData({...formData, responsavelCadastro: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                placeholder="Nome do responsável"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-300">Observações</label>
              <textarea
                id="customer-observations-textarea"
                value={formData.observacoes}
                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-300"
                rows={4}
                placeholder="Observações adicionais..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              id="customer-form-back-button"
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
              </h1>
              <p className="text-gray-400 mt-2">
                {isEditing ? 'Atualize as informações do cliente' : 'Preencha todas as informações do cliente'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-effect rounded-xl shadow-lg mb-8 gradient-card border">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`customer-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            <form onSubmit={handleSubmit}>
              {renderTabContent()}
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
                <Button
                  id="customer-form-cancel-button"
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-gray-300 border-gray-600 hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button
                  id="customer-form-save-button"
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Atualizar Cliente' : 'Salvar Cliente'}</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CustomerFormPage() {
  return <CustomerFormView />;
}
