import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDirectFunction() {
  try {
    console.log('🧪 Testando a função calcular_situacao_acao diretamente...');
    
    // Buscar uma ação que tenha histórico
    const { data: acaoComHist, error: acaoError } = await supabase
      .from('023_hist_acao')
      .select('id_acao')
      .limit(1)
      .single();
    
    if (acaoError || !acaoComHist) {
      console.error('❌ Erro ao buscar ação com histórico:', acaoError);
      return;
    }
    
    const idAcaoTeste = acaoComHist.id_acao;
    console.log(`📋 Testando com a ação ID: ${idAcaoTeste}`);
    
    // Testar a função diretamente via RPC
    console.log('\n🔧 Chamando a função calcular_situacao_acao diretamente...');
    
    const { data: resultado, error: funcError } = await supabase
      .rpc('calcular_situacao_acao', { p_id_acao: idAcaoTeste });
    
    if (funcError) {
      console.error('❌ Erro ao chamar função:', funcError);
      return;
    }
    
    console.log(`✅ Resultado da função: ${resultado}`);
    
    // Verificar os dados da ação
    const { data: acao, error: acaoDetailError } = await supabase
      .from('009_acoes')
      .select('id, desc_acao, prazo_implementacao, novo_prazo, situacao')
      .eq('id', idAcaoTeste)
      .single();
    
    if (acaoDetailError) {
      console.error('❌ Erro ao buscar detalhes da ação:', acaoDetailError);
      return;
    }
    
    console.log('\n📋 Detalhes da ação:');
    console.log(`   ID: ${acao.id}`);
    console.log(`   Descrição: ${acao.desc_acao?.substring(0, 50)}...`);
    console.log(`   Prazo Implementação: ${acao.prazo_implementacao || 'NULL'}`);
    console.log(`   Novo Prazo: ${acao.novo_prazo || 'NULL'}`);
    console.log(`   Situação Atual: ${acao.situacao || 'NULL'}`);
    
    // Verificar o histórico desta ação
    const { data: historico, error: histError } = await supabase
      .from('023_hist_acao')
      .select('perc_implementacao, created_at')
      .eq('id_acao', idAcaoTeste)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (histError) {
      console.error('❌ Erro ao buscar histórico:', histError);
      return;
    }
    
    console.log('\n📊 Histórico da ação (últimos 3 registros):');
    historico.forEach((hist, index) => {
      console.log(`   ${index + 1}. ${hist.perc_implementacao}% em ${hist.created_at}`);
    });
    
    // Verificar se há registros na tabela 022_fato_prazo para esta ação
    const { data: fatoPrazo, error: fatoPrazoError } = await supabase
      .from('022_fato_prazo')
      .select('novo_prazo, created_at')
      .eq('id_acao', idAcaoTeste)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (fatoPrazoError) {
      console.error('❌ Erro ao buscar fato_prazo:', fatoPrazoError);
      return;
    }
    
    if (fatoPrazo && fatoPrazo.length > 0) {
      console.log('\n📅 Novo prazo encontrado:');
      console.log(`   Novo Prazo: ${fatoPrazo[0].novo_prazo}`);
      console.log(`   Data: ${fatoPrazo[0].created_at}`);
    } else {
      console.log('\n📅 Nenhum novo prazo encontrado na tabela 022_fato_prazo');
    }
    
    console.log('\n✅ Teste direto da função concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testDirectFunction();