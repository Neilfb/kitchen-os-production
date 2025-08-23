import { createClient } from '@supabase/supabase-js'
import { Database } from './types'

// Server-side admin client - ONLY for server-side use
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    const error = `Missing Supabase admin environment variables: URL=${!!supabaseUrl}, SERVICE_KEY=${!!serviceRoleKey}`;
    console.error('[Supabase Admin Client]', error);
    throw new Error(error);
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Only export admin client for server-side use
export const supabaseAdmin = createSupabaseAdminClient();
