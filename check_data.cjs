const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

(async () => {
  try {
    console.log('🔍 Verificando dados dos processos...');
    
    const result = await supabase
      .from('005_processos')
      .select('id, processo, responsavel_processo, objetivo_processo, entregas_processo')
      .limit(5);
    
    console.log('📊 Dados dos processos:');
    result.data?.forEach((processo, index) => {
      console.log(`\n${index + 1}. ${processo.processo}`);
      console.log('   Responsável:', processo.responsavel_processo || 'NULL');
      console.log('   Objetivo:', processo.objetivo_processo || 'NULL');
      console.log('   Entregas:', processo.entregas_processo || 'NULL');
    });
    
    console.log('\n🔍 Verificando dados das áreas...');
    const areas = await supabase
      .from('003_areas')
      .select('id, gerencia, sigla_area')
      .limit(3);
    
    console.log('📊 Dados das áreas:');
    areas.data?.forEach((area, index) => {
      console.log(`${index + 1}. ${area.gerencia} - ${area.sigla_area} (ID: ${area.id})`);
    });
    
  } catch (err) {
    console.log('❌ Erro:', err);
  }
})();