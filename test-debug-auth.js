import { chromium } from 'playwright';

async function debugAuthIssue() {
    console.log('🔍 TESTE CRÍTICO: Debugging do problema de autenticação\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    const context = await browser.newContext({
        viewport: { width: 1200, height: 800 }
    });
    const page = await context.newPage();

    // Interceptar todas as chamadas de rede
    page.on('response', async (response) => {
        const url = response.url();
        if (url.includes('supabase') || url.includes('api') || url.includes('auth')) {
            console.log(`🌐 Resposta: ${response.status()} ${response.statusText()} - ${url}`);
            if (!response.ok()) {
                try {
                    const body = await response.text();
                    console.log(`❌ Erro no response: ${body.substring(0, 200)}`);
                } catch (e) {
                    console.log('❌ Erro ao ler response body');
                }
            }
        }
    });

    // Interceptar requests
    page.on('request', (request) => {
        const url = request.url();
        if (url.includes('supabase') || url.includes('api') || url.includes('auth')) {
            console.log(`📤 Request: ${request.method()} - ${url}`);
        }
    });

    // Capturar erros de JavaScript
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            console.log(`💥 JS Error: ${msg.text()}`);
        } else if (msg.text().includes('🔄') || msg.text().includes('❌') || msg.text().includes('✅')) {
            console.log(`📝 Console: ${msg.text()}`);
        }
    });

    try {
        // 1. Navegar para a aplicação
        console.log('📡 Acessando http://localhost:8083...');
        await page.goto('http://localhost:8083', { waitUntil: 'networkidle' });
        
        // 2. Aguardar elementos de login
        console.log('⏳ Aguardando elementos de login...');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });

        // 3. Fazer login
        console.log('🔐 Realizando login...');
        await page.fill('input[type="email"]', 'isademocrata@gmail.com');
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        
        // 4. Aguardar resposta do login com timeout
        console.log('⏳ Aguardando resposta do login...');
        
        // Aguardar por uma das duas condições: loading spinner ou redirecionamento
        try {
            await Promise.race([
                page.waitForSelector('[class*="loading"]', { timeout: 5000 }),
                page.waitForSelector('text=Carregando perfil do usuário', { timeout: 5000 }),
                page.waitForURL(url => !url.includes('/login'), { timeout: 5000 })
            ]);
            console.log('✅ Login aceito, verificando estado...');
        } catch (e) {
            console.log('❌ Timeout aguardando resposta do login');
        }

        // 5. Verificar estado atual da página após 3 segundos
        await page.waitForTimeout(3000);
        
        const currentState = await page.evaluate(() => {
            // Verificar se está na tela de loading
            const loadingText = document.querySelector('text')?.textContent;
            const loadingSpinner = document.querySelector('[class*="loading"], [class*="spinner"]');
            
            // Verificar se há elementos de header/navbar
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');
            
            // Verificar URL atual
            const currentUrl = window.location.href;
            
            // Verificar localStorage/sessionStorage
            const authData = localStorage.getItem('sb-ydolsyvkjcrsnrhqxwhm-auth-token');
            
            return {
                currentUrl,
                hasLoadingSpinner: !!loadingSpinner,
                loadingText: loadingText,
                hasHeader: !!header,
                hasNavbar: !!nav,
                hasAuthData: !!authData,
                bodyClasses: document.body.className,
                title: document.title
            };
        });
        
        console.log('📊 Estado atual da aplicação:', currentState);

        // 6. Se está na tela de loading, aguardar mais tempo
        if (currentState.hasLoadingSpinner) {
            console.log('⏳ Detectado loading spinner, aguardando mais tempo...');
            
            try {
                await page.waitForSelector('header, nav, [role="main"]', { timeout: 15000 });
                console.log('✅ Interface principal carregada após aguardar');
            } catch (e) {
                console.log('❌ TIMEOUT: Interface principal não carregou em 15 segundos');
                
                // Capturar estado final
                const finalState = await page.evaluate(() => {
                    return {
                        allElements: Array.from(document.querySelectorAll('*'))
                            .map(el => ({
                                tag: el.tagName,
                                classes: el.className,
                                id: el.id,
                                text: el.textContent?.substring(0, 50)
                            }))
                            .filter(el => el.classes || el.id || el.text?.trim())
                            .slice(0, 20)
                    };
                });
                
                console.log('🔍 Elementos visíveis na página:', finalState);
            }
        }

        // 7. Capturar screenshot final
        await page.screenshot({ path: 'debug-auth-final.png', fullPage: true });
        console.log('📸 Screenshot salvo como: debug-auth-final.png');

    } catch (error) {
        console.error('❌ Erro durante debug:', error);
        await page.screenshot({ path: 'debug-auth-error.png', fullPage: true });
    } finally {
        await browser.close();
    }
}

debugAuthIssue().catch(console.error);