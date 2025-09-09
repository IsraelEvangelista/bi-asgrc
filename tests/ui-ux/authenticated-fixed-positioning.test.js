import { test, expect } from '@playwright/test';

test.describe('Authenticated Fixed Header and Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8084');
    await page.waitForLoadState('networkidle');
  });

  test('should login and verify fixed positioning elements exist', async ({ page }) => {
    // Take screenshot of login page first
    await page.screenshot({ 
      path: 'tests/screenshots/01-login-page.png', 
      fullPage: true 
    });

    // Fill login form - using common test credentials
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    
    // Click login button
    await page.click('button:has-text("Entrar")');
    
    // Wait for navigation to authenticated area
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Extra wait for authentication

    // Take screenshot after login
    await page.screenshot({ 
      path: 'tests/screenshots/02-after-login.png', 
      fullPage: true 
    });

    // Check if header exists with correct classes
    const header = page.locator('header.fixed.top-0');
    await expect(header).toBeVisible({ timeout: 10000 });
    
    // Check if navbar exists with correct classes  
    const navbar = page.locator('nav.fixed.top-16');
    await expect(navbar).toBeVisible({ timeout: 10000 });

    console.log('✓ Login successful and fixed elements found');
  });

  test('should test header fixed positioning during scrolling', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Wait for header to be visible
    const header = page.locator('header.fixed');
    await expect(header).toBeVisible();

    // Get initial header position
    const headerBefore = await header.boundingBox();
    console.log('Header position before scroll:', headerBefore);

    // Take screenshot before scrolling
    await page.screenshot({ 
      path: 'tests/screenshots/03-before-scroll.png', 
      fullPage: true 
    });

    // Scroll down significantly
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(1000);

    // Take screenshot after scrolling
    await page.screenshot({ 
      path: 'tests/screenshots/04-after-scroll.png', 
      fullPage: true 
    });

    // Get header position after scrolling
    const headerAfter = await header.boundingBox();
    console.log('Header position after scroll:', headerAfter);

    // Verify header stayed fixed at top
    expect(headerAfter.y).toBe(0);
    expect(headerAfter.y).toBe(headerBefore.y);

    console.log('✓ Header maintains fixed position during scrolling');
  });

  test('should test navbar fixed positioning and height', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const navbar = page.locator('nav.fixed');
    await expect(navbar).toBeVisible();

    // Check navbar positioning
    const navbarBox = await navbar.boundingBox();
    console.log('Navbar position and dimensions:', navbarBox);

    // Should be positioned at 64px from top (header height)
    expect(navbarBox.y).toBe(64);
    
    // Scroll and verify navbar stays fixed
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(1000);

    const navbarAfterScroll = await navbar.boundingBox();
    expect(navbarAfterScroll.y).toBe(64);

    console.log('✓ Navbar maintains fixed position at correct offset');
  });

  test('should verify main content has proper padding', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Find main content element
    const mainContent = page.locator('main.pt-28').first();
    await expect(mainContent).toBeVisible();

    // Check computed top padding
    const paddingTop = await mainContent.evaluate(el => 
      window.getComputedStyle(el).paddingTop
    );
    
    console.log('Main content padding-top:', paddingTop);
    
    // Should be 112px (28 * 4 = 112px in Tailwind)
    expect(paddingTop).toBe('112px');

    // Verify content starts below both fixed elements
    const contentBox = await mainContent.boundingBox();
    expect(contentBox.y).toBeGreaterThanOrEqual(112);

    console.log('✓ Content has proper padding to account for fixed elements');
  });

  test('should test navigation across different pages', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test navigation to Conceitos page
    const conceitosLink = page.locator('nav a:has-text("Conceitos")');
    if (await conceitosLink.count() > 0) {
      await conceitosLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.screenshot({ 
        path: 'tests/screenshots/05-conceitos-page.png', 
        fullPage: true 
      });

      // Test scrolling behavior on this page
      await page.evaluate(() => window.scrollTo(0, 400));
      await page.waitForTimeout(500);

      // Verify fixed elements still work
      const header = await page.locator('header.fixed').boundingBox();
      const navbar = await page.locator('nav.fixed').boundingBox();

      expect(header?.y).toBe(0);
      expect(navbar?.y).toBe(64);

      console.log('✓ Fixed positioning works on Conceitos page');
    }

    // Test dropdown navigation
    const processosButton = page.locator('nav button:has-text("Processos")');
    if (await processosButton.count() > 0) {
      await processosButton.click();
      await page.waitForTimeout(500);

      // Take screenshot with dropdown open
      await page.screenshot({ 
        path: 'tests/screenshots/06-processos-dropdown.png', 
        fullPage: true 
      });

      // Click on a dropdown item
      const cadeiaValorLink = page.locator('nav a:has-text("Cadeia de Valor")');
      if (await cadeiaValorLink.count() > 0) {
        await cadeiaValorLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await page.screenshot({ 
          path: 'tests/screenshots/07-cadeia-valor-page.png', 
          fullPage: true 
        });

        // Test scrolling
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        // Verify fixed positioning
        const header = await page.locator('header.fixed').boundingBox();
        expect(header?.y).toBe(0);

        console.log('✓ Fixed positioning works on Cadeia de Valor page');
      }
    }
  });

  test('should test responsive behavior', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Test different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);

      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `tests/screenshots/08-responsive-${viewport.name}.png`, 
        fullPage: true 
      });

      // Test scrolling on each viewport
      await page.evaluate(() => window.scrollTo(0, 300));
      await page.waitForTimeout(500);

      // Verify fixed positioning still works
      const header = page.locator('header.fixed');
      const navbar = page.locator('nav.fixed');

      if (await header.count() > 0) {
        const headerBox = await header.boundingBox();
        expect(headerBox?.y).toBe(0);
      }

      if (await navbar.count() > 0) {
        const navbarBox = await navbar.boundingBox();
        expect(navbarBox?.y).toBe(64);
      }

      console.log(`✓ Fixed positioning verified on ${viewport.name} viewport`);
    }
  });

  test('should verify z-index layering', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get z-index values
    const headerZIndex = await page.locator('header.fixed').evaluate(el => 
      window.getComputedStyle(el).zIndex
    );
    
    const navbarZIndex = await page.locator('nav.fixed').evaluate(el => 
      window.getComputedStyle(el).zIndex
    );

    console.log('Header z-index:', headerZIndex);
    console.log('Navbar z-index:', navbarZIndex);

    // Verify correct z-index values
    expect(parseInt(headerZIndex)).toBe(50); // z-50
    expect(parseInt(navbarZIndex)).toBe(40); // z-40
    expect(parseInt(headerZIndex)).toBeGreaterThan(parseInt(navbarZIndex));

    console.log('✓ Z-index layering is correct');
  });

  test('should test dropdown behavior during scrolling', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@cogerh.gov.br');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Open a dropdown
    const riscosButton = page.locator('nav button:has-text("Riscos Estratégicos")');
    if (await riscosButton.count() > 0) {
      await riscosButton.click();
      await page.waitForTimeout(500);

      // Take screenshot with dropdown open
      await page.screenshot({ 
        path: 'tests/screenshots/09-dropdown-open.png', 
        fullPage: true 
      });

      // Scroll while dropdown is open
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(500);

      // Take screenshot after scrolling with dropdown
      await page.screenshot({ 
        path: 'tests/screenshots/10-dropdown-scroll.png', 
        fullPage: true 
      });

      // Verify navbar and header are still fixed
      const header = await page.locator('header.fixed').boundingBox();
      const navbar = await page.locator('nav.fixed').boundingBox();

      expect(header?.y).toBe(0);
      expect(navbar?.y).toBe(64);

      // Verify dropdown is still visible and positioned correctly
      const dropdown = page.locator('nav .absolute.left-0.mt-1');
      if (await dropdown.count() > 0) {
        await expect(dropdown).toBeVisible();
        console.log('✓ Dropdown remains functional during scrolling');
      }
    }
  });
});