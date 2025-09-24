import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarSituacaoAcoes() {
  try {
    console.log('=== VERIFICAÇÃO FINAL DA REGRA DE SITUAÇÃO ===\n');
    
    // 1. Verificar algumas ações com situação calculada
    console.log('1. Verificando ações com situação calculada:');
    const { data: acoes, error: acoesError } = await supabase
      .from('009_acoes')
      .select('id, desc_acao, situacao, novo_prazo, prazo_implementacao')
      .not('situacao', 'is', null)
      .limit(5);
    
    if (acoesError) {
      console.error('Erro ao buscar ações:', acoesError);
      return;
    }
    
    if (acoes && acoes.length > 0) {
      acoes.forEach(acao => {
        console.log(`- ID: ${acao.id}`);
        console.log(`  Descrição: ${acao.desc_acao?.substring(0, 50)}...`);
        console.log(`  Situação: ${acao.situacao}`);
        console.log(`  Novo Prazo: ${acao.novo_prazo || 'N/A'}`);
        console.log(`  Prazo Implementação: ${acao.prazo_implementacao || 'N/A (limpo)'}`);
        console.log('');
      });
    } else {
      console.log('Nenhuma ação com situação definida encontrada.');
    }
    
    // 2. Contar situações
    console.log('2. Contagem de situações:');
    const { data: contagem, error: contagemError } = await supabase
      .from('009_acoes')
      .select('situacao')
      .not('situacao', 'is', null);
    
    if (contagemError) {
      console.error('Erro ao contar situações:', contagemError);
      return;
    }
    
    const noPrazo = contagem?.filter(a => a.situacao === 'No Prazo').length || 0;
    const atrasado = contagem?.filter(a => a.situacao === 'Atrasado').length || 0;
    const total = contagem?.length || 0;
    
    console.log(`- No Prazo: ${noPrazo}`);
    console.log(`- Atrasado: ${atrasado}`);
    console.log(`- Total com situação: ${total}`);
    
    // 3. Verificar total de ações
    const { count: totalAcoes } = await supabase
      .from('009_acoes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`- Total de ações: ${totalAcoes}`);
    console.log(`- Percentual com situação: ${((total / totalAcoes) * 100).toFixed(1)}%\n`);
    
    // 4. Testar função de cálculo diretamente
    console.log('3. Testando função calcular_situacao_acao:');
    if (acoes && acoes.length > 0) {
      const primeiraAcao = acoes[0];
      const { data: resultado, error: funcaoError } = await supabase
        .rpc('calcular_situacao_acao', { acao_id: primeiraAcao.id });
      
      if (funcaoError) {
        console.error('Erro ao testar função:', funcaoError);
      } else {
        console.log(`- Ação: ${primeiraAcao.desc_acao?.substring(0, 50)}...`);
        console.log(`- Situação atual: ${primeiraAcao.situacao}`);
        console.log(`- Situação calculada: ${resultado}`);
        console.log(`- Consistente: ${primeiraAcao.situacao === resultado ? 'SIM' : 'NÃO'}\n`);
      }
    }
    
    // 5. Verificar se prazo_implementacao foi limpo
    console.log('4. Verificando limpeza do campo prazo_implementacao:');
    const { data: prazosNaoLimpos, error: prazosError } = await supabase
      .from('009_acoes')
      .select('id, desc_acao, prazo_implementacao')
      .not('prazo_implementacao', 'is', null)
      .limit(3);
    
    if (prazosError) {
      console.error('Erro ao verificar prazos:', prazosError);
    } else if (prazosNaoLimpos && prazosNaoLimpos.length > 0) {
      console.log('ATENÇÃO: Ainda existem registros com prazo_implementacao:');
      prazosNaoLimpos.forEach(acao => {
        console.log(`- ${acao.desc_acao?.substring(0, 40)}...: ${acao.prazo_implementacao}`);
      });
    } else {
      console.log('✓ Campo prazo_implementacao foi limpo corretamente.');
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro durante verificação:', error);
  }
}

verificarSituacaoAcoes();