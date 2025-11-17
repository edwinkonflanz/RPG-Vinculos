import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          plan: 'free' | 'premium'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          plan?: 'free' | 'premium'
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          title: string
          content: string
          folder_id: string | null
          owner_id: string
          is_template: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string
          folder_id?: string | null
          owner_id: string
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          folder_id?: string | null
          owner_id?: string
          is_template?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          owner_id: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          parent_id?: string | null
          created_at?: string
        }
      }
      collaborators: {
        Row: {
          id: string
          note_id: string
          user_id: string
          permission: 'view' | 'edit'
          created_at: string
        }
        Insert: {
          id?: string
          note_id: string
          user_id: string
          permission?: 'view' | 'edit'
          created_at?: string
        }
        Update: {
          id?: string
          note_id?: string
          user_id?: string
          permission?: 'view' | 'edit'
          created_at?: string
        }
      }
    }
  }
}
