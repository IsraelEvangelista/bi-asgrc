import { chromium } from 'playwright';

async function testeHeaderFixo() {
  console.log('🚀 Iniciando teste do header fixo...\n');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 // Slow motion para visualizar melhor
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. Acessar a aplicação
    console.log('📱 Acessando http://localhost:8084...');
    await page.goto('http://localhost:8084', { waitUntil: 'networkidle' });
    
    // 2. Realizar login
    console.log('🔐 Realizando login...');
    await page.fill('input[type="email"]', 'isademocrata@gmail.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // 3. Aguardar carregamento do perfil (máximo 8 segundos)
    console.log('⏳ Aguardando carregamento do perfil...');
    await page.waitForTimeout(8000);
    
    // 4. Capturar screenshot inicial
    await page.screenshot({ path: 'header-teste-inicial.png', fullPage: true });
    console.log('📸 Screenshot inicial capturado');
    
    // 5. Verificar se header e navbar estão presentes
    const header = await page.$('.header-container, header');
    const navbar = await page.$('.navbar, nav');
    
    console.log('🔍 Verificando elementos da interface:');
    console.log(`   - Header encontrado: ${header ? '✅' : '❌'}`);
    console.log(`   - Navbar encontrada: ${navbar ? '✅' : '❌'}`);
    
    if (!header || !navbar) {
      throw new Error('Header ou Navbar não encontrados na página');
    }
    
    // 6. Obter posições iniciais
    const headerInitialPos = await page.evaluate(() => {
      const header = document.querySelector('.header-container, header');
      return header ? header.getBoundingClientRect() : null;
    });
    
    const navbarInitialPos = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar, nav');
      return navbar ? navbar.getBoundingClientRect() : null;
    });
    
    console.log(`📏 Posição inicial do Header: top=${headerInitialPos?.top}, position=${await page.evaluate(() => getComputedStyle(document.querySelector('.header-container, header')).position)}`);
    console.log(`📏 Posição inicial da Navbar: top=${navbarInitialPos?.top}, position=${await page.evaluate(() => getComputedStyle(document.querySelector('.navbar, nav')).position)}`);
    
    // 7. Simular scroll para baixo
    console.log('📜 Fazendo scroll para baixo (500px)...');
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    
    // 8. Verificar posições após scroll
    const headerAfterScroll = await page.evaluate(() => {
      const header = document.querySelector('.header-container, header');
      return header ? header.getBoundingClientRect() : null;
    });
    
    const navbarAfterScroll = await page.evaluate(() => {
      const navbar = document.querySelector('.navbar, nav');
      return navbar ? navbar.getBoundingClientRect() : null;
    });
    
    console.log(`📏 Posição do Header após scroll: top=${headerAfterScroll?.top}`);
    console.log(`📏 Posição da Navbar após scroll: top=${navbarAfterScroll?.top}`);
    
    // 9. Capturar screenshot após scroll
    await page.screenshot({ path: 'header-teste-apos-scroll.png', fullPage: true });
    console.log('📸 Screenshot após scroll capturado');
    
    // 10. Validações específicas
    console.log('\n🔍 VALIDAÇÕES ESPECÍFICAS:');
    
    // Verificar se header permanece no topo (top = 0 ou próximo)
    const headerFixo = headerAfterScroll?.top <= 5; // Tolerância de 5px
    console.log(`   - Header permanece fixo no topo: ${headerFixo ? '✅' : '❌'}`);
    
    // Verificar se navbar está posicionada logo abaixo do header
    const navbarPosicaoCorreta = navbarAfterScroll?.top >= headerAfterScroll?.bottom - 5;
    console.log(`   - Navbar posicionada corretamente: ${navbarPosicaoCorreta ? '✅' : '❌'}`);
    
    // Verificar se o conteúdo principal tem espaçamento adequado
    const contentSpacing = await page.evaluate(() => {
      const mainContent = document.querySelector('main, .main-content, .content');
      return mainContent ? getComputedStyle(mainContent).paddingTop || getComputedStyle(mainContent).marginTop : '0px';
    });
    console.log(`   - Espaçamento do conteúdo principal: ${contentSpacing}`);
    
    // 11. Testar dropdown se existir
    console.log('\n🔽 Testando funcionalidade dos dropdowns...');
    const dropdownTrigger = await page.$('[data-testid="user-menu"], .dropdown-toggle, .user-dropdown');
    if (dropdownTrigger) {
      await dropdownTrigger.click();
      await page.waitForTimeout(500);
      const dropdownMenu = await page.$('.dropdown-menu, .dropdown-content');
      console.log(`   - Dropdown funcional: ${dropdownMenu ? '✅' : '❌'}`);
    } else {
      console.log('   - Nenhum dropdown encontrado para teste');
    }
    
    // 12. Scroll adicional para teste mais rigoroso
    console.log('\n📜 Teste de scroll mais extenso...');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(1000);
    
    const headerFinalPos = await page.evaluate(() => {
      const header = document.querySelector('.header-container, header');
      return header ? header.getBoundingClientRect() : null;
    });
    
    const headerAindaFixo = headerFinalPos?.top <= 5;
    console.log(`   - Header ainda fixo após scroll extenso: ${headerAindaFixo ? '✅' : '❌'}`);
    
    // Screenshot final
    await page.screenshot({ path: 'header-teste-final.png', fullPage: true });
    console.log('📸 Screenshot final capturado');
    
    // 13. RELATÓRIO FINAL
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('========================');
    
    const resultados = {
      headerEncontrado: !!header,
      navbarEncontrada: !!navbar,
      headerFixoAposScroll: headerFixo && headerAindaFixo,
      navbarPosicionada: navbarPosicaoCorreta,
      dropdownFuncional: !!dropdownTrigger
    };
    
    const sucesso = Object.values(resultados).every(Boolean);
    
    console.log(`Status Geral: ${sucesso ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`Header encontrado: ${resultados.headerEncontrado ? '✅' : '❌'}`);
    console.log(`Navbar encontrada: ${resultados.navbarEncontrada ? '✅' : '❌'}`);
    console.log(`Header permanece fixo: ${resultados.headerFixoAposScroll ? '✅' : '❌'}`);
    console.log(`Navbar posicionada corretamente: ${resultados.navbarPosicionada ? '✅' : '❌'}`);
    console.log(`Funcionalidade completa: ${sucesso ? '✅' : '❌'}`);
    
    return {
      sucesso,
      detalhes: resultados,
      screenshots: ['header-teste-inicial.png', 'header-teste-apos-scroll.png', 'header-teste-final.png']
    };
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    await page.screenshot({ path: 'header-teste-erro.png', fullPage: true });
    return {
      sucesso: false,
      erro: error.message,
      screenshot: 'header-teste-erro.png'
    };
  } finally {
    await browser.close();
  }
}

// Executar o teste
testeHeaderFixo().then(resultado => {
  console.log('\n🏁 TESTE FINALIZADO');
  console.log('Resultado:', JSON.stringify(resultado, null, 2));
}).catch(console.error);