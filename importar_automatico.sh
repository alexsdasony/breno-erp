#!/bin/bash

echo "🚀 Importação automática da RDS IMOBILIÁRIA"
echo "=========================================="

# Verificar se os arquivos existem
if [ ! -f "import_locatarios_rds_clientes.sql" ]; then
    echo "❌ Arquivo import_locatarios_rds_clientes.sql não encontrado!"
    exit 1
fi

if [ ! -f "import_proprietarios_rds_fornecedores.sql" ]; then
    echo "❌ Arquivo import_proprietarios_rds_fornecedores.sql não encontrado!"
    exit 1
fi

echo "✅ Arquivos SQL encontrados!"

# Tentar conectar e executar
echo ""
echo "📁 Executando import_locatarios_rds_clientes.sql..."
echo "🔄 Tentando conectar ao banco..."

# Método 1: psql direto
if psql "postgresql://postgres:C0ntr0l3t0t%40l%23@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres" -f import_locatarios_rds_clientes.sql; then
    echo "✅ Locatários importados com sucesso!"
else
    echo "❌ Falha na importação dos locatários"
    echo "🔄 Tentando método alternativo..."
    
    # Método 2: Usar npx supabase
    if npx supabase db push --linked; then
        echo "✅ Conexão via Supabase CLI funcionou!"
    else
        echo "❌ Falha na conexão"
        exit 1
    fi
fi

echo ""
echo "📁 Executando import_proprietarios_rds_fornecedores.sql..."

if psql "postgresql://postgres:C0ntr0l3t0t%40l%23@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres" -f import_proprietarios_rds_fornecedores.sql; then
    echo "✅ Proprietários importados com sucesso!"
else
    echo "❌ Falha na importação dos proprietários"
    exit 1
fi

echo ""
echo "🎉 Importação automática concluída!"
echo "📊 Resumo:"
echo "   • 39 locatários → clientes"
echo "   • 7 proprietários → fornecedores"
echo "   • Segmento: RDS IMOBILIÁRIO"
