import { test, expect } from '@playwright/test';

test('Investigação do header fixo - Análise de CSS e comportamento', async ({ page }) => {
  // Navegar para a aplicação
  await page.goto('http://localhost:8081');
  
  // Aguardar o carregamento da página
  await page.waitForLoadState('networkidle');
  
  // Aguardar a autenticação ou tela de login aparecer
  await page.waitForTimeout(2000);
  
  // Tentar fazer login se estiver na tela de login
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible()) {
    await emailInput.fill('israel@trae.dev.br');
    await page.locator('input[type="password"]').fill('Isr@3lT3st3!');
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
  }
  
  // Aguardar o layout carregar
  await page.waitForSelector('header', { timeout: 10000 });
  
  console.log('=== ANÁLISE DO LAYOUT ===');
  
  // 1. Verificar estrutura do DOM
  const headerContainer = page.locator('div.fixed.top-0.left-0.right-0.z-50');
  const header = page.locator('header');
  const navbar = page.locator('nav');
  
  console.log('Header container exists:', await headerContainer.count() > 0);
  console.log('Header exists:', await header.count() > 0);
  console.log('Navbar exists:', await navbar.count() > 0);
  
  // 2. Verificar CSS computado do container fixo
  if (await headerContainer.count() > 0) {
    const containerStyles = await headerContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        right: computed.right,
        zIndex: computed.zIndex,
        backgroundColor: computed.backgroundColor,
        display: computed.display
      };
    });
    console.log('Container styles:', containerStyles);
  }
  
  // 3. Verificar CSS computado do header
  const headerStyles = await header.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      position: computed.position,
      width: computed.width,
      height: computed.height,
      backgroundColor: computed.backgroundColor,
      boxShadow: computed.boxShadow
    };
  });
  console.log('Header styles:', headerStyles);
  
  // 4. Verificar CSS computado da navbar
  const navbarStyles = await navbar.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      position: computed.position,
      width: computed.width,
      height: computed.height,
      backgroundColor: computed.backgroundColor,
      borderBottom: computed.borderBottom
    };
  });
  console.log('Navbar styles:', navbarStyles);
  
  // 5. Verificar posição inicial do header
  const initialHeaderPosition = await headerContainer.boundingBox();
  console.log('Initial header position:', initialHeaderPosition);
  
  // 6. Fazer scroll e verificar se o header mantém a posição
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  
  const afterScrollHeaderPosition = await headerContainer.boundingBox();
  console.log('After scroll header position:', afterScrollHeaderPosition);
  
  // 7. Verificar se o header permaneceu no topo
  const headerStayedFixed = initialHeaderPosition?.y === afterScrollHeaderPosition?.y;
  console.log('Header stayed fixed after scroll:', headerStayedFixed);
  
  // 8. Fazer mais scroll para testar
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  
  const afterMoreScrollHeaderPosition = await headerContainer.boundingBox();
  console.log('After more scroll header position:', afterMoreScrollHeaderPosition);
  
  // 9. Verificar elementos visíveis na tela
  const visibleElements = await page.evaluate(() => {
    const elements = [];
    const rect = document.querySelector('div.fixed.top-0.left-0.right-0.z-50')?.getBoundingClientRect();
    if (rect) {
      elements.push({
        element: 'header-container',
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.top >= 0
      });
    }
    return elements;
  });
  console.log('Visible elements info:', visibleElements);
  
  // 10. Screenshot para análise visual
  await page.screenshot({ 
    path: 'tests/screenshots/header-investigation.png',
    fullPage: true
  });
  
  // 11. Verificar classes Tailwind aplicadas
  const appliedClasses = await headerContainer.evaluate(el => ({
    className: el.className,
    classList: Array.from(el.classList)
  }));
  console.log('Applied classes:', appliedClasses);
  
  // 12. Verificar se há CSS customizado interferindo
  const customCSS = await page.evaluate(() => {
    const styles = [];
    const styleSheets = Array.from(document.styleSheets);
    
    for (const sheet of styleSheets) {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        for (const rule of rules) {
          if (rule.type === 1 && rule.selectorText) { // CSSStyleRule
            if (rule.selectorText.includes('header') || 
                rule.selectorText.includes('nav') || 
                rule.selectorText.includes('fixed')) {
              styles.push({
                selector: rule.selectorText,
                cssText: rule.cssText
              });
            }
          }
        }
      } catch (e) {
        // Ignorar erros de CORS
      }
    }
    return styles;
  });
  console.log('Custom CSS rules affecting header/nav/fixed:', customCSS);
  
  console.log('=== FIM DA ANÁLISE ===');
});