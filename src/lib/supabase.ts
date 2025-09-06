import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Configurações para melhorar a estabilidade da conexão
const supabaseOptions = {
  auth: {
    // Evita reconexões desnecessárias durante mudanças de visibilidade
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  // Configurações de realtime para evitar reconexões excessivas
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseOptions);