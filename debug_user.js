import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qhtymaqiizferumxghyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHltYXFpaXpmZXJ1bXhnaHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjcxODIsImV4cCI6MjA3MjMwMzE4Mn0.V8JBT1dyeQKv2fZyK9oqAUVWG5fG_4-RIy_xWTwWTkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  try {
    // Verificar usuário específico
    const { data: userData, error: userError } = await supabase
      .from('002_usuarios')
      .select('id, nome, email, perfil_id')
      .eq('id', 'cf541a54-153f-4523-a57a-9ae9dab899cc')
      .single();

    if (userError) {
      console.log('Erro ao buscar usuário:', userError);
    } else {
      console.log('Usuário encontrado:', userData);
    }

    // Verificar usuário por email
    const { data: emailData, error: emailError } = await supabase
      .from('002_usuarios')
      .select('id, nome, email, perfil_id')
      .eq('email', 'isademocrata@gmail.com')
      .single();

    if (emailError) {
      console.log('Erro ao buscar por email:', emailError);
    } else {
      console.log('Usuário por email:', emailData);
    }

    // Listar todos os usuários
    const { data: allUsers, error: allError } = await supabase
      .from('002_usuarios')
      .select('id, nome, email, perfil_id');

    if (allError) {
      console.log('Erro ao listar usuários:', allError);
    } else {
      console.log('Todos os usuários:', allUsers);
    }

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

checkUser();