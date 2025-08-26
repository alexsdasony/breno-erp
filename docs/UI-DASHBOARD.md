# Dashboard UI Blueprint

## Visão Geral
Este documento descreve as alterações necessárias no módulo de Dashboard para que a interface atual corresponda visualmente à versão anterior (backup).

## Componentes Visuais

### Cabeçalho

#### Versão Atual
- Título simples "Dashboard"
- Botão de atualização à direita
- Seletores de período (7d, 30d, 90d)

#### Versão Desejada (Backup)
- Título "Dashboard" em tamanho maior (text-3xl)
- Subtítulo "Visão geral do seu negócio"
- Botões de ação no cabeçalho:
  - Botão "Hoje" com ícone de calendário
  - Botão "Relatórios" com ícone de gráfico

### Cards de Métricas

#### Versão Atual
- Cards simples com título, valor e gráfico
- Cores básicas para cada card
- Sem indicadores de variação

#### Versão Desejada (Backup)
- Cards com design mais elaborado
- Indicadores de variação percentual (+12.5%, etc.)
- Ícones de tendência (TrendingUp/TrendingDown)
- Esquema de cores mais vibrante:
  - Verde para receita
  - Azul para vendas
  - Roxo para clientes
  - Laranja para produtos

### Gráficos e Visualizações

#### Versão Atual
- Gráficos de linha simples
- Sem legendas ou contexto

#### Versão Desejada (Backup)
- Gráficos mais elaborados com legendas
- Tooltips informativos
- Áreas coloridas sob as linhas
- Indicadores de tendência

### Tabelas de Dados

#### Versão Atual
- Tabelas simples ou inexistentes

#### Versão Desejada (Backup)
- Tabela de transações recentes
- Tabela de vendas recentes
- Indicadores visuais de status
- Ações rápidas em cada linha

## Animações e Interatividade

#### Versão Atual
- Sem animações
- Interatividade básica

#### Versão Desejada (Backup)
- Animações de entrada com framer-motion
- Transições suaves entre estados
- Feedback visual para interações

## Responsividade

#### Versão Atual
- Layout responsivo básico

#### Versão Desejada (Backup)
- Layout responsivo mais refinado
- Adaptação elegante para diferentes tamanhos de tela

## Implementação

### Alterações Necessárias

1. **Atualizar o Cabeçalho**:
   - Adicionar subtítulo
   - Implementar botões de ação

2. **Melhorar Cards de Métricas**:
   - Adicionar indicadores de variação
   - Implementar ícones de tendência
   - Ajustar esquema de cores

3. **Aprimorar Gráficos**:
   - Adicionar legendas e contexto
   - Implementar tooltips
   - Melhorar visualização de dados

4. **Adicionar Tabelas de Dados**:
   - Implementar tabela de transações recentes
   - Implementar tabela de vendas recentes

5. **Implementar Animações**:
   - Adicionar framer-motion
   - Implementar animações de entrada
   - Adicionar transições entre estados

### Dependências

- Framer Motion: Para animações
- Lucide React: Para ícones adicionais
- Recharts: Para gráficos aprimorados

### Observações

- Manter a estrutura de componentes atual
- Focar apenas nas alterações visuais
- Preservar a funcionalidade existente