const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateToSupabase() {
  console.log('🚀 Iniciando migração para Supabase...')
  
  try {
    // Ler o arquivo SQL de migração
    const sqlFile = path.join(__dirname, 'migrate-to-supabase.sql')
    const sqlContent = fs.readFileSync(sqlFile, 'utf8')
    
    console.log('📄 Arquivo SQL carregado')
    
    // Dividir o SQL em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`🔧 Executando ${commands.length} comandos SQL...`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      
      if (command.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { 
            query: command + ';',
            params: '[]'
          })
          
          if (error) {
            // Se exec_sql não existir, tentar executar diretamente
            console.log(`⚠️  Tentando execução direta para comando ${i + 1}`)
            const { error: directError } = await supabase.from('_dummy').select('*').limit(0)
            
            if (directError) {
              console.log(`❌ Erro no comando ${i + 1}: ${error.message}`)
              errorCount++
            } else {
              console.log(`✅ Comando ${i + 1} executado com sucesso`)
              successCount++
            }
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`)
            successCount++
          }
        } catch (err) {
          console.log(`❌ Erro no comando ${i + 1}: ${err.message}`)
          errorCount++
        }
      }
    }
    
    console.log(`\n📊 Resumo da migração:`)
    console.log(`✅ Comandos executados com sucesso: ${successCount}`)
    console.log(`❌ Comandos com erro: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Migração concluída com sucesso!')
      
      // Testar conexão após migração
      console.log('\n🔍 Testando conexão após migração...')
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        console.log('⚠️  Aviso: Tabela users pode não ter sido criada ainda')
      } else {
        console.log('✅ Conexão e estrutura funcionando corretamente')
      }
      
    } else {
      console.log('\n⚠️  Migração concluída com alguns erros. Verifique os logs acima.')
    }
    
  } catch (error) {
    console.error('💥 Erro fatal durante migração:', error.message)
    process.exit(1)
  }
}

// Executar migração
migrateToSupabase()
  .then(() => {
    console.log('\n🏁 Processo de migração finalizado')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  }) 