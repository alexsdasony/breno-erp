import type { ID, Timestamped } from './common'
import type { UserRole } from './enums'

export interface User extends Timestamped {
  id: ID
  email: string
  name?: string | null
  role?: UserRole | null
  is_active?: boolean
  last_login?: string | null
  segment_id?: ID | null
}

export interface UserPayload {
  email?: string
  name?: string | null
  role?: UserRole | null
  is_active?: boolean
  status?: 'ativo' | 'inativo'
  segment_id?: ID | null
}

export interface UserProfile {
  id: ID
  user_id: ID
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  preferences?: Record<string, any> | null
}

export interface UserProfilePayload {
  full_name?: string | null
  avatar_url?: string | null
  phone?: string | null
  preferences?: Record<string, any> | null
}