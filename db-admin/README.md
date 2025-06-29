# 🐘 Horizons DB Viewer

Interface web simples para visualização do banco PostgreSQL do projeto Horizons.

## 🚀 Como usar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor:**
   ```bash
   npm start
   ```

3. **Acessar a interface:**
   ```
   http://localhost:3002
   ```

## 📋 Funcionalidades

- ✅ Visualizar lista de tabelas
- ✅ Navegar pelos dados das tabelas (com paginação)
- ✅ **NOVO:** Ver estrutura completa das tabelas (colunas, tipos, etc.)
- ✅ **NOVO:** Adicionar novos registros
- ✅ **NOVO:** Editar registros existentes
- ✅ **NOVO:** Excluir registros
- ✅ Executar consultas SQL SELECT personalizadas
- ✅ Ver informações gerais do banco
- ✅ Interface responsiva e moderna

## 🔧 Configuração

As credenciais do PostgreSQL estão no arquivo `config.js`:
- **Host:** dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com
- **Database:** breno_erp
- **User:** breno_erp_user
- **Port:** 5432

## 🛡️ Segurança

- Apenas consultas SELECT são permitidas
- Validação de nomes de tabelas para evitar SQL injection
- Limitação de registros por página

## 📊 Preview

A interface possui 4 abas principais:
1. **Tabelas** - Lista, visualização e CRUD de dados
2. **Estrutura** - Visualização da estrutura das tabelas
3. **Consulta SQL** - Executor de queries personalizadas
4. **Informações** - Dados gerais do banco

### 🔧 Funcionalidades CRUD
- **Adicionar:** Botão "+" em cada tabela para novos registros
- **Editar:** Botão "Editar" em cada linha
- **Excluir:** Botão "Excluir" com confirmação
- **Formulários dinâmicos:** Baseados na estrutura da tabela 