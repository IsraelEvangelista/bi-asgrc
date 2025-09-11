import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qhtymaqiizferumxghyj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHltYXFpaXpmZXJ1bXhnaHlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MjcxODIsImV4cCI6MjA3MjMwMzE4Mn0.V8JBT1dyeQKv2fZyK9oqAUVWG5fG_4-RIy_xWTwWTkE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testQuery() {
  console.log('🔍 Testando query de riscos por natureza...');
  
  try {
    // Primeiro, testar a tabela principal
    console.log('\n1️⃣ Testando tabela 018_rel_risco...');
    const { data: relData, error: relError } = await supabase
      .from('018_rel_risco')
      .select('*')
      .limit(5);
    
    console.log('📊 Dados da 018_rel_risco:', { data: relData, error: relError });
    console.log('📈 Quantidade:', relData?.length || 0);
    
    if (relData && relData.length > 0) {
      console.log('📝 Primeiro registro:', relData[0]);
    }
    
    // Testar tabela natureza
    console.log('\n2️⃣ Testando tabela 010_natureza...');
    const { data: natData, error: natError } = await supabase
      .from('010_natureza')
      .select('*')
      .limit(5);
    
    console.log('📊 Dados da 010_natureza:', { data: natData, error: natError });
    console.log('📈 Quantidade:', natData?.length || 0);
    
    // Testar tabela matriz_riscos
    console.log('\n3️⃣ Testando tabela 006_matriz_riscos...');
    const { data: matData, error: matError } = await supabase
      .from('006_matriz_riscos')
      .select('*')
      .limit(5);
    
    console.log('📊 Dados da 006_matriz_riscos:', { data: matData, error: matError });
    console.log('📈 Quantidade:', matData?.length || 0);
    
    // Agora testar a query com left join
    console.log('\n4️⃣ Testando query com left join...');
    const { data, error } = await supabase
      .from('018_rel_risco')
      .select(`
        id_risco,
        id_natureza,
        010_natureza(
          desc_natureza
        ),
        006_matriz_riscos(
          severidade
        )
      `)
      .limit(10);
    
    console.log('📊 Resultado da query com left join:', { data, error });
    console.log('📈 Quantidade de registros:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('📝 Primeiro registro:', data[0]);
    }
    
  } catch (err) {
    console.error('❌ Erro na query:', err);
  }
}

testQuery();