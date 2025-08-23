export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      menus: {
        Row: {
          created_at: string
          description: string | null
          id: string
          metadata: Json
          name: string
          restaurant_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name: string
          restaurant_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json
          name?: string
          restaurant_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      restaurants: {
        Row: {
          address: string | null
          address_data: Json
          approved_at: string | null
          approved_by: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          location: unknown | null
          logo_url: string | null
          metadata: Json
          name: string
          owner_id: string | null
          phone: string | null
          status: Database["public"]["Enums"]["restaurant_status"]
          updated_at: string
          verification_data: Json
          website: string | null
        }
        Insert: {
          address?: string | null
          address_data?: Json
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: unknown | null
          logo_url?: string | null
          metadata?: Json
          name: string
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["restaurant_status"]
          updated_at?: string
          verification_data?: Json
          website?: string | null
        }
        Update: {
          address?: string | null
          address_data?: Json
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          location?: unknown | null
          logo_url?: string | null
          metadata?: Json
          name?: string
          owner_id?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["restaurant_status"]
          updated_at?: string
          verification_data?: Json
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          is_active: boolean
          is_superadmin: boolean
          last_login: string | null
          metadata: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          is_active?: boolean
          is_superadmin?: boolean
          last_login?: string | null
          metadata?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          is_superadmin?: boolean
          last_login?: string | null
          metadata?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      superadmin_dashboard: {
        Row: {
          count: string | null
          details: Json | null
          resource_type: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_superadmin_config: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          display_name: string
          role: Database["public"]["Enums"]["user_role"]
          is_superadmin: boolean
          created_at: string
        }[]
      }
      create_initial_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      promote_to_superadmin: {
        Args: {
          user_email: string
        }
        Returns: undefined
      }
    }
    Enums: {
      restaurant_status: "active" | "inactive" | "pending_approval" | "suspended"
      user_role: "superadmin" | "restaurant_admin" | "manager" | "regular_user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type User = Database['public']['Tables']['user_profiles']['Row']
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Menu = Database['public']['Tables']['menus']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type RestaurantStatus = Database['public']['Enums']['restaurant_status']

export type UserInsert = Database['public']['Tables']['user_profiles']['Insert']
export type RestaurantInsert = Database['public']['Tables']['restaurants']['Insert']
export type MenuInsert = Database['public']['Tables']['menus']['Insert']
