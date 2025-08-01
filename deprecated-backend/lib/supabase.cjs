const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '../.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables for backend')
}

// Create Supabase client with service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database operations for backend
const db = {
  // Generic CRUD operations with service role privileges
  select: async (table, columns = '*', filters = {}) => {
    let query = supabase.from(table).select(columns)
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
    return { data, error }
  },

  insert: async (table, data) => {
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
    return { data: result, error }
  },

  update: async (table, data, filters = {}) => {
    let query = supabase.from(table).update(data)
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    const { data: result, error } = await query.select()
    return { data: result, error }
  },

  delete: async (table, filters = {}) => {
    let query = supabase.from(table).delete()
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
    return { data, error }
  },

  // Raw SQL queries (use with caution)
  rpc: async (functionName, params = {}) => {
    const { data, error } = await supabase.rpc(functionName, params)
    return { data, error }
  },

  // Execute raw SQL (use with extreme caution)
  sql: async (query, params = []) => {
    const { data, error } = await supabase.rpc('exec_sql', { 
      query, 
      params: JSON.stringify(params) 
    })
    return { data, error }
  }
}

// Auth operations for backend
const auth = {
  // Get user by ID
  getUserById: async (userId) => {
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
    return { user, error }
  },

  // Create user
  createUser: async (userData) => {
    const { data: { user }, error } = await supabase.auth.admin.createUser(userData)
    return { user, error }
  },

  // Update user
  updateUser: async (userId, userData) => {
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(userId, userData)
    return { user, error }
  },

  // Delete user
  deleteUser: async (userId) => {
    const { data, error } = await supabase.auth.admin.deleteUser(userId)
    return { data, error }
  },

  // List users
  listUsers: async (page = 1, perPage = 1000) => {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page,
      perPage
    })
    return { users, error }
  }
}

module.exports = {
  supabase,
  db,
  auth
} 