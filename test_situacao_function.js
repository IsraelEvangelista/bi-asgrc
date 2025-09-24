import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSituacaoFunction() {
  try {
    console.log('🧪 Testando a função calcular_situacao_acao...');
    
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
    
    // 1. Primeiro, vamos adicionar um prazo de implementação para esta ação
    console.log('\n1️⃣ Adicionando prazo de implementação (data futura)...');
    const dataFutura = new Date();
    dataFutura.setDate(dataFutura.getDate() + 30); // 30 dias no futuro
    
    const { error: updateError1 } = await supabase
      .from('009_acoes')
      .update({ 
        prazo_implementacao: dataFutura.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', idAcaoTeste);
    
    if (updateError1) {
      console.error('❌ Erro ao atualizar prazo:', updateError1);
      return;
    }
    
    // Aguardar um pouco para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar a situação
    const { data: acao1, error: acao1Error } = await supabase
      .from('009_acoes')
      .select('situacao, prazo_implementacao')
      .eq('id', idAcaoTeste)
      .single();
    
    if (acao1Error) {
      console.error('❌ Erro ao buscar ação atualizada:', acao1Error);
      return;
    }
    
    console.log(`   Prazo: ${acao1.prazo_implementacao}`);
    console.log(`   Situação: ${acao1.situacao}`);
    
    // 2. Agora vamos testar com uma data no passado
    console.log('\n2️⃣ Testando com prazo no passado...');
    const dataPassada = new Date();
    dataPassada.setDate(dataPassada.getDate() - 10); // 10 dias no passado
    
    const { error: updateError2 } = await supabase
      .from('009_acoes')
      .update({ 
        prazo_implementacao: dataPassada.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', idAcaoTeste);
    
    if (updateError2) {
      console.error('❌ Erro ao atualizar prazo:', updateError2);
      return;
    }
    
    // Aguardar um pouco para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar a situação
    const { data: acao2, error: acao2Error } = await supabase
      .from('009_acoes')
      .select('situacao, prazo_implementacao')
      .eq('id', idAcaoTeste)
      .single();
    
    if (acao2Error) {
      console.error('❌ Erro ao buscar ação atualizada:', acao2Error);
      return;
    }
    
    console.log(`   Prazo: ${acao2.prazo_implementacao}`);
    console.log(`   Situação: ${acao2.situacao}`);
    
    // 3. Testar com percentual de implementação 100%
    console.log('\n3️⃣ Testando com 100% de implementação...');
    
    // Atualizar o histórico para 100%
    const { error: histError } = await supabase
      .from('023_hist_acao')
      .insert({
        id_acao: idAcaoTeste,
        perc_implementacao: 100,
        created_at: new Date().toISOString()
      });
    
    if (histError) {
      console.error('❌ Erro ao inserir histórico:', histError);
      return;
    }
    
    // Aguardar um pouco para o trigger processar
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verificar a situação
    const { data: acao3, error: acao3Error } = await supabase
      .from('009_acoes')
      .select('situacao, prazo_implementacao')
      .eq('id', idAcaoTeste)
      .single();
    
    if (acao3Error) {
      console.error('❌ Erro ao buscar ação atualizada:', acao3Error);
      return;
    }
    
    console.log(`   Prazo: ${acao3.prazo_implementacao}`);
    console.log(`   Situação: ${acao3.situacao}`);
    
    console.log('\n✅ Teste da função concluído!');
    console.log('\n📋 Resumo dos testes:');
    console.log('1. Prazo futuro + 0% implementação → Deveria ser "No Prazo"');
    console.log('2. Prazo passado + 0% implementação → Deveria ser "Atrasado"');
    console.log('3. Prazo passado + 100% implementação → Deveria ser "No Prazo"');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testSituacaoFunction();