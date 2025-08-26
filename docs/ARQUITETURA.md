# Arquitetura do Sistema Breno ERP

## Visão Geral

O Breno ERP é um sistema de gestão empresarial desenvolvido com tecnologias modernas, seguindo uma arquitetura baseada em Next.js com App Router. O sistema é organizado de forma modular, com uma clara separação de responsabilidades entre componentes, hooks e serviços.

## Estrutura de Arquivos

A estrutura de arquivos do projeto segue um padrão organizado por domínio, com uma clara separação entre a camada de interface do usuário e a lógica de negócios:

```
app/
  (admin)/                # Grupo de rotas protegidas por autenticação
    [module]/             # Módulos do sistema (dashboard, sales, customers, etc.)
      _components/         # Componentes específicos do módulo
      _hooks/              # Hooks específicos do módulo
      page.tsx             # Página principal do módulo
  api/                     # Rotas de API (Edge Functions)
  login/                   # Páginas públicas (fora do grupo admin)
  register/
  forgot-password/
  reset-password/

src/
  components/              # Componentes reutilizáveis
    ui/                    # Componentes de UI globais
    layouts/               # Layouts compartilhados
  config/                  # Configurações do sistema
  contexts/                # Contextos React (se houver)
  hooks/                   # Hooks globais
  lib/                     # Utilidades puras
  services/                # Serviços de comunicação com o backend
  styles/                  # Estilos globais
  types/                   # Definições de tipos
  utils/                   # Funções auxiliares
```

## Organização dos Módulos

Cada módulo dentro do diretório `app/(admin)/` segue um padrão consistente:

1. **page.tsx**: Ponto de entrada do módulo, geralmente um componente simples que renderiza o componente principal do módulo.

2. **_components/**: Diretório contendo os componentes específicos do módulo, incluindo o componente principal (geralmente nomeado como `[Module]View.tsx`).

3. **_hooks/**: Diretório contendo os hooks específicos do módulo, que encapsulam a lógica de negócios e a comunicação com os serviços.

Exemplo de um módulo típico (Dashboard):

```
app/(admin)/dashboard/
  _components/
    DashboardView.tsx      # Componente principal do módulo
  _hooks/
    useDashboard.ts        # Hook específico do módulo
  page.tsx                 # Ponto de entrada do módulo
```

## Padrão de Implementação

O sistema segue um padrão de implementação bem definido:

1. **Componente (View)**: Responsável pela interface do usuário, renderização e interação com o usuário.

2. **Hook**: Encapsula a lógica de negócios, gerencia o estado e se comunica com os serviços.

3. **Serviço**: Responsável pela comunicação com o backend, realizando requisições HTTP e processando respostas.

4. **API Service**: Centraliza a comunicação HTTP com o backend, fornecendo métodos para realizar operações CRUD.

Este padrão pode ser resumido como: **Componente → Hook → Serviço → API Service**.

## Contexto Global

O sistema utiliza um contexto global (`AppDataProvider`) para gerenciar o estado compartilhado entre os módulos, incluindo:

- Autenticação e informações do usuário
- Segmentos ativos
- Dados compartilhados entre módulos
- Métricas do dashboard

Este contexto é acessado através do hook `useAppData`, que fornece métodos para interagir com o estado global.

## Interação com o Backend

A comunicação com o backend é centralizada no serviço `apiService` (`src/services/api.ts`), que fornece métodos para realizar requisições HTTP. Este serviço é responsável por:

1. Gerenciar tokens de autenticação
2. Configurar cabeçalhos HTTP
3. Lidar com erros de comunicação
4. Normalizar respostas do backend

Os serviços específicos de cada domínio (como `partnersService`, `productsService`, etc.) utilizam o `apiService` para realizar operações específicas do domínio.

## Fluxo de Dados

O fluxo de dados no sistema segue um padrão unidirecional:

1. O usuário interage com a interface (componente)
2. O componente chama métodos do hook
3. O hook atualiza o estado local e/ou chama métodos do serviço
4. O serviço realiza requisições ao backend através do `apiService`
5. O `apiService` processa a resposta e retorna os dados normalizados
6. O hook atualiza o estado com os dados recebidos
7. O componente é re-renderizado com os novos dados

## Módulos Analisados

Para confirmar o padrão de implementação, foram analisados os seguintes módulos:

1. **Dashboard**: Exibe métricas e gráficos de desempenho do negócio.
2. **Sales**: Gerencia vendas e pedidos.
3. **Customers**: Gerencia clientes e contatos.
4. **Inventory**: Gerencia produtos e estoque.
5. **Accounts Payable**: Gerencia contas a pagar e despesas.

Todos estes módulos seguem o padrão descrito acima, com pequenas variações específicas de cada domínio.

## Módulos com Padrões Diferentes

Alguns módulos apresentam variações no padrão de implementação:

1. **Customers/Suppliers**: Ambos utilizam o mesmo hook (`usePartners`) e serviço (`partnersService`), com diferenciação apenas no parâmetro `role` passado para o serviço.

2. **Billing/Financial**: Estes módulos compartilham alguns serviços e hooks, com variações específicas para cada domínio.

## Conclusão

A arquitetura do Breno ERP segue um padrão bem definido, com clara separação de responsabilidades e organização modular. O sistema utiliza o Next.js App Router para roteamento, com uma estrutura de diretórios organizada por domínio e um fluxo de dados unidirecional.

O padrão de implementação (Componente → Hook → Serviço → API Service) é consistente em todos os módulos analisados, com pequenas variações específicas de cada domínio. O sistema utiliza um contexto global para gerenciar o estado compartilhado entre os módulos, e a comunicação com o backend é centralizada no serviço `apiService`.