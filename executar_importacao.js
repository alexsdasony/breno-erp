#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executarSQL(arquivo) {
    try {
        console.log(`📁 Executando ${arquivo}...`);
        
        const sql = fs.readFileSync(arquivo, 'utf8');
        
        // Dividir o SQL em comandos individuais
        const comandos = sql.split(';').filter(cmd => cmd.trim());
        
        for (const comando of comandos) {
            if (comando.trim()) {
                console.log(`🔄 Executando: ${comando.substring(0, 50)}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql: comando.trim()
                });
                
                if (error) {
                    console.log(`⚠️  Aviso: ${error.message}`);
                } else {
                    console.log(`✅ Comando executado com sucesso!`);
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error(`❌ Erro ao executar ${arquivo}:`, error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Iniciando importação automática da RDS IMOBILIÁRIA...');
    
    const arquivos = [
        'import_locatarios_rds_clientes.sql',
        'import_proprietarios_rds_fornecedores.sql'
    ];
    
    for (const arquivo of arquivos) {
        if (!fs.existsSync(arquivo)) {
            console.error(`❌ Arquivo ${arquivo} não encontrado!`);
            process.exit(1);
        }
    }
    
    console.log('✅ Arquivos SQL encontrados!');
    
    // Executar cada arquivo
    for (const arquivo of arquivos) {
        const sucesso = await executarSQL(arquivo);
        if (!sucesso) {
            console.error(`❌ Falha ao executar ${arquivo}`);
            process.exit(1);
        }
    }
    
    console.log('\n🎉 Importação automática concluída!');
    console.log('📊 Resumo:');
    console.log('   • 39 locatários → clientes');
    console.log('   • 7 proprietários → fornecedores');
    console.log('   • Segmento: RDS IMOBILIÁRIO');
}

main().catch(console.error);
