# Billing (Faturamento) UI Blueprint

## Visão Geral
Este documento descreve as alterações necessárias no módulo de Faturamento para que a interface atual corresponda visualmente à versão anterior (backup).

## Componentes Visuais

### Cabeçalho

#### Versão Atual
- Título simples "Faturamento"
- Botões básicos ou inexistentes

#### Versão Desejada (Backup)
- Título "Faturamento" com estilo mais proeminente
- Botão "Novo Faturamento" com ícone de adição
- Botão de importação de dados
- Filtros de período (Hoje, Esta Semana, Este Mês)
- Campo de pesquisa

### Lista de Faturas

#### Versão Atual
- Lista simples com informações básicas
- Sem indicadores visuais de status ou vencimento

#### Versão Desejada (Backup)
- Lista detalhada com:
  - Número da fatura com destaque
  - Cliente com ícone
  - Valor total com formatação de moeda
  - Data de emissão formatada
  - Data de vencimento formatada
  - Status com indicador visual colorido:
    - Verde: Pago
    - Azul: Emitido
    - Amarelo: Pendente
    - Vermelho: Atrasado
  - Método de pagamento com ícone
- Ações rápidas por item:
  - Visualizar (ícone de olho)
  - Editar (ícone de lápis)
  - Enviar por email (ícone de envelope)
  - Excluir (ícone de lixeira)

### Resumo Financeiro

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Cards de resumo no topo:
  - Total faturado no mês
  - Total recebido no mês
  - Total pendente
  - Total atrasado
- Gráfico de faturamento mensal
- Gráfico de distribuição por status

### Formulário de Fatura

#### Versão Atual
- Formulário básico com campos limitados

#### Versão Desejada (Backup)
- Formulário completo com:
  - Número da fatura (automático ou manual)
  - Seleção de cliente (autocomplete)
  - Data de emissão com calendário
  - Data de vencimento com calendário
  - Itens da fatura:
    - Descrição
    - Quantidade
    - Valor unitário
    - Desconto
    - Subtotal
  - Cálculo automático de totais
  - Método de pagamento
  - Status com opções visuais
  - Campo de observações
  - Botões de ação (Salvar, Cancelar, Emitir)

### Modal de Visualização

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Modal detalhado com:
  - Layout semelhante a uma fatura real
  - Informações completas da fatura
  - Lista de itens
  - Totais e subtotais
  - Informações de pagamento
  - Botões para imprimir, enviar por email, marcar como pago

## Animações e Interatividade

#### Versão Atual
- Sem animações
- Interatividade básica

#### Versão Desejada (Backup)
- Animações de entrada/saída com framer-motion
- Transições suaves entre estados
- Feedback visual para interações
- Animações para modais
- Efeitos de hover nos itens da lista

## Filtros e Pesquisa

#### Versão Atual
- Inexistentes ou básicos

#### Versão Desejada (Backup)
- Filtros avançados:
  - Por período (Hoje, Esta Semana, Este Mês, Personalizado)
  - Por status (Pago, Emitido, Pendente, Atrasado)
  - Por cliente
  - Por valor (faixas)
- Campo de pesquisa com funcionalidade de busca em tempo real

## Implementação

### Alterações Necessárias

1. **Atualizar o Cabeçalho**:
   - Adicionar botões de ação com ícones
   - Implementar filtros de período
   - Adicionar campo de pesquisa

2. **Melhorar Lista de Faturas**:
   - Adicionar mais detalhes por item
   - Implementar indicadores visuais de status
   - Adicionar ações rápidas
   - Melhorar formatação de datas e valores

3. **Adicionar Resumo Financeiro**:
   - Implementar cards de resumo
   - Adicionar gráficos de faturamento e distribuição

4. **Aprimorar Formulário de Fatura**:
   - Adicionar campos faltantes
   - Implementar seleção de cliente
   - Adicionar gerenciamento de itens
   - Implementar cálculos automáticos

5. **Criar Modal de Visualização**:
   - Implementar layout semelhante a uma fatura real
   - Adicionar botões de ação

6. **Implementar Animações**:
   - Adicionar framer-motion
   - Implementar animações de entrada/saída
   - Adicionar transições entre estados

### Dependências

- Framer Motion: Para animações
- Lucide React: Para ícones
- React Hook Form: Para formulários
- Recharts: Para gráficos

### Observações

- Manter a estrutura de componentes atual
- Focar apenas nas alterações visuais
- Preservar a funcionalidade existente