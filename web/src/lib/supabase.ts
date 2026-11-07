import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqggahnqfbihbnydpfre.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NqYO8vvQZG9E5r4cnj89XQ_yEodIZW1';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
