import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkHistAcao() {
  try {
    console.log('🔍 Verificando dados na tabela 023_hist_acao...');
    
    // Verificar se há dados na tabela 023_hist_acao
    const { count: totalHist, error: countError } = await supabase
      .from('023_hist_acao')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar histórico:', countError);
      return;
    }
    
    console.log(`📊 Total de registros em 023_hist_acao: ${totalHist}`);
    
    if (totalHist > 0) {
      // Buscar alguns registros de exemplo
      const { data: histData, error: histError } = await supabase
        .from('023_hist_acao')
        .select('id_acao, perc_implementacao, created_at')
        .limit(5);
      
      if (histError) {
        console.error('❌ Erro ao buscar histórico:', histError);
        return;
      }
      
      console.log('\n📋 Primeiros 5 registros do histórico:');
      histData.forEach((hist, index) => {
        console.log(`${index + 1}. ID Ação: ${hist.id_acao}`);
        console.log(`   Perc. Implementação: ${hist.perc_implementacao}%`);
        console.log(`   Data: ${hist.created_at}\n`);
      });
    }
    
    // Verificar se há ações com prazos definidos
    const { data: acoesComPrazo, error: prazoError } = await supabase
      .from('009_acoes')
      .select('id, desc_acao, prazo_implementacao')
      .not('prazo_implementacao', 'is', null)
      .limit(5);
    
    if (prazoError) {
      console.error('❌ Erro ao buscar ações com prazo:', prazoError);
      return;
    }
    
    console.log(`\n📅 Ações com prazo de implementação definido: ${acoesComPrazo.length}`);
    
    if (acoesComPrazo.length > 0) {
      console.log('\n📋 Exemplos de ações com prazo:');
      acoesComPrazo.forEach((acao, index) => {
        console.log(`${index + 1}. ${acao.desc_acao.substring(0, 50)}...`);
        console.log(`   Prazo: ${acao.prazo_implementacao}\n`);
      });
    }
    
    // Verificar se há novos prazos na tabela 022_fato_prazo
    const { count: totalFatoPrazo, error: fatoPrazoError } = await supabase
      .from('022_fato_prazo')
      .select('*', { count: 'exact', head: true });
    
    if (fatoPrazoError) {
      console.error('❌ Erro ao contar fato_prazo:', fatoPrazoError);
      return;
    }
    
    console.log(`\n📊 Total de registros em 022_fato_prazo: ${totalFatoPrazo}`);
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

checkHistAcao();