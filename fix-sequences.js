import { Pool } from 'pg';

// Configuração do banco de dados
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'breno_erp',
  user: 'postgres',
  password: 'postgres'
});

async function fixSequences() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Corrigindo sequências das tabelas...');
    
    // Corrigir sequência de cost_centers
    const costCentersMax = await client.query('SELECT MAX(id) as max_id FROM cost_centers');
    if (costCentersMax.rows[0].max_id) {
      await client.query(`ALTER SEQUENCE cost_centers_id_seq RESTART WITH ${costCentersMax.rows[0].max_id + 1}`);
      console.log(`✅ Sequência cost_centers_id_seq corrigida para: ${costCentersMax.rows[0].max_id + 1}`);
    }
    
    // Verificar se as tabelas de contas contábeis existem
    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chart_of_accounts', 'cost_center_accounts')
    `);
    
    if (tablesCheck.rows.length === 0) {
      console.log('📋 Criando tabelas de contas contábeis...');
      
      // Criar tabela chart_of_accounts
      await client.query(`
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
          id SERIAL PRIMARY KEY,
          account_code VARCHAR(20) UNIQUE NOT NULL,
          account_name VARCHAR(255) NOT NULL,
          account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
          account_category VARCHAR(100) NOT NULL,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          parent_account_id INTEGER REFERENCES chart_of_accounts(id),
          segment_id INTEGER REFERENCES segments(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Criar tabela cost_center_accounts
      await client.query(`
        CREATE TABLE IF NOT EXISTS cost_center_accounts (
          id SERIAL PRIMARY KEY,
          cost_center_id INTEGER NOT NULL REFERENCES cost_centers(id) ON DELETE CASCADE,
          account_id INTEGER NOT NULL REFERENCES chart_of_accounts(id) ON DELETE CASCADE,
          allocation_percentage DECIMAL(5,2) DEFAULT 100.00,
          is_primary BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(cost_center_id, account_id)
        )
      `);
      
      // Criar índices
      await client.query('CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(account_code)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(account_type)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_segment ON chart_of_accounts(segment_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_cost_center_accounts_cost_center ON cost_center_accounts(cost_center_id)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_cost_center_accounts_account ON cost_center_accounts(account_id)');
      
      console.log('✅ Tabelas de contas contábeis criadas');
      
      // Inserir contas padrão
      console.log('📊 Inserindo contas contábeis padrão...');
      await client.query(`
        INSERT INTO chart_of_accounts (account_code, account_name, account_type, account_category, description) VALUES
        ('1', 'ATIVO', 'asset', 'Ativo', 'Contas do Ativo'),
        ('1.1', 'ATIVO CIRCULANTE', 'asset', 'Ativo Circulante', 'Ativos que se convertem em dinheiro em até 12 meses'),
        ('1.1.1', 'DISPONÍVEL', 'asset', 'Disponível', 'Caixa e equivalentes'),
        ('1.1.1.01', 'CAIXA', 'asset', 'Caixa', 'Dinheiro em caixa'),
        ('1.1.1.02', 'BANCOS CONTA MOVIMENTO', 'asset', 'Bancos', 'Contas bancárias'),
        ('1.1.2', 'CRÉDITOS', 'asset', 'Créditos', 'Direitos a receber'),
        ('1.1.2.01', 'CLIENTES', 'asset', 'Clientes', 'Contas a receber de clientes'),
        ('2', 'PASSIVO', 'liability', 'Passivo', 'Contas do Passivo'),
        ('2.1', 'PASSIVO CIRCULANTE', 'liability', 'Passivo Circulante', 'Obrigações que vencem em até 12 meses'),
        ('2.1.1', 'FORNECEDORES', 'liability', 'Fornecedores', 'Contas a pagar a fornecedores'),
        ('2.1.2', 'OBRIGAÇÕES TRABALHISTAS', 'liability', 'Obrigações Trabalhistas', 'Salários e encargos sociais'),
        ('2.1.3', 'OBRIGAÇÕES FISCAIS', 'liability', 'Obrigações Fiscais', 'Impostos e contribuições'),
        ('2.1.3.01', 'ICMS A RECOLHER', 'liability', 'ICMS', 'ICMS a recolher'),
        ('2.1.3.02', 'PIS A RECOLHER', 'liability', 'PIS', 'PIS a recolher'),
        ('2.1.3.03', 'COFINS A RECOLHER', 'liability', 'COFINS', 'COFINS a recolher'),
        ('3', 'PATRIMÔNIO LÍQUIDO', 'equity', 'Patrimônio Líquido', 'Capital próprio'),
        ('3.1', 'CAPITAL SOCIAL', 'equity', 'Capital Social', 'Capital social da empresa'),
        ('4', 'RECEITAS', 'revenue', 'Receitas', 'Receitas operacionais'),
        ('4.1', 'RECEITA DE VENDAS', 'revenue', 'Receita de Vendas', 'Receita bruta de vendas'),
        ('4.1.1', 'VENDAS DE MERCADORIAS', 'revenue', 'Vendas', 'Receita de vendas de produtos'),
        ('5', 'CUSTOS E DESPESAS', 'expense', 'Custos e Despesas', 'Custos e despesas operacionais'),
        ('5.1', 'CUSTO DAS MERCADORIAS VENDIDAS', 'expense', 'CMV', 'Custo das mercadorias vendidas'),
        ('5.2', 'DESPESAS OPERACIONAIS', 'expense', 'Despesas Operacionais', 'Despesas administrativas e comerciais'),
        ('5.2.1', 'DESPESAS ADMINISTRATIVAS', 'expense', 'Despesas Administrativas', 'Despesas administrativas'),
        ('5.2.1.01', 'DESPESAS COM PESSOAL', 'expense', 'Despesas com Pessoal', 'Salários e encargos'),
        ('5.2.1.02', 'DESPESAS COM ALUGUEL', 'expense', 'Aluguel', 'Despesas com locação'),
        ('5.2.1.03', 'DESPESAS COM ENERGIA ELÉTRICA', 'expense', 'Energia Elétrica', 'Despesas com energia'),
        ('5.2.1.04', 'DESPESAS COM ÁGUA', 'expense', 'Água', 'Despesas com água'),
        ('5.2.1.05', 'DESPESAS COM TELEFONE', 'expense', 'Telefone', 'Despesas com telefonia'),
        ('5.2.1.06', 'DESPESAS COM INTERNET', 'expense', 'Internet', 'Despesas com internet'),
        ('5.2.1.07', 'DESPESAS COM MATERIAL DE ESCRITÓRIO', 'expense', 'Material de Escritório', 'Material de consumo'),
        ('5.2.1.08', 'DESPESAS COM LIMPEZA', 'expense', 'Limpeza', 'Despesas com limpeza'),
        ('5.2.1.09', 'DESPESAS COM SEGUROS', 'expense', 'Seguros', 'Despesas com seguros'),
        ('5.2.1.10', 'DESPESAS COM MANUTENÇÃO', 'expense', 'Manutenção', 'Despesas com manutenção'),
        ('5.2.2', 'DESPESAS COMERCIAS', 'expense', 'Despesas Comerciais', 'Despesas de vendas e marketing'),
        ('5.2.2.01', 'DESPESAS COM PROPAGANDA', 'expense', 'Propaganda', 'Despesas com publicidade'),
        ('5.2.2.02', 'DESPESAS COM COMISSÕES', 'expense', 'Comissões', 'Comissões sobre vendas'),
        ('5.2.2.03', 'DESPESAS COM FRETES', 'expense', 'Fretes', 'Despesas com transporte'),
        ('5.2.3', 'DESPESAS FINANCEIRAS', 'expense', 'Despesas Financeiras', 'Despesas financeiras'),
        ('5.2.3.01', 'JUROS E ENCARGOS FINANCEIROS', 'expense', 'Juros', 'Juros e encargos financeiros'),
        ('5.2.3.02', 'DESPESAS BANCÁRIAS', 'expense', 'Despesas Bancárias', 'Taxas e tarifas bancárias')
      `);
      
      console.log('✅ Contas contábeis padrão inseridas');
    } else {
      console.log('✅ Tabelas de contas contábeis já existem');
    }
    
    console.log('🎉 Sequências corrigidas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir sequências:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  fixSequences()
    .then(() => {
      console.log('🎉 Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no processo:', error);
      process.exit(1);
    });
}

export { fixSequences }; 