# Plano de Performance para Módulo de Business Intelligence (B.I)

## Visão Geral

Este documento apresenta um plano estratégico para otimizar a performance do sistema de métricas e dashboard através da implementação de snapshots/screenshots do banco de dados para um módulo de Business Intelligence dedicado.

## Situação Atual

Após a implementação de dados reais na edge function de métricas (`supabase/functions/metrics/index.ts`), o sistema agora consulta diretamente as tabelas do banco de dados em tempo real:

- **Tabelas consultadas**: `sales`, `customers`, `transactions`, `billings`, `accounts_payable`, `products`
- **Consultas por requisição**: 5-7 consultas paralelas para métricas completas
- **Frequência de acesso**: Alta (dashboard acessado constantemente pelos usuários)
- **Latência atual**: Variável dependendo do volume de dados

## Problemas Identificados

### 1. Performance
- Consultas complexas em tempo real podem causar lentidão
- Múltiplas consultas paralelas aumentam carga no banco
- Séries temporais requerem agregações custosas

### 2. Escalabilidade
- Crescimento do volume de dados impacta diretamente na performance
- Múltiplos usuários simultâneos podem sobrecarregar o banco
- Consultas históricas se tornam mais lentas com o tempo

### 3. Disponibilidade
- Dependência total do banco principal para métricas
- Falhas no banco afetam visualização de dados históricos

## Solução Proposta: Sistema de Snapshots para B.I

### Arquitetura do Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Banco Principal   │    │   Processador de     │    │   Banco B.I         │
│   (Transacional)    │───▶│   Snapshots          │───▶│   (Analítico)       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                           │
                                ▼                           ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   Scheduler       │    │   Dashboard      │
                       │   (Cron Jobs)     │    │   (Consultas     │
                       └──────────────────┘    │   Otimizadas)    │
                                               └─────────────────┘
```

### 1. Tabelas de Snapshots

Criar tabelas especializadas para armazenar dados pré-calculados:

#### 1.1 Tabela `bi_daily_metrics`
```sql
CREATE TABLE bi_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  segment_id UUID REFERENCES segments(id),
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  avg_ticket DECIMAL(10,2) DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  pending_invoices INTEGER DEFAULT 0,
  pending_payables DECIMAL(15,2) DEFAULT 0,
  cash_in DECIMAL(15,2) DEFAULT 0,
  cash_out DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, segment_id)
);
```

#### 1.2 Tabela `bi_monthly_metrics`
```sql
CREATE TABLE bi_monthly_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  segment_id UUID REFERENCES segments(id),
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(15,2) DEFAULT 0,
  avg_ticket DECIMAL(10,2) DEFAULT 0,
  new_customers INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  cash_flow DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, month, segment_id)
);
```

#### 1.3 Tabela `bi_product_metrics`
```sql
CREATE TABLE bi_product_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  product_id UUID REFERENCES products(id),
  sales_count INTEGER DEFAULT 0,
  revenue DECIMAL(15,2) DEFAULT 0,
  stock_level INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, product_id)
);
```

### 2. Sistema de Processamento de Snapshots

#### 2.1 Edge Function para Processamento
Criar `supabase/functions/bi-processor/index.ts`:

```typescript
// Função para processar snapshots diários
async function processDailySnapshots(supabase: any, targetDate: string) {
  // Calcular métricas do dia
  const metrics = await calculateDailyMetrics(supabase, targetDate);
  
  // Inserir ou atualizar snapshot
  await upsertDailySnapshot(supabase, targetDate, metrics);
}

// Função para processar snapshots mensais
async function processMonthlySnapshots(supabase: any, year: number, month: number) {
  // Agregar dados diários do mês
  const monthlyMetrics = await aggregateMonthlyMetrics(supabase, year, month);
  
  // Inserir ou atualizar snapshot mensal
  await upsertMonthlySnapshot(supabase, year, month, monthlyMetrics);
}
```

#### 2.2 Scheduler com Cron Jobs
Configurar jobs automáticos:

```sql
-- Job diário (executa todo dia às 2:00 AM)
SELECT cron.schedule(
  'daily-bi-snapshots',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/bi-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}',
    body := '{"type": "daily", "date": "' || CURRENT_DATE || '"}'
  );
  $$
);

-- Job mensal (executa no primeiro dia do mês às 3:00 AM)
SELECT cron.schedule(
  'monthly-bi-snapshots',
  '0 3 1 * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/bi-processor',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_KEY"}',
    body := '{"type": "monthly"}'
  );
  $$
);
```

### 3. Otimização da Edge Function de Métricas

#### 3.1 Estratégia Híbrida
Modificar `supabase/functions/metrics/index.ts` para usar snapshots quando disponíveis:

```typescript
async function getOptimizedMetrics(supabase: any, params: any) {
  const { start_date, end_date, segment_id } = params;
  
  // Para períodos históricos, usar snapshots
  if (isHistoricalPeriod(start_date, end_date)) {
    return await getMetricsFromSnapshots(supabase, params);
  }
  
  // Para dados do dia atual, usar consultas em tempo real
  return await buildRealDashboardMetrics(supabase, params);
}

function isHistoricalPeriod(start_date: string, end_date: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return end_date < today;
}
```

### 4. Índices e Otimizações

#### 4.1 Índices para Performance
```sql
-- Índices para consultas rápidas em snapshots
CREATE INDEX idx_bi_daily_metrics_date_segment ON bi_daily_metrics(date, segment_id);
CREATE INDEX idx_bi_daily_metrics_date_desc ON bi_daily_metrics(date DESC);
CREATE INDEX idx_bi_monthly_metrics_year_month ON bi_monthly_metrics(year, month, segment_id);

-- Índices para tabelas principais (se não existirem)
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at_type ON transactions(created_at, type);
CREATE INDEX IF NOT EXISTS idx_customers_segment_status ON customers(segment_id, status);
```

#### 4.2 Particionamento (Para grandes volumes)
```sql
-- Particionar tabela de snapshots diários por mês
CREATE TABLE bi_daily_metrics_y2024m01 PARTITION OF bi_daily_metrics
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE bi_daily_metrics_y2024m02 PARTITION OF bi_daily_metrics
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### 5. Monitoramento e Alertas

#### 5.1 Tabela de Logs
```sql
CREATE TABLE bi_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_type VARCHAR(50) NOT NULL, -- 'daily', 'monthly', 'manual'
  target_date DATE,
  status VARCHAR(20) NOT NULL, -- 'success', 'error', 'running'
  duration_ms INTEGER,
  error_message TEXT,
  records_processed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 5.2 Alertas de Falha
```sql
-- Trigger para alertar sobre falhas no processamento
CREATE OR REPLACE FUNCTION notify_bi_processing_failure()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'error' THEN
    -- Enviar notificação (webhook, email, etc.)
    PERFORM net.http_post(
      url := 'https://your-monitoring-service.com/alert',
      headers := '{"Content-Type": "application/json"}',
      body := json_build_object(
        'type', 'bi_processing_failure',
        'process_type', NEW.process_type,
        'target_date', NEW.target_date,
        'error', NEW.error_message
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_bi_processing_failure
  AFTER INSERT ON bi_processing_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_bi_processing_failure();
```

## Cronograma de Implementação

### Fase 1: Infraestrutura (Semana 1-2)
- [ ] Criar tabelas de snapshots
- [ ] Implementar edge function de processamento
- [ ] Configurar índices básicos
- [ ] Criar sistema de logs

### Fase 2: Processamento (Semana 3-4)
- [ ] Implementar lógica de cálculo de snapshots
- [ ] Configurar cron jobs
- [ ] Processar dados históricos iniciais
- [ ] Testes de performance

### Fase 3: Integração (Semana 5-6)
- [ ] Modificar edge function de métricas para usar snapshots
- [ ] Implementar estratégia híbrida
- [ ] Testes de integração
- [ ] Otimizações finais

### Fase 4: Monitoramento (Semana 7-8)
- [ ] Implementar alertas
- [ ] Dashboard de monitoramento
- [ ] Documentação final
- [ ] Treinamento da equipe

## Benefícios Esperados

### Performance
- **Redução de 80-90%** no tempo de resposta para consultas históricas
- **Diminuição de 70%** na carga do banco principal
- **Melhoria de 5x** na performance de séries temporais

### Escalabilidade
- Suporte a **milhões de registros** sem degradação
- **Crescimento linear** da performance com o volume
- **Isolamento** entre cargas transacionais e analíticas

### Disponibilidade
- **99.9%** de disponibilidade para dados históricos
- **Recuperação rápida** em caso de falhas
- **Backup automático** de métricas críticas

## Custos e Recursos

### Armazenamento Adicional
- **Estimativa**: 10-20% do tamanho das tabelas principais
- **Crescimento**: ~1GB por mês para 10k transações/dia

### Processamento
- **CPU**: 5-10 minutos/dia para processamento
- **Memória**: 512MB durante execução dos jobs

### Manutenção
- **Desenvolvimento inicial**: 40-60 horas
- **Manutenção mensal**: 2-4 horas

## Conclusão

A implementação deste sistema de snapshots para B.I proporcionará uma base sólida para análises de performance, permitindo que o dashboard seja extremamente responsivo mesmo com grandes volumes de dados, enquanto mantém a flexibilidade de consultas em tempo real quando necessário.

O sistema híbrido garante o melhor dos dois mundos: performance otimizada para dados históricos e precisão em tempo real para dados atuais.