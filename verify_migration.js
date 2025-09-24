import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  try {
    console.log('🔍 Verificando se a migração foi aplicada corretamente...');
    
    // Verificar algumas ações na tabela 009_acoes
    const { data: acoes, error } = await supabase
      .from('009_acoes')
      .select('id, desc_acao, prazo_implementacao, novo_prazo, situacao, status')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao consultar ações:', error);
      return;
    }
    
    console.log('\n📊 Primeiras 5 ações na tabela 009_acoes:');
    console.log('=' .repeat(80));
    
    acoes.forEach((acao, index) => {
      console.log(`\n${index + 1}. ID: ${acao.id}`);
      console.log(`   Descrição: ${acao.desc_acao?.substring(0, 50)}...`);
      console.log(`   Prazo Implementação: ${acao.prazo_implementacao || 'N/A'}`);
      console.log(`   Novo Prazo: ${acao.novo_prazo || 'N/A'}`);
      console.log(`   Situação: ${acao.situacao || 'NULL'}`);
      console.log(`   Status: ${acao.status || 'NULL'}`);
    });
    
    // Verificar quantas ações têm situação preenchida
    const { data: situacaoStats, error: statsError } = await supabase
      .from('009_acoes')
      .select('situacao')
      .not('situacao', 'is', null);
    
    if (statsError) {
      console.error('❌ Erro ao consultar estatísticas:', statsError);
      return;
    }
    
    const totalComSituacao = situacaoStats.length;
    
    // Contar total de ações
    const { count: totalAcoes, error: countError } = await supabase
      .from('009_acoes')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Erro ao contar ações:', countError);
      return;
    }
    
    console.log('\n📈 Estatísticas da migração:');
    console.log('=' .repeat(40));
    console.log(`Total de ações: ${totalAcoes}`);
    console.log(`Ações com situação preenchida: ${totalComSituacao}`);
    console.log(`Percentual preenchido: ${((totalComSituacao / totalAcoes) * 100).toFixed(1)}%`);
    
    // Verificar distribuição das situações
    const { data: distribuicao, error: distError } = await supabase
      .from('009_acoes')
      .select('situacao')
      .not('situacao', 'is', null);
    
    if (!distError && distribuicao) {
      const contadores = distribuicao.reduce((acc, item) => {
        acc[item.situacao] = (acc[item.situacao] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Distribuição das situações:');
      Object.entries(contadores).forEach(([situacao, count]) => {
        console.log(`   ${situacao}: ${count} ações`);
      });
    }
    
    console.log('\n✅ Verificação concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

verifyMigration();