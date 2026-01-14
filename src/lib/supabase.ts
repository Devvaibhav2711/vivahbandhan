import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
}

// Fallback to prevent app crash if env vars are missing
const url = supabaseUrl || '';
const key = supabaseAnonKey || '';

export const supabase = createClient(url, key);
