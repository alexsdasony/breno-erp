# Arquitetura de Context API - Breno ERP

## Visão Geral

Esta documentação descreve a nova arquitetura modular de Context API implementada no Breno ERP, seguindo as melhores práticas do Next.js 13+ com App Router.

## Provedor Global

A aplicação agora utiliza um único provedor global que consolida autenticação, segmentos e dados: `AppDataProvider` em `app/providers.tsx`, que envolve toda a App Router tree.

## Hook Combinado

### useAppData (`src/hooks/useAppData.tsx`)
**Responsabilidade**: Única fonte de verdade para Auth + Segmentos + Dados

**Retorna**:
```typescript
{
  // Auth
  currentUser,
  authLoading,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  changeUserPassword,

  // Segments
  segments,
  activeSegmentId,
  setActiveSegmentId,

  // Data
  data,
  loading,
  metrics,
  refreshData,
  reloadDashboardData,

  // Password reset
  requestPasswordReset,
  resetPassword
}
```

## Como Usar

### 1. Em um Módulo
```tsx
import { useAppData } from '@/hooks/useAppData';

const MyModule = () => {
  const { 
    data,
    activeSegmentId,
    segments,
    reloadDashboardData
  } = useAppData();
  
  // Usar os dados...
};
```

### 2. Apenas Autenticação
```tsx
import { useAppData } from '@/hooks/useAppData';

const LoginComponent = () => {
  const { loginUser, authLoading } = useAppData();
  
  // Usar autenticação...
};
```

### 3. Apenas Segmentos
```tsx
import { useAppData } from '@/hooks/useAppData';

const SegmentsComponent = () => {
  const { segments, setActiveSegmentId } = useAppData();
  
  // Usar segmentos...
};
```

## Benefícios da Nova Arquitetura

### 1. **Modularidade**
- Cada contexto tem responsabilidade específica
- Fácil manutenção e teste
- Separação clara de concerns

### 2. **Performance**
- Contextos isolados evitam re-renders desnecessários
- Carregamento lazy de dados
- Cache inteligente por módulo

### 3. **Escalabilidade**
- Fácil adicionar novos contextos
- Reutilização de lógica
- Padrão consistente

### 4. **TypeScript**
- Tipagem forte em todos os contextos
- IntelliSense completo
- Detecção de erros em tempo de compilação

### 5. **Next.js 13+**
- Compatível com App Router
- Server Components friendly
- Otimizações automáticas

## Migração de Módulos

### Antes (useApp)
```tsx
const { data, activeSegmentId, refreshData, metrics } = useApp();
```

### Depois (useAppData)
```tsx
const { data, activeSegmentId, reloadDashboardData, metrics } = useAppData();
```

## Estrutura de Arquivos

```
src/
├── hooks/
│   └── useAppData.tsx
└── app/
    └── providers.tsx  // Exporta AppDataProvider para o App Router
```

## Próximos Passos

1. **Migrar todos os módulos** para usar o novo contexto
2. **Implementar cache** mais sofisticado
3. **Adicionar testes** para cada contexto
4. **Otimizar performance** com React.memo e useMemo
5. **Implementar error boundaries** específicos

## Exemplo de Implementação Completa

```tsx
// Módulo de Produtos (exemplo)
import { useAppData } from '@/hooks/useAppData';

const ProductsModule = () => {
  const {
    data,
    activeSegmentId,
    segments,
    reloadDashboardData
  } = useAppData();
  
  const handleCreateProduct = async (productData) => {
    // Criar produto
    await createProduct(productData);
    
    // Atualizar dados do dashboard/segmento atual
    await reloadDashboardData(activeSegmentId);
  };
  
  return (
    <div>
      <h1>Produtos</h1>
      {/* Renderizar produtos */}
    </div>
  );
};
```

Esta arquitetura fornece uma base sólida e escalável para o crescimento do sistema Breno ERP.
