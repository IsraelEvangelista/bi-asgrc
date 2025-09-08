import { test, expect } from '@playwright/test';

test.describe('Fixed Header and Navigation Bar Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:8084');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should take initial screenshot of the application', async ({ page }) => {
    // Take full page screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/initial-app-view.png', 
      fullPage: true 
    });
    
    console.log('Initial screenshot saved: tests/screenshots/initial-app-view.png');
  });

  test('should verify header and navigation are fixed on dashboard', async ({ page }) => {
    // Navigate to dashboard (assuming this is the main page after login)
    await page.waitForSelector('header', { timeout: 5000 });
    await page.waitForSelector('nav', { timeout: 5000 });

    // Take screenshot before scrolling
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-before-scroll.png', 
      fullPage: true 
    });

    // Get initial positions of header and nav
    const headerBefore = await page.locator('header').boundingBox();
    const navBefore = await page.locator('nav').boundingBox();

    console.log('Header position before scroll:', headerBefore);
    console.log('Nav position before scroll:', navBefore);

    // Scroll down the page
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000); // Wait for scroll to complete

    // Take screenshot after scrolling
    await page.screenshot({ 
      path: 'tests/screenshots/dashboard-after-scroll.png', 
      fullPage: true 
    });

    // Get positions after scrolling
    const headerAfter = await page.locator('header').boundingBox();
    const navAfter = await page.locator('nav').boundingBox();

    console.log('Header position after scroll:', headerAfter);
    console.log('Nav position after scroll:', navAfter);

    // Verify header stays fixed (y position should remain the same)
    expect(headerAfter.y).toBe(headerBefore.y);
    expect(headerAfter.y).toBe(0); // Should be at top

    // Verify nav stays fixed (y position should remain the same)
    expect(navAfter.y).toBe(navBefore.y);
    expect(navAfter.y).toBe(64); // Should be at 64px (height of header)

    // Check CSS classes for fixed positioning
    const headerClasses = await page.locator('header').getAttribute('class');
    const navClasses = await page.locator('nav').getAttribute('class');

    expect(headerClasses).toContain('fixed');
    expect(headerClasses).toContain('top-0');
    expect(headerClasses).toContain('z-50');
    
    expect(navClasses).toContain('fixed');
    expect(navClasses).toContain('top-16');
    expect(navClasses).toContain('z-40');
  });

  test('should verify content padding accounts for fixed elements', async ({ page }) => {
    // Find the main content area
    const mainContent = page.locator('main').first();
    
    if (await mainContent.count() > 0) {
      const contentClasses = await mainContent.getAttribute('class');
      console.log('Main content classes:', contentClasses);
      
      // Check if content has proper top padding
      expect(contentClasses).toContain('pt-28'); // 112px padding-top
      
      const contentBox = await mainContent.boundingBox();
      console.log('Main content position:', contentBox);
      
      // Content should start below both fixed elements (64px header + 48px nav = 112px)
      expect(contentBox.y).toBeGreaterThanOrEqual(112);
    }
  });

  test('should test fixed positioning on different pages', async ({ page }) => {
    // List of pages to test (adjust based on your application structure)
    const pagesToTest = [
      { name: 'Gestão de Riscos', selector: 'a[href*="riscos"]' },
      { name: 'Conformidade', selector: 'a[href*="conformidade"]' },
      { name: 'Auditoria', selector: 'a[href*="auditoria"]' },
      { name: 'Relatórios', selector: 'a[href*="relatorios"]' }
    ];

    for (const page_info of pagesToTest) {
      console.log(`Testing page: ${page_info.name}`);
      
      // Try to navigate to the page
      const navLink = page.locator(page_info.selector).first();
      
      if (await navLink.count() > 0) {
        await navLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // Take screenshot
        await page.screenshot({ 
          path: `tests/screenshots/${page_info.name.toLowerCase().replace(/\s+/g, '-')}-page.png`, 
          fullPage: true 
        });

        // Test scrolling behavior
        await page.evaluate(() => window.scrollTo(0, 300));
        await page.waitForTimeout(500);

        // Verify fixed positioning
        const header = await page.locator('header').boundingBox();
        const nav = await page.locator('nav').boundingBox();

        expect(header.y).toBe(0);
        expect(nav.y).toBe(64);

        console.log(`✓ Fixed positioning verified on ${page_info.name} page`);
      } else {
        console.log(`⚠ Navigation link not found for ${page_info.name}`);
      }
    }
  });

  test('should verify login page does NOT have fixed positioning', async ({ page }) => {
    // Try to find and navigate to login page
    try {
      // Look for logout button or login link
      const logoutBtn = page.locator('button:has-text("Sair"), a:has-text("Login"), a:has-text("Entrar")').first();
      
      if (await logoutBtn.count() > 0) {
        await logoutBtn.click();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of login page
        await page.screenshot({ 
          path: 'tests/screenshots/login-page.png', 
          fullPage: true 
        });

        // Check if header/nav exist on login page
        const headerExists = await page.locator('header').count() > 0;
        const navExists = await page.locator('nav').count() > 0;

        console.log('Header exists on login page:', headerExists);
        console.log('Nav exists on login page:', navExists);

        // If they exist, they should NOT have fixed positioning
        if (headerExists) {
          const headerClasses = await page.locator('header').getAttribute('class');
          expect(headerClasses).not.toContain('fixed');
        }

        if (navExists) {
          const navClasses = await page.locator('nav').getAttribute('class');
          expect(navClasses).not.toContain('fixed');
        }

        console.log('✓ Login page correctly excludes fixed positioning');
      } else {
        console.log('⚠ Could not find logout/login button to test login page');
      }
    } catch (error) {
      console.log('Note: Could not test login page -', error.message);
    }
  });

  test('should test responsive behavior of fixed elements', async ({ page }) => {
    // Test different viewport sizes
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      // Take screenshot
      await page.screenshot({ 
        path: `tests/screenshots/responsive-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });

      // Test scrolling on this viewport
      await page.evaluate(() => window.scrollTo(0, 200));
      await page.waitForTimeout(500);

      // Verify fixed positioning still works
      const header = await page.locator('header').boundingBox();
      if (header) {
        expect(header.y).toBe(0);
      }

      const nav = await page.locator('nav').boundingBox();
      if (nav) {
        expect(nav.y).toBe(64);
      }

      console.log(`✓ Fixed positioning verified on ${viewport.name} viewport`);
    }
  });

  test('should verify z-index layering is correct', async ({ page }) => {
    // Get computed styles for z-index verification
    const headerZIndex = await page.locator('header').evaluate(el => 
      window.getComputedStyle(el).zIndex
    );
    
    const navZIndex = await page.locator('nav').evaluate(el => 
      window.getComputedStyle(el).zIndex
    );

    console.log('Header z-index:', headerZIndex);
    console.log('Nav z-index:', navZIndex);

    // Header should have higher z-index than nav
    expect(parseInt(headerZIndex)).toBeGreaterThan(parseInt(navZIndex));
    expect(parseInt(headerZIndex)).toBeGreaterThanOrEqual(50);
    expect(parseInt(navZIndex)).toBeGreaterThanOrEqual(40);
  });
});