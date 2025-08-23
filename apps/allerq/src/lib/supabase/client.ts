import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Singleton pattern to ensure only one client instance
let _supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

// Function to get Supabase client with proper error handling
function getSupabaseClient() {
  if (_supabaseClient) {
    return _supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only log in development or when there are issues
  if (process.env.NODE_ENV === 'development' || !supabaseUrl || !supabaseAnonKey) {
    console.log('[Supabase Client] Creating client instance:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseAnonKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      isBrowser: typeof window !== 'undefined'
    });
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = `Missing Supabase environment variables: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`;
    console.error('[Supabase Client]', error);
    throw new Error(error);
  }

  _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  return _supabaseClient;
}

export const supabase = getSupabaseClient();

// Note: Admin client moved to separate file (admin.ts) for server-side only use
