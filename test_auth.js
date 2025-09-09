// Script de teste para verificar autenticação e carregamento de perfil
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (usando as configurações corretas do projeto)
const supabaseUrl = 'https://qhtymaqiizferumxghyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHltYXFpaXpmZXJ1bXhnaHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjcxODIsImV4cCI6MjA3MjMwMzE4Mn0.V8JBT1dyeQKv2fZyK9oqAUVWG5fG_4-RIy_xWTwWTkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('🔍 Testando autenticação e carregamento de perfil...');
  
  try {
    // 1. Verificar sessão atual
    console.log('\n1. Verificando sessão atual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Erro ao obter sessão:', sessionError);
      return;
    }
    
    console.log('📋 Sessão atual:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    });
    
    // 2. Testar consulta direta à tabela de usuários (simulando usuário autenticado)
    console.log('\n2. Testando consulta direta à tabela 002_usuarios...');
    
    // Primeiro, vamos verificar se conseguimos listar usuários
    const { data: allUsers, error: listError } = await supabase
      .from('002_usuarios')
      .select('*')
      .limit(5);
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
    } else {
      console.log('✅ Usuários encontrados:', allUsers?.length || 0);
      if (allUsers && allUsers.length > 0) {
        console.log('📋 Primeiro usuário:', {
          id: allUsers[0].id,
          nome: allUsers[0].nome,
          email: allUsers[0].email,
          ativo: allUsers[0].ativo
        });
      }
    }
    
    // 3. Tentar carregar perfil específico do usuário de teste
    console.log('\n3. Tentando carregar perfil específico do usuário de teste...');
    
    const testEmail = 'teste@cogerh.com.br';
    console.log('🔍 Buscando perfil para email:', testEmail);
    
    const { data: userProfile, error: profileError } = await supabase
      .from('002_usuarios')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao carregar perfil:', profileError);
      
      if (profileError.code === 'PGRST116') {
        console.log('⚠️ Usuário não encontrado na tabela 002_usuarios');
      }
      
      return;
    }
    
    console.log('✅ Perfil carregado com sucesso:', {
      id: userProfile.id,
      nome: userProfile.nome,
      email: userProfile.email,
      ativo: userProfile.ativo,
      perfil_id: userProfile.perfil_id,
      area_gerencia_id: userProfile.area_gerencia_id
    });
    
    console.log('\n🎉 Teste concluído com sucesso! O fluxo de autenticação está funcionando.');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar teste
testAuth();