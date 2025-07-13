import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function updateCustomersTable() {
  try {
    console.log('🔧 Atualizando tabela customers...');
    
    // Adicionar novos campos para cadastro
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS profissao TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS pais TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS estado TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS cidade TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS grau_instrucao TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS estado_civil TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_nascimento DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS sexo TEXT');

    // Adicionar campos para documentos
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS tipo_documento TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_emissao DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS numero_documento TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_validade DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS orgao_emissor TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS documento_image TEXT');

    // Adicionar campos para renda
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS cnpj_origem_renda TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_admissao DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS cargo TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS renda_bruta DECIMAL(15,2)');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS salario_liquido DECIMAL(15,2)');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS valor_imposto_renda DECIMAL(15,2)');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_comprovacao DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS documento_renda_image TEXT');

    // Adicionar campos para endereço
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS cep TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS rua TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS bairro TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS numero_casa TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS tipo_imovel TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS data_atualizacao_endereco DATE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS endereco_declarado BOOLEAN DEFAULT FALSE');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS endereco_comprovado BOOLEAN DEFAULT FALSE');

    // Adicionar campos para contato
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS telefone_fixo TEXT');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS celular TEXT');

    // Adicionar campos para patrimônio
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS valor_patrimonio DECIMAL(15,2)');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS nao_possui_patrimonio BOOLEAN DEFAULT FALSE');

    // Adicionar campos para status do cadastro
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS status_cadastro TEXT DEFAULT \'Pendente\'');
    await pool.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS responsavel_cadastro TEXT');

    // Criar índices para melhor performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customers_document ON customers(document)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status_cadastro)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_customers_responsavel ON customers(responsavel_cadastro)');

    console.log('✅ Tabela customers atualizada com sucesso!');
    
    // Verificar a estrutura da tabela
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'customers' 
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura atual da tabela customers:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(NULL)' : '(NOT NULL)'} ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar tabela:', error);
  } finally {
    await pool.end();
  }
}

updateCustomersTable(); 