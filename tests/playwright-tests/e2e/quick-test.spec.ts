import { test, expect } from '@playwright/test';
import { createWidgetHelpers, setupErrorTracking, assertWidgetLoaded } from '../test-helpers';

// Quick test to verify the test setup is working
test.describe('Quick Widget Test', () => {
  test('widget loads on wsj-article-seven.vercel.app', async ({ page }) => {
    // Set up error tracking
    await setupErrorTracking(page);
    
    // Create widget helpers
    const widget = createWidgetHelpers(page);
    
    // Navigate to the known working site
    await page.goto('https://wsj-article-seven.vercel.app', { 
      waitUntil: 'networkidle' 
    });
    
    // Wait for widget to load
    await widget.waitForWidget();
    
    // Verify widget is loaded and visible
    await assertWidgetLoaded(page, widget);
    
    // Expand the widget
    await widget.expandWidget();
    
    // Ask a simple question
    const response = await widget.askQuestion('What is this article about?');
    
    // Verify we got a response
    expect(response).toBeTruthy();
    expect(response.length).toBeGreaterThan(50);
    console.log('Widget response:', response.substring(0, 100) + '...');
    
    // Check performance
    const metrics = await widget.checkPerformance();
    console.log('Performance metrics:', metrics);
    
    // Take a screenshot
    await widget.takeScreenshot('wsj-article-widget-expanded');
    
    // Collapse widget
    await widget.collapseWidget();
    
    // Verify no console errors
    const errorCount = await page.evaluate(() => (window as any).__playwrightErrors || 0);
    expect(errorCount).toBe(0);
  });
});

// Test a few other sites quickly
test.describe('Multi-Site Quick Test', () => {
  const testSites = [
    { name: 'React Docs', url: 'https://react.dev' },
    { name: 'Vue.js', url: 'https://vuejs.org' },
    { name: 'Vercel', url: 'https://vercel.com' }
  ];
  
  for (const site of testSites) {
    test(`widget loads on ${site.name}`, async ({ page }) => {
      const widget = createWidgetHelpers(page);
      
      // Navigate to site
      await page.goto(site.url, { waitUntil: 'networkidle' });
      
      // Inject widget if not present
      await widget.injectWidget();
      
      // Verify widget loads
      await assertWidgetLoaded(page, widget);
      
      // Quick interaction test
      await widget.expandWidget();
      const response = await widget.askQuestion(`What is ${site.name}?`);
      expect(response).toBeTruthy();
      
      console.log(`✅ ${site.name} - Widget working!`);
    });
  }
});