import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Carregar variáveis de ambiente do arquivo .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Criar cliente Supabase com service role key para operações do backend
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Interface compatível com a estrutura atual do projeto
export async function getDatabase() {
  return {
    // Método para consultas SELECT
    async get(sql, params = []) {
      try {
        // Converter SQL para query Supabase
        const { table, columns, filters } = parseSQL(sql, params)
        let query = supabase.from(table).select(columns)
        
        // Aplicar filtros
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }
        
        const { data, error } = await query.limit(1)
        
        if (error) throw error
        return data[0] || null
      } catch (error) {
        console.error('Database get error:', error)
        throw error
      }
    },
    
    // Método para consultas SELECT múltiplas
    async all(sql, params = []) {
      try {
        const { table, columns, filters } = parseSQL(sql, params)
        let query = supabase.from(table).select(columns)
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return data || []
      } catch (error) {
        console.error('Database all error:', error)
        throw error
      }
    },
    
    // Método para INSERT, UPDATE, DELETE
    async run(sql, params = []) {
      try {
        const { operation, table, data, filters } = parseSQL(sql, params)
        
        let result
        if (operation === 'INSERT') {
          const { data: insertedData, error } = await supabase
            .from(table)
            .insert(data)
            .select()
          
          if (error) throw error
          result = { lastID: insertedData[0]?.id, changes: 1 }
        } else if (operation === 'UPDATE') {
          let query = supabase.from(table).update(data)
          
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                query = query.eq(key, value)
              }
            })
          }
          
          const { data: updatedData, error } = await query.select()
          
          if (error) throw error
          result = { changes: updatedData?.length || 0 }
        } else if (operation === 'DELETE') {
          let query = supabase.from(table).delete()
          
          if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                query = query.eq(key, value)
              }
            })
          }
          
          const { data: deletedData, error } = await query
          
          if (error) throw error
          result = { changes: deletedData?.length || 0 }
        }
        
        return result
      } catch (error) {
        console.error('Database run error:', error)
        throw error
      }
    },
    
    // Método para consultas genéricas
    async query(sql, params = []) {
      try {
        const { table, columns, filters } = parseSQL(sql, params)
        let query = supabase.from(table).select(columns)
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              query = query.eq(key, value)
            }
          })
        }
        
        const { data, error } = await query
        
        if (error) throw error
        return { rows: data || [] }
      } catch (error) {
        console.error('Database query error:', error)
        throw error
      }
    }
  }
}

// Função para fazer parse básico de SQL para Supabase
function parseSQL(sql, params) {
  const upperSQL = sql.trim().toUpperCase()
  
  // Detectar operação
  let operation = 'SELECT'
  if (upperSQL.startsWith('INSERT')) operation = 'INSERT'
  else if (upperSQL.startsWith('UPDATE')) operation = 'UPDATE'
  else if (upperSQL.startsWith('DELETE')) operation = 'DELETE'
  
  // Extrair nome da tabela (simplificado)
  const fromMatch = sql.match(/FROM\s+(\w+)/i)
  const intoMatch = sql.match(/INTO\s+(\w+)/i)
  const updateMatch = sql.match(/UPDATE\s+(\w+)/i)
  
  const table = fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1]
  
  // Para operações simples, retornar estrutura básica
  return {
    operation,
    table,
    columns: '*',
    data: operation === 'INSERT' ? params[0] : undefined,
    filters: operation === 'UPDATE' || operation === 'DELETE' ? params[0] : undefined
  }
}

// Função para inicializar o banco (mantida para compatibilidade)
export async function initProductionDatabase() {
  try {
    // Testar conexão
    const { data, error } = await supabase.from('users').select('count').limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      throw error
    }
    
    console.log('✅ Supabase database connected successfully')
    return true
  } catch (error) {
    console.error('❌ Supabase initialization failed:', error.message)
    throw error
  }
}

// Função para executar SQL arbitrário (usando RPC)
export async function runArbitrarySQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: sql,
      params: '[]'
    })
    
    if (error) throw error
    return data
  } catch (error) {
    console.error('SQL execution error:', error)
    throw error
  }
}

export { supabase } 