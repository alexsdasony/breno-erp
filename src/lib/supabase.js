import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

import { SUPABASE_CONFIG, SECURITY_CONFIG } from '../config/constants.js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtSecret = SECURITY_CONFIG.JWT_SECRET

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase env vars missing");
  // Retorna fallback ou lança erro controlado
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Custom authentication functions for our users table
export const auth = {
  // Custom sign in with our users table
  signIn: async (email, password) => {
    try {
      // Query our custom users table
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'ativo')
        .limit(1)

      if (queryError) {
        return { data: null, error: queryError }
      }

      if (!users || users.length === 0) {
        return { 
          data: null, 
          error: { message: 'Usuário não encontrado' } 
        }
      }

      const user = users[0]

      // Verify password (assuming bcrypt hash)
      const bcrypt = await import('bcrypt')
      const isValidPassword = await bcrypt.compare(password, user.password)

      if (!isValidPassword) {
        return { 
          data: null, 
          error: { message: 'Senha incorreta' } 
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role,
          name: user.name 
        },
        jwtSecret,
        { expiresIn: '24h' }
      )

      // Create session-like object
      const session = {
        access_token: token,
        refresh_token: null,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name
        }
      }

      return { data: { session, user }, error: null }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Custom sign up
  signUp: async (email, password, userData = {}) => {
    try {
      const bcrypt = await import('bcrypt')
      const hashedPassword = await bcrypt.hash(password, 12)

      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password: hashedPassword,
          name: userData.name || 'Usuário',
          role: userData.role || 'user',
          status: 'ativo'
        })
        .select()

      return { data, error }
    } catch (error) {
      return { data: null, error: { message: error.message } }
    }
  },

  // Sign out
  signOut: async () => {
    // Clear local storage
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('auth_token')
    return { error: null }
  },

  // Get current user from JWT
  getUser: async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return { user: null, error: { message: 'No token found' } }
      }

      const decoded = jwt.verify(token, jwtSecret)
      return { user: decoded, error: null }
    } catch (error) {
      return { user: null, error: { message: 'Invalid token' } }
    }
  },

  // Get current session
  getSession: async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        return { session: null, error: { message: 'No session found' } }
      }

      const decoded = jwt.verify(token, jwtSecret)
      const session = {
        access_token: token,
        user: decoded
      }

      return { session, error: null }
    } catch (error) {
      return { session: null, error: { message: 'Invalid session' } }
    }
  }
}

// Database operations
export const db = {
  // Generic CRUD operations
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
  }
}

export default supabase 