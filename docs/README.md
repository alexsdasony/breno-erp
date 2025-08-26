# UI Blueprints - Documentação

## Visão Geral

Esta pasta contém blueprints (plantas) detalhadas para a implementação visual dos módulos do sistema, com o objetivo de fazer com que a interface atual corresponda visualmente à versão anterior (backup).

## Propósito

Estes documentos servem como guia de referência para desenvolvedores que estão trabalhando na adaptação da nova arquitetura de componentes para manter a aparência visual da versão anterior. Cada arquivo detalha as diferenças entre a versão atual e a desejada, bem como as alterações necessárias para alcançar a consistência visual.

## Arquivos Disponíveis

### Diretrizes Gerais

- **[UI-GENERAL-GUIDELINES.md](./UI-GENERAL-GUIDELINES.md)**: Princípios de design e diretrizes visuais que se aplicam a todos os módulos. Este documento deve ser consultado primeiro para entender a abordagem geral.

### Módulos Específicos

- **[UI-DASHBOARD.md](./UI-DASHBOARD.md)**: Blueprint para o módulo de Dashboard
- **[UI-SALES.md](./UI-SALES.md)**: Blueprint para o módulo de Vendas
- **[UI-CUSTOMERS.md](./UI-CUSTOMERS.md)**: Blueprint para o módulo de Clientes
- **[UI-ACCOUNTS-PAYABLE.md](./UI-ACCOUNTS-PAYABLE.md)**: Blueprint para o módulo de Contas a Pagar
- **[UI-BILLING.md](./UI-BILLING.md)**: Blueprint para o módulo de Faturamento

## Como Usar

1. Comece lendo o documento de **Diretrizes Gerais** para entender os princípios de design e a abordagem geral.

2. Para cada módulo que você estiver trabalhando, consulte o blueprint específico desse módulo.

3. Compare a implementação atual com as especificações do blueprint:
   - Verifique o cabeçalho e os botões de ação
   - Analise a estrutura e o estilo dos componentes principais
   - Identifique elementos visuais faltantes ou diferentes

4. Implemente as alterações necessárias seguindo as diretrizes do blueprint:
   - Mantenha a estrutura de componentes atual
   - Foque apenas nas alterações visuais
   - Preserve a funcionalidade existente

5. Teste as alterações para garantir que a aparência visual corresponda à versão anterior.

## Referências

Os blueprints foram criados com base na análise dos arquivos JSX originais que foram extraídos do commit de 5 dias atrás e armazenados na pasta `backup_modules_jsx`. Esses arquivos servem como referência visual para a implementação.

## Observações

- Estes blueprints focam exclusivamente nas alterações visuais, não em mudanças de funcionalidade.
- A estrutura de componentes atual deve ser mantida, apenas adaptando o visual para corresponder à versão anterior.
- Após a conclusão das alterações visuais, os arquivos de backup podem ser removidos.