# 📋 Como Usar o Horizons DB Viewer

## 🚀 Iniciando

1. **Pela raiz do projeto:**
   ```bash
   ./start-db-viewer.sh
   ```

2. **Ou diretamente:**
   ```bash
   cd db-admin
   npm start
   ```

3. **Acessar:** http://localhost:3002

## 📊 Abas Disponíveis

### 1. 🗂️ Tabelas
- Lista todas as tabelas do banco
- Visualiza dados com paginação (50 registros por página)
- **Adicionar:** Botão verde "+" para novos registros
- **Editar:** Botão amarelo em cada linha
- **Excluir:** Botão vermelho com confirmação

### 2. 🏗️ Estrutura
- Mostra estrutura completa das tabelas
- Tipos de dados, colunas obrigatórias, valores padrão
- Útil para entender o schema antes de inserir dados

### 3. 💻 Consulta SQL
- Execute queries SELECT personalizadas
- Sintaxe completa do PostgreSQL
- **Limitação:** Apenas queries SELECT por segurança

### 4. ℹ️ Informações
- Versão do PostgreSQL
- Tamanho do banco de dados
- Número total de tabelas

## 🔧 Operações CRUD

### ➕ Adicionar Registros
1. Vá para aba "Tabelas"
2. Selecione uma tabela
3. Clique no botão verde "+" 
4. Preencha o formulário (campos obrigatórios marcados com *)
5. Clique "Salvar"

### ✏️ Editar Registros
1. Na visualização da tabela, clique "Editar" na linha desejada
2. Modifique os campos necessários
3. Clique "Salvar"

### 🗑️ Excluir Registros
1. Clique "Excluir" na linha desejada
2. Confirme a ação (não é reversível!)

## 🛡️ Segurança

- Apenas queries SELECT permitidas
- Validação de nomes de tabelas
- Formulários baseados na estrutura real do banco
- Conexão segura via SSL

## 🔍 Dicas de Uso

- **Paginação:** Use os botões "Anterior/Próximo" para navegar
- **Estrutura:** Consulte sempre antes de inserir dados
- **Backup:** Faça backup antes de operações em massa
- **Consultas:** Use LIMIT para evitar sobrecarregar o servidor

## ⚠️ Limitações

- Apenas tabelas do schema 'public'
- Não suporta operações em lote
- Interface apenas em português
- Funciona melhor com tabelas que têm coluna 'id' 