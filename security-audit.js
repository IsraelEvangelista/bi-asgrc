import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFodHltYXFpaXpmZXJ1bXhnaHlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjcyNzE4MiwiZXhwIjoyMDcyMzAzMTgyfQ.YO4KBnwulf4Bom_J9cASnBsX6SXvtNVpK8P4YD_Dm6I';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Lista de tabelas conhecidas do projeto
const knownTables = [
  '001_perfis', '002_usuarios', '003_processos', '004_riscos', '005_acoes',
  '006_indicadores', '007_categorias', '008_subcategorias', '009_tipos_risco',
  '010_niveis_risco', '011_status_risco', '012_frequencias', '013_impactos',
  '014_probabilidades', '015_controles', '016_avaliacoes', '017_matriz_riscos'
];

async function checkSecurityIssues() {
  console.log('🔍 AUDITORIA DE SEGURANÇA - SUPABASE SECURITY ADVISOR');
  console.log('=' .repeat(60));
  
  const issues = {
    info: [],
    warnings: [],
    errors: []
  };

  try {
    // 1. Verificar acesso às tabelas com role anon
    console.log('\n📋 1. Verificando acesso com role ANON...');
    const anonClient = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    
    let anonAccessCount = 0;
    let authAccessCount = 0;
    
    for (const tableName of knownTables) {
      try {
        // Teste com role anon
        const { data: anonData, error: anonError } = await anonClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!anonError) {
          anonAccessCount++;
          issues.warnings.push({
            type: 'ANON_TABLE_ACCESS',
            severity: 'WARNING',
            table: tableName,
            description: `Tabela "${tableName}" acessível por usuários não autenticados (role anon)`,
            recommendation: 'Verificar se o acesso público é necessário ou restringir com RLS'
          });
        }
        
        // Teste com role authenticated (usando service key como proxy)
        const { data: authData, error: authError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!authError) {
          authAccessCount++;
        }
        
      } catch (error) {
        console.log(`❌ Erro ao testar tabela ${tableName}:`, error.message);
      }
    }
    
    console.log(`✅ Tabelas acessíveis por anon: ${anonAccessCount}/${knownTables.length}`);
    console.log(`✅ Tabelas acessíveis por authenticated: ${authAccessCount}/${knownTables.length}`);
    
    if (anonAccessCount === 0 && authAccessCount === 0) {
      issues.errors.push({
        type: 'NO_TABLE_ACCESS',
        severity: 'ERROR',
        description: 'Nenhuma tabela acessível - possível problema de permissões',
        recommendation: 'Verificar configurações de RLS e permissões no Supabase'
      });
    }
    
    if (anonAccessCount > authAccessCount / 2) {
      issues.warnings.push({
        type: 'EXCESSIVE_ANON_ACCESS',
        severity: 'WARNING',
        description: `Muitas tabelas (${anonAccessCount}) acessíveis publicamente`,
        recommendation: 'Revisar necessidade de acesso público e implementar RLS adequado'
      });
    }

    // 2. Verificar autenticação básica
    console.log('\n🔐 2. Verificando sistema de autenticação...');
    
    try {
      // Tentar fazer login com credenciais inválidas
      const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
        email: 'test@invalid.com',
        password: 'invalid'
      });
      
      if (loginError) {
        console.log('✅ Sistema de autenticação funcionando (rejeitou credenciais inválidas)');
        issues.info.push({
          type: 'AUTH_WORKING',
          severity: 'INFO',
          description: 'Sistema de autenticação está funcionando corretamente',
          recommendation: 'Continuar monitorando tentativas de login suspeitas'
        });
      } else {
        issues.errors.push({
          type: 'AUTH_BYPASS',
          severity: 'ERROR',
          description: 'Possível falha na autenticação - credenciais inválidas aceitas',
          recommendation: 'Verificar configurações de autenticação imediatamente'
        });
      }
    } catch (error) {
      console.log('✅ Sistema de autenticação protegido:', error.message);
    }

    // 3. Verificar configurações de email
    console.log('\n📧 3. Verificando configurações de email...');
    
    try {
      // Tentar registrar com email inválido
      const { data: signupData, error: signupError } = await anonClient.auth.signUp({
        email: 'invalid-email',
        password: 'test123456'
      });
      
      if (signupError && signupError.message.includes('email')) {
        console.log('✅ Validação de email funcionando');
        issues.info.push({
          type: 'EMAIL_VALIDATION_OK',
          severity: 'INFO',
          description: 'Validação de formato de email está funcionando',
          recommendation: 'Considerar implementar verificação de domínio se necessário'
        });
      }
    } catch (error) {
      console.log('⚠️ Erro ao testar validação de email:', error.message);
    }

    // 4. Verificar políticas de senha
    console.log('\n🔑 4. Verificando políticas de senha...');
    
    try {
      // Tentar registrar com senha fraca
      const { data: weakPassData, error: weakPassError } = await anonClient.auth.signUp({
        email: 'test@example.com',
        password: '123'
      });
      
      if (weakPassError && weakPassError.message.includes('password')) {
        console.log('✅ Política de senha forte ativa');
        issues.info.push({
          type: 'STRONG_PASSWORD_POLICY',
          severity: 'INFO',
          description: 'Política de senha forte está ativa',
          recommendation: 'Considerar adicionar requisitos adicionais se necessário'
        });
      } else if (!weakPassError) {
        issues.warnings.push({
          type: 'WEAK_PASSWORD_ALLOWED',
          severity: 'WARNING',
          description: 'Senhas fracas podem ser aceitas',
          recommendation: 'Implementar política de senha mais rigorosa'
        });
      }
    } catch (error) {
      console.log('⚠️ Erro ao testar política de senha:', error.message);
    }

    // 5. Verificar rate limiting
    console.log('\n⏱️ 5. Verificando rate limiting...');
    
    let rateLimitHit = false;
    for (let i = 0; i < 10; i++) {
      try {
        const { error } = await anonClient.auth.signInWithPassword({
          email: 'test@invalid.com',
          password: 'invalid'
        });
        
        if (error && error.message.includes('rate')) {
          rateLimitHit = true;
          break;
        }
      } catch (error) {
        if (error.message.includes('rate') || error.message.includes('limit')) {
          rateLimitHit = true;
          break;
        }
      }
      
      // Pequena pausa entre tentativas
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (rateLimitHit) {
      console.log('✅ Rate limiting ativo');
      issues.info.push({
        type: 'RATE_LIMITING_ACTIVE',
        severity: 'INFO',
        description: 'Rate limiting está ativo para tentativas de login',
        recommendation: 'Monitorar logs para detectar ataques de força bruta'
      });
    } else {
      issues.warnings.push({
        type: 'NO_RATE_LIMITING',
        severity: 'WARNING',
        description: 'Rate limiting pode não estar configurado adequadamente',
        recommendation: 'Configurar rate limiting para prevenir ataques de força bruta'
      });
    }

    // 6. Verificar exposição de dados sensíveis
    console.log('\n🔍 6. Verificando exposição de dados sensíveis...');
    
    const sensitiveFields = ['password', 'senha', 'token', 'secret', 'key', 'hash'];
    
    for (const tableName of knownTables.slice(0, 5)) { // Verificar apenas algumas tabelas
      try {
        const { data, error } = await anonClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (data && data.length > 0) {
          const fields = Object.keys(data[0]);
          const exposedSensitiveFields = fields.filter(field => 
            sensitiveFields.some(sensitive => 
              field.toLowerCase().includes(sensitive)
            )
          );
          
          if (exposedSensitiveFields.length > 0) {
            issues.warnings.push({
              type: 'SENSITIVE_DATA_EXPOSED',
              severity: 'WARNING',
              table: tableName,
              fields: exposedSensitiveFields,
              description: `Campos sensíveis expostos na tabela "${tableName}": ${exposedSensitiveFields.join(', ')}`,
              recommendation: 'Remover campos sensíveis da seleção pública ou implementar RLS'
            });
          }
        }
      } catch (error) {
        // Tabela protegida - isso é bom
      }
    }

    // 7. Verificar configurações de CORS
    console.log('\n🌐 7. Verificando configurações de CORS...');
    
    issues.info.push({
      type: 'CORS_CHECK_MANUAL',
      severity: 'INFO',
      description: 'Configurações de CORS devem ser verificadas manualmente no dashboard',
      recommendation: 'Verificar se apenas domínios autorizados podem acessar a API'
    });

    // 8. Verificar logs de auditoria
    console.log('\n📊 8. Verificando disponibilidade de logs...');
    
    issues.info.push({
      type: 'AUDIT_LOGS_MANUAL',
      severity: 'INFO',
      description: 'Logs de auditoria devem ser verificados regularmente no dashboard',
      recommendation: 'Configurar alertas para atividades suspeitas e revisar logs semanalmente'
    });

  } catch (error) {
    console.error('❌ Erro geral na auditoria:', error.message);
    issues.errors.push({
      type: 'AUDIT_ERROR',
      severity: 'ERROR',
      description: `Erro durante a auditoria: ${error.message}`,
      recommendation: 'Verificar conectividade e permissões do Supabase'
    });
  }

  // Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL - SECURITY ADVISOR ISSUES');
  console.log('='.repeat(60));
  
  console.log(`\n🔴 ERRORS (${issues.errors.length}):`);
  issues.errors.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    if (issue.table) console.log(`   📋 Tabela: ${issue.table}`);
    console.log('');
  });
  
  console.log(`\n⚠️ WARNINGS (${issues.warnings.length}):`);
  issues.warnings.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    if (issue.table) console.log(`   📋 Tabela: ${issue.table}`);
    if (issue.fields) console.log(`   🏷️ Campos: ${issue.fields.join(', ')}`);
    console.log('');
  });
  
  console.log(`\nℹ️ INFO (${issues.info.length}):`);
  issues.info.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.description}`);
    console.log(`   💡 Recomendação: ${issue.recommendation}`);
    console.log('');
  });
  
  console.log('\n📈 RESUMO:');
  console.log(`- Total de issues: ${issues.errors.length + issues.warnings.length + issues.info.length}`);
  console.log(`- Errors: ${issues.errors.length}`);
  console.log(`- Warnings: ${issues.warnings.length}`);
  console.log(`- Info: ${issues.info.length}`);
  
  if (issues.errors.length === 0 && issues.warnings.length <= 2) {
    console.log('\n✅ Configuração de segurança está em bom estado!');
  } else if (issues.errors.length > 0) {
    console.log('\n🚨 ATENÇÃO: Problemas críticos de segurança encontrados!');
  } else {
    console.log('\n⚠️ Algumas melhorias de segurança são recomendadas.');
  }
  
  console.log('\n🔗 Para verificações mais detalhadas, acesse:');
  console.log('   - Dashboard do Supabase > Settings > Security');
  console.log('   - Dashboard do Supabase > Authentication > Settings');
  console.log('   - Dashboard do Supabase > Database > Policies');
}

// Executar auditoria
checkSecurityIssues().catch(console.error);