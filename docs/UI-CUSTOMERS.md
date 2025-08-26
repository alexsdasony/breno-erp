# Customers (Clientes) UI Blueprint

## Visão Geral
Este documento descreve as alterações necessárias no módulo de Clientes para que a interface atual corresponda visualmente à versão anterior (backup).

## Componentes Visuais

### Cabeçalho

#### Versão Atual
- Título simples "Clientes"
- Botão "Novo Cliente" básico

#### Versão Desejada (Backup)
- Título "Clientes" com estilo mais proeminente
- Botão "Novo Cliente" com ícone de adição (UserPlus)
- Botão de importação de dados
- Filtros e pesquisa no cabeçalho

### Lista de Clientes

#### Versão Atual
- Tabela simples com informações básicas
- Sem ações por item ou com ações limitadas
- Sem indicadores visuais de tipo ou status

#### Versão Desejada (Backup)
- Lista mais detalhada com:
  - Nome do cliente com destaque
  - Tipo de pessoa (PF/PJ) com ícone (User/Building)
  - Documento (CPF/CNPJ) formatado
  - Contato (telefone e email) com ícones
  - Endereço com ícone de localização
  - Status com indicador visual (cores diferentes)
- Ações rápidas por item:
  - Visualizar (ícone de olho)
  - Editar (ícone de lápis)
  - Excluir (ícone de lixeira)

### Modal de Visualização

#### Versão Atual
- Inexistente ou muito básico

#### Versão Desejada (Backup)
- Modal detalhado com:
  - Informações completas do cliente
  - Dados de contato
  - Endereço completo
  - Histórico de compras (se disponível)
  - Status com indicador visual
  - Botões para editar ou excluir

### Formulário de Cliente

#### Versão Atual
- Formulário básico com campos limitados
- Sem validação visual adequada

#### Versão Desejada (Backup)
- Formulário completo com:
  - Seleção de tipo de pessoa (PF/PJ)
  - Campos adaptados ao tipo selecionado
  - Validação visual em tempo real
  - Formatação automática de campos (CPF, CNPJ, telefone)
  - Campos de endereço completos
  - Seleção de segmento
  - Status com opções visuais

### Modal de Confirmação de Exclusão

#### Versão Atual
- Inexistente ou padrão do sistema

#### Versão Desejada (Backup)
- Modal personalizado com:
  - Mensagem de confirmação
  - Detalhes do cliente a ser excluído
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
  - Por tipo de pessoa
  - Por segmento
  - Por status
  - Por localização
- Campo de pesquisa com funcionalidade de busca em tempo real

## Implementação

### Alterações Necessárias

1. **Atualizar o Cabeçalho**:
   - Adicionar ícones aos botões
   - Implementar filtros e pesquisa

2. **Melhorar Lista de Clientes**:
   - Adicionar mais detalhes por item
   - Implementar ícones para cada tipo de informação
   - Adicionar ações rápidas
   - Adicionar indicadores visuais de tipo e status

3. **Criar Modal de Visualização**:
   - Implementar visualização detalhada
   - Adicionar formatação adequada
   - Incluir histórico de compras

4. **Aprimorar Formulário de Cliente**:
   - Adicionar campos faltantes
   - Implementar validação visual
   - Adicionar formatação automática

5. **Criar Modal de Confirmação**:
   - Implementar modal personalizado

6. **Implementar Animações**:
   - Adicionar framer-motion
   - Implementar animações de entrada/saída
   - Adicionar transições entre estados

### Dependências

- Framer Motion: Para animações
- Lucide React: Para ícones
- React Hook Form: Para formulários e validação

### Observações

- Manter a estrutura de componentes atual
- Focar apenas nas alterações visuais
- Preservar a funcionalidade existente