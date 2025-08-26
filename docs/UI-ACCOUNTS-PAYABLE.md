# Accounts Payable (Contas a Pagar) UI Blueprint

## Visão Geral
Este documento descreve as alterações necessárias no módulo de Contas a Pagar para que a interface atual corresponda visualmente à versão anterior (backup).

## Componentes Visuais

### Cabeçalho

#### Versão Atual
- Título simples "Contas a Pagar"
- Botões básicos ou inexistentes

#### Versão Desejada (Backup)
- Título "Contas a Pagar" com estilo mais proeminente
- Botão "Nova Conta" com ícone de adição
- Botão de importação de dados
- Filtros de período (Hoje, Esta Semana, Este Mês)
- Campo de pesquisa

### Lista de Contas

#### Versão Atual
- Lista simples com informações básicas
- Sem indicadores visuais de status ou vencimento

#### Versão Desejada (Backup)
- Lista detalhada com:
  - Descrição da conta com destaque
  - Fornecedor com ícone
  - Valor com formatação de moeda
  - Data de vencimento formatada
  - Status com indicador visual colorido:
    - Verde: Pago
    - Amarelo: Pendente
    - Vermelho: Atrasado
  - Categoria com ícone
- Ações rápidas por item:
  - Marcar como pago (ícone de check)
  - Editar (ícone de lápis)
  - Excluir (ícone de lixeira)

### Resumo Financeiro

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Cards de resumo no topo:
  - Total a pagar (valor pendente)
  - Contas atrasadas (valor e quantidade)
  - Contas para hoje (valor e quantidade)
  - Contas pagas no mês (valor e quantidade)
- Gráfico de distribuição por categoria
- Gráfico de fluxo de pagamentos

### Formulário de Conta

#### Versão Atual
- Formulário básico com campos limitados

#### Versão Desejada (Backup)
- Formulário completo com:
  - Descrição
  - Seleção de fornecedor (autocomplete)
  - Valor
  - Data de vencimento com calendário
  - Data de pagamento (opcional)
  - Status com opções visuais
  - Categoria com ícones
  - Campo de observações
  - Anexo de comprovantes
  - Botões de ação (Salvar, Cancelar)

### Modal de Pagamento

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Modal para registrar pagamento:
  - Informações da conta
  - Data de pagamento
  - Valor pago
  - Método de pagamento
  - Campo para comprovante
  - Botões de confirmação

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
  - Por status (Pago, Pendente, Atrasado)
  - Por fornecedor
  - Por categoria
- Campo de pesquisa com funcionalidade de busca em tempo real

## Implementação

### Alterações Necessárias

1. **Atualizar o Cabeçalho**:
   - Adicionar botões de ação com ícones
   - Implementar filtros de período
   - Adicionar campo de pesquisa

2. **Melhorar Lista de Contas**:
   - Adicionar mais detalhes por item
   - Implementar indicadores visuais de status
   - Adicionar ações rápidas
   - Melhorar formatação de datas e valores

3. **Adicionar Resumo Financeiro**:
   - Implementar cards de resumo
   - Adicionar gráficos de distribuição e fluxo

4. **Aprimorar Formulário de Conta**:
   - Adicionar campos faltantes
   - Implementar seleção de fornecedor
   - Adicionar seleção de categoria com ícones
   - Implementar upload de comprovantes

5. **Criar Modal de Pagamento**:
   - Implementar modal para registro de pagamento

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