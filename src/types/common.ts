export type ID = string

export type Timestamped = {
  created_at?: string
  updated_at?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  segment_id?: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  page: number
  limit: number
  total?: number
}
