/**
 * Parsers para extratos bancários (CSV, XML/OFX, QIF)
 * 
 * Suporta formatos dos principais bancos brasileiros:
 * - Banco do Brasil, Bradesco, Itaú, Santander, Caixa, Nubank, etc.
 */

export interface BankStatementTransaction {
  date: string; // ISO date format (YYYY-MM-DD)
  description: string;
  amount: number; // Valor absoluto (sempre positivo)
  direction: 'receivable' | 'payable'; // receivable = entrada, payable = saída
  balance?: number; // Saldo após a transação
  doc_no?: string; // Número do documento/comprovante
  category?: string; // Categoria da transação
}

/**
 * Parse CSV de extrato bancário - SUPORTA MÚLTIPLOS FORMATOS
 * 
 * Formatos suportados:
 * - Formato padrão: Data, Descrição, Valor, Tipo (D/C ou Entrada/Saída)
 * - Formato com saldo: Data, Descrição, Débito, Crédito, Saldo
 * - Formato simples: Data, Descrição, Valor (sinal indica direção)
 * - Formatos específicos de bancos (Bradesco, Itaú, BB, Santander, etc.)
 */
export function parseCSVStatement(csvContent: string): BankStatementTransaction[] {
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Arquivo CSV muito curto ou inválido');
  }

  // Detectar encoding e separador
  const { separator, encoding } = detectCSVFormat(lines[0]);
  
  // Normalizar header removendo BOM se presente
  let headerLine = lines[0].trim();
  if (headerLine.charCodeAt(0) === 0xFEFF) {
    headerLine = headerLine.substring(1);
  }
  headerLine = headerLine.toLowerCase();
  
  const headers = parseCSVLine(headerLine, separator).map(h => h.trim().toLowerCase());
  
  // Tentar identificar índices das colunas (busca mais abrangente)
  const dateIndices = findColumnIndices(headers, [
    'data', 'date', 'data movimento', 'data lançamento', 'dt movto', 'dt mov', 
    'data da transação', 'data transação', 'dt', 'data_operacao'
  ]);
  
  const descIndices = findColumnIndices(headers, [
    'descrição', 'descricao', 'desc', 'descri', 'histórico', 'historico', 
    'detalhes', 'detalhe', 'lançamento', 'lancamento', 'lanç', 'lanc',
    'descrição do lançamento', 'descricao do lancamento', 'observação', 
    'observacao', 'obs', 'referência', 'referencia', 'ref', 'motivo',
    'descrição detalhada', 'descricao detalhada', 'descrição resumida',
    'transação', 'transacao', 'operacao', 'operação', 'comp', 'complemento'
  ]);
  
  const valueIndices = findColumnIndices(headers, [
    'valor', 'value', 'saldo', 'saldo atual', 'vlr', 'valor lançamento',
    'valor da transação', 'valor transação', 'montante', 'total'
  ]);
  
  // Colunas específicas para débito/crédito
  const debitoIndices = findColumnIndices(headers, [
    'débito', 'debito', 'deb', 'saída', 'saida', 'saidas', 'pagamento',
    'despesa', 'retirada', 'saque', 'transferência saída', 'transferencia saida'
  ]);
  
  const creditoIndices = findColumnIndices(headers, [
    'crédito', 'credito', 'cred', 'entrada', 'entradas', 'recebimento',
    'receita', 'depósito', 'deposito', 'transferência entrada', 'transferencia entrada'
  ]);
  
  const typeIndices = findColumnIndices(headers, [
    'tipo', 'type', 'natureza', 'sinal', 'dc', 'd/c', 'operacao', 
    'operação', 'categoria', 'classificação', 'classificacao'
  ]);
  
  const balanceIndices = findColumnIndices(headers, [
    'saldo', 'saldo atual', 'saldo final', 'saldo após', 'saldo depois',
    'saldo acumulado', 'balance', 'saldo conta', 'saldo em conta'
  ]);
  
  const docNoIndices = findColumnIndices(headers, [
    'documento', 'doc', 'num doc', 'numero documento', 'número documento',
    'núm doc', 'num. doc', 'comprovante', 'id', 'identificação', 'identificacao',
    'num operação', 'numero operacao', 'número operação', 'núm operação'
  ]);

  // Verificar se temos informações suficientes
  const hasDate = dateIndices.length > 0;
  const hasDesc = descIndices.length > 0;
  const hasValue = valueIndices.length > 0 || (debitoIndices.length > 0 && creditoIndices.length > 0);
  
  if (!hasDate || !hasDesc || !hasValue) {
    throw new Error(
      'Formato CSV não reconhecido. ' +
      'Colunas esperadas: Data, Descrição/Histórico, Valor (ou Débito/Crédito). ' +
      'Colunas encontradas: ' + headers.join(', ')
    );
  }

  const transactions: BankStatementTransaction[] = [];

  // Processar linhas de dados
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('Total') || line.startsWith('TOTAL') || 
        line.startsWith('Saldo') || line.startsWith('SALDO')) continue;

    const cells = parseCSVLine(line, separator);
    
    try {
      // Extrair data
      const dateStr = getCellValue(cells, dateIndices);
      if (!dateStr) continue;
      const date = parseDate(dateStr);
      if (!date) continue;

      // Extrair descrição
      const descStr = getCellValue(cells, descIndices) || 'Transação bancária';

      // Extrair valor - pode vir de várias fontes
      let rawValue: number | null = null;
      let direction: 'receivable' | 'payable' | null = null;

      // Tentar débito/crédito primeiro (formato mais confiável)
      const debitoStr = getCellValue(cells, debitoIndices);
      const creditoStr = getCellValue(cells, creditoIndices);
      
      if (debitoStr) {
        rawValue = parseValue(debitoStr);
        if (rawValue !== null && rawValue !== 0) {
          direction = 'payable';
        }
      }
      
      if (creditoStr && (!rawValue || rawValue === 0)) {
        rawValue = parseValue(creditoStr);
        if (rawValue !== null && rawValue !== 0) {
          direction = 'receivable';
        }
      }

      // Se não encontrou débito/crédito, usar coluna de valor genérica
      if (rawValue === null || rawValue === 0) {
        const valueStr = getCellValue(cells, valueIndices);
        if (!valueStr) continue;
        rawValue = parseValue(valueStr);
      if (rawValue === null) continue;

        // Determinar direção pelo tipo ou sinal
        const typeStr = getCellValue(cells, typeIndices)?.toLowerCase() || '';
      if (typeStr) {
        direction = (
          typeStr.includes('c') || typeStr.includes('credito') || 
            typeStr.includes('cred') || typeStr.includes('entrada') || 
            typeStr.includes('recebimento') || typeStr.includes('receita') ||
            typeStr.includes('deposito') || typeStr.includes('depósito')
        ) ? 'receivable' : 'payable';
      } else {
        // Usar sinal do valor
        direction = rawValue >= 0 ? 'receivable' : 'payable';
      }
      }

      // Extrair saldo se disponível
      const balanceStr = getCellValue(cells, balanceIndices);
      const balance = balanceStr ? parseValue(balanceStr) : undefined;

      // Extrair número do documento
      const docNo = getCellValue(cells, docNoIndices);

      transactions.push({
        date,
        description: descStr.trim(),
        amount: Math.abs(rawValue),
        direction: direction!,
        balance: balance !== null ? balance : undefined,
        doc_no: docNo,
      });
    } catch (error) {
      console.warn(`⚠️ Erro ao processar linha ${i + 1}:`, error);
      continue;
    }
  }

  if (transactions.length === 0) {
    throw new Error('Nenhuma transação válida encontrada no arquivo');
  }

  return transactions;
}

/**
 * Parse XML de extrato bancário
 * 
 * Suporta:
 * - OFX (Open Financial Exchange) - padrão brasileiro
 * - QIF (Quicken Interchange Format)
 */
export async function parseXMLStatement(xmlContent: string): Promise<BankStatementTransaction[]> {
  try {
    const content = xmlContent.trim();
    
    // Tentar parsear como OFX
    if (content.includes('<OFX>') || content.includes('<ofx:') || 
        content.includes('OFXHEADER') || content.includes('FINANCIALINSTMSGSRSV1')) {
      return parseOFXStatement(content);
    }
    
    // Tentar parsear como QIF
    if (content.includes('!Type:') || content.startsWith('!Account')) {
      return parseQIFStatement(content);
    }
    
    throw new Error('Formato XML não suportado. Formatos suportados: OFX, QIF');
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro ao processar arquivo XML');
  }
}

/**
 * Parse formato OFX (Open Financial Exchange)
 */
function parseOFXStatement(ofxContent: string): BankStatementTransaction[] {
  const transactions: BankStatementTransaction[] = [];
  
  // Regex para encontrar transações OFX
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  const matches = ofxContent.matchAll(stmtTrnRegex);
  
  for (const match of matches) {
    const transactionBlock = match[1];
    
    // Extrair data - formato OFX: YYYYMMDDHHMMSS ou YYYYMMDD
    const dtPostedMatch = transactionBlock.match(/<DTPOSTED>(\d{8,14})<\/DTPOSTED>/i);
    if (!dtPostedMatch) continue;
    
    const dateStr = dtPostedMatch[1];
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = `${year}-${month}-${day}`;
    
    // Extrair valor
    const trnamtMatch = transactionBlock.match(/<TRNAMT>([-+]?\d+\.?\d*)<\/TRNAMT>/i);
    if (!trnamtMatch) continue;
    
    const rawValue = parseFloat(trnamtMatch[1]);
    const direction: 'receivable' | 'payable' = rawValue >= 0 ? 'receivable' : 'payable';
    
    // Extrair descrição (MEMO ou NAME)
    const memoMatch = transactionBlock.match(/<MEMO>([^<]+)<\/MEMO>/i);
    const nameMatch = transactionBlock.match(/<NAME>([^<]+)<\/NAME>/i);
    const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação bancária').trim();
    
    // Extrair FITID (ID único da transação)
    const fitidMatch = transactionBlock.match(/<FITID>([^<]+)<\/FITID>/i);
    const doc_no = fitidMatch?.[1]?.trim();
    
    // Extrair saldo
    const balanceMatch = transactionBlock.match(/<BALAMT>([-+]?\d+\.?\d*)<\/BALAMT>/i);
    const balance = balanceMatch ? parseFloat(balanceMatch[1]) : undefined;
    
    transactions.push({
      date,
      description,
      amount: Math.abs(rawValue),
      direction,
      doc_no,
      balance,
    });
  }
  
  if (transactions.length === 0) {
    throw new Error('Nenhuma transação encontrada no arquivo OFX');
  }
  
  return transactions;
}

/**
 * Parse formato QIF (Quicken Interchange Format)
 */
function parseQIFStatement(qifContent: string): BankStatementTransaction[] {
  const transactions: BankStatementTransaction[] = [];
  const lines = qifContent.split(/\r?\n/);
  
  let currentTransaction: Partial<BankStatementTransaction> = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    const code = trimmed[0];
    const value = trimmed.substring(1);
    
    switch (code) {
      case 'D': // Date
        currentTransaction.date = parseDate(value);
        break;
      case 'T': // Amount
        const amount = parseValue(value);
        if (amount !== null) {
          currentTransaction.amount = Math.abs(amount);
          currentTransaction.direction = amount >= 0 ? 'receivable' : 'payable';
        }
        break;
      case 'P': // Payee/Description
        currentTransaction.description = value || 'Transação bancária';
        break;
      case 'M': // Memo
        if (currentTransaction.description && currentTransaction.description !== 'Transação bancária') {
          currentTransaction.description += ' - ' + value;
        } else {
          currentTransaction.description = value || 'Transação bancária';
        }
        break;
      case 'N': // Number/Reference
        currentTransaction.doc_no = value;
        break;
      case '^': // End of transaction
        if (currentTransaction.date && currentTransaction.amount && currentTransaction.direction) {
          transactions.push({
            date: currentTransaction.date,
            description: currentTransaction.description || 'Transação bancária',
            amount: currentTransaction.amount,
            direction: currentTransaction.direction,
            doc_no: currentTransaction.doc_no,
          });
        }
        currentTransaction = {};
        break;
    }
  }
  
  // Adicionar última transação se não terminou com ^
  if (currentTransaction.date && currentTransaction.amount && currentTransaction.direction) {
    transactions.push({
      date: currentTransaction.date,
      description: currentTransaction.description || 'Transação bancária',
      amount: currentTransaction.amount,
      direction: currentTransaction.direction,
      doc_no: currentTransaction.doc_no,
    });
  }
  
  if (transactions.length === 0) {
    throw new Error('Nenhuma transação encontrada no arquivo QIF');
  }
  
  return transactions;
}

/**
 * Detectar formato CSV (separador e encoding)
 */
function detectCSVFormat(firstLine: string): { separator: string; encoding: string } {
  // Contar ocorrências de cada separador
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const commaCount = (firstLine.match(/,/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  
  // Escolher separador mais comum
  if (tabCount > semicolonCount && tabCount > commaCount) {
    return { separator: '\t', encoding: 'utf-8' };
  }
  if (semicolonCount > commaCount) {
    return { separator: ';', encoding: 'utf-8' };
  }
  
  return { separator: ',', encoding: 'utf-8' };
}

/**
 * Encontrar índices de colunas que correspondem a nomes alternativos
 */
function findColumnIndices(headers: string[], names: string[]): number[] {
  const indices: number[] = [];
  for (const name of names) {
    const index = headers.findIndex(h => h.includes(name));
    if (index !== -1 && !indices.includes(index)) {
      indices.push(index);
    }
  }
  return indices;
}

/**
 * Obter valor de célula usando índices alternativos
 */
function getCellValue(cells: string[], indices: number[]): string | null {
  for (const index of indices) {
    if (index >= 0 && index < cells.length) {
      const value = cells[index]?.trim();
      if (value) return value;
    }
  }
  return null;
}

/**
 * Parse linha CSV lidando com células que podem conter separadores entre aspas
 */
function parseCSVLine(line: string, separator: string): string[] {
  const cells: string[] = [];
  let currentCell = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Aspas duplas escapadas
        currentCell += '"';
        i++; // Pular próxima aspas
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      // Fim da célula
      cells.push(currentCell);
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  
  // Adicionar última célula
  cells.push(currentCell);
  
  return cells;
}

/**
 * Parse data em vários formatos brasileiros e internacionais
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Remover espaços e normalizar
  let cleaned = dateStr.trim();
  
  // Formato ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // Formato brasileiro (DD/MM/YYYY)
  const brMatch = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brMatch) {
    return `${brMatch[3]}-${brMatch[2]}-${brMatch[1]}`;
  }
  
  // Formato brasileiro sem ano (DD/MM) - assume ano atual
  const brShortMatch = cleaned.match(/^(\d{2})\/(\d{2})$/);
  if (brShortMatch) {
    const now = new Date();
    const year = now.getFullYear();
    return `${year}-${brShortMatch[2]}-${brShortMatch[1]}`;
  }
  
  // Formato DDMMYYYY
  const ddmmyyyyMatch = cleaned.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (ddmmyyyyMatch) {
    return `${ddmmyyyyMatch[3]}-${ddmmyyyyMatch[2]}-${ddmmyyyyMatch[1]}`;
  }
  
  // Formato YYYYMMDD
  const yyyymmddMatch = cleaned.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (yyyymmddMatch) {
    return `${yyyymmddMatch[1]}-${yyyymmddMatch[2]}-${yyyymmddMatch[3]}`;
  }
  
  // Formato brasileiro com hora (DD/MM/YYYY HH:MM:SS)
  const brWithTimeMatch = cleaned.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brWithTimeMatch) {
    return `${brWithTimeMatch[3]}-${brWithTimeMatch[2]}-${brWithTimeMatch[1]}`;
  }
  
  // Tentar parse como Date nativo (último recurso)
  const dateObj = new Date(cleaned);
  if (!isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
}

/**
 * Parse valor numérico removendo formatação brasileira e internacional
 */
function parseValue(valueStr: string): number | null {
  if (!valueStr) return null;
  
  // Remover espaços e caracteres não numéricos (exceto vírgula, ponto e sinal)
  let cleaned = valueStr.trim().replace(/[^\d.,+-]/g, '');
  
  // Remover múltiplos sinais (manter apenas o primeiro)
  const firstSign = cleaned.match(/^([+-])/);
  cleaned = cleaned.replace(/[+-]/g, '');
  if (firstSign) {
    cleaned = firstSign[1] + cleaned;
  }
  
  // Padrão brasileiro comum: 1.234,56 (ponto milhar, vírgula decimal)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Se tem ponto antes da vírgula, ponto é milhar
    const commaIndex = cleaned.indexOf(',');
    const dotIndex = cleaned.indexOf('.');
    if (dotIndex < commaIndex) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
    } else {
      // Vírgula é milhar, ponto é decimal (menos comum)
      cleaned = cleaned.replace(/,/g, '').replace('.', ',');
      cleaned = cleaned.replace(',', '.');
    }
  } else if (cleaned.includes(',')) {
    // Só tem vírgula - pode ser decimal ou milhar
    const parts = cleaned.split(',');
    if (parts[1] && parts[1].length <= 2) {
      // Provavelmente decimal
      cleaned = cleaned.replace(',', '.');
    } else {
      // Provavelmente milhar
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  
  return value;
}