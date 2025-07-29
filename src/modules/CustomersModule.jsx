import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  User, 
  FileText, 
  DollarSign, 
  MapPin, 
  Phone, 
  Home, 
  CheckCircle, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Camera,
  Upload,
  Trash2,
  Eye,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData.jsx';
import { toast } from '@/components/ui/use-toast';
import apiService from '@/services/api';

const TABS = [
  { key: 'resumo', label: 'Resumo', icon: User },
  { key: 'cadastro', label: 'Cadastro', icon: User },
  { key: 'documento', label: 'Documento', icon: FileText },
  { key: 'renda', label: 'Renda', icon: DollarSign },
  { key: 'endereco', label: 'Endereço', icon: MapPin },
  { key: 'contato', label: 'Contato', icon: Phone },
  { key: 'patrimonio', label: 'Patrimônio', icon: Home },
  { key: 'status', label: 'Status', icon: CheckCircle },
];

const CustomersModule = () => {
  const { data, loadCustomers, currentUser } = useAppData();
  const [activeTab, setActiveTab] = useState('resumo');
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    name: '',
    tipoPessoa: 'pf', // pf ou pj
    cpf: '',
    cnpj: '',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    profissao: '',
    empresa: '',
    cargo: '',
    dataAdmissao: '',
    
    // Documentos
    tipoDocumento: '',
    numeroDocumento: '',
    dataEmissao: '',
    dataValidade: '',
    orgaoEmissor: '',
    documentoImage: null,
    documentos: [],
    
    // Renda
    cnpjOrigemRenda: '',
    dataAdmissaoRenda: '',
    cargoRenda: '',
    tipoRenda: '',
    rendaBruta: '',
    salarioLiquido: '',
    valorImpostoRenda: '',
    dataComprovacao: '',
    documentoRendaImage: null,
    rendaMensal: '',
    rendaComplementar: '',
    origemRenda: '',
    comprovantesRenda: [],
    
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    tipoImovel: '',
    dataReferencia: '',
    
    // Contato
    telefone: '',
    tipoTelefone: 'residencial',
    celular: '',
    email: '',
    telefoneComercial: '',
    dataReferenciaContato: '',
    
    // Patrimônio
    possuiPatrimonio: false,
    valorPatrimonio: '',
    descricaoPatrimonio: '',
    
    // Status
    status: 'pendente',
    observacoes: '',
    responsavelCadastro: '',
    dataCadastro: new Date().toISOString().split('T')[0]
  });

  // Função para lidar com mudanças nos campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Reset do formulário
  const resetForm = () => {
    setFormData({
      name: '',
      tipoPessoa: 'pf',
      cpf: '',
      cnpj: '',
      rg: '',
      dataNascimento: '',
      estadoCivil: '',
      profissao: '',
      empresa: '',
      cargo: '',
      dataAdmissao: '',
      tipoDocumento: '',
      numeroDocumento: '',
      dataEmissao: '',
      dataValidade: '',
      orgaoEmissor: '',
      documentoImage: null,
      documentos: [],
      cnpjOrigemRenda: '',
      dataAdmissaoRenda: '',
      cargoRenda: '',
      tipoRenda: '',
      rendaBruta: '',
      salarioLiquido: '',
      valorImpostoRenda: '',
      dataComprovacao: '',
      documentoRendaImage: null,
      rendaMensal: '',
      rendaComplementar: '',
      origemRenda: '',
      comprovantesRenda: [],
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      tipoImovel: '',
      dataReferencia: '',
      telefone: '',
      tipoTelefone: 'residencial',
      celular: '',
      email: '',
      telefoneComercial: '',
      dataReferenciaContato: '',
      possuiPatrimonio: false,
      valorPatrimonio: '',
      descricaoPatrimonio: '',
      status: 'pendente',
      observacoes: '',
      responsavelCadastro: '',
      dataCadastro: new Date().toISOString().split('T')[0]
    });
    setPhotoPreview(null);
    setIsEditing(false);
    setSelectedCustomer(null);
    setShowForm(false);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Erro', description: 'O nome deve ter pelo menos 2 caracteres.', variant: 'destructive' });
        return false;
      }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      toast({ title: 'Erro', description: 'Informe um e-mail válido.', variant: 'destructive' });
        return false;
      }
      return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' });
        await loadCustomers();
        resetForm();
      } else {
        const error = await response.json();
        if (error.details && Array.isArray(error.details)) {
          error.details.forEach((err) => {
            toast({ title: 'Erro', description: err.msg, variant: 'destructive' });
          });
        } else {
          toast({ title: 'Erro', description: error.error || 'Erro ao cadastrar cliente.', variant: 'destructive' });
        }
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro de rede ao cadastrar cliente.', variant: 'destructive' });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e, type) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documentos: [...prev.documentos, ...files.map(file => ({ file, type }))]
    }));
  };

  const handleCepSearch = async (cep) => {
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            logradouro: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  // Função para consultar Receita Federal
  const handleConsultaReceita = async () => {
    if (!currentUser) {
      toast({ title: 'Erro', description: 'Você precisa estar logado para consultar a Receita Federal.', variant: 'destructive' });
      return;
    }
    // Sanitizar documento
    const doc = formData.tipoPessoa === 'pf' ? formData.cpf.replace(/\D/g, '') : formData.cnpj.replace(/\D/g, '');
    if (!doc || (formData.tipoPessoa === 'pf' && doc.length !== 11) || (formData.tipoPessoa === 'pj' && doc.length !== 14)) {
      toast({ title: 'Erro', description: 'Preencha um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.', variant: 'destructive' });
      return;
    }
    try {
      const url = formData.tipoPessoa === 'pf'
        ? `/api/receita/consulta/${doc}`
        : `/api/receita/consulta-cnpj/${doc}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiService.getToken()}` }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        if (formData.tipoPessoa === 'pf') {
          setFormData(prev => ({
            ...prev,
            name: result.data.nome,
            dataNascimento: result.data.dataNascimento,
            situacaoCadastral: result.data.situacaoCadastral,
            logradouro: result.data.endereco?.logradouro,
            bairro: result.data.endereco?.bairro,
            cidade: result.data.endereco?.cidade,
            estado: result.data.endereco?.uf,
            cep: result.data.endereco?.cep
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            name: result.data.razaoSocial,
            situacaoCadastral: result.data.situacaoCadastral,
            logradouro: result.data.endereco?.logradouro,
            bairro: result.data.endereco?.bairro,
            cidade: result.data.endereco?.cidade,
            estado: result.data.endereco?.uf,
            cep: result.data.endereco?.cep
          }));
        }
        toast({ title: 'Consulta Receita Federal', description: 'Dados preenchidos automaticamente!' });
      } else {
        toast({ title: 'Erro', description: `Status: ${response.status}\n${result.error || 'Não foi possível consultar.'}`, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erro', description: `Falha na consulta Receita Federal.\n${error && error.message ? error.message : error}`, variant: 'destructive' });
    }
  };

  const renderResumo = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Resumo do Cliente</h3>
        <Button 
          onClick={() => {
            setShowForm(true);
            setActiveTab('cadastro');
            resetForm();
          }} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
        >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-blue-100 shadow-sm">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border-2 border-blue-200">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <Camera className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <h4 className="font-semibold text-lg text-gray-800">{formData.name || 'Nome do Cliente'}</h4>
            <p className="text-sm text-gray-600">{formData.cpf || 'CPF não informado'}</p>
        </div>
      </div>

        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-6 border border-green-100 shadow-sm">
          <h4 className="font-semibold mb-3 text-gray-800">Informações Principais</h4>
          <div className="space-y-2 text-sm">
            <p><strong className="text-gray-700">Profissão:</strong> <span className="text-gray-600">{formData.profissao || 'Não informado'}</span></p>
            <p><strong className="text-gray-700">Empresa:</strong> <span className="text-gray-600">{formData.empresa || 'Não informado'}</span></p>
            <p><strong className="text-gray-700">Renda:</strong> <span className="text-gray-600">{formData.rendaMensal ? `R$ ${formData.rendaMensal}` : 'Não informado'}</span></p>
            <p><strong className="text-gray-700">Status:</strong> <span className={`px-2 py-1 rounded-full text-xs font-medium ${formData.status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{formData.status}</span></p>
            </div>
          </div>
        
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-xl p-6 border border-purple-100 shadow-sm">
          <h4 className="font-semibold mb-3 text-gray-800">Contato</h4>
          <div className="space-y-2 text-sm">
            <p><strong className="text-gray-700">Telefone:</strong> <span className="text-gray-600">{formData.telefone || 'Não informado'}</span></p>
            <p><strong className="text-gray-700">Celular:</strong> <span className="text-gray-600">{formData.celular || 'Não informado'}</span></p>
            <p><strong className="text-gray-700">E-mail:</strong> <span className="text-gray-600">{formData.email || 'Não informado'}</span></p>
            <p><strong className="text-gray-700">Endereço:</strong> <span className="text-gray-600">{formData.logradouro ? `${formData.logradouro}, ${formData.numero}` : 'Não informado'}</span></p>
            </div>
          </div>
      </div>
    </div>
  );

  const renderCadastro = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Dados Cadastrais</h3>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={resetForm}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nome Completo *</label>
                <input
                  type="text"
              name="name"
                  value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
              placeholder="Nome completo"
              required
              minLength={2}
                />
              </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de Pessoa *</label>
            <select
              value={formData.tipoPessoa}
              onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value, cpf: '', cnpj: ''})}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
              required
            >
              <option value="pf">Pessoa Física (CPF)</option>
              <option value="pj">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              {formData.tipoPessoa === 'pf' ? 'CPF *' : 'CNPJ *'}
            </label>
            <div className="flex items-center space-x-2">
                <input
                  type="text"
                value={formData.tipoPessoa === 'pf' ? formData.cpf : formData.cnpj}
                onChange={(e) => {
                  if (formData.tipoPessoa === 'pf') {
                    setFormData({...formData, cpf: e.target.value});
                  } else {
                    setFormData({...formData, cnpj: e.target.value});
                  }
                }}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
                placeholder={formData.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
              <Button type="button" variant="outline" onClick={handleConsultaReceita} title="Consultar Receita Federal">
                <Search className="w-4 h-4" />
              </Button>
              </div>
          </div>
          
          {formData.tipoPessoa === 'pf' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">RG</label>
                <input
                type="text"
                value={formData.rg}
                onChange={(e) => setFormData({...formData, rg: e.target.value})}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
                placeholder="Digite o RG"
                />
              </div>
          )}
          
          {formData.tipoPessoa === 'pf' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Data de Nascimento *</label>
                <input
                type="date"
                value={formData.dataNascimento}
                onChange={(e) => setFormData({...formData, dataNascimento: e.target.value})}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
                required
                />
              </div>
          )}
          
          {formData.tipoPessoa === 'pf' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Estado Civil *</label>
              <select
                value={formData.estadoCivil}
                onChange={(e) => setFormData({...formData, estadoCivil: e.target.value})}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
                required
              >
                <option value="">Selecione...</option>
                <option value="solteiro">Solteiro(a)</option>
                <option value="casado">Casado(a)</option>
                <option value="divorciado">Divorciado(a)</option>
                <option value="viuvo">Viúvo(a)</option>
                <option value="uniao">União Estável</option>
                <option value="separado">Separado(a)</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Profissão</label>
                <input
                  type="text"
              value={formData.profissao}
              onChange={(e) => setFormData({...formData, profissao: e.target.value})}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
              placeholder="Digite a profissão"
                />
              </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Empresa</label>
                <input
                  type="text"
              value={formData.empresa}
              onChange={(e) => setFormData({...formData, empresa: e.target.value})}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
              placeholder="Digite o nome da empresa"
                />
              </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Cargo</label>
            <input
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({...formData, cargo: e.target.value})}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
              placeholder="Digite o cargo"
            />
              </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Data de Admissão</label>
            <input
              type="date"
              value={formData.dataAdmissao}
              onChange={(e) => setFormData({...formData, dataAdmissao: e.target.value})}
              className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
            />
          </div>
              </div>
            </form>
    </div>
  );

  const renderDocumento = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Documentos</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de Documento *</label>
          <select
            value={formData.tipoDocumento}
            onChange={(e) => setFormData({...formData, tipoDocumento: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
            required
          >
            <option value="">Selecione o tipo de documento...</option>
            <option value="rg">RG (Registro Geral)</option>
            <option value="cpf">CPF (Cadastro de Pessoa Física)</option>
            <option value="cnpj">CNPJ (Cadastro Nacional da Pessoa Jurídica)</option>
            <option value="passaporte">Passaporte</option>
            <option value="carteira_trabalho">Carteira de Trabalho</option>
            <option value="certidao_nascimento">Certidão de Nascimento</option>
            <option value="certidao_casamento">Certidão de Casamento</option>
            <option value="certidao_divorcio">Certidão de Divórcio</option>
            <option value="titulo_eleitor">Título de Eleitor</option>
            <option value="carteira_motorista">Carteira de Motorista</option>
            <option value="carteira_identidade">Carteira de Identidade</option>
            <option value="certificado_reservista">Certificado de Reservista</option>
            <option value="contrato_social">Contrato Social (PJ)</option>
            <option value="inscricao_estadual">Inscrição Estadual (PJ)</option>
            <option value="inscricao_municipal">Inscrição Municipal (PJ)</option>
            <option value="outros">Outros</option>
          </select>
          </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Número do Documento *</label>
          <input
            type="text"
            value={formData.numeroDocumento}
            onChange={(e) => setFormData({...formData, numeroDocumento: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="Digite o número do documento"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Data de Emissão</label>
          <input
            type="date"
            value={formData.dataEmissao}
            onChange={(e) => setFormData({...formData, dataEmissao: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
          />
                    </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Data de Validade</label>
          <input
            type="date"
            value={formData.dataValidade}
            onChange={(e) => setFormData({...formData, dataValidade: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
          />
                    </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Órgão Emissor</label>
          <input
            type="text"
            value={formData.orgaoEmissor}
            onChange={(e) => setFormData({...formData, orgaoEmissor: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="Digite o órgão emissor"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Upload do Documento</label>
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => handleDocumentUpload(e, 'documento')}
              className="hidden"
              id="documentoUpload"
            />
            <label htmlFor="documentoUpload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Clique para fazer upload</p>
              <p className="text-sm text-gray-500">PNG, JPG, PDF até 5MB</p>
            </label>
          </div>
        </div>
              </div>
              
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-3">Documentos Obrigatórios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-blue-800">RG ou CNH</span>
                </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-blue-800">CPF</span>
                  </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-blue-800">Comprovante de Residência</span>
                  </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <span className="text-sm text-blue-800">Comprovante de Renda</span>
                </div>
                </div>
                </div>
                </div>
  );

  const renderRenda = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-800">Informações de Renda</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">CNPJ da Origem da Renda</label>
          <input
            type="text"
            value={formData.cnpjOrigemRenda}
            onChange={(e) => setFormData({...formData, cnpjOrigemRenda: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            placeholder="00.000.000/0000-00"
          />
                </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Admissão</label>
          <input
            type="date"
            value={formData.dataAdmissaoRenda}
            onChange={(e) => setFormData({...formData, dataAdmissaoRenda: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
          />
                  </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
          <input
            type="text"
            value={formData.cargoRenda}
            onChange={(e) => setFormData({...formData, cargoRenda: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            placeholder="Ex: Analista, Gerente, Diretor"
          />
                  </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Renda *</label>
          <select
            value={formData.tipoRenda}
            onChange={(e) => setFormData({...formData, tipoRenda: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            required
          >
            <option value="">Selecione o tipo de renda...</option>
            <option value="salario">Salário</option>
            <option value="holerite">Holerite</option>
            <option value="extrato_bancario">Extrato Bancário</option>
            <option value="declaracao_imposto">Declaração de Imposto de Renda</option>
            <option value="comprovante_renda">Comprovante de Renda</option>
            <option value="proventos">Proventos</option>
            <option value="renda_autonomo">Renda de Autônomo</option>
            <option value="renda_empresario">Renda de Empresário</option>
            <option value="aposentadoria">Aposentadoria</option>
            <option value="pensao">Pensão</option>
            <option value="aluguel">Renda de Aluguel</option>
            <option value="dividendos">Dividendos</option>
            <option value="investimentos">Renda de Investimentos</option>
            <option value="freelance">Freelance</option>
            <option value="consultoria">Consultoria</option>
            <option value="outros">Outros</option>
          </select>
                </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Renda Salarial Bruto *</label>
          <input
            type="number"
            value={formData.rendaBruta}
            onChange={(e) => setFormData({...formData, rendaBruta: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            placeholder="0,00"
            step="0.01"
            required
          />
                </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Salário Líquido *</label>
          <input
            type="number"
            value={formData.salarioLiquido}
            onChange={(e) => setFormData({...formData, salarioLiquido: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            placeholder="0,00"
            step="0.01"
            required
          />
              </div>
              
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Valor Imposto de Renda</label>
          <input
            type="number"
            value={formData.valorImpostoRenda}
            onChange={(e) => setFormData({...formData, valorImpostoRenda: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
            placeholder="0,00"
            step="0.01"
          />
              </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Comprovação</label>
          <input
            type="date"
            value={formData.dataComprovacao}
            onChange={(e) => setFormData({...formData, dataComprovacao: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Anexar Documento de Renda *</label>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center border-2 border-green-200 shadow-sm">
                {formData.documentoRendaImage ? (
                  <img src={formData.documentoRendaImage} alt="Preview" className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <FileText className="w-8 h-8 text-green-500" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => setFormData({...formData, documentoRendaImage: e.target.result});
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="documento-renda-upload"
                  required
                />
                <label htmlFor="documento-renda-upload" className="cursor-pointer bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documento de Renda
                </label>
                <p className="text-sm text-gray-600 mt-2">Formatos aceitos: JPG, PNG, PDF</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <h4 className="font-medium mb-4 text-gray-800">📊 Resumo da Renda</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Renda Bruta</p>
            <p className="text-lg font-semibold text-gray-800">
              {formData.rendaBruta ? `R$ ${parseFloat(formData.rendaBruta).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Não informado'}
            </p>
              </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Salário Líquido</p>
            <p className="text-lg font-semibold text-gray-800">
              {formData.salarioLiquido ? `R$ ${parseFloat(formData.salarioLiquido).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : 'Não informado'}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600">Tipo de Renda</p>
            <p className="text-lg font-semibold text-gray-800">
              {formData.tipoRenda || 'Não informado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEndereco = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Endereço</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
          <label className="block text-sm font-medium mb-2">CEP *</label>
                  <input
                    type="text"
            value={formData.cep}
            onChange={(e) => {
              setFormData({...formData, cep: e.target.value});
              if (e.target.value.length === 8) {
                handleCepSearch(e.target.value);
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="00000-000"
            required
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Logradouro *</label>
                  <input
                    type="text"
            value={formData.logradouro}
            onChange={(e) => setFormData({...formData, logradouro: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Número *</label>
                  <input
            type="text"
            value={formData.numero}
            onChange={(e) => setFormData({...formData, numero: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Complemento</label>
                  <input
            type="text"
            value={formData.complemento}
            onChange={(e) => setFormData({...formData, complemento: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Apto, Casa, etc."
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Bairro *</label>
                  <input
                    type="text"
            value={formData.bairro}
            onChange={(e) => setFormData({...formData, bairro: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Cidade *</label>
                  <input
                    type="text"
            value={formData.cidade}
            onChange={(e) => setFormData({...formData, cidade: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
                  />
                </div>
        
                <div>
          <label className="block text-sm font-medium mb-2">Estado *</label>
                  <select
            value={formData.estado}
            onChange={(e) => setFormData({...formData, estado: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
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
          <label className="block text-sm font-medium mb-2">Tipo de Imóvel</label>
          <select
            value={formData.tipoImovel}
            onChange={(e) => setFormData({...formData, tipoImovel: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione...</option>
            <option value="proprio">Próprio</option>
            <option value="alugado">Alugado</option>
            <option value="financiado">Financiado</option>
            <option value="cedido">Cedido</option>
          </select>
                </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data de Referência</label>
          <input
            type="date"
            value={formData.dataReferencia}
            onChange={(e) => setFormData({...formData, dataReferencia: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );

  const renderContato = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Informações de Contato</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Tipo de Telefone</label>
          <select
            value={formData.tipoTelefone}
            onChange={(e) => setFormData({...formData, tipoTelefone: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
          >
            <option value="residencial">Residencial</option>
            <option value="celular">Celular</option>
            <option value="comercial">Comercial</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Telefone Principal *</label>
          <input
            type="tel"
            value={formData.telefone}
            onChange={(e) => setFormData({...formData, telefone: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder={formData.tipoTelefone === 'celular' ? "(11) 98765-4321" : "(11) 1234-5678"}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Telefone Secundário</label>
          <input
            type="tel"
            value={formData.celular}
            onChange={(e) => setFormData({...formData, celular: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="(11) 98765-4321"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">E-mail</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="cliente@email.com"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Telefone Comercial</label>
          <input
            type="tel"
            value={formData.telefoneComercial}
            onChange={(e) => setFormData({...formData, telefoneComercial: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="(11) 1234-5678"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Data de Referência</label>
          <input
            type="date"
            value={formData.dataReferenciaContato}
            onChange={(e) => setFormData({...formData, dataReferenciaContato: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Informações do Telefone Principal</h4>
        <div className="text-sm text-blue-800">
          <p><strong>Tipo:</strong> {formData.tipoTelefone === 'residencial' ? 'Residencial' : formData.tipoTelefone === 'celular' ? 'Celular' : 'Comercial'}</p>
          <p><strong>Número:</strong> {formData.telefone || 'Não informado'}</p>
        </div>
      </div>
    </div>
  );

  const renderPatrimonio = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Patrimônio</h3>
      
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="possuiPatrimonio"
            checked={formData.possuiPatrimonio}
            onChange={(e) => setFormData({...formData, possuiPatrimonio: e.target.checked})}
            className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500"
          />
          <label htmlFor="possuiPatrimonio" className="text-sm font-semibold text-gray-900">
            Possui patrimônio
          </label>
        </div>
        
        {formData.possuiPatrimonio && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Valor do Patrimônio</label>
              <input
                type="number"
                value={formData.valorPatrimonio}
                onChange={(e) => setFormData({...formData, valorPatrimonio: e.target.value})}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
                placeholder="0,00"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Descrição do Patrimônio</label>
              <textarea
                value={formData.descricaoPatrimonio}
                onChange={(e) => setFormData({...formData, descricaoPatrimonio: e.target.value})}
                className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
                rows="4"
                placeholder="Descreva os bens que compõem o patrimônio..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Status do Cadastro</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Status *</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
            required
          >
            <option value="pendente">Pendente</option>
            <option value="em_analise">Em Análise</option>
            <option value="aprovado">Aprovado</option>
            <option value="reprovado">Reprovado</option>
            <option value="suspenso">Suspenso</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Responsável pelo Cadastro</label>
          <input
            type="text"
            value={formData.responsavelCadastro}
            onChange={(e) => setFormData({...formData, responsavelCadastro: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            placeholder="Nome do responsável"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Data do Cadastro</label>
          <input
            type="date"
            value={formData.dataCadastro}
            onChange={(e) => setFormData({...formData, dataCadastro: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-900 mb-2">Observações</label>
          <textarea
            value={formData.observacoes}
            onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
            className="w-full p-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 shadow-sm transition-all duration-200 placeholder-gray-500"
            rows="4"
            placeholder="Observações sobre o cadastro..."
          />
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Checklist de Requisitos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Documentos pessoais anexados</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Comprovante de residência</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Comprovante de renda</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Foto do cliente</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Endereço completo</span>
          </div>
          <div className="flex items-center space-x-3">
            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-400 rounded focus:ring-blue-500" />
            <span className="text-sm text-gray-700">Contatos validados</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'resumo':
        return renderResumo();
      case 'cadastro':
        return renderCadastro();
      case 'documento':
        return renderDocumento();
      case 'renda':
        return renderRenda();
      case 'endereco':
        return renderEndereco();
      case 'contato':
        return renderContato();
      case 'patrimonio':
        return renderPatrimonio();
      case 'status':
        return renderStatus();
      default:
        return renderResumo();
    }
  };

  return (
            <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center mb-6">
        <Users className="w-8 h-8 text-primary mr-3" />
        <h2 className="text-2xl font-bold">Cadastro de Clientes</h2>
                </div>
      
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`flex items-center px-4 py-2 text-sm font-medium focus:outline-none transition-colors border-b-2 ${activeTab === tab.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-primary'}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
                </div>
      
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
            </motion.div>
      </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default CustomersModule;