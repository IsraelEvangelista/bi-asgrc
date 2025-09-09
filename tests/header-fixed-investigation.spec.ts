import { test, expect } from '@playwright/test';

test('Investigação completa do header fixo', async ({ page }) => {
  // Navegar para a aplicação
  await page.goto('http://localhost:8081');
  await page.waitForTimeout(2000);
  
  console.log('=== INICIANDO INVESTIGAÇÃO DO HEADER FIXO ===');
  
  // Fazer login
  await page.fill('input[type="email"]', 'admin@cogerh.com.br');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  
  // Screenshot após login
  await page.screenshot({ 
    path: 'tests/screenshots/after-login.png',
    fullPage: true
  });
  
  // Aguardar elementos de layout carregarem
  await page.waitForSelector('header', { timeout: 10000 });
  await page.waitForSelector('nav', { timeout: 10000 });
  
  console.log('✓ Header e Nav encontrados');
  
  // 1. Verificar estrutura do DOM
  const headerContainer = page.locator('div.fixed.top-0.left-0.right-0.z-50');
  const header = page.locator('header');
  const navbar = page.locator('nav');
  
  const containerExists = await headerContainer.count() > 0;
  const headerExists = await header.count() > 0;
  const navbarExists = await navbar.count() > 0;
  
  console.log('Container fixo existe:', containerExists);
  console.log('Header existe:', headerExists);
  console.log('Navbar existe:', navbarExists);
  
  // 2. Verificar CSS computado do container fixo
  if (containerExists) {
    const containerStyles = await headerContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        position: computed.position,
        top: computed.top,
        left: computed.left,
        right: computed.right,
        zIndex: computed.zIndex,
        backgroundColor: computed.backgroundColor,
        display: computed.display,
        width: computed.width,
        height: computed.height
      };
    });
    console.log('🎨 Container styles:', containerStyles);
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
  console.log('🎨 Header styles:', headerStyles);
  
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
  console.log('🎨 Navbar styles:', navbarStyles);
  
  // 5. Verificar posição inicial do header
  let initialHeaderPosition = null;
  if (containerExists) {
    initialHeaderPosition = await headerContainer.boundingBox();
  } else {
    initialHeaderPosition = await header.boundingBox();
  }
  
  console.log('📐 Posição inicial do header:', initialHeaderPosition);
  
  // Screenshot antes do scroll
  await page.screenshot({ 
    path: 'tests/screenshots/before-scroll.png'
  });
  
  // 6. Fazer scroll e verificar se o header mantém a posição
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  
  let afterScrollHeaderPosition = null;
  if (containerExists) {
    afterScrollHeaderPosition = await headerContainer.boundingBox();
  } else {
    afterScrollHeaderPosition = await header.boundingBox();
  }
  
  console.log('📐 Posição após scroll 500px:', afterScrollHeaderPosition);
  
  // Screenshot após scroll
  await page.screenshot({ 
    path: 'tests/screenshots/after-scroll-500.png'
  });
  
  // 7. Fazer mais scroll para testar
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(1000);
  
  let afterMoreScrollHeaderPosition = null;
  if (containerExists) {
    afterMoreScrollHeaderPosition = await headerContainer.boundingBox();
  } else {
    afterMoreScrollHeaderPosition = await header.boundingBox();
  }
  
  console.log('📐 Posição após scroll 1000px:', afterMoreScrollHeaderPosition);
  
  // Screenshot após mais scroll
  await page.screenshot({ 
    path: 'tests/screenshots/after-scroll-1000.png'
  });
  
  // 8. Verificar se o header permaneceu fixo
  const headerStayedFixed = initialHeaderPosition?.y === afterScrollHeaderPosition?.y && 
                            initialHeaderPosition?.y === afterMoreScrollHeaderPosition?.y;
  console.log('🔒 Header manteve posição fixa:', headerStayedFixed);
  
  // 9. Verificar classes aplicadas
  const appliedClasses = containerExists 
    ? await headerContainer.evaluate(el => ({
        className: el.className,
        classList: Array.from(el.classList)
      }))
    : await header.evaluate(el => ({
        className: el.className,
        classList: Array.from(el.classList)
      }));
  console.log('🏷️ Classes aplicadas:', appliedClasses);
  
  // 10. Verificar altura do conteúdo principal e padding-top
  const mainContent = page.locator('main');
  const mainExists = await mainContent.count() > 0;
  
  if (mainExists) {
    const mainStyles = await mainContent.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        paddingTop: computed.paddingTop,
        marginTop: computed.marginTop,
        width: computed.width,
        position: computed.position
      };
    });
    console.log('📄 Main content styles:', mainStyles);
  }
  
  // 11. Verificar se há CSS customizado interferindo
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
                rule.selectorText.includes('fixed') ||
                rule.selectorText.includes('main')) {
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
  console.log('🎨 CSS customizado relevante:', customCSS);
  
  // 12. Análise final
  console.log('\n=== ANÁLISE FINAL ===');
  console.log('Container fixo implementado:', containerExists);
  console.log('Header permaneceu fixo durante scroll:', headerStayedFixed);
  console.log('Position CSS do header:', headerStyles?.position || 'N/A');
  
  // 13. Screenshot final para comparação
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ 
    path: 'tests/screenshots/final-top.png'
  });
  
  console.log('=== INVESTIGAÇÃO CONCLUÍDA ===');
});