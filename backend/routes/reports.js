import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

// Configuração do banco PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware para validar parâmetros de data
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      error: 'Data inicial e final são obrigatórias' 
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ 
      error: 'Formato de data inválido' 
    });
  }

  if (start > end) {
    return res.status(400).json({ 
      error: 'Data inicial não pode ser maior que a data final' 
    });
  }

  next();
};

// Gerar DRE baseado em centros de custo e contas contábeis
router.get('/dre', validateDateRange, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      startDate, 
      endDate, 
      costCenterId, 
      accountType, 
      groupBy = 'account_type',
      segmentId 
    } = req.query;

    // Construir condições WHERE
    let whereConditions = [];
    let paramIndex = 1;
    const params = [];

    // Filtro de data
    whereConditions.push(`t.date >= $${paramIndex++} AND t.date <= $${paramIndex++}`);
    params.push(startDate, endDate);

    // Filtro de segmento
    if (segmentId) {
      whereConditions.push(`t.segment_id = $${paramIndex++}`);
      params.push(segmentId);
    }

    // Filtro de centro de custo
    if (costCenterId) {
      whereConditions.push(`t.cost_center = (SELECT name FROM cost_centers WHERE id = $${paramIndex++})`);
      params.push(costCenterId);
    }

    // Filtro de tipo de conta
    if (accountType) {
      whereConditions.push(`coa.account_type = $${paramIndex++}`);
      params.push(accountType);
    }

    const whereClause = whereConditions.join(' AND ');

    // Query principal para buscar transações com contas contábeis e centros de custo
    const mainQuery = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center,
        cc.name as cost_center_name,
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category
      FROM transactions t
      LEFT JOIN cost_centers cc ON t.cost_center = cc.name
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_type
      WHERE ${whereClause}
      ORDER BY t.date DESC, coa.account_code
    `;

    console.log('🔍 Executando query DRE:', mainQuery);
    console.log('📝 Parâmetros:', params);

    const result = await client.query(mainQuery, params);
    const transactions = result.rows;

    console.log('✅ Query executada com sucesso!');
    console.log('📊 Transações encontradas:', transactions.length);

    // Processar dados para DRE
    const dreData = {
      revenues: [],
      expenses: [],
      costCenterAnalysis: [],
      accountAnalysis: [],
      summary: {
        totalRevenues: 0,
        totalExpenses: 0,
        netIncome: 0,
        margin: 0
      }
    };

    // Agrupar por tipo de conta
    const accountGroups = {};
    const costCenterGroups = {};

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const accountType = transaction.account_type || 'unknown';
      const costCenterName = transaction.cost_center || 'Sem Centro de Custo';

      // Agrupar por conta contábil
      if (!accountGroups[transaction.account_id]) {
        accountGroups[transaction.account_id] = {
          account_id: transaction.account_id,
          account_code: transaction.account_code,
          account_name: transaction.account_name,
          account_type: accountType,
          cost_center_name: transaction.cost_center_name,
          total: 0
        };
      }
      accountGroups[transaction.account_id].total += amount;

      // Agrupar por centro de custo
      if (!costCenterGroups[costCenterName]) {
        costCenterGroups[costCenterName] = {
          id: costCenterName,
          name: costCenterName,
          revenues: 0,
          expenses: 0
        };
      }

      if (accountType === 'revenue') {
        costCenterGroups[costCenterName].revenues += amount;
        dreData.summary.totalRevenues += amount;
      } else if (accountType === 'expense') {
        costCenterGroups[costCenterName].expenses += amount;
        dreData.summary.totalExpenses += amount;
      }
    });

    // Separar receitas e despesas
    Object.values(accountGroups).forEach(account => {
      if (account.account_type === 'revenue') {
        dreData.revenues.push(account);
      } else if (account.account_type === 'expense') {
        dreData.expenses.push(account);
      }
      dreData.accountAnalysis.push(account);
    });

    // Análise por centro de custo
    dreData.costCenterAnalysis = Object.values(costCenterGroups);

    // Calcular resultado líquido e margem
    dreData.summary.netIncome = dreData.summary.totalRevenues - dreData.summary.totalExpenses;
    dreData.summary.margin = dreData.summary.totalRevenues > 0 
      ? (dreData.summary.netIncome / dreData.summary.totalRevenues) * 100 
      : 0;

    // Ordenar dados
    dreData.revenues.sort((a, b) => b.total - a.total);
    dreData.expenses.sort((a, b) => b.total - a.total);
    dreData.costCenterAnalysis.sort((a, b) => (b.revenues - b.expenses) - (a.revenues - a.expenses));
    dreData.accountAnalysis.sort((a, b) => b.total - a.total);

    console.log('🎉 DRE gerado com sucesso!');
    res.json(dreData);

  } catch (error) {
    console.error('❌ Erro ao gerar DRE:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar DRE',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

export default router; 