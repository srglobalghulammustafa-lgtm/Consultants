import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env;
const supabaseUrl = env?.VITE_SUPABASE_URL || 'https://lqggahnqfbihbnydpfre.supabase.co';
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

