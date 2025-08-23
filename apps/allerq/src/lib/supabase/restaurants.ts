import { supabase } from './client'
import { Restaurant, RestaurantInsert, RestaurantStatus } from './types'

export interface RestaurantInput {
  name: string
  address?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  logo_url?: string
  address_data?: any
  verification_data?: any
  location?: any
}

export class SupabaseRestaurantService {
  /**
   * Get all restaurants for current user (or all for superadmin)
   */
  async getRestaurants(): Promise<Restaurant[]> {
    try {
      console.log('[SupabaseRestaurants] Fetching restaurants')

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[SupabaseRestaurants] Failed to fetch restaurants:', error)
        throw new Error(`Failed to fetch restaurants: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Found ${data.length} restaurants`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Get restaurants failed:', error)
      throw error
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurant(id: string): Promise<Restaurant | null> {
    try {
      console.log(`[SupabaseRestaurants] Fetching restaurant: ${id}`)

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          console.log(`[SupabaseRestaurants] Restaurant not found: ${id}`)
          return null
        }
        console.error('[SupabaseRestaurants] Failed to fetch restaurant:', error)
        throw new Error(`Failed to fetch restaurant: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Found restaurant: ${data.name}`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Get restaurant failed:', error)
      throw error
    }
  }

  /**
   * Create a new restaurant
   */
  async createRestaurant(input: RestaurantInput): Promise<Restaurant> {
    try {
      console.log('[SupabaseRestaurants] Creating restaurant:', input.name)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const restaurantData: RestaurantInsert = {
        name: input.name.trim(),
        address: input.address?.trim() || null,
        phone: input.phone?.trim() || null,
        email: input.email?.trim() || null,
        website: input.website?.trim() || null,
        description: input.description?.trim() || null,
        logo_url: input.logo_url || null,
        owner_id: user.id,
        status: 'active',
        address_data: input.address_data || {},
        verification_data: input.verification_data || {},
        location: input.location || null,
        metadata: {
          created_via: 'supabase_migration',
          source: 'web_app'
        }
      }

      const { data, error } = await supabase
        .from('restaurants')
        .insert(restaurantData)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseRestaurants] Failed to create restaurant:', error)
        throw new Error(`Failed to create restaurant: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Restaurant created successfully: ${data.id}`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Create restaurant failed:', error)
      throw error
    }
  }

  /**
   * Update restaurant
   */
  async updateRestaurant(id: string, input: Partial<RestaurantInput>): Promise<Restaurant> {
    try {
      console.log(`[SupabaseRestaurants] Updating restaurant: ${id}`)

      const updateData: Partial<RestaurantInsert> = {}
      
      if (input.name) updateData.name = input.name.trim()
      if (input.address !== undefined) updateData.address = input.address?.trim() || null
      if (input.phone !== undefined) updateData.phone = input.phone?.trim() || null
      if (input.email !== undefined) updateData.email = input.email?.trim() || null
      if (input.website !== undefined) updateData.website = input.website?.trim() || null
      if (input.description !== undefined) updateData.description = input.description?.trim() || null
      if (input.logo_url !== undefined) updateData.logo_url = input.logo_url || null
      if (input.address_data) updateData.address_data = input.address_data
      if (input.verification_data) updateData.verification_data = input.verification_data
      if (input.location) updateData.location = input.location

      const { data, error } = await supabase
        .from('restaurants')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseRestaurants] Failed to update restaurant:', error)
        throw new Error(`Failed to update restaurant: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Restaurant updated successfully: ${id}`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Update restaurant failed:', error)
      throw error
    }
  }

  /**
   * Delete restaurant
   */
  async deleteRestaurant(id: string): Promise<void> {
    try {
      console.log(`[SupabaseRestaurants] Deleting restaurant: ${id}`)

      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('[SupabaseRestaurants] Failed to delete restaurant:', error)
        throw new Error(`Failed to delete restaurant: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Restaurant deleted successfully: ${id}`)
    } catch (error) {
      console.error('[SupabaseRestaurants] Delete restaurant failed:', error)
      throw error
    }
  }

  /**
   * Update restaurant status (superadmin only)
   */
  async updateRestaurantStatus(id: string, status: RestaurantStatus): Promise<Restaurant> {
    try {
      console.log(`[SupabaseRestaurants] Updating restaurant status: ${id} -> ${status}`)

      const { data, error } = await supabase
        .from('restaurants')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('[SupabaseRestaurants] Failed to update restaurant status:', error)
        throw new Error(`Failed to update restaurant status: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Restaurant status updated: ${id}`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Update restaurant status failed:', error)
      throw error
    }
  }

  /**
   * Get restaurants by owner (superadmin only)
   */
  async getRestaurantsByOwner(ownerId: string): Promise<Restaurant[]> {
    try {
      console.log(`[SupabaseRestaurants] Fetching restaurants for owner: ${ownerId}`)

      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[SupabaseRestaurants] Failed to fetch restaurants by owner:', error)
        throw new Error(`Failed to fetch restaurants by owner: ${error.message}`)
      }

      console.log(`[SupabaseRestaurants] ✅ Found ${data.length} restaurants for owner: ${ownerId}`)
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Get restaurants by owner failed:', error)
      throw error
    }
  }

  /**
   * Get restaurant statistics (superadmin only)
   */
  async getRestaurantStats() {
    try {
      console.log('[SupabaseRestaurants] Fetching restaurant statistics')

      const { data, error } = await supabase
        .from('superadmin_dashboard')
        .select('*')
        .eq('resource_type', 'restaurants')
        .single()

      if (error) {
        console.error('[SupabaseRestaurants] Failed to fetch restaurant stats:', error)
        throw new Error(`Failed to fetch restaurant stats: ${error.message}`)
      }

      console.log('[SupabaseRestaurants] ✅ Restaurant statistics fetched')
      return data
    } catch (error) {
      console.error('[SupabaseRestaurants] Get restaurant stats failed:', error)
      throw error
    }
  }
}

export const restaurantService = new SupabaseRestaurantService()
