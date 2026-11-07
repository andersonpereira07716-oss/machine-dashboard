import { createClient } from '@supabase/supabase-js';

// Em produção, utilize variáveis de ambiente do Vite (import.meta.env.VITE_SUPABASE_URL)
const SUPABASE_URL = 'SUA_SUPABASE_URL_AQUI';
const SUPABASE_ANON_KEY = 'SUA_SUPABASE_ANON_KEY_AQUI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
