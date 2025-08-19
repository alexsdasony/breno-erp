# Hooks Refatorados

Esta pasta contém os hooks refatorados do sistema, divididos em responsabilidades específicas para melhorar a manutenibilidade e organização do código.

## Estrutura

### Hooks Principais

- **`useAppDataRefactored.jsx`** - Hook principal que combina todos os outros hooks
- **`useAuth.jsx`** - Autenticação e gerenciamento de usuários

### Hooks por Domínio

#### Operações CRUD
- **`useTransactions.js`** - Operações de transações
- **`useProducts.js`** - Operações de produtos
- **`usePartners.js`** - Operações de parceiros (clientes e fornecedores)
- **`useSegments.js`** - Operações de segmentos
- **`useFinancial.js`** - Operações financeiras (vendas, cobranças, documentos)
- **`useDocuments.js`** - Operações de documentos (NFe, etc.)
- **`useCostCenters.js`** - Operações de centros de custo e contas a pagar
- **`useAdmin.js`** - Operações administrativas (usuários, integrações, importação)

#### Carregamento de Dados
- **`useDataLoader.js`** - Funções para carregar dados da API
- **`useMetrics.js`** - Funções para calcular métricas

#### Hook Combinado
- **`useCrudRefactored.js`** - Combina todos os hooks de operações CRUD

## Benefícios da Refatoração

1. **Separação de Responsabilidades**: Cada hook tem uma responsabilidade específica
2. **Manutenibilidade**: Código mais fácil de manter e debugar
3. **Reutilização**: Hooks podem ser usados independentemente
4. **Testabilidade**: Mais fácil de testar hooks menores
5. **Performance**: Melhor controle sobre re-renderizações

## Como Usar

### Hook Principal (Recomendado)
```javascript
import { useAppDataRefactored } from '@/hooks/useAppDataRefactored';

const MyComponent = () => {
  const { 
    data, 
    addSegment, 
    deleteSegment, 
    loadPartners,
    // ... outras funções
  } = useAppDataRefactored();
  
  // Use as funções conforme necessário
};
```

### Hooks Específicos
```javascript
import { useSegments } from '@/hooks/useSegments';
import { usePartners } from '@/hooks/usePartners';

const MyComponent = () => {
  const { addSegment, deleteSegment } = useSegments();
  const { addPartner, deletePartner } = usePartners();
  
  // Use apenas as funções necessárias
};
```

## Migração

Para migrar do sistema antigo:

1. Substitua `useAppData` por `useAppDataRefactored`
2. Substitua `useCrud` por `useCrudRefactored` ou use hooks específicos
3. Atualize as importações nos componentes

## Hooks Legados

Os hooks antigos (`useAppData.jsx` e `useCrud.jsx`) ainda estão disponíveis para compatibilidade, mas é recomendado migrar para a nova estrutura.
