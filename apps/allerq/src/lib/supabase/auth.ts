import { supabase } from './client'
import { User, UserRole } from './types'

export interface AuthUser {
  id: string
  email: string
  display_name: string
  role: UserRole
  is_superadmin: boolean
  is_active: boolean
  last_login: string | null
  created_at: string
}

export interface SignUpData {
  email: string
  password: string
  display_name: string
  role?: UserRole
}

export interface SignInData {
  email: string
  password: string
}

export class SupabaseAuthService {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, display_name, role = 'manager' }: SignUpData) {
    try {
      console.log(`[SupabaseAuth] Starting signup for: ${email}`)

      // Create auth user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('[SupabaseAuth] Auth signup failed:', authError)
        throw new Error(`Authentication signup failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication signup')
      }

      console.log(`[SupabaseAuth] Auth user created: ${authData.user.id}`)

      // User profile will be created automatically by trigger
      // But let's verify it was created
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('[SupabaseAuth] User profile fetch failed:', userError)
        throw new Error(`User profile not found: ${userError.message}`)
      }

      console.log(`[SupabaseAuth] ✅ Signup completed successfully for: ${email}`)

      return {
        user: userData as AuthUser,
        session: authData.session
      }
    } catch (error) {
      console.error('[SupabaseAuth] Signup failed:', error)
      throw error
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInData) {
    try {
      console.log(`[SupabaseAuth] Starting signin for: ${email}`)

      // Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[SupabaseAuth] Auth signin failed:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user returned from authentication')
      }

      console.log(`[SupabaseAuth] Auth successful: ${authData.user.id}`)

      // Get user profile from our user_profiles table
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (userError) {
        console.error('[SupabaseAuth] User profile fetch failed:', userError)
        throw new Error(`User profile not found: ${userError.message}`)
      }

      // Update last login
      await supabase
        .from('user_profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authData.user.id)

      console.log(`[SupabaseAuth] ✅ Signin completed successfully for: ${email}`)

      return {
        user: userData as AuthUser,
        session: authData.session
      }
    } catch (error) {
      console.error('[SupabaseAuth] Signin failed:', error)
      throw error
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      console.log('[SupabaseAuth] Signing out user')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('[SupabaseAuth] Signout failed:', error)
        throw new Error(`Signout failed: ${error.message}`)
      }

      console.log('[SupabaseAuth] ✅ Signout completed successfully')
    } catch (error) {
      console.error('[SupabaseAuth] Signout failed:', error)
      throw error
    }
  }

  /**
   * Get current user session
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        return null
      }

      const { data: userData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('[SupabaseAuth] Current user fetch failed:', error)
        return null
      }

      return userData as AuthUser
    } catch (error) {
      console.error('[SupabaseAuth] Get current user failed:', error)
      return null
    }
  }

  /**
   * Check if current user is superadmin
   */
  async isSuperadmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser()
      return user?.is_superadmin || user?.role === 'superadmin' || false
    } catch (error) {
      console.error('[SupabaseAuth] Superadmin check failed:', error)
      return false
    }
  }

  /**
   * Get user by ID (superadmin only)
   */
  async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[SupabaseAuth] Get user by ID failed:', error)
        return null
      }

      return data as AuthUser
    } catch (error) {
      console.error('[SupabaseAuth] Get user by ID failed:', error)
      return null
    }
  }

  /**
   * Promote user to superadmin (superadmin only)
   */
  async promoteToSuperadmin(userEmail: string): Promise<void> {
    try {
      console.log(`[SupabaseAuth] Promoting user to superadmin: ${userEmail}`)

      const { error } = await supabase.rpc('promote_to_superadmin', {
        user_email: userEmail
      })

      if (error) {
        console.error('[SupabaseAuth] Promote to superadmin failed:', error)
        throw new Error(`Failed to promote user: ${error.message}`)
      }

      console.log(`[SupabaseAuth] ✅ User promoted to superadmin: ${userEmail}`)
    } catch (error) {
      console.error('[SupabaseAuth] Promote to superadmin failed:', error)
      throw error
    }
  }
}

export const authService = new SupabaseAuthService()
