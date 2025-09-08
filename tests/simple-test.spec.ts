import { test, expect } from '@playwright/test';

test('Screenshot da página atual', async ({ page }) => {
  await page.goto('http://localhost:8081');
  await page.waitForTimeout(5000); // Aguarda 5 segundos
  
  // Captura screenshot da página inteira
  await page.screenshot({ 
    path: 'tests/screenshots/current-page.png',
    fullPage: true
  });
  
  // Captura screenshot da viewport
  await page.screenshot({ 
    path: 'tests/screenshots/viewport.png'
  });
  
  // Verifica se existem elementos
  const bodyContent = await page.textContent('body');
  console.log('Body content length:', bodyContent?.length || 0);
  
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);
  
  const url = page.url();
  console.log('Current URL:', url);
});