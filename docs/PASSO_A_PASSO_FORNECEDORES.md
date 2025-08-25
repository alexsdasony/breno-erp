# 🚀 Passo a Passo - Sistema de Fornecedores

## 📋 **PASSO 1: Criar a Tabela no Supabase**

### 1.1 Acesse o Supabase SQL Editor
- Vá para: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql
- Faça login se necessário

### 1.2 Execute o Script SQL
- Copie todo o conteúdo do arquivo `create-fornecedores-complete.sql`
- Cole no SQL Editor do Supabase
- Clique em **"Run"** para executar

### 1.3 Verifique se foi criado
- Você deve ver mensagens de sucesso
- A tabela `fornecedores` deve aparecer na lista de tabelas

## 🧪 **PASSO 2: Testar as Funções CRUD**

### 2.1 Execute o script de teste
```bash
node check-and-setup-fornecedores.js
```

### 2.2 Resultado esperado
Você deve ver:
```
✅ Tabela fornecedores existe!
📊 Encontrados 3 fornecedores na tabela
✅ Dados já existem na tabela
Fornecedores encontrados:
- TECNOLOGIA AVANÇADA LTDA
- MATERIAIS CONSTRUÇÃO LTDA
- SERVIÇOS ADMINISTRATIVOS LTDA

🧪 Testando funções CRUD...
1️⃣ Testando LISTAR...
✅ LISTAR OK - 3 fornecedores
2️⃣ Testando CRIAR...
✅ CRIAR OK - ID: [número]
3️⃣ Testando BUSCAR...
✅ BUSCAR OK - TESTE CRUD LTDA
4️⃣ Testando ATUALIZAR...
✅ ATUALIZAR OK - TesteCRUD Atualizado
5️⃣ Testando EXCLUIR...
✅ EXCLUIR OK

🎉 Testes CRUD concluídos!
✅ Todas as funções estão funcionando corretamente!
```

## 🎨 **PASSO 3: Testar a Interface Frontend**

### 3.1 Inicie o servidor de desenvolvimento
```bash
npm run dev
```

### 3.2 Acesse o sistema
- Vá para: http://localhost:3000
- Faça login com: `admin@erppro.com` / `admin123`
- Acesse o menu **"Fornecedores"**

### 3.3 Teste as funcionalidades

#### ✅ **Listagem**
- Verifique se os 3 fornecedores aparecem
- Teste os filtros (Status, UF)
- Teste a busca por texto

#### ✅ **Criação**
- Clique em **"Novo Fornecedor"**
- Preencha todas as abas:
  - **Identificação**: Razão social, CPF/CNPJ
  - **Localização**: Endereço completo
  - **Contato**: Telefones e email
  - **Financeiro**: Dados bancários
  - **Operacional**: Status e observações
- Clique em **"Criar"**

#### ✅ **Edição**
- Clique no ícone de **editar** em um fornecedor
- Modifique dados em diferentes abas
- Clique em **"Atualizar"**

#### ✅ **Exclusão**
- Clique no ícone de **deletar**
- Confirme a exclusão

## 🔧 **PASSO 4: Verificar Integração**

### 4.1 Verifique se os dados são salvos
- Após criar/editar, recarregue a página
- Verifique se os dados persistem

### 4.2 Teste validações
- Tente criar sem CPF/CNPJ (deve dar erro)
- Tente criar com CPF/CNPJ duplicado (deve dar erro)

### 4.3 Teste responsividade
- Redimensione a janela do navegador
- Teste em mobile (F12 > Device Toolbar)

## 📊 **Estrutura da Tabela**

### 🔍 **Identificação**
- `razao_social` (obrigatório)
- `nome_fantasia`
- `ramo_atividade`
- `tipo_contribuinte` (PJ, PF, MEI, Outros)
- `cpf_cnpj` (obrigatório, único)
- `inscricao_estadual`
- `inscricao_municipal`

### 📍 **Localização**
- `uf`, `cidade`, `cep`
- `endereco`, `numero`, `complemento`, `bairro`

### 📞 **Contato**
- `pessoa_contato`
- `telefone_fixo`, `telefone_celular`
- `email`, `site`

### 💰 **Financeiro**
- `banco_nome`, `banco_codigo`
- `agencia_numero`, `agencia_digito`
- `conta_numero`, `conta_digito`
- `pix_chave`, `condicao_pagamento`

### ⚙️ **Operacional**
- `status` (ATIVO/INATIVO)
- `data_cadastro` (automático)
- `observacoes`

## 🛠️ **Solução de Problemas**

### ❌ **Se a tabela não for criada:**
- Verifique se você está no projeto correto do Supabase
- Verifique se o script SQL não tem erros de sintaxe
- Tente executar o script em partes menores

### ❌ **Se as funções CRUD falharem:**
- Verifique se as chaves do Supabase estão corretas
- Verifique se a tabela foi criada corretamente
- Execute novamente o script de teste

### ❌ **Se a interface não carregar:**
- Verifique se o servidor está rodando
- Verifique se não há erros no console do navegador
- Verifique se todas as dependências estão instaladas

## 🎯 **Resultado Final**

Após seguir todos os passos, você terá:

✅ **Backend completo** com tabela e funções CRUD
✅ **Frontend moderno** com interface em abas
✅ **Validações** de campos obrigatórios
✅ **Filtros e busca** funcionando
✅ **Responsividade** para mobile e desktop
✅ **Integração completa** com Supabase

**Sistema pronto para uso em produção!** 🚀

