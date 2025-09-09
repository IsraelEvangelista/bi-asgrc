import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de tabelas conhecidas do projeto
const knownTables = [
  '001_perfis', '002_usuarios', '003_processos', '004_riscos', '005_acoes',
  '006_indicadores', '007_categorias', '008_subcategorias', '009_tipos_risco',
  '010_niveis_risco', '011_status_risco', '012_frequencias', '013_impactos',
  '014_probabilidades', '015_controles', '016_avaliacoes', '017_matriz_riscos'
];

async function checkRLSAndPolicies() {
  console.log('🔒 VERIFICAÇÃO DETALHADA - RLS E POLÍTICAS');
  console.log('=' .repeat(50));
  
  const issues = {
    info: [],
    warnings: [],
    errors: []
  };

  try {
    // 1. Verificar quais tabelas existem realmente
    console.log('\n📋 1. Verificando tabelas existentes...');
    
    const existingTables = [];
    for (const tableName of knownTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          existingTables.push(tableName);
          console.log(`✅ Tabela encontrada: ${tableName}`);
        } else {
          console.log(`❌ Tabela não encontrada: ${tableName}`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar tabela ${tableName}:`, error.message);
      }
    }
    
    console.log(`\n📊 Total de tabelas existentes: ${existingTables.length}/${knownTables.length}`);
    
    if (existingTables.length === 0) {
      issues.errors.push({
        type: 'NO_TABLES_FOUND',
        severity: 'ERROR',
        description: 'Nenhuma tabela foi encontrada no banco de dados',
        recommendation: 'Verificar se as migrações foram executadas corretamente'
      });
      return issues;
    }

    // 2. Verificar acesso público (role anon) para cada tabela
    console.log('\n🌐 2. Verificando acesso público (role anon)...');
    
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    const publiclyAccessibleTables = [];
    
    for (const tableName of existingTables) {
      try {
        const { data, error } = await anonClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          publiclyAccessibleTables.push(tableName);
          console.log(`⚠️ Tabela ${tableName}: ACESSÍVEL PUBLICAMENTE`);
          
          issues.warnings.push({
            type: 'PUBLIC_TABLE_ACCESS',
            severity: 'WARNING',
            table: tableName,
            description: `Tabela "${tableName}" está acessível publicamente (sem autenticação)`,
            recommendation: 'Implementar RLS ou remover permissões do role anon se não for necessário acesso público'
          });
        } else {
          console.log(`✅ Tabela ${tableName}: PROTEGIDA (acesso negado para anon)`);
        }
      } catch (error) {
        console.log(`✅ Tabela ${tableName}: PROTEGIDA (erro: ${error.message})`);
      }
    }
    
    // 3. Verificar se há dados sensíveis expostos publicamente
    console.log('\n🔍 3. Verificando exposição de dados sensíveis...');
    
    const sensitiveKeywords = ['password', 'senha', 'token', 'secret', 'key', 'hash', 'cpf', 'cnpj', 'email'];
    
    for (const tableName of publiclyAccessibleTables) {
      try {
        const { data, error } = await anonClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          const sensitiveColumns = columns.filter(col => 
            sensitiveKeywords.some(keyword => 
              col.toLowerCase().includes(keyword)
            )
          );
          
          if (sensitiveColumns.length > 0) {
            issues.errors.push({
              type: 'SENSITIVE_DATA_EXPOSED',
              severity: 'ERROR',
              table: tableName,
              columns: sensitiveColumns,
              description: `Dados sensíveis expostos publicamente na tabela "${tableName}": ${sensitiveColumns.join(', ')}`,
              recommendation: 'URGENTE: Implementar RLS ou remover acesso público imediatamente'
            });
            console.log(`🚨 CRÍTICO: Dados sensíveis expostos em ${tableName}: ${sensitiveColumns.join(', ')}`);
          }
          
          // Verificar se há dados reais expostos
          const sampleData = data[0];
          const nonNullFields = Object.entries(sampleData)
            .filter(([key, value]) => value !== null && value !== '')
            .map(([key]) => key);
          
          if (nonNullFields.length > 2) { // Mais que id e created_at
            issues.warnings.push({
              type: 'DATA_EXPOSURE',
              severity: 'WARNING',
              table: tableName,
              description: `Tabela "${tableName}" expõe dados reais publicamente (${nonNullFields.length} campos com dados)`,
              recommendation: 'Avaliar se a exposição pública destes dados é necessária'
            });
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar dados sensíveis em ${tableName}:`, error.message);
      }
    }
    
    // 4. Verificar tentativas de operações de escrita como anon
    console.log('\n✏️ 4. Verificando proteção contra escrita pública...');
    
    for (const tableName of existingTables.slice(0, 3)) { // Testar apenas algumas tabelas
      try {
        // Tentar inserir dados como anon
        const { data, error } = await anonClient
          .from(tableName)
          .insert({ test_field: 'test_value' })
          .select();
        
        if (!error) {
          issues.errors.push({
            type: 'PUBLIC_WRITE_ACCESS',
            severity: 'ERROR',
            table: tableName,
            description: `Tabela "${tableName}" permite inserção de dados por usuários não autenticados`,
            recommendation: 'CRÍTICO: Implementar RLS para prevenir inserções não autorizadas'
          });
          console.log(`🚨 CRÍTICO: Escrita pública permitida em ${tableName}`);
          
          // Tentar remover o dado de teste
          try {
            await supabase.from(tableName).delete().eq('test_field', 'test_value');
          } catch (cleanupError) {
            console.log(`⚠️ Não foi possível remover dado de teste de ${tableName}`);
          }
        } else {
          console.log(`✅ Tabela ${tableName}: Protegida contra escrita pública`);
        }
      } catch (error) {
        console.log(`✅ Tabela ${tableName}: Protegida (erro: ${error.message})`);
      }
    }
    
    // 5. Verificar configurações de autenticação
    console.log('\n🔐 5. Verificando configurações de autenticação...');
    
    // Tentar operações que requerem autenticação
    try {
      const { data: user, error: userError } = await anonClient.auth.getUser();
      
      if (!user || !user.user) {
        console.log('✅ Usuário não autenticado corretamente identificado');
        issues.info.push({
          type: 'AUTH_STATE_CORRECT',
          severity: 'INFO',
          description: 'Estado de autenticação está sendo gerenciado corretamente',
          recommendation: 'Continuar monitorando sessões de usuário'
        });
      }
    } catch (error) {
      console.log('✅ Sistema de autenticação funcionando:', error.message);
    }
    
    // 6. Verificar políticas de senha (tentativa com senha fraca)
    console.log('\n🔑 6. Testando políticas de senha...');
    
    const weakPasswords = ['123', '123456', 'password', 'admin'];
    let weakPasswordAccepted = false;
    
    for (const weakPass of weakPasswords) {
      try {
        const { data, error } = await anonClient.auth.signUp({
          email: `[MASKED_TEST_EMAIL]`,
          password: '[MASKED_WEAK_PASSWORD]'
        });
        
        if (!error) {
          weakPasswordAccepted = true;
          issues.warnings.push({
            type: 'WEAK_PASSWORD_POLICY',
            severity: 'WARNING',
            description: `Senha fraca "[MASKED]" foi aceita pelo sistema`,
            recommendation: 'Implementar política de senha mais rigorosa'
          });
          break;
        }
      } catch (error) {
        // Senha rejeitada - isso é bom
      }
    }
    
    if (!weakPasswordAccepted) {
      console.log('✅ Políticas de senha estão funcionando');
      issues.info.push({
        type: 'STRONG_PASSWORD_POLICY',
        severity: 'INFO',
        description: 'Políticas de senha forte estão ativas',
        recommendation: 'Manter monitoramento das tentativas de registro'
      });
    }
    
    // 7. Resumo de segurança por tabela
    console.log('\n📊 7. Resumo de segurança por tabela...');
    
    for (const tableName of existingTables) {
      const tableIssues = issues.warnings.filter(issue => issue.table === tableName).length +
                         issues.errors.filter(issue => issue.table === tableName).length;
      
      if (tableIssues === 0) {
        console.log(`✅ ${tableName}: Sem issues de segurança detectadas`);
      } else {
        console.log(`⚠️ ${tableName}: ${tableIssues} issue(s) de segurança`);
      }
    }

  } catch (error) {
    console.error('❌ Erro geral na verificação:', error.message);
    issues.errors.push({
      type: 'VERIFICATION_ERROR',
      severity: 'ERROR',
      description: `Erro durante a verificação: ${error.message}`,
      recommendation: 'Verificar conectividade e permissões do Supabase'
    });
  }

  // Relatório final
  console.log('\n' + '='.repeat(50));
  console.log('📊 RELATÓRIO FINAL - RLS E POLÍTICAS');
  console.log('='.repeat(50));
  
  console.log(`\n🔴 ERRORS (${issues.errors.length}):`);
  issues.errors.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    if (issue.table) console.log(`   📋 Tabela: ${issue.table}`);
    if (issue.columns) console.log(`   🏷️ Colunas: ${issue.columns.join(', ')}`);
    console.log('');
  });
  
  console.log(`\n⚠️ WARNINGS (${issues.warnings.length}):`);
  issues.warnings.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    if (issue.table) console.log(`   📋 Tabela: ${issue.table}`);
    if (issue.columns) console.log(`   🏷️ Colunas: ${issue.columns.join(', ')}`);
    console.log('');
  });
  
  console.log(`\nℹ️ INFO (${issues.info.length}):`);
  issues.info.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    console.log('');
  });
  
  console.log('\n📈 RESUMO GERAL:');
  console.log(`- Total de issues: ${issues.errors.length + issues.warnings.length + issues.info.length}`);
  console.log(`- Errors: ${issues.errors.length}`);
  console.log(`- Warnings: ${issues.warnings.length}`);
  console.log(`- Info: ${issues.info.length}`);
  
  // Classificação de risco
  if (issues.errors.length > 0) {
    console.log('\n🚨 RISCO ALTO: Problemas críticos de segurança encontrados!');
    console.log('   Ação requerida: Corrigir imediatamente os erros listados.');
  } else if (issues.warnings.length > 3) {
    console.log('\n⚠️ RISCO MÉDIO: Várias melhorias de segurança recomendadas.');
    console.log('   Ação requerida: Revisar e implementar as recomendações.');
  } else if (issues.warnings.length > 0) {
    console.log('\n🟡 RISCO BAIXO: Algumas melhorias de segurança recomendadas.');
    console.log('   Ação requerida: Considerar implementar as melhorias quando possível.');
  } else {
    console.log('\n✅ RISCO MÍNIMO: Configuração de segurança está adequada!');
    console.log('   Ação requerida: Manter monitoramento regular.');
  }
  
  return issues;
}

// Executar verificação
checkRLSAndPolicies().catch(console.error);