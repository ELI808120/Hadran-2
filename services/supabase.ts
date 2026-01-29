
import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Initialization
 * The environment variables MUST be provided by the deployment platform (Vercel, Netlify, etc.)
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL: Supabase URL or Anon Key is missing in process.env");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
