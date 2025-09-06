import { test, expect } from '@playwright/test';

test.describe('Análise de Transições entre Interfaces - COGERH ASGRC', () => {
  const baseURL = 'http://localhost:8080';
  let transitionTimes = {};
  let screenshots = [];

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');
  });

  test('Mapear todas as rotas e interfaces disponíveis', async ({ page }) => {
    console.log('🔍 Mapeando interfaces disponíveis...');
    
    // Capturar screenshot inicial do dashboard
    await page.screenshot({ 
      path: 'tests/screenshots/01-dashboard-inicial.png',
      fullPage: true 
    });
    
    // Aguardar carregamento completo do dashboard
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Localizar todos os links de navegação disponíveis
    const navigationLinks = await page.locator('nav a, [data-testid*="nav"], .nav-link, .menu-item').all();
    
    console.log(`📋 Encontrados ${navigationLinks.length} links de navegação`);
    
    // Extrair informações dos links
    const routes = [];
    for (const link of navigationLinks) {
      try {
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        if (href && text) {
          routes.push({ href, text: text.trim() });
        }
      } catch (error) {
        console.log('Link não acessível:', error.message);
      }
    }
    
    console.log('🗺️ Rotas encontradas:', routes);
  });

  test('Analisar transições do Dashboard para outras interfaces', async ({ page }) => {
    console.log('🔄 Testando transições a partir do Dashboard...');
    
    const startTime = Date.now();
    
    // Aguardar dashboard estar completamente carregado
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
    
    // Localizar links de navegação
    const navLinks = await page.locator('nav a, .nav-link, .menu-item').all();
    
    for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
      const link = navLinks[i];
      
      try {
        const linkText = await link.textContent();
        const linkHref = await link.getAttribute('href');
        
        console.log(`📍 Testando transição para: ${linkText} (${linkHref})`);
        
        // Marcar tempo de início da transição
        const transitionStart = Date.now();
        
        // Clicar no link
        await link.click();
        
        // Aguardar a navegação e qualquer loading/spinner desaparecer
        await page.waitForLoadState('networkidle');
        
        // Aguardar elementos da nova página carregarem
        await page.waitForTimeout(2000);
        
        // Marcar tempo de fim da transição
        const transitionEnd = Date.now();
        const transitionDuration = transitionEnd - transitionStart;
        
        // Capturar screenshot da nova interface
        await page.screenshot({ 
          path: `tests/screenshots/transition-${i+2}-${linkText?.replace(/[^\w]/g, '_')}.png`,
          fullPage: true 
        });
        
        // Registrar tempo de transição
        transitionTimes[linkText || `Link ${i+1}`] = transitionDuration;
        
        console.log(`⏱️ Transição completada em ${transitionDuration}ms`);
        
        // Verificar se há elementos de loading visíveis após a transição
        const loadingElements = await page.locator('[data-testid*="loading"], .loading, .spinner, .skeleton').count();
        if (loadingElements > 0) {
          console.log(`⚠️ Elementos de loading ainda visíveis: ${loadingElements}`);
        }
        
        // Voltar ao dashboard para próxima transição
        await page.goBack();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.log(`❌ Erro ao testar link ${i+1}:`, error.message);
        
        // Capturar screenshot do erro
        await page.screenshot({ 
          path: `tests/screenshots/error-${i+1}.png`,
          fullPage: true 
        });
      }
    }
    
    // Relatório de tempos de transição
    console.log('📊 Relatório de Tempos de Transição:');
    Object.entries(transitionTimes).forEach(([route, time]) => {
      const status = time > 3000 ? '🔴 LENTO' : time > 1500 ? '🟡 MÉDIO' : '🟢 RÁPIDO';
      console.log(`${status} ${route}: ${time}ms`);
    });
  });

  test('Detectar páginas intermediárias e problemas de fluidez', async ({ page }) => {
    console.log('🔍 Detectando páginas intermediárias...');
    
    // Interceptar requests para detectar redirects e páginas intermediárias
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
    });
    
    page.on('response', response => {
      if (response.status() >= 300 && response.status() < 400) {
        console.log(`🔄 Redirect detectado: ${response.url()} -> Status: ${response.status()}`);
      }
    });
    
    // Testar navegação em interfaces específicas
    const testRoutes = ['#/relatorios', '#/processos', '#/riscos', '#/usuarios', '#/configuracoes'];
    
    for (const route of testRoutes) {
      try {
        console.log(`🧪 Testando rota: ${route}`);
        
        const navigationStart = Date.now();
        await page.goto(`${baseURL}${route}`);
        
        // Aguardar e detectar mudanças de URL
        let urlChanges = 0;
        let currentUrl = page.url();
        
        await page.waitForTimeout(3000);
        
        // Monitorar mudanças de URL que indicam páginas intermediárias
        const finalUrl = page.url();
        if (currentUrl !== finalUrl) {
          urlChanges++;
          console.log(`🔄 Mudança de URL detectada: ${currentUrl} -> ${finalUrl}`);
        }
        
        const navigationEnd = Date.now();
        const totalTime = navigationEnd - navigationStart;
        
        // Capturar screenshot final
        await page.screenshot({ 
          path: `tests/screenshots/route-${route.replace(/[^\w]/g, '_')}.png`,
          fullPage: true 
        });
        
        // Analisar elementos de loading e transição
        const loadingIndicators = await page.locator('[data-testid*="loading"], .loading, .spinner').count();
        const skeletonLoaders = await page.locator('.skeleton, [data-testid*="skeleton"]').count();
        
        console.log(`📋 Análise da rota ${route}:`);
        console.log(`  ⏱️ Tempo total: ${totalTime}ms`);
        console.log(`  🔄 Mudanças de URL: ${urlChanges}`);
        console.log(`  ⚡ Indicadores de loading: ${loadingIndicators}`);
        console.log(`  💀 Skeleton loaders: ${skeletonLoaders}`);
        
      } catch (error) {
        console.log(`❌ Erro ao testar rota ${route}:`, error.message);
      }
    }
  });

  test('Analisar responsividade das transições', async ({ page }) => {
    console.log('📱 Analisando responsividade das transições...');
    
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];
    
    for (const viewport of viewports) {
      console.log(`🖥️ Testando viewport: ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(baseURL);
      await page.waitForLoadState('networkidle');
      
      // Capturar screenshot do dashboard em cada viewport
      await page.screenshot({ 
        path: `tests/screenshots/dashboard-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      // Testar uma transição em cada viewport
      const firstNavLink = await page.locator('nav a, .nav-link').first();
      if (await firstNavLink.count() > 0) {
        const transitionStart = Date.now();
        await firstNavLink.click();
        await page.waitForLoadState('networkidle');
        const transitionEnd = Date.now();
        
        console.log(`⏱️ Transição em ${viewport.name}: ${transitionEnd - transitionStart}ms`);
        
        await page.screenshot({ 
          path: `tests/screenshots/transition-${viewport.name.toLowerCase()}.png`,
          fullPage: true 
        });
        
        await page.goBack();
      }
    }
  });
});