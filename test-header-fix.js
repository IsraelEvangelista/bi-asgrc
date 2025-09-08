import { chromium } from 'playwright';

async function testHeaderFixed() {
    console.log('🚀 Iniciando teste crítico do header fixo...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    const page = await context.newPage();

    try {
        // 1. Navegar para a aplicação
        console.log('📡 Acessando http://localhost:8083...');
        await page.goto('http://localhost:8083');
        await page.waitForLoadState('networkidle');
        
        // 2. Fazer login
        console.log('🔐 Realizando login...');
        await page.fill('input[type="email"]', 'isademocrata@gmail.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 3. Aguardar carregamento da página principal
        await page.waitForTimeout(3000);

        // 4. Capturar screenshot inicial
        console.log('📸 Capturando screenshot inicial...');
        await page.screenshot({ 
            path: 'screenshot-initial.png', 
            fullPage: true 
        });

        // 5. Inspecionar elementos do header
        console.log('🔍 Inspecionando estrutura do Layout...');
        
        // Verificar se existe o container fixo
        const fixedContainer = await page.locator('.fixed.top-0.left-0.right-0.z-50');
        const fixedContainerExists = await fixedContainer.count() > 0;
        console.log(`Container fixo existe: ${fixedContainerExists}`);
        
        if (fixedContainerExists) {
            const computedStyle = await fixedContainer.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    left: style.left,
                    right: style.right,
                    zIndex: style.zIndex,
                    width: style.width,
                    height: style.height,
                    backgroundColor: style.backgroundColor
                };
            });
            console.log('🎨 CSS computado do container fixo:', computedStyle);
        }

        // Verificar Header
        const header = await page.locator('header');
        const headerExists = await header.count() > 0;
        console.log(`Header existe: ${headerExists}`);
        
        if (headerExists) {
            const headerStyle = await header.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    backgroundColor: style.backgroundColor,
                    height: style.height,
                    zIndex: style.zIndex
                };
            });
            console.log('📄 CSS computado do Header:', headerStyle);
        }

        // Verificar Navbar
        const navbar = await page.locator('nav');
        const navbarExists = await navbar.count() > 0;
        console.log(`Navbar existe: ${navbarExists}`);
        
        if (navbarExists) {
            const navbarStyle = await navbar.evaluate(el => {
                const style = window.getComputedStyle(el);
                return {
                    position: style.position,
                    top: style.top,
                    backgroundColor: style.backgroundColor,
                    height: style.height,
                    zIndex: style.zIndex
                };
            });
            console.log('🧭 CSS computado do Navbar:', navbarStyle);
        }

        // 6. Testar scroll e verificar se header permanece fixo
        console.log('📜 Testando comportamento de scroll...');
        
        // Obter posição inicial do header
        let headerPosition = null;
        if (headerExists) {
            headerPosition = await header.boundingBox();
            console.log('📍 Posição inicial do header:', headerPosition);
        }

        // Fazer scroll para baixo
        await page.evaluate(() => {
            window.scrollTo(0, 500);
        });
        await page.waitForTimeout(1000);

        // Capturar screenshot após scroll
        console.log('📸 Capturando screenshot após scroll...');
        await page.screenshot({ 
            path: 'screenshot-after-scroll.png', 
            fullPage: true 
        });

        // Verificar nova posição do header
        if (headerExists) {
            const headerPositionAfterScroll = await header.boundingBox();
            console.log('📍 Posição do header após scroll:', headerPositionAfterScroll);
            
            // Comparar posições
            if (headerPosition && headerPositionAfterScroll) {
                const stayedFixed = headerPosition.y === headerPositionAfterScroll.y;
                console.log(`🎯 Header permaneceu fixo: ${stayedFixed}`);
                
                if (!stayedFixed) {
                    console.log('❌ PROBLEMA IDENTIFICADO: Header não está permanecendo fixo durante o scroll!');
                    console.log(`   Posição inicial Y: ${headerPosition.y}`);
                    console.log(`   Posição após scroll Y: ${headerPositionAfterScroll.y}`);
                }
            }
        }

        // 7. Verificar se há conflitos de CSS
        console.log('⚠️ Verificando possíveis conflitos de CSS...');
        
        // Verificar se há outros elementos com position fixed que podem conflitar
        const otherFixedElements = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const fixedElements = [];
            
            allElements.forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed') {
                    fixedElements.push({
                        tagName: el.tagName,
                        className: el.className,
                        id: el.id,
                        zIndex: style.zIndex,
                        top: style.top
                    });
                }
            });
            
            return fixedElements;
        });
        
        console.log('🔧 Elementos com position: fixed encontrados:');
        otherFixedElements.forEach((el, index) => {
            console.log(`  ${index + 1}. ${el.tagName} (class: "${el.className}", id: "${el.id}", z-index: ${el.zIndex}, top: ${el.top})`);
        });

        // 8. Análise do viewport e body
        const viewportInfo = await page.evaluate(() => {
            return {
                bodyOverflow: window.getComputedStyle(document.body).overflow,
                bodyPosition: window.getComputedStyle(document.body).position,
                htmlOverflow: window.getComputedStyle(document.documentElement).overflow,
                scrollY: window.scrollY,
                documentHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight
            };
        });
        
        console.log('📊 Informações do viewport:', viewportInfo);

        console.log('\n✅ Teste concluído! Screenshots salvos como:');
        console.log('   - screenshot-initial.png');
        console.log('   - screenshot-after-scroll.png');

    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
    } finally {
        await browser.close();
    }
}

testHeaderFixed().catch(console.error);