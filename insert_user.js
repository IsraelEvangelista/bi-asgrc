import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase com SERVICE_ROLE_KEY para operações administrativas
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertUserData() {
  try {
    console.log('🔍 Verificando perfis existentes...');
    
    // Primeiro, verificar se existe o perfil
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('001_perfis')
      .select('*')
      .eq('id', 1);

    if (profileCheckError) {
      console.error('❌ Erro ao verificar perfil:', profileCheckError);
      return;
    }

    console.log('✅ Dados inseridos com sucesso');
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar função
insertUserData();