import express from 'express';
import { authenticateToken as auth } from '../middleware/auth.js';
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

    // Construir filtros baseados nos parâmetros
    let whereConditions = ['t.deleted_at IS NULL'];
    let params = [];
    let paramIndex = 1;

    // Filtro de data
    whereConditions.push(`t.date >= $${paramIndex++}`);
    params.push(startDate);
    whereConditions.push(`t.date <= $${paramIndex++}`);
    params.push(endDate);

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
        coa.code as account_code,
        coa.name as account_name,
        coa.account_type,
        coa.category
      FROM transactions t
      LEFT JOIN cost_centers cc ON t.cost_center = cc.name
      LEFT JOIN chart_of_accounts coa ON t.category = coa.category
      WHERE ${whereClause}
      ORDER BY t.date DESC, coa.code
    `;

    const result = await client.query(mainQuery, params);
    const transactions = result.rows;

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

    res.json(dreData);

  } catch (error) {
    console.error('Erro ao gerar DRE:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar DRE',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Exportar DRE em diferentes formatos
router.get('/dre/export', auth, validateDateRange, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      startDate, 
      endDate, 
      costCenterId, 
      accountType, 
      groupBy = 'account_type',
      segmentId,
      format = 'pdf'
    } = req.query;

    // Primeiro, buscar os dados do DRE
    const dreResponse = await fetch(`${req.protocol}://${req.get('host')}/api/reports/dre?${new URLSearchParams({
      startDate,
      endDate,
      costCenterId,
      accountType,
      groupBy,
      segmentId
    })}`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });

    if (!dreResponse.ok) {
      return res.status(500).json({ error: 'Erro ao gerar dados do DRE' });
    }

    const dreData = await dreResponse.json();

    // Gerar conteúdo baseado no formato
    let content, contentType, filename;

    if (format === 'excel') {
      // Gerar CSV (simples para Excel)
      content = generateCSV(dreData);
      contentType = 'text/csv';
      filename = `DRE_${startDate}_${endDate}.csv`;
    } else {
      // Gerar PDF (simples em texto)
      content = generatePDF(dreData);
      contentType = 'application/pdf';
      filename = `DRE_${startDate}_${endDate}.pdf`;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);

  } catch (error) {
    console.error('Erro ao exportar DRE:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao exportar DRE',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Função para gerar CSV
function generateCSV(dreData) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  let csv = 'Demonstração do Resultado do Exercício\n\n';
  
  // Resumo
  csv += 'RESUMO EXECUTIVO\n';
  csv += 'Receitas Totais,' + formatCurrency(dreData.summary.totalRevenues) + '\n';
  csv += 'Despesas Totais,' + formatCurrency(dreData.summary.totalExpenses) + '\n';
  csv += 'Resultado Líquido,' + formatCurrency(dreData.summary.netIncome) + '\n';
  csv += 'Margem de Lucro,' + dreData.summary.margin.toFixed(2) + '%\n\n';

  // Receitas
  if (dreData.revenues.length > 0) {
    csv += 'RECEITAS OPERACIONAIS\n';
    csv += 'Conta,Código,Centro de Custo,Valor\n';
    dreData.revenues.forEach(item => {
      csv += `"${item.account_name}","${item.account_code}","${item.cost_center_name || ''}","${formatCurrency(item.total)}"\n`;
    });
    csv += '\n';
  }

  // Despesas
  if (dreData.expenses.length > 0) {
    csv += 'CUSTOS E DESPESAS OPERACIONAIS\n';
    csv += 'Conta,Código,Centro de Custo,Valor\n';
    dreData.expenses.forEach(item => {
      csv += `"${item.account_name}","${item.account_code}","${item.cost_center_name || ''}","${formatCurrency(item.total)}"\n`;
    });
    csv += '\n';
  }

  // Análise por Centro de Custo
  if (dreData.costCenterAnalysis.length > 0) {
    csv += 'ANÁLISE POR CENTRO DE CUSTO\n';
    csv += 'Centro de Custo,Receitas,Despesas,Resultado\n';
    dreData.costCenterAnalysis.forEach(center => {
      csv += `"${center.name}","${formatCurrency(center.revenues)}","${formatCurrency(center.expenses)}","${formatCurrency(center.revenues - center.expenses)}"\n`;
    });
  }

  return csv;
}

// Função para gerar PDF (simples em texto)
function generatePDF(dreData) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  let pdf = 'DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO\n';
  pdf += '='.repeat(50) + '\n\n';
  
  // Resumo
  pdf += 'RESUMO EXECUTIVO\n';
  pdf += '-'.repeat(20) + '\n';
  pdf += `Receitas Totais: ${formatCurrency(dreData.summary.totalRevenues)}\n`;
  pdf += `Despesas Totais: ${formatCurrency(dreData.summary.totalExpenses)}\n`;
  pdf += `Resultado Líquido: ${formatCurrency(dreData.summary.netIncome)}\n`;
  pdf += `Margem de Lucro: ${dreData.summary.margin.toFixed(2)}%\n\n`;

  // Receitas
  if (dreData.revenues.length > 0) {
    pdf += 'RECEITAS OPERACIONAIS\n';
    pdf += '-'.repeat(25) + '\n';
    dreData.revenues.forEach(item => {
      pdf += `${item.account_name} (${item.account_code})\n`;
      pdf += `  Centro de Custo: ${item.cost_center_name || 'N/A'}\n`;
      pdf += `  Valor: ${formatCurrency(item.total)}\n\n`;
    });
  }

  // Despesas
  if (dreData.expenses.length > 0) {
    pdf += 'CUSTOS E DESPESAS OPERACIONAIS\n';
    pdf += '-'.repeat(35) + '\n';
    dreData.expenses.forEach(item => {
      pdf += `${item.account_name} (${item.account_code})\n`;
      pdf += `  Centro de Custo: ${item.cost_center_name || 'N/A'}\n`;
      pdf += `  Valor: ${formatCurrency(item.total)}\n\n`;
    });
  }

  // Análise por Centro de Custo
  if (dreData.costCenterAnalysis.length > 0) {
    pdf += 'ANÁLISE POR CENTRO DE CUSTO\n';
    pdf += '-'.repeat(25) + '\n';
    dreData.costCenterAnalysis.forEach(center => {
      pdf += `${center.name}\n`;
      pdf += `  Receitas: ${formatCurrency(center.revenues)}\n`;
      pdf += `  Despesas: ${formatCurrency(center.expenses)}\n`;
      pdf += `  Resultado: ${formatCurrency(center.revenues - center.expenses)}\n\n`;
    });
  }

  return pdf;
}

// Relatório de conciliação bancária
router.get('/bank-reconciliation', auth, validateDateRange, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { startDate, endDate, segmentId } = req.query;

    let whereConditions = ['t.deleted_at IS NULL'];
    let params = [];
    let paramIndex = 1;

    whereConditions.push(`t.date >= $${paramIndex++}`);
    params.push(startDate);
    whereConditions.push(`t.date <= $${paramIndex++}`);
    params.push(endDate);

    if (segmentId) {
      whereConditions.push(`t.segment_id = $${paramIndex++}`);
      params.push(segmentId);
    }

    const whereClause = whereConditions.join(' AND ');

    // Query para conciliação bancária
    const query = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center,
        cc.name as cost_center_name,
        coa.code as account_code,
        coa.name as account_name,
        coa.account_type,
        cca.allocation_percentage,
        cca.is_primary
      FROM transactions t
      LEFT JOIN cost_centers cc ON t.cost_center = cc.name
      LEFT JOIN chart_of_accounts coa ON t.category = coa.category
      LEFT JOIN cost_center_accounts cca ON cc.id = cca.cost_center_id AND coa.id = cca.account_id
      WHERE ${whereClause}
      ORDER BY t.date DESC, coa.code
    `;

    const result = await client.query(query, params);
    const transactions = result.rows;

    // Processar dados para conciliação
    const reconciliationData = {
      totalTransactions: transactions.length,
      totalAmount: 0,
      byAccount: {},
      byCostCenter: {},
      unallocated: []
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      reconciliationData.totalAmount += amount;

      // Agrupar por conta contábil
      if (!reconciliationData.byAccount[transaction.account_id]) {
        reconciliationData.byAccount[transaction.account_id] = {
          account_code: transaction.account_code,
          account_name: transaction.account_name,
          account_type: transaction.account_type,
          total: 0,
          transactions: []
        };
      }
      reconciliationData.byAccount[transaction.account_id].total += amount;
      reconciliationData.byAccount[transaction.account_id].transactions.push(transaction);

      // Agrupar por centro de custo
      if (transaction.cost_center) {
        if (!reconciliationData.byCostCenter[transaction.cost_center]) {
          reconciliationData.byCostCenter[transaction.cost_center] = {
            name: transaction.cost_center,
            total: 0,
            transactions: []
          };
        }
        reconciliationData.byCostCenter[transaction.cost_center].total += amount;
        reconciliationData.byCostCenter[transaction.cost_center].transactions.push(transaction);
      } else {
        reconciliationData.unallocated.push(transaction);
      }
    });

    res.json(reconciliationData);

  } catch (error) {
    console.error('Erro ao gerar relatório de conciliação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar relatório de conciliação',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Relatório de fluxo de caixa
router.get('/cash-flow', auth, validateDateRange, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { startDate, endDate, segmentId } = req.query;

    let whereConditions = ['t.deleted_at IS NULL'];
    let params = [];
    let paramIndex = 1;

    whereConditions.push(`t.date >= $${paramIndex++}`);
    params.push(startDate);
    whereConditions.push(`t.date <= $${paramIndex++}`);
    params.push(endDate);

    if (segmentId) {
      whereConditions.push(`t.segment_id = $${paramIndex++}`);
      params.push(segmentId);
    }

    const whereClause = whereConditions.join(' AND ');

    // Query para fluxo de caixa
    const query = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        EXTRACT(MONTH FROM t.date) as month,
        EXTRACT(YEAR FROM t.date) as year,
        coa.account_type,
        coa.category
      FROM transactions t
      LEFT JOIN chart_of_accounts coa ON t.account_id = coa.id
      WHERE ${whereClause}
      ORDER BY t.date
    `;

    const result = await client.query(query, params);
    const transactions = result.rows;

    // Processar dados para fluxo de caixa
    const cashFlowData = {
      totalInflows: 0,
      totalOutflows: 0,
      netCashFlow: 0,
      byMonth: {},
      byCategory: {}
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const monthKey = `${transaction.year}-${transaction.month.toString().padStart(2, '0')}`;
      const category = transaction.category || 'Outros';

      // Inicializar mês se não existir
      if (!cashFlowData.byMonth[monthKey]) {
        cashFlowData.byMonth[monthKey] = {
          inflows: 0,
          outflows: 0,
          netFlow: 0
        };
      }

      // Inicializar categoria se não existir
      if (!cashFlowData.byCategory[category]) {
        cashFlowData.byCategory[category] = {
          inflows: 0,
          outflows: 0,
          netFlow: 0
        };
      }

      if (transaction.account_type === 'revenue' || transaction.type === 'receita') {
        cashFlowData.totalInflows += amount;
        cashFlowData.byMonth[monthKey].inflows += amount;
        cashFlowData.byCategory[category].inflows += amount;
      } else {
        cashFlowData.totalOutflows += amount;
        cashFlowData.byMonth[monthKey].outflows += amount;
        cashFlowData.byCategory[category].outflows += amount;
      }
    });

    // Calcular fluxos líquidos
    cashFlowData.netCashFlow = cashFlowData.totalInflows - cashFlowData.totalOutflows;

    Object.keys(cashFlowData.byMonth).forEach(month => {
      cashFlowData.byMonth[month].netFlow = 
        cashFlowData.byMonth[month].inflows - cashFlowData.byMonth[month].outflows;
    });

    Object.keys(cashFlowData.byCategory).forEach(category => {
      cashFlowData.byCategory[category].netFlow = 
        cashFlowData.byCategory[category].inflows - cashFlowData.byCategory[category].outflows;
    });

    res.json(cashFlowData);

  } catch (error) {
    console.error('Erro ao gerar relatório de fluxo de caixa:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar relatório de fluxo de caixa',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

export default router; 