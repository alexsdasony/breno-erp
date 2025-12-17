-- Criar tabela de logs de importação de extratos bancários
CREATE TABLE IF NOT EXISTS bank_statement_import_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  user_email TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'CSV', 'XML', 'OFX', 'QIF'
  file_size BIGINT, -- Tamanho do arquivo em bytes
  first_date DATE NOT NULL, -- Primeira data do extrato
  last_date DATE NOT NULL, -- Última data do extrato
  total_transactions INTEGER NOT NULL, -- Total de transações no arquivo
  imported_count INTEGER NOT NULL DEFAULT 0, -- Quantidade importada com sucesso
  duplicates_in_file INTEGER NOT NULL DEFAULT 0, -- Duplicatas dentro do arquivo
  duplicates_in_database INTEGER NOT NULL DEFAULT 0, -- Duplicatas no banco
  segment_id UUID REFERENCES segments(id),
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'failed', 'partial'
  error_message TEXT, -- Mensagem de erro se falhou
  import_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  import_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_import_logs_user_id ON bank_statement_import_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON bank_statement_import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_logs_first_date ON bank_statement_import_logs(first_date);
CREATE INDEX IF NOT EXISTS idx_import_logs_last_date ON bank_statement_import_logs(last_date);
CREATE INDEX IF NOT EXISTS idx_import_logs_segment_id ON bank_statement_import_logs(segment_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON bank_statement_import_logs(status);

-- Comentários
COMMENT ON TABLE bank_statement_import_logs IS 'Logs de controle de importação de extratos bancários';
COMMENT ON COLUMN bank_statement_import_logs.first_date IS 'Primeira data encontrada no extrato';
COMMENT ON COLUMN bank_statement_import_logs.last_date IS 'Última data encontrada no extrato';
COMMENT ON COLUMN bank_statement_import_logs.duplicates_in_file IS 'Quantidade de transações duplicadas dentro do arquivo';
COMMENT ON COLUMN bank_statement_import_logs.duplicates_in_database IS 'Quantidade de transações que já existiam no banco';

