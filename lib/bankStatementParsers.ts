/**
 * Parsers para extratos bancários (CSV e XML)
 * 
 * Suporta diferentes formatos de extratos bancários brasileiros
 */

export interface BankStatementTransaction {
  date: string; // ISO date format (YYYY-MM-DD)
  description: string;
  amount: number; // Valor absoluto (sempre positivo)
  direction: 'receivable' | 'payable'; // receivable = entrada, payable = saída
  balance?: number; // Saldo após a transação
  doc_no?: string; // Número do documento/comprovante
}

/**
 * Parse CSV de extrato bancário
 * 
 * Aceita diferentes formatos:
 * - Formato padrão: Data, Descrição, Valor, Tipo (D/C ou Entrada/Saída)
 * - Formato simples: Data, Descrição, Valor (sinal indica direção)
 */
export function parseCSVStatement(csvContent: string): BankStatementTransaction[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('Arquivo CSV muito curto ou inválido');
  }

  const transactions: BankStatementTransaction[] = [];
  const headerLine = lines[0].toLowerCase();
  
  // Detectar separador (vírgula ou ponto e vírgula)
  const separator = headerLine.includes(';') ? ';' : ',';
  
  // Normalizar header
  const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());
  
  // Tentar identificar índices das colunas
  const dateIndex = headers.findIndex(h => 
    h.includes('data') || h.includes('date')
  );
  const descIndex = headers.findIndex(h => 
    h.includes('descrição') || h.includes('descricao') || h.includes('desc') || 
    h.includes('histórico') || h.includes('historico') || h.includes('detalhes')
  );
  const valueIndex = headers.findIndex(h => 
    h.includes('valor') || h.includes('value') || h.includes('saldo')
  );
  const typeIndex = headers.findIndex(h => 
    h.includes('tipo') || h.includes('type') || h.includes('débito') || 
    h.includes('debito') || h.includes('crédito') || h.includes('credito') ||
    h.includes('entrada') || h.includes('saída') || h.includes('saida')
  );

  if (dateIndex === -1 || descIndex === -1 || valueIndex === -1) {
    throw new Error('Formato CSV não reconhecido. Colunas esperadas: Data, Descrição, Valor');
  }

  // Processar linhas de dados
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = parseCSVLine(line, separator);
    
    try {
      const dateStr = cells[dateIndex]?.trim();
      const descStr = cells[descIndex]?.trim();
      const valueStr = cells[valueIndex]?.trim();
      const typeStr = typeIndex !== -1 ? cells[typeIndex]?.trim().toLowerCase() : '';

      if (!dateStr || !valueStr) continue;

      // Parse da data
      const date = parseDate(dateStr);
      if (!date) continue;

      // Parse do valor
      const rawValue = parseValue(valueStr);
      if (rawValue === null) continue;

      // Determinar direção (entrada ou saída)
      let direction: 'receivable' | 'payable';
      if (typeStr) {
        // Usar coluna de tipo se disponível
        direction = (
          typeStr.includes('c') || typeStr.includes('credito') || 
          typeStr.includes('entrada') || typeStr.includes('recebimento')
        ) ? 'receivable' : 'payable';
      } else {
        // Usar sinal do valor
        direction = rawValue >= 0 ? 'receivable' : 'payable';
      }

      transactions.push({
        date,
        description: descStr || 'Transação bancária',
        amount: Math.abs(rawValue),
        direction,
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
 * Suporta formato OFX (padrão brasileiro) e formatos personalizados
 */
export async function parseXMLStatement(xmlContent: string): Promise<BankStatementTransaction[]> {
  try {
    // Para XML, vamos usar DOMParser no browser ou xml2js no servidor
    // Como estamos no servidor (API route), vamos usar uma abordagem simples
    
    // Tentar parsear como OFX primeiro
    if (xmlContent.includes('<OFX>') || xmlContent.includes('<ofx:')) {
      return parseOFXStatement(xmlContent);
    }
    
    // Outros formatos XML podem ser adicionados aqui
    throw new Error('Formato XML não suportado. Formatos suportados: OFX');
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
    
    // Extrair data
    const dtPostedMatch = transactionBlock.match(/<DTPOSTED>(\d+)<\/DTPOSTED>/i);
    if (!dtPostedMatch) continue;
    
    // Data OFX: YYYYMMDDHHMMSS (ou YYYYMMDD)
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
    
    // Extrair descrição
    const memoMatch = transactionBlock.match(/<MEMO>([^<]+)<\/MEMO>/i);
    const nameMatch = transactionBlock.match(/<NAME>([^<]+)<\/NAME>/i);
    const description = (memoMatch?.[1] || nameMatch?.[1] || 'Transação bancária').trim();
    
    // Extrair fitid (ID único)
    const fitidMatch = transactionBlock.match(/<FITID>([^<]+)<\/FITID>/i);
    const doc_no = fitidMatch?.[1]?.trim();
    
    transactions.push({
      date,
      description,
      amount: Math.abs(rawValue),
      direction,
      doc_no,
    });
  }
  
  if (transactions.length === 0) {
    throw new Error('Nenhuma transação encontrada no arquivo OFX');
  }
  
  return transactions;
}

/**
 * Parse linha CSV lidando com células que podem conter vírgulas entre aspas
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
 * Parse data em vários formatos brasileiros
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // Remover espaços
  const cleaned = dateStr.trim();
  
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
  
  return null;
}

/**
 * Parse valor numérico removendo formatação brasileira
 */
function parseValue(valueStr: string): number | null {
  if (!valueStr) return null;
  
  // Remover espaços e caracteres não numéricos (exceto vírgula, ponto e sinal)
  let cleaned = valueStr.trim().replace(/[^\d.,+-]/g, '');
  
  // Se tem vírgula e ponto, vírgula é decimal
  // Se só tem vírgula, pode ser decimal ou milhar (assumir decimal)
  // Se só tem ponto, pode ser decimal ou milhar
  
  // Padrão brasileiro comum: 1.234,56 (ponto milhar, vírgula decimal)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // Pode ser decimal ou milhar, assumir decimal se tem 2 dígitos após vírgula
    const parts = cleaned.split(',');
    if (parts[1] && parts[1].length === 2) {
      cleaned = cleaned.replace(',', '.');
    } else {
      cleaned = cleaned.replace(/,/g, '');
    }
  }
  
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  
  return value;
}
