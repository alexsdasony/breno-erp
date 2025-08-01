const { supabase } = require('./lib/supabase.cjs')

async function testSupabaseConnection() {
  console.log('🔍 Testando conexão com Supabase...')
  
  try {
    // Teste básico de conexão
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message)
      return false
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log('📊 Dados recebidos:', data)
    
    // Teste de autenticação
    console.log('\n🔐 Testando autenticação...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('⚠️  Aviso de autenticação:', authError.message)
    } else {
      console.log('✅ Autenticação configurada corretamente')
    }
    
    return true
    
  } catch (err) {
    console.log('❌ Erro inesperado:', err.message)
    return false
  }
}

// Executar teste
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 Configuração do Supabase concluída com sucesso!')
    } else {
      console.log('\n💥 Falha na configuração do Supabase')
      process.exit(1)
    }
  })
  .catch(err => {
    console.log('💥 Erro fatal:', err)
    process.exit(1)
  }) 