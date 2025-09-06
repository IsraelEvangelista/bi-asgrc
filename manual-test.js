import { chromium } from 'playwright';

async function manualTest() {
  console.log('🚀 Iniciando teste manual da aplicação...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: false,
    slowMo: 1000 // Delay para observar as transições
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Array para armazenar métricas de performance
  const metrics = [];
  
  try {
    console.log('\n=== TESTE 1: ACESSO INICIAL ===');
    const startTime = Date.now();
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`✓ Tempo de carregamento inicial: ${loadTime}ms`);
    metrics.push({ operation: 'initial-load', time: loadTime });
    
    // Screenshot inicial
    await page.screenshot({ path: 'initial-load.png', fullPage: false });
    console.log('📷 Screenshot salvo: initial-load.png');
    
    // Verifica se está na tela de login
    const hasLoginForm = await page.locator('form[role="form"]').count() > 0;
    
    if (hasLoginForm) {
      console.log('\n=== TESTE 2: PROCESSO DE LOGIN ===');
      
      // Preenche credenciais
      await page.fill('input[type="email"]', 'admin@cogerh.ce.gov.br');
      await page.fill('input[type="password"]', 'admin123');
      
      await page.screenshot({ path: 'login-form.png', fullPage: false });
      console.log('📷 Screenshot salvo: login-form.png');
      
      // Realiza login
      const loginStart = Date.now();
      await page.click('button[type="submit"]');
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      const loginTime = Date.now() - loginStart;
      
      console.log(`✓ Tempo de login: ${loginTime}ms`);
      metrics.push({ operation: 'login', time: loginTime });
      
      await page.screenshot({ path: 'post-login.png', fullPage: false });
      console.log('📷 Screenshot salvo: post-login.png');
    }
    
    console.log('\n=== TESTE 3: NAVEGAÇÃO ENTRE ROTAS ===');
    
    const routes = [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Gestão de Riscos', path: '/riscos' },
      { name: 'Matriz de Risco', path: '/matriz-risco' },
      { name: 'Monitoramento', path: '/monitoramento' },
      { name: 'Indicadores', path: '/indicadores' },
      { name: 'Processos', path: '/processos' },
      { name: 'Auditoria', path: '/auditoria' },
      { name: 'Relatórios', path: '/relatorios' },
      { name: 'Configurações', path: '/configuracoes' }
    ];
    
    for (const route of routes) {
      console.log(`\n--- Testando: ${route.name} ---`);
      
      const navStart = Date.now();
      await page.goto(`http://localhost:8080${route.path}`);
      await page.waitForLoadState('networkidle');
      const navTime = Date.now() - navStart;
      
      console.log(`✓ Navegação para ${route.name}: ${navTime}ms`);
      metrics.push({ operation: `navigate-${route.name}`, time: navTime });
      
      // Verifica se há erros visíveis
      const hasError = await page.locator('.error, [data-testid="error"]').count() > 0;
      const hasLoadingStuck = await page.locator('.loading, .spinner').count() > 0;
      
      if (hasError) {
        console.log(`⚠️ Erro detectado em ${route.name}`);
      }
      
      if (hasLoadingStuck) {
        console.log(`⚠️ Loading state persistente em ${route.name}`);
      }
      
      if (!hasError && !hasLoadingStuck) {
        console.log(`✅ ${route.name} carregou corretamente`);
      }
      
      // Screenshot
      const filename = `route-${route.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`📷 Screenshot salvo: ${filename}`);
      
      // Pausa para observar
      await page.waitForTimeout(2000);
    }
    
    console.log('\n=== RELATÓRIO DE PERFORMANCE ===');
    const totalTime = metrics.reduce((sum, metric) => sum + metric.time, 0);
    const avgTime = Math.round(totalTime / metrics.length);
    
    console.log(`Tempo médio de operação: ${avgTime}ms`);
    console.log(`Tempo total de teste: ${totalTime}ms`);
    
    // Métricas detalhadas
    metrics.forEach(metric => {
      console.log(`  ${metric.operation}: ${metric.time}ms`);
    });
    
    // Salva métricas
    const fs = await import('fs');
    const report = {
      timestamp: new Date().toISOString(),
      metrics,
      summary: {
        totalOperations: metrics.length,
        averageTime: avgTime,
        totalTime: totalTime
      }
    };
    
    fs.writeFileSync('manual-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📊 Relatório salvo: manual-test-report.json');
    
    console.log('\n✅ Teste manual concluído! Verifique os screenshots gerados.');
    
    // Mantém o browser aberto por 10 segundos para inspeção final
    console.log('\n🔍 Browser permanecerá aberto por 10 segundos para inspeção...');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Browser fechado. Teste finalizado.');
  }
}

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  manualTest().catch(console.error);
}