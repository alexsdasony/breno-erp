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
  Briefcase
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
