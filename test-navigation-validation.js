import { chromium } from 'playwright';

class NavigationValidator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      navigationTests: [],
      performanceMetrics: [],
      uxValidations: [],
      issues: [],
      screenshots: []
    };
  }

  async initialize() {
    this.browser = await chromium.launch({ 
      headless: false,
      devtools: false,
      slowMo: 100 // Adiciona delay para observar melhor as transições
    });
    this.page = await this.browser.newPage();
    
    // Configurar viewport para desktop padrão
    await this.page.setViewportSize({ width: 1920, height: 1080 });
    
    // Capturar logs de console para debug
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.results.issues.push({
          type: 'console-error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  async measureNavigationTime(fromPage, toPage, navigationAction) {
    const startTime = Date.now();
    
    try {
      await navigationAction();
      
      // Aguarda a página carregar completamente
      await this.page.waitForLoadState('networkidle');
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.results.performanceMetrics.push({
        from: fromPage,
        to: toPage,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✓ Navegação ${fromPage} → ${toPage}: ${duration}ms`);
      return duration;
      
    } catch (error) {
      this.results.issues.push({
        type: 'navigation-error',
        from: fromPage,
        to: toPage,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      console.error(`✗ Erro na navegação ${fromPage} → ${toPage}:`, error.message);
      return null;
    }
  }

  async takeScreenshot(label) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `screenshot-${label}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: filename, 
      fullPage: true 
    });
    this.results.screenshots.push({
      label,
      filename,
      timestamp
    });
    console.log(`📷 Screenshot salvo: ${filename}`);
  }

  async testInitialAccess() {
    console.log('\n=== TESTE 1: ACESSO INICIAL ===');
    
    const startTime = Date.now();
    await this.page.goto('http://localhost:8080');
    
    // Aguarda a página carregar
    await this.page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Tempo de carregamento inicial: ${loadTime}ms`);
    
    // Verifica se chegou no dashboard ou no login
    const currentUrl = this.page.url();
    const hasLoginForm = await this.page.locator('form[role="form"]').count() > 0;
    const hasDashboard = await this.page.locator('[data-testid="dashboard"]').count() > 0;
    
    this.results.navigationTests.push({
      test: 'initial-access',
      url: currentUrl,
      hasLoginForm,
      hasDashboard,
      loadTime,
      success: true
    });
    
    await this.takeScreenshot('initial-access');
    
    if (hasLoginForm) {
      console.log('✓ Redirecionado para login (comportamento esperado se não autenticado)');
      return 'login';
    } else if (hasDashboard) {
      console.log('✓ Dashboard carregado diretamente (usuário já autenticado)');
      return 'dashboard';
    } else {
      console.log('⚠ Estado inicial não identificado');
      return 'unknown';
    }
  }

  async performLogin() {
    console.log('\n=== TESTE 2: PROCESSO DE LOGIN ===');
    
    // Verifica se está na tela de login
    const loginForm = await this.page.locator('form[role="form"]');
    if (await loginForm.count() === 0) {
      console.log('⚠ Não está na tela de login, pulando teste de login');
      return false;
    }
    
    // Preenche credenciais de teste
    await this.page.fill('input[type="email"]', 'admin@cogerh.ce.gov.br');
    await this.page.fill('input[type="password"]', 'admin123');
    
    await this.takeScreenshot('login-form-filled');
    
    // Realiza login e mede o tempo
    const duration = await this.measureNavigationTime('login', 'dashboard', async () => {
      await this.page.click('button[type="submit"]');
      await this.page.waitForURL('**/dashboard', { timeout: 10000 });
    });
    
    await this.takeScreenshot('post-login-dashboard');
    
    return duration !== null;
  }

  async testNavigationFlow() {
    console.log('\n=== TESTE 3: FLUXO COMPLETO DE NAVEGAÇÃO ===');
    
    // Lista de todas as rotas para testar
    const routes = [
      { name: 'Dashboard', path: '/dashboard', selector: '[data-testid="dashboard"]' },
      { name: 'Gestão de Riscos', path: '/riscos', selector: '[data-testid="risk-management"]' },
      { name: 'Matriz de Risco', path: '/matriz-risco', selector: '[data-testid="risk-matrix"]' },
      { name: 'Monitoramento', path: '/monitoramento', selector: '[data-testid="monitoring"]' },
      { name: 'Indicadores', path: '/indicadores', selector: '[data-testid="indicators"]' },
      { name: 'Processos', path: '/processos', selector: '[data-testid="processes"]' },
      { name: 'Auditoria', path: '/auditoria', selector: '[data-testid="audit"]' },
      { name: 'Relatórios', path: '/relatorios', selector: '[data-testid="reports"]' },
      { name: 'Configurações', path: '/configuracoes', selector: '[data-testid="settings"]' }
    ];
    
    let successfulNavigations = 0;
    let totalNavigations = 0;
    
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      console.log(`\n--- Testando navegação para: ${route.name} ---`);
      
      totalNavigations++;
      
      // Navegação via URL direta
      const duration = await this.measureNavigationTime('current', route.name, async () => {
        await this.page.goto(`http://localhost:8080${route.path}`);
        await this.page.waitForLoadState('networkidle');
      });
      
      if (duration !== null) {
        successfulNavigations++;
        
        // Verifica se o componente específico está presente
        const componentExists = await this.page.locator(route.selector).count() > 0;
        const hasLoadingState = await this.page.locator('.loading, .spinner, [data-testid="loading"]').count() > 0;
        const hasErrorState = await this.page.locator('.error, [data-testid="error"]').count() > 0;
        
        this.results.uxValidations.push({
          route: route.name,
          path: route.path,
          componentLoaded: componentExists,
          hasLoadingState,
          hasErrorState,
          navigationDuration: duration
        });
        
        await this.takeScreenshot(`route-${route.name.toLowerCase().replace(/\s+/g, '-')}`);
        
        console.log(`  ✓ Componente carregado: ${componentExists}`);
        console.log(`  ✓ Tempo de navegação: ${duration}ms`);
        
        if (hasErrorState) {
          console.log(`  ⚠ Estado de erro detectado`);
        }
        
        // Pequena pausa para observar a interface
        await this.page.waitForTimeout(500);
      }
    }
    
    console.log(`\n=== RESUMO NAVEGAÇÃO ===`);
    console.log(`Navegações bem-sucedidas: ${successfulNavigations}/${totalNavigations}`);
    console.log(`Taxa de sucesso: ${((successfulNavigations/totalNavigations) * 100).toFixed(1)}%`);
    
    return { successfulNavigations, totalNavigations };
  }

  async testSidebarNavigation() {
    console.log('\n=== TESTE 4: NAVEGAÇÃO VIA SIDEBAR ===');
    
    // Volta para o dashboard
    await this.page.goto('http://localhost:8080/dashboard');
    await this.page.waitForLoadState('networkidle');
    
    // Lista de itens da sidebar para testar
    const sidebarItems = [
      'Dashboard',
      'Gestão de Riscos', 
      'Matriz de Risco',
      'Monitoramento',
      'Indicadores',
      'Processos',
      'Auditoria', 
      'Relatórios',
      'Configurações'
    ];
    
    let sidebarNavigations = 0;
    
    for (const item of sidebarItems) {
      try {
        console.log(`\n--- Testando clique na sidebar: ${item} ---`);
        
        // Procura pelo item na sidebar
        const sidebarLink = this.page.locator(`nav a, .sidebar a`).filter({ hasText: item }).first();
        
        if (await sidebarLink.count() > 0) {
          const duration = await this.measureNavigationTime('sidebar', item, async () => {
            await sidebarLink.click();
            await this.page.waitForLoadState('networkidle');
          });
          
          if (duration !== null) {
            sidebarNavigations++;
            console.log(`  ✓ Navegação via sidebar para ${item}: ${duration}ms`);
          }
        } else {
          console.log(`  ⚠ Item "${item}" não encontrado na sidebar`);
        }
        
        await this.page.waitForTimeout(300);
        
      } catch (error) {
        this.results.issues.push({
          type: 'sidebar-navigation-error',
          item,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        console.error(`  ✗ Erro na navegação via sidebar para ${item}:`, error.message);
      }
    }
    
    console.log(`\nNavegações via sidebar bem-sucedidas: ${sidebarNavigations}/${sidebarItems.length}`);
    return sidebarNavigations;
  }

  async validateResponsiveness() {
    console.log('\n=== TESTE 5: RESPONSIVIDADE ===');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`\n--- Testando viewport: ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
      
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.goto('http://localhost:8080/dashboard');
      await this.page.waitForLoadState('networkidle');
      
      // Verifica elementos responsivos
      const hasMobileMenu = await this.page.locator('.mobile-menu, .hamburger, [data-testid="mobile-menu"]').count() > 0;
      const sidebarVisible = await this.page.locator('nav, .sidebar').isVisible();
      const contentOverflow = await this.page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });
      
      this.results.uxValidations.push({
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        hasMobileMenu,
        sidebarVisible,
        contentOverflow
      });
      
      await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
      
      console.log(`  ✓ Menu mobile presente: ${hasMobileMenu}`);
      console.log(`  ✓ Sidebar visível: ${sidebarVisible}`);
      console.log(`  ✓ Overflow horizontal: ${contentOverflow ? 'SIM (problema)' : 'NÃO'}`);
    }
    
    // Volta para desktop
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async generateReport() {
    console.log('\n=== RELATÓRIO FINAL DE VALIDAÇÃO ===');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.navigationTests.length,
        totalIssues: this.results.issues.length,
        averageNavigationTime: this.calculateAverageNavigationTime(),
        successRate: this.calculateSuccessRate()
      },
      ...this.results
    };
    
    // Salva relatório em JSON
    const fs = await import('fs');
    const reportFilename = `navigation-validation-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Relatório salvo: ${reportFilename}`);
    console.log(`📈 Taxa de sucesso geral: ${report.summary.successRate}%`);
    console.log(`⏱️ Tempo médio de navegação: ${report.summary.averageNavigationTime}ms`);
    console.log(`🔍 Total de problemas encontrados: ${report.summary.totalIssues}`);
    console.log(`📷 Screenshots capturados: ${this.results.screenshots.length}`);
    
    if (this.results.issues.length > 0) {
      console.log('\n🚨 PROBLEMAS IDENTIFICADOS:');
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.message || issue.error}`);
      });
    }
    
    return report;
  }

  calculateAverageNavigationTime() {
    if (this.results.performanceMetrics.length === 0) return 0;
    const total = this.results.performanceMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return Math.round(total / this.results.performanceMetrics.length);
  }

  calculateSuccessRate() {
    const totalOperations = this.results.navigationTests.length + this.results.performanceMetrics.length;
    if (totalOperations === 0) return 0;
    const successfulOperations = totalOperations - this.results.issues.length;
    return Math.round((successfulOperations / totalOperations) * 100);
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Execução principal
async function main() {
  const validator = new NavigationValidator();
  
  try {
    console.log('🚀 Iniciando validação completa da aplicação...\n');
    
    await validator.initialize();
    
    // 1. Teste de acesso inicial
    const initialState = await validator.testInitialAccess();
    
    // 2. Login se necessário
    if (initialState === 'login') {
      await validator.performLogin();
    }
    
    // 3. Testes de navegação
    await validator.testNavigationFlow();
    await validator.testSidebarNavigation();
    
    // 4. Testes de responsividade
    await validator.validateResponsiveness();
    
    // 5. Geração do relatório final
    const report = await validator.generateReport();
    
    console.log('\n✅ Validação concluída com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro durante a validação:', error);
  } finally {
    await validator.cleanup();
  }
}

// Executa se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default NavigationValidator;