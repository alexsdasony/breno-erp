'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Package, 
  FileText, 
  BarChart3, 
  Settings,
  Download,
  Search,
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  CreditCard,
  Building2,
  Home,
  BookOpen
} from 'lucide-react';

export default function ManualView() {
  const [searchTerm, setSearchTerm] = useState('');

  const manualSections = [
    {
      id: 'overview',
      title: 'Visão Geral',
      icon: Book,
      description: 'Entenda a arquitetura e estrutura geral do sistema Breno ERP',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🎯 VISÃO GERAL DO SISTEMA</h2>
        <p style="color: #374151; margin-bottom: 1rem;">O <strong>Breno ERP</strong> é um sistema empresarial completo desenvolvido com tecnologias modernas para gerenciar todos os aspectos de uma empresa, desde finanças até vendas e estoque.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">🏗️ ARQUITETURA TÉCNICA</h3>
        <h4 style="color: #374151; margin-bottom: 0.5rem;">Frontend (Interface do Usuário)</h4>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Framework:</strong> Next.js 15 com App Router</li>
          <li><strong>Interface:</strong> React 18 + Tailwind CSS + Radix UI</li>
          <li><strong>Estado:</strong> Context API + Hooks customizados</li>
          <li><strong>Roteamento:</strong> Sistema de arquivos do Next.js</li>
          <li><strong>Autenticação:</strong> JWT com sessionStorage</li>
        </ul>
        
        <h4 style="color: #374151; margin-bottom: 0.5rem;">Backend (Servidor)</h4>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Banco de Dados:</strong> Supabase (PostgreSQL)</li>
          <li><strong>API:</strong> Supabase Edge Functions (Deno)</li>
          <li><strong>Autenticação:</strong> JWT customizado</li>
          <li><strong>Proxy:</strong> Next.js rewrites para desenvolvimento</li>
        </ul>
      `
    },
    {
      id: 'receita',
      title: 'Receita Federal',
      icon: Search,
      description: 'Integração e consultas com a Receita Federal para validação de dados',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🔍 RECEITA FEDERAL</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Módulo Receita Federal</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O módulo de Receita Federal permite integração direta com os sistemas governamentais para validação de CNPJ, CPF e consulta de informações cadastrais.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Validação de CNPJ:</strong> Verificação automática de empresas</li>
          <li><strong>Validação de CPF:</strong> Confirmação de pessoas físicas</li>
          <li><strong>Consulta de Dados:</strong> Informações cadastrais atualizadas</li>
          <li><strong>Integração Automática:</strong> Sincronização com sistemas RFB</li>
          <li><strong>Relatórios:</strong> Histórico de consultas realizadas</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Usar</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Receita Federal" no menu principal</li>
          <li>Digite o CNPJ ou CPF a ser consultado</li>
          <li>Clique em "Consultar"</li>
          <li>Visualize os dados retornados</li>
          <li>Salve ou exporte as informações</li>
        </ol>
      `
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Visão geral e métricas em tempo real de todos os segmentos da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🏠 DASHBOARD PRINCIPAL</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Dashboard</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O Dashboard é o centro de controle do sistema, onde você visualiza todas as informações importantes da empresa em um só lugar, organizadas por segmentos.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Métricas em Tempo Real:</strong> Usuários ativos, vendas, receitas</li>
          <li><strong>Gráficos Interativos:</strong> Performance por período e segmento</li>
          <li><strong>Alertas Importantes:</strong> Notificações e lembretes</li>
          <li><strong>Acesso Rápido:</strong> Links para todos os módulos</li>
          <li><strong>Visão Consolidada:</strong> Dados de todos os segmentos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Usar</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse o sistema e faça login</li>
          <li>O Dashboard será exibido automaticamente</li>
          <li>Use o seletor de segmentos para filtrar dados</li>
          <li>Clique nos gráficos para detalhes</li>
          <li>Navegue pelos módulos usando os cards</li>
        </ol>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Métricas Disponíveis</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Usuários:</strong> Total, ativos, administradores</li>
          <li><strong>Financeiro:</strong> Receitas, despesas, saldo</li>
          <li><strong>Vendas:</strong> Total vendido, pedidos pendentes</li>
          <li><strong>Produtos:</strong> Estoque, produtos ativos</li>
          <li><strong>Clientes:</strong> Total cadastrado, novos</li>
        </ul>
      `
    },
    {
      id: 'segments',
      title: 'Segmentos',
      icon: Briefcase,
      description: 'Controle múltiplos segmentos empresariais no mesmo sistema de forma organizada',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🏢 GESTÃO DE SEGMENTOS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que são Segmentos</h3>
        <p style="color: #374151; margin-bottom: 1rem;">Segmentos são unidades empresariais separadas que podem ser gerenciadas no mesmo sistema. Cada segmento tem seus próprios dados, usuários e configurações, mas compartilha a mesma infraestrutura.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Vantagens do Sistema Multi-Segmento</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Controle Centralizado:</strong> Gerencie várias empresas em um só lugar</li>
          <li><strong>Isolamento de Dados:</strong> Cada segmento mantém suas informações separadas</li>
          <li><strong>Economia de Recursos:</strong> Compartilha infraestrutura e licenças</li>
          <li><strong>Flexibilidade:</strong> Diferentes configurações por segmento</li>
          <li><strong>Relatórios Consolidados:</strong> Visão geral de todos os segmentos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Tipos de Segmentos</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Segmento Principal:</strong> Empresa matriz ou principal</li>
          <li><strong>Filiais:</strong> Unidades da mesma empresa</li>
          <li><strong>Empresas Relacionadas:</strong> Empresas do mesmo grupo</li>
          <li><strong>Projetos Específicos:</strong> Segmentos para projetos temporários</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Gerenciar Segmentos</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Segmentos" no menu principal</li>
          <li>Clique em "Novo Segmento" para criar</li>
          <li>Preencha nome, descrição e tipo</li>
          <li>Configure usuários e permissões</li>
          <li>Ative o segmento</li>
        </ol>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades por Segmento</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Usuários:</strong> Cada segmento tem seus próprios usuários</li>
          <li><strong>Dados:</strong> Clientes, produtos e transações isolados</li>
          <li><strong>Configurações:</strong> Parâmetros específicos por segmento</li>
          <li><strong>Relatórios:</strong> Análises individuais e consolidadas</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Troca de Segmentos</h3>
        <p style="color: #374151; margin-bottom: 1rem;">Use o seletor de segmentos no topo da tela para alternar entre diferentes segmentos. O sistema automaticamente filtra todos os dados e funcionalidades para o segmento selecionado.</p>
      `
    },
    {
      id: 'users',
      title: 'Gestão de Usuários',
      icon: Users,
      description: 'Gerencie acessos, perfis e permissões de todos os usuários do sistema',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">👥 GESTÃO DE USUÁRIOS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Tipos de Usuário</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Administrador:</strong> Acesso total ao sistema</li>
          <li><strong>Usuário:</strong> Acesso limitado aos módulos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Criar:</strong> Novo usuário com perfil e segmento</li>
          <li><strong>Editar:</strong> Modificar dados existentes</li>
          <li><strong>Ativar/Desativar:</strong> Controle de acesso</li>
          <li><strong>Resetar Senha:</strong> Nova senha padrão</li>
          <li><strong>Excluir:</strong> Remoção permanente</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Usar</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse o menu "Usuários"</li>
          <li>Clique em "Novo Usuário" para criar</li>
          <li>Preencha os dados obrigatórios</li>
          <li>Defina o perfil e segmento</li>
          <li>Salve o usuário</li>
        </ol>
      `
    },
    {
      id: 'accountsPayable',
      title: 'Contas a Pagar',
      icon: CheckSquare,
      description: 'Controle completo de todas as obrigações e contas a pagar da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">📋 CONTAS A PAGAR</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Módulo Contas a Pagar</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O módulo de Contas a Pagar gerencia todas as obrigações financeiras da empresa, permitindo controle de prazos, valores e fornecedores.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro de Contas:</strong> Registro de obrigações a pagar</li>
          <li><strong>Controle de Prazos:</strong> Vencimentos e alertas</li>
          <li><strong>Fornecedores:</strong> Gestão de credores</li>
          <li><strong>Categorização:</strong> Classificação por tipo de despesa</li>
          <li><strong>Fluxo de Aprovação:</strong> Controle de autorizações</li>
          <li><strong>Relatórios:</strong> Análise de obrigações</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Registrar uma Conta a Pagar</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Contas a Pagar" no menu</li>
          <li>Clique em "Nova Conta"</li>
          <li>Selecione o fornecedor</li>
          <li>Preencha valor, vencimento e descrição</li>
          <li>Defina a categoria e centro de custo</li>
          <li>Configure o fluxo de aprovação</li>
          <li>Salve a conta a pagar</li>
        </ol>
      `
    },
    {
      id: 'billing',
      title: 'Cobranças',
      icon: CreditCard,
      description: 'Sistema completo de cobrança e gestão de recebimentos da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">💳 SISTEMA DE COBRANÇAS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Sistema de Cobranças</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O sistema de Cobranças gerencia todo o processo de recebimento da empresa, desde a emissão de boletos até o controle de inadimplência.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Emissão de Boletos:</strong> Geração automática de cobranças</li>
          <li><strong>Controle de Vencimentos:</strong> Acompanhamento de prazos</li>
          <li><strong>Gestão de Inadimplência:</strong> Controle de atrasos</li>
          <li><strong>Formas de Pagamento:</strong> Múltiplas opções de recebimento</li>
          <li><strong>Relatórios:</strong> Análise de recebimentos</li>
          <li><strong>Integração Bancária:</strong> Conciliação automática</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Criar uma Cobrança</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Cobranças" no menu</li>
          <li>Clique em "Nova Cobrança"</li>
          <li>Selecione o cliente</li>
          <li>Defina o valor e vencimento</li>
          <li>Escolha a forma de pagamento</li>
          <li>Configure as condições</li>
          <li>Gere o boleto ou fatura</li>
        </ol>
      `
    },
    {
      id: 'financial',
      title: 'Módulo Financeiro',
      icon: DollarSign,
      description: 'Controle completo de receitas, despesas e fluxo de caixa da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">💰 MÓDULO FINANCEIRO</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Transações:</strong> Entrada e saída de recursos</li>
          <li><strong>Categorias:</strong> Classificação de movimentações</li>
          <li><strong>Relatórios:</strong> Análise de fluxo de caixa</li>
          <li><strong>Exportação:</strong> Dados em Excel/PDF</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Registrar Transações</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Financeiro" no menu</li>
          <li>Clique em "Nova Transação"</li>
          <li>Selecione o tipo (Receita/Despesa)</li>
          <li>Preencha valor, descrição e categoria</li>
          <li>Associe ao centro de custo</li>
          <li>Salve a transação</li>
        </ol>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Relatórios Disponíveis</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li>Fluxo de Caixa</li>
          <li>Demonstração de Resultados (DRE)</li>
          <li>Análise por Centro de Custo</li>
          <li>Relatório de Receitas e Despesas</li>
        </ul>
      `
    },
    {
      id: 'customers',
      title: 'Gestão de Clientes',
      icon: Users,
      description: 'Cadastro completo e gestão de todos os clientes da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">👥 GESTÃO DE CLIENTES</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é a Gestão de Clientes</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O módulo de Gestão de Clientes permite cadastrar, organizar e acompanhar todos os clientes da empresa, incluindo dados pessoais, histórico de compras e preferências.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro Completo:</strong> Dados pessoais e empresariais</li>
          <li><strong>Categorização:</strong> Segmentação por tipo de cliente</li>
          <li><strong>Histórico de Compras:</strong> Acompanhamento de pedidos</li>
          <li><strong>Contatos:</strong> Múltiplas formas de contato</li>
          <li><strong>Endereços:</strong> Cadastro de múltiplos endereços</li>
          <li><strong>Relatórios:</strong> Análise de clientes</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Cadastrar um Cliente</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Clientes" no menu</li>
          <li>Clique em "Novo Cliente"</li>
          <li>Preencha os dados básicos</li>
          <li>Adicione informações de contato</li>
          <li>Configure o endereço</li>
          <li>Defina a categoria</li>
          <li>Salve o cliente</li>
        </ol>
      `
    },
    {
      id: 'suppliers',
      title: 'Gestão de Fornecedores',
      icon: Building2,
      description: 'Controle completo de fornecedores e parceiros comerciais',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🏭 GESTÃO DE FORNECEDORES</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é a Gestão de Fornecedores</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O módulo de Gestão de Fornecedores permite cadastrar e gerenciar todos os parceiros comerciais da empresa, incluindo fornecedores de produtos e serviços.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro Completo:</strong> Dados empresariais e fiscais</li>
          <li><strong>Categorização:</strong> Classificação por tipo de serviço</li>
          <li><strong>Contatos:</strong> Informações de contato</li>
          <li><strong>Histórico de Compras:</strong> Acompanhamento de pedidos</li>
          <li><strong>Avaliação:</strong> Sistema de rating e feedback</li>
          <li><strong>Relatórios:</strong> Análise de fornecedores</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Cadastrar um Fornecedor</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Fornecedores" no menu</li>
          <li>Clique em "Novo Fornecedor"</li>
          <li>Preencha os dados empresariais</li>
          <li>Adicione informações fiscais</li>
          <li>Configure os contatos</li>
          <li>Defina a categoria</li>
          <li>Salve o fornecedor</li>
        </ol>
      `
    },
    {
      id: 'costCenters',
      title: 'Centros de Custo',
      icon: Home,
      description: 'Organização e controle de custos por departamentos e projetos',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🏢 CENTROS DE CUSTO</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que são Centros de Custo</h3>
        <p style="color: #374151; margin-bottom: 1rem;">Centros de Custo são unidades organizacionais que permitem controlar e analisar gastos por departamento, projeto ou área específica da empresa.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro de Centros:</strong> Criação de unidades de custo</li>
          <li><strong>Hierarquia:</strong> Organização hierárquica</li>
          <li><strong>Controle de Gastos:</strong> Acompanhamento de despesas</li>
          <li><strong>Orçamentos:</strong> Definição de limites</li>
          <li><strong>Relatórios:</strong> Análise de custos</li>
          <li><strong>Integração:</strong> Conexão com outros módulos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Criar um Centro de Custo</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Centros de Custo" no menu</li>
          <li>Clique em "Novo Centro"</li>
          <li>Defina o nome e descrição</li>
          <li>Configure a hierarquia</li>
          <li>Defina o orçamento</li>
          <li>Associe responsáveis</li>
          <li>Salve o centro de custo</li>
        </ol>
      `
    },
    {
      id: 'chartOfAccounts',
      title: 'Plano de Contas',
      icon: BookOpen,
      description: 'Estrutura contábil completa para organização financeira da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">📚 PLANO DE CONTAS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Plano de Contas</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O Plano de Contas é a estrutura contábil que organiza todas as contas da empresa, permitindo classificar e controlar movimentações financeiras.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Estrutura Hierárquica:</strong> Organização por níveis</li>
          <li><strong>Códigos de Conta:</strong> Identificação única</li>
          <li><strong>Tipos de Conta:</strong> Ativo, Passivo, Receita, Despesa</li>
          <li><strong>Natureza:</strong> Débito ou Crédito</li>
          <li><strong>Contas Sintéticas:</strong> Agrupamento de contas</li>
          <li><strong>Relatórios:</strong> Balanço e DRE</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Criar uma Conta</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Plano de Contas" no menu</li>
          <li>Clique em "Nova Conta"</li>
          <li>Defina o código e nome</li>
          <li>Selecione o tipo de conta</li>
          <li>Configure a natureza</li>
          <li>Associe à conta pai</li>
          <li>Salve a conta</li>
        </ol>
      `
    },
    {
      id: 'sales',
      title: 'Módulo de Vendas',
      icon: ShoppingCart,
      description: 'Gerencie todo o processo de vendas, desde o pedido até a entrega',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🛒 MÓDULO DE VENDAS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Processo de Venda</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Seleção do Cliente:</strong> Escolher cliente existente</li>
          <li><strong>Produtos:</strong> Adicionar itens ao pedido</li>
          <li><strong>Valores:</strong> Cálculo automático de totais</li>
          <li><strong>Pagamento:</strong> Definir forma e condições</li>
          <li><strong>Confirmação:</strong> Finalizar a venda</li>
        </ol>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li>Cadastro de vendas</li>
          <li>Histórico de vendas</li>
          <li>Relatórios de performance</li>
          <li>Integração com estoque</li>
          <li>Controle de comissões</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Status das Vendas</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Pendente:</strong> Aguardando pagamento</li>
          <li><strong>Pago:</strong> Pagamento confirmado</li>
          <li><strong>Cancelado:</strong> Venda cancelada</li>
          <li><strong>Entregue:</strong> Produto entregue</li>
        </ul>
      `
    },
    {
      id: 'inventory',
      title: 'Controle de Produtos',
      icon: Package,
      description: 'Gerencie estoque, preços e cadastro de todos os produtos da empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">🏪 CONTROLE DE PRODUTOS</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro:</strong> Nome, descrição, preço</li>
          <li><strong>Categorias:</strong> Organização por tipo</li>
          <li><strong>Estoque:</strong> Controle de quantidade</li>
          <li><strong>Preços:</strong> Histórico de variações</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Cadastrar Produto</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Estoque" no menu</li>
          <li>Clique em "Novo Produto"</li>
          <li>Preencha os dados básicos</li>
          <li>Defina a categoria</li>
          <li>Configure o preço</li>
          <li>Defina o estoque inicial</li>
          <li>Salve o produto</li>
        </ol>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Controle de Estoque</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li>Entrada de produtos</li>
          <li>Saída por vendas</li>
          <li>Ajustes de inventário</li>
          <li>Alertas de estoque baixo</li>
          <li>Relatórios de movimentação</li>
        </ul>
      `
    },
    {
      id: 'paymentMethods',
      title: 'Formas de Pagamento',
      icon: CreditCard,
      description: 'Configure e gerencie todas as formas de pagamento aceitas pela empresa',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">💳 FORMAS DE PAGAMENTO</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que são Formas de Pagamento</h3>
        <p style="color: #374151; margin-bottom: 1rem;">As Formas de Pagamento definem como a empresa recebe pagamentos de clientes e como paga fornecedores, incluindo cartões, transferências, PIX e outros métodos.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Cadastro de Formas:</strong> Criação de métodos de pagamento</li>
          <li><strong>Configuração de Taxas:</strong> Definição de comissões</li>
          <li><strong>Integração Bancária:</strong> Conexão com instituições</li>
          <li><strong>Controle de Prazos:</strong> Definição de vencimentos</li>
          <li><strong>Relatórios:</strong> Análise de recebimentos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Configurar uma Forma de Pagamento</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Formas de Pagamento" no menu</li>
          <li>Clique em "Nova Forma"</li>
          <li>Defina o nome e descrição</li>
          <li>Configure as taxas e prazos</li>
          <li>Associe às contas bancárias</li>
          <li>Ative a forma de pagamento</li>
        </ol>
      `
    },
    {
      id: 'nfe',
      title: 'Emissão NF-e',
      icon: FileText,
      description: 'Sistema completo de emissão e gestão de notas fiscais eletrônicas',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">📄 EMISSÃO DE NF-e</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">O que é o Sistema de NF-e</h3>
        <p style="color: #374151; margin-bottom: 1rem;">O sistema de NF-e permite emitir, gerenciar e controlar todas as notas fiscais eletrônicas da empresa, garantindo conformidade com a legislação fiscal.</p>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Funcionalidades Principais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Emissão Automática:</strong> Geração de NF-e a partir de vendas</li>
          <li><strong>Validação Fiscal:</strong> Verificação de dados obrigatórios</li>
          <li><strong>Envio à SEFAZ:</strong> Transmissão automática</li>
          <li><strong>Cancelamento:</strong> Gestão de NF-e canceladas</li>
          <li><strong>Relatórios:</strong> Controle fiscal completo</li>
          <li><strong>Integração:</strong> Conexão com sistemas externos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Emitir uma NF-e</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Emissão NF-e" no menu</li>
          <li>Clique em "Nova NF-e"</li>
          <li>Selecione o cliente e produtos</li>
          <li>Preencha os dados fiscais</li>
          <li>Valide as informações</li>
          <li>Envie para a SEFAZ</li>
          <li>Imprima ou envie por email</li>
        </ol>
      `
    },
    {
      id: 'reports',
      title: 'Relatórios e Análises',
      icon: BarChart3,
      description: 'Gere relatórios detalhados para análise de performance e tomada de decisão',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">📊 RELATÓRIOS E ANÁLISES</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Tipos de Relatórios</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Financeiros:</strong> Fluxo de caixa, DRE</li>
          <li><strong>Vendas:</strong> Performance por período</li>
          <li><strong>Clientes:</strong> Análise de comportamento</li>
          <li><strong>Produtos:</strong> Rotatividade de estoque</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Exportação de Dados</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Formatos:</strong> Excel, PDF, CSV</li>
          <li><strong>Filtros:</strong> Por período, segmento, usuário</li>
          <li><strong>Agendamento:</strong> Relatórios automáticos</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Como Gerar Relatórios</h3>
        <ol style="color: #374151; margin-bottom: 1rem;">
          <li>Acesse "Relatórios" no menu</li>
          <li>Selecione o tipo de relatório</li>
          <li>Configure os filtros desejados</li>
          <li>Clique em "Gerar"</li>
          <li>Baixe no formato desejado</li>
        </ol>
      `
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: Settings,
      description: 'Configure parâmetros do sistema, segurança e personalizações',
      content: `
        <h2 style="color: #1f2937; margin-bottom: 1rem;">⚙️ CONFIGURAÇÕES DO SISTEMA</h2>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Configurações Gerais</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Empresa:</strong> Dados da empresa</li>
          <li><strong>Usuários:</strong> Gestão de acessos</li>
          <li><strong>Segmentos:</strong> Organização empresarial</li>
          <li><strong>Integrações:</strong> APIs externas</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Personalização</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Tema:</strong> Cores e layout</li>
          <li><strong>Notificações:</strong> Alertas e lembretes</li>
          <li><strong>Permissões:</strong> Controle de acesso</li>
          <li><strong>Backup:</strong> Configurações de segurança</li>
        </ul>
        
        <h3 style="color: #1f2937; margin-bottom: 0.75rem;">Segurança</h3>
        <ul style="color: #374151; margin-bottom: 1rem;">
          <li><strong>Autenticação:</strong> Login obrigatório</li>
          <li><strong>Sessão:</strong> Timeout automático</li>
          <li><strong>Logs:</strong> Registro de atividades</li>
          <li><strong>Backup:</strong> Dados protegidos</li>
        </ul>
      `
    }
  ];

  const filteredSections = manualSections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📚 Manual do Sistema
        </h1>
        <p className="text-gray-700">
          Documentação completa e guias de uso do sistema Breno ERP
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar no manual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
          />
        </div>
      </div>

      {/* Navegação por Abas - Layout Responsivo */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex flex-wrap gap-2 mb-6 p-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {manualSections.map((section) => (
            <TabsTrigger 
              key={section.id} 
              value={section.id}
              className="flex flex-col items-center gap-2 p-3 h-auto min-w-[120px] max-w-[140px] rounded-md transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 hover:scale-105 focus:bg-blue-100 focus:text-blue-800 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 data-[state=active]:shadow-md bg-gray-50 text-gray-700 border border-gray-200"
            >
              <section.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-xs font-medium text-center leading-tight break-words">
                {section.title}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {manualSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card className="shadow-lg border border-gray-200 bg-white">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <CardTitle className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <section.icon className="w-6 h-6 text-blue-700" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </span>
                </CardTitle>
                <p className="text-gray-800 text-base leading-relaxed font-medium">
                  {section.description}
                </p>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <div 
                  className="prose prose-gray max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
                
                {/* Botão de Exportar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    onClick={() => {
                      const element = document.createElement('a');
                      const file = new Blob([section.content.replace(/<[^>]*>/g, '')], {type: 'text/plain'});
                      element.href = URL.createObjectURL(file);
                      element.download = `${section.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
                      document.body.appendChild(element);
                      element.click();
                      document.body.removeChild(element);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors duration-200 text-white"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Seção
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Botão de Exportar Manual Completo */}
      <div className="mt-8 text-center">
        <Button 
          onClick={() => {
            const fullManual = manualSections.map(section => 
              `${section.title}\n${'='.repeat(section.title.length)}\n${section.description}\n\n${section.content.replace(/<[^>]*>/g, '')}\n\n`
            ).join('');
            
            const element = document.createElement('a');
            const file = new Blob([fullManual], {type: 'text/plain'});
            element.href = URL.createObjectURL(file);
            element.download = 'manual-completo-sistema.txt';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }}
          size="lg"
          className="flex items-center gap-2 mx-auto bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-lg text-white"
        >
          <Download className="w-5 h-5" />
          Exportar Manual Completo
        </Button>
      </div>
    </div>
  );
}
