# Sales (Vendas) UI Blueprint

## Visão Geral
Este documento descreve as alterações necessárias no módulo de Vendas para que a interface atual corresponda visualmente à versão anterior (backup).

## Componentes Visuais

### Cabeçalho

#### Versão Atual
- Título simples "Vendas"
- Sem botões de ação no cabeçalho

#### Versão Desejada (Backup)
- Título "Vendas" com estilo mais proeminente
- Botão "Nova Venda" com ícone de adição
- Botão de importação de dados
- Filtros e pesquisa no cabeçalho

### Lista de Vendas

#### Versão Atual
- Lista simples com informações básicas
- Sem ações por item
- Sem indicadores visuais de status

#### Versão Desejada (Backup)
- Lista mais detalhada com:
  - Nome do cliente com destaque
  - Data da venda formatada
  - Valor total com formatação de moeda
  - Status com indicador visual (cores diferentes)
  - Método de pagamento
  - Número de itens
- Ações rápidas por item:
  - Visualizar (ícone de olho)
  - Editar (ícone de lápis)
  - Excluir (ícone de lixeira)

### Formulário de Venda

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Modal completo com:
  - Seleção de cliente (autocomplete)
  - Data da venda
  - Método de pagamento
  - Status
  - Adição de produtos:
    - Seleção de produto
    - Quantidade
    - Preço unitário
    - Desconto
    - Subtotal
  - Cálculo automático de totais
  - Botões de ação (Salvar, Cancelar)

### Modal de Visualização

#### Versão Atual
- Inexistente

#### Versão Desejada (Backup)
- Modal detalhado com:
  - Informações completas da venda
  - Lista de produtos
  - Informações de pagamento
  - Status com indicador visual
  - Histórico de alterações (se disponível)

### Modal de Confirmação de Exclusão

#### Versão Atual
- Inexistente ou padrão do sistema

#### Versão Desejada (Backup)
- Modal personalizado com:
  - Mensagem de confirmação
  - Detalhes da venda a ser excluída
  - Botões de confirmação e cancelamento

## Animações e Interatividade

#### Versão Atual
- Sem animações
- Interatividade básica

#### Versão Desejada (Backup)
- Animações de entrada/saída com framer-motion
- Transições suaves entre estados
- Feedback visual para interações
- Animações para modais

## Filtros e Pesquisa

#### Versão Atual
- Inexistentes ou básicos

#### Versão Desejada (Backup)
- Filtros avançados:
  - Por período
  - Por cliente
  - Por status
  - Por método de pagamento
- Campo de pesquisa com funcionalidade de busca em tempo real

## Implementação

### Alterações Necessárias

1. **Atualizar o Cabeçalho**:
   - Adicionar botões de ação
   - Implementar filtros e pesquisa

2. **Melhorar Lista de Vendas**:
   - Adicionar mais detalhes por item
   - Implementar ações rápidas
   - Adicionar indicadores visuais de status

3. **Implementar Formulário de Venda**:
   - Criar modal completo
   - Implementar seleção de produtos
   - Adicionar cálculos automáticos

4. **Criar Modal de Visualização**:
   - Implementar visualização detalhada
   - Adicionar formatação adequada

5. **Criar Modal de Confirmação**:
   - Implementar modal personalizado

6. **Implementar Animações**:
   - Adicionar framer-motion
   - Implementar animações de entrada/saída
   - Adicionar transições entre estados

### Dependências

- Framer Motion: Para animações
- Lucide React: Para ícones
- React Hook Form: Para formulários

### Observações

- Manter a estrutura de componentes atual
- Focar apenas nas alterações visuais
- Preservar a funcionalidade existente