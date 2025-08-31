# Blueprint: Tela de Cadastro de Clientes - Refatoração

## Análise do Módulo Legado (CustomersModule.jsx)

### Estrutura Original
O módulo legado possuía uma estrutura simples com:
- Lista de clientes em tabela
- Modal de visualização de detalhes
- Modal de confirmação de exclusão
- Navegação para formulário de cadastro/edição
- KPIs básicos (total, ativos, valor total)

### Estrutura Atual do Formulário
O formulário atual já possui uma estrutura avançada com abas:

#### Abas Existentes:
1. **Dados Pessoais** (`dados-pessoais`)
   - Segmento, Nome, Tipo Pessoa, CPF/CNPJ, RG, Data Nascimento, Estado Civil, Profissão

2. **Dados Profissionais** (`dados-profissionais`)
   - Empresa, Cargo, Data Admissão, Telefone Comercial

3. **Contato** (`contato`)
   - E-mail, Telefone Residencial, Celular

4. **Endereço** (`endereco`)
   - Endereço completo, Número, Complemento, Bairro, Cidade, Estado, CEP, Tipo Imóvel

5. **Patrimônio** (`patrimonio`)
   - Possui Patrimônio (checkbox), Valor, Descrição

6. **Sistema** (`sistema`)
   - Status, Data Cadastro, Responsável, Observações

## Análise do Schema Atual

### Tabela `partners`
Todos os campos necessários já existem:
- ✅ Campos básicos: id, name, tax_id, email, phone, address, city, state, zip_code
- ✅ Campos específicos: tipo_pessoa, rg, data_nascimento, estado_civil, profissao
- ✅ Campos profissionais: empresa, cargo, data_admissao, telefone_comercial, celular
- ✅ Campos endereço: numero, complemento, bairro, tipo_imovel
- ✅ Campos patrimônio: possui_patrimonio, valor_patrimonio, descricao_patrimonio
- ✅ Campos sistema: status, responsavel_cadastro, data_cadastro, observacoes
- ✅ Soft delete: deleted_at, is_deleted

### Tabela `partner_roles`
- ✅ Já existe para definir roles (customer, supplier, employee)

### Tabela `partner_documents`
- ✅ Já existe para anexar documentos aos parceiros

## Melhorias Necessárias

### 1. Adicionar Aba de Documentos
Criar uma nova aba para upload e gerenciamento de documentos:
- Upload de múltiplos arquivos
- Visualização de documentos anexados
- Categorização por tipo de documento
- Status dos documentos

### 2. Melhorar Validações
- Validação de CPF/CNPJ
- Validação de CEP com busca automática
- Validação de e-mail
- Campos obrigatórios por tipo de pessoa

### 3. Integração com APIs Externas
- Consulta CEP (ViaCEP)
- Validação CPF/CNPJ (Receita Federal)

### 4. Histórico de Alterações
- Log de mudanças no cadastro
- Auditoria de campos alterados

## Estrutura de Arquivos Refatorada

```
app/(admin)/customers/
├── page.tsx                           # Página principal (lista)
├── _components/
│   ├── CustomersView.tsx             # Lista de clientes (atual)
│   ├── CustomerForm/
│   │   ├── index.tsx                 # Formulário principal
│   │   ├── PersonalDataTab.tsx       # Aba dados pessoais
│   │   ├── ProfessionalDataTab.tsx   # Aba dados profissionais
│   │   ├── ContactTab.tsx            # Aba contato
│   │   ├── AddressTab.tsx            # Aba endereço
│   │   ├── AssetsTab.tsx             # Aba patrimônio
│   │   ├── DocumentsTab.tsx          # Aba documentos (NOVA)
│   │   ├── SystemTab.tsx             # Aba sistema
│   │   └── types.ts                  # Tipos específicos do formulário
│   └── CustomerDetails.tsx           # Modal de detalhes
├── _hooks/
│   ├── useCustomers.ts               # Hook para operações de clientes
│   ├── useCustomerForm.ts            # Hook para formulário
│   └── useCustomerDocuments.ts       # Hook para documentos (NOVO)
└── [id]/
    └── page.tsx                      # Página de edição
```

## Campos Adicionais Necessários

Todos os campos já existem no schema atual da tabela `partners`. Não é necessário criar migrations adicionais.

## Funcionalidades a Implementar

### 1. Upload de Documentos
- Integração com Supabase Storage
- Tipos de documento: RG, CPF, Comprovante Residência, etc.
- Preview de imagens/PDFs
- Download de documentos

### 2. Validações Avançadas
- Máscara para CPF/CNPJ
- Validação de CEP
- Validação de telefone
- Campos condicionais baseados no tipo de pessoa

### 3. Integração com APIs
- ViaCEP para busca automática de endereço
- Receita Federal para validação de CNPJ

### 4. Melhorias de UX
- Salvamento automático (draft)
- Indicador de progresso do preenchimento
- Validação em tempo real
- Navegação entre abas com validação

## Comandos para Deploy

```bash
# Não são necessárias migrations adicionais - schema já está completo

# Deploy das Edge Functions (se houver alterações)
npx supabase functions deploy customers --password "$SUPABASE_PASSWORD"
npx supabase functions deploy partners --password "$SUPABASE_PASSWORD"

# Validação TypeScript
npx tsc --noEmit

# Commit das alterações
git add .
git commit -m "feat: refatora formulário de clientes com estrutura de abas avançada"
git push
```

## Próximos Passos

1. ✅ Analisar estrutura legada
2. ✅ Verificar schema atual
3. ✅ Criar blueprint
4. 🔄 Refatorar componentes do formulário
5. 🔄 Implementar aba de documentos
6. 🔄 Adicionar validações avançadas
7. 🔄 Integrar APIs externas
8. 🔄 Testes e ajustes finais