# UI General Guidelines

## Visão Geral
Este documento descreve os princípios gerais de design e as diretrizes visuais que devem ser aplicados em todos os módulos para garantir consistência com a versão anterior (backup).

## Princípios de Design

### Estética Visual

#### Versão Atual
- Design minimalista e simples
- Poucos elementos visuais
- Cores básicas e pouco variadas

#### Versão Desejada (Backup)
- Design mais rico e detalhado
- Elementos visuais mais elaborados
- Esquema de cores mais vibrante e diversificado
- Ícones consistentes em todo o sistema

### Tipografia

#### Versão Atual
- Tamanhos de fonte padrão
- Pouca variação de peso e estilo

#### Versão Desejada (Backup)
- Hierarquia tipográfica mais clara:
  - Títulos maiores e mais destacados (text-3xl)
  - Subtítulos com peso médio
  - Texto de conteúdo com tamanho adequado para leitura
  - Informações secundárias em tamanho menor
- Uso de pesos diferentes para criar contraste

### Cores

#### Versão Atual
- Paleta de cores limitada
- Pouco uso de cores para indicar estados

#### Versão Desejada (Backup)
- Paleta de cores mais rica:
  - Cor primária: Azul (#3B82F6)
  - Cor secundária: Verde (#10B981)
  - Cor de alerta: Amarelo (#FBBF24)
  - Cor de erro: Vermelho (#EF4444)
  - Cor de sucesso: Verde (#34D399)
  - Cores neutras para fundos e textos
- Uso consistente de cores para indicar estados e categorias

### Espaçamento e Layout

#### Versão Atual
- Espaçamento básico e uniforme
- Layout simples e direto

#### Versão Desejada (Backup)
- Espaçamento mais refinado:
  - Maior espaço entre seções
  - Padding consistente em cards e containers
  - Margens adequadas para melhor legibilidade
- Layout mais estruturado:
  - Uso de grids para organizar conteúdo
  - Alinhamento consistente de elementos
  - Agrupamento lógico de informações relacionadas

## Componentes Comuns

### Botões

#### Versão Atual
- Botões simples com pouca diferenciação
- Sem ícones ou com ícones básicos

#### Versão Desejada (Backup)
- Hierarquia clara de botões:
  - Botão primário: Preenchido com cor primária
  - Botão secundário: Contorno com cor primária
  - Botão de ação destrutiva: Vermelho
  - Botão de texto: Sem fundo, apenas texto colorido
- Todos os botões com ícones relevantes
- Estados de hover e focus bem definidos
- Animações suaves em interações

### Cards

#### Versão Atual
- Cards simples com pouca profundidade visual

#### Versão Desejada (Backup)
- Cards com mais profundidade visual:
  - Sombras sutis
  - Bordas arredondadas
  - Padding interno adequado
- Elementos internos bem organizados
- Estados de hover para cards interativos
- Animações de entrada e saída

### Tabelas e Listas

#### Versão Atual
- Tabelas e listas básicas
- Pouca diferenciação entre itens

#### Versão Desejada (Backup)
- Tabelas e listas mais elaboradas:
  - Cabeçalhos destacados
  - Linhas alternadas para melhor legibilidade
  - Bordas sutis entre itens
  - Ícones para diferentes tipos de informação
  - Indicadores visuais de status
- Estados de hover para itens interativos
- Animações de entrada e saída

### Formulários

#### Versão Atual
- Campos de formulário básicos
- Pouca validação visual

#### Versão Desejada (Backup)
- Campos de formulário mais elaborados:
  - Labels claros e consistentes
  - Placeholders informativos
  - Bordas e preenchimento adequados
  - Estados de focus bem definidos
- Validação visual em tempo real:
  - Indicadores de erro em vermelho
  - Mensagens de erro específicas
  - Indicadores de sucesso em verde
- Animações suaves em transições de estado

### Modais

#### Versão Atual
- Modais simples ou padrão do sistema

#### Versão Desejada (Backup)
- Modais mais elaborados:
  - Cabeçalho destacado
  - Conteúdo bem organizado
  - Botões de ação claros
  - Overlay com opacidade adequada
- Animações de entrada e saída
- Transições suaves entre estados

## Animações e Interatividade

### Animações

#### Versão Atual
- Poucas ou nenhuma animação

#### Versão Desejada (Backup)
- Animações sutis e significativas:
  - Animações de entrada e saída de elementos
  - Transições suaves entre estados
  - Efeitos de hover e focus
  - Animações de carregamento
- Uso de framer-motion para implementação

### Feedback Visual

#### Versão Atual
- Feedback visual limitado

#### Versão Desejada (Backup)
- Feedback visual rico:
  - Indicadores de carregamento
  - Mensagens de sucesso e erro
  - Toasts para notificações
  - Indicadores de progresso
- Animações para reforçar o feedback

## Responsividade

#### Versão Atual
- Responsividade básica

#### Versão Desejada (Backup)
- Responsividade refinada:
  - Layout adaptativo para diferentes tamanhos de tela
  - Reorganização de elementos em telas menores
  - Ajuste de tamanho de fonte e espaçamento
  - Comportamento adequado de modais e menus

## Implementação

### Bibliotecas e Ferramentas

- **Framer Motion**: Para todas as animações
- **Lucide React**: Para ícones consistentes
- **Tailwind CSS**: Para estilização consistente
- **React Hook Form**: Para formulários
- **Recharts**: Para gráficos e visualizações

### Abordagem de Implementação

1. **Criar Componentes Base**:
   - Botões
   - Cards
   - Inputs
   - Modais
   - Tabelas

2. **Aplicar Estilos Consistentes**:
   - Definir classes Tailwind reutilizáveis
   - Criar variáveis para cores e espaçamentos

3. **Implementar Animações**:
   - Definir animações padrão para entrada/saída
   - Criar transições para estados

4. **Aplicar em Módulos**:
   - Atualizar cada módulo usando os componentes base
   - Garantir consistência visual entre módulos

### Observações

- Manter a estrutura de componentes atual
- Focar apenas nas alterações visuais
- Preservar a funcionalidade existente
- Garantir que todas as alterações sejam consistentes entre os módulos