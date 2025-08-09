#!/bin/bash

# =====================================================
# SCRIPT DE APLICAÇÃO DE OTIMIZAÇÕES - BRENO ERP
# =====================================================
# Data: $(date)
# Versão: 1.0
# Descrição: Script automatizado para aplicar otimizações

set -e  # Para o script se houver erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

error() {
    echo -e "${RED}✗ $1${NC}"
}

# Função para verificar se o comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Função para verificar variáveis de ambiente
check_env() {
    log "Verificando variáveis de ambiente..."
    
    if [ -z "$SUPABASE_URL" ]; then
        error "SUPABASE_URL não está definida"
        exit 1
    fi
    
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        error "SUPABASE_ANON_KEY não está definida"
        exit 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        error "SUPABASE_SERVICE_ROLE_KEY não está definida"
        exit 1
    fi
    
    success "Variáveis de ambiente verificadas"
}

# Função para backup antes da migração
create_backup() {
    log "Criando backup antes da migração..."
    
    BACKUP_DIR="backups/$(date +'%Y%m%d_%H%M%S')"
    mkdir -p "$BACKUP_DIR"
    
    # Backup do schema atual
    pg_dump "$SUPABASE_URL" --schema-only --no-owner --no-privileges > "$BACKUP_DIR/schema_backup.sql"
    
    # Backup das configurações
    psql "$SUPABASE_URL" -c "
        \copy (SELECT schemaname, tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public') TO '$BACKUP_DIR/indexes_backup.csv' CSV HEADER;
        \copy (SELECT tc.table_name, tc.constraint_name, tc.constraint_type FROM information_schema.table_constraints tc WHERE tc.table_schema = 'public') TO '$BACKUP_DIR/constraints_backup.csv' CSV HEADER;
    "
    
    success "Backup criado em: $BACKUP_DIR"
}

# Função para executar migração
execute_migration() {
    log "Executando migração de otimização..."
    
    # Executar script de migração
    psql "$SUPABASE_URL" -f "supabase/optimization/database-optimization.sql"
    
    if [ $? -eq 0 ]; then
        success "Migração executada com sucesso"
    else
        error "Erro durante a migração"
        exit 1
    fi
}

# Função para executar queries de teste
test_queries() {
    log "Executando testes de performance..."
    
    # Testar queries otimizadas
    psql "$SUPABASE_URL" -f "supabase/optimization/performance-queries.sql" > "test_results_$(date +'%Y%m%d_%H%M%S').log" 2>&1
    
    if [ $? -eq 0 ]; then
        success "Testes de performance executados"
    else
        warning "Alguns testes falharam - verifique o log"
    fi
}

# Função para verificar performance
check_performance() {
    log "Verificando performance pós-otimização..."
    
    # Query para verificar uso de índices
    psql "$SUPABASE_URL" -c "
        SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
    " > "performance_check_$(date +'%Y%m%d_%H%M%S').log"
    
    success "Verificação de performance concluída"
}

# Função para monitoramento contínuo
setup_monitoring() {
    log "Configurando monitoramento..."
    
    # Criar script de monitoramento
    cat > "monitor_performance.sh" << 'EOF'
#!/bin/bash

# Script de monitoramento de performance
LOG_FILE="performance_monitor_$(date +'%Y%m%d').log"

echo "=== Monitoramento de Performance - $(date) ===" >> "$LOG_FILE"

# Verificar queries lentas
psql "$SUPABASE_URL" -c "
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
    FROM pg_stat_statements 
    ORDER BY mean_time DESC 
    LIMIT 5;
" >> "$LOG_FILE"

# Verificar uso de cache
psql "$SUPABASE_URL" -c "
    SELECT 
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        round(sum(heap_blks_hit) * 100.0 / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as cache_hit_ratio
    FROM pg_statio_user_tables;
" >> "$LOG_FILE"

echo "=== Fim do Monitoramento ===" >> "$LOG_FILE"
EOF

    chmod +x "monitor_performance.sh"
    
    # Configurar cron job para monitoramento diário (opcional)
    # echo "0 2 * * * $(pwd)/monitor_performance.sh" | crontab -
    
    success "Monitoramento configurado"
}

# Função para rollback
rollback_migration() {
    log "Executando rollback..."
    
    psql "$SUPABASE_URL" -c "SELECT execute_rollback();"
    
    if [ $? -eq 0 ]; then
        success "Rollback executado com sucesso"
    else
        error "Erro durante o rollback"
        exit 1
    fi
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [OPÇÃO]"
    echo ""
    echo "Opções:"
    echo "  apply     - Aplicar otimizações"
    echo "  test      - Executar testes de performance"
    echo "  rollback  - Executar rollback"
    echo "  monitor   - Configurar monitoramento"
    echo "  backup    - Criar backup"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  $0 apply"
    echo "  $0 test"
    echo "  $0 rollback"
}

# Função principal
main() {
    case "${1:-help}" in
        "apply")
            log "Iniciando aplicação de otimizações..."
            check_env
            create_backup
            execute_migration
            test_queries
            check_performance
            setup_monitoring
            success "Otimizações aplicadas com sucesso!"
            ;;
        "test")
            log "Executando testes de performance..."
            check_env
            test_queries
            check_performance
            ;;
        "rollback")
            log "Executando rollback..."
            check_env
            rollback_migration
            ;;
        "monitor")
            log "Configurando monitoramento..."
            setup_monitoring
            ;;
        "backup")
            log "Criando backup..."
            check_env
            create_backup
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Executar função principal
main "$@" 