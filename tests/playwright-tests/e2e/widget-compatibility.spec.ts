import { test, expect, Page } from '@playwright/test';
import { TEST_SITES, TestSiteConfig } from '../test-sites-config';

// Widget selectors
const WIDGET_SELECTORS = {
  container: '[data-testid="ai-widget-container"], .tw-widget-container',
  button: '[data-testid="ai-widget-button"], button[aria-label*="AI"], button[aria-label*="Ask"]',
  input: '[data-testid="ai-widget-input"], input[placeholder*="Ask"]',
  chatViewport: '[data-testid="chat-viewport"], .tw-chat-viewport',
  response: '[data-testid="ai-response"], .tw-chat-message:last-child',
  loading: '[data-testid="loading-indicator"], .tw-loading'
};

// Helper functions
async function waitForWidget(page: Page) {
  await page.waitForSelector(WIDGET_SELECTORS.container, { 
    state: 'visible',
    timeout: 10000 
  });
}

async function expandWidget(page: Page) {
  await page.click(WIDGET_SELECTORS.button);
  await page.waitForSelector(WIDGET_SELECTORS.input, { state: 'visible' });
}

async function askQuestion(page: Page, question: string): Promise<string> {
  await page.fill(WIDGET_SELECTORS.input, question);
  await page.press(WIDGET_SELECTORS.input, 'Enter');
  
  // Wait for loading to start and finish
  await page.waitForSelector(WIDGET_SELECTORS.loading, { state: 'visible' });
  await page.waitForSelector(WIDGET_SELECTORS.loading, { state: 'hidden', timeout: 30000 });
  
  // Get response
  const response = await page.locator(WIDGET_SELECTORS.response).textContent();
  return response || '';
}

// Test suite for each site type
Object.entries(TEST_SITES).forEach(([siteName, siteConfig]) => {
  test.describe(`Widget Compatibility - ${siteName}`, () => {
    test.beforeEach(async ({ page }) => {
      // Set up request interception for monitoring
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`Console error on ${siteName}:`, msg.text());
        }
      });
      
      // Navigate to test site
      await page.goto(siteConfig.url, { waitUntil: 'networkidle' });
    });

    test('widget loads and initializes correctly', async ({ page }) => {
      // Wait for widget to appear
      await waitForWidget(page);
      
      // Check visibility
      const widget = page.locator(WIDGET_SELECTORS.container);
      await expect(widget).toBeVisible();
      
      // Verify dimensions
      const box = await widget.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(50);
      expect(box!.height).toBeGreaterThan(50);
      
      // Take screenshot for visual regression
      await page.screenshot({ 
        path: `test-results/screenshots/${siteName}-initial.png`,
        fullPage: true 
      });
    });

    test('widget extracts and understands page content', async ({ page }) => {
      await waitForWidget(page);
      await expandWidget(page);
      
      // Ask about page content
      const response = await askQuestion(page, 'What is this website about?');
      
      // Verify response contains expected content
      expect(response.length).toBeGreaterThan(50);
      
      // Check for key content indicators
      if (siteConfig.expectedContent) {
        for (const keyword of siteConfig.expectedContent) {
          expect(response.toLowerCase()).toContain(keyword.toLowerCase());
        }
      }
    });

    test('widget handles dynamic content loading', async ({ page }) => {
      if (!siteConfig.hasDynamicContent) {
        test.skip();
      }
      
      await waitForWidget(page);
      
      // Wait for dynamic content based on site type
      if (siteConfig.type === 'spa') {
        await page.waitForTimeout(3000); // Wait for SPA to render
      }
      
      // Trigger dynamic content if needed
      if (siteConfig.dynamicContentTrigger) {
        await page.click(siteConfig.dynamicContentTrigger);
        await page.waitForTimeout(2000);
      }
      
      await expandWidget(page);
      const response = await askQuestion(page, 'What products or services are offered?');
      
      expect(response.length).toBeGreaterThan(50);
    });

    test('widget maintains functionality after navigation', async ({ page }) => {
      if (!siteConfig.navigationTest) {
        test.skip();
      }
      
      await waitForWidget(page);
      
      // Navigate to another page
      await page.click(siteConfig.navigationTest.linkSelector);
      await page.waitForURL(siteConfig.navigationTest.expectedUrl);
      
      // Check widget still works
      await waitForWidget(page);
      await expandWidget(page);
      
      const response = await askQuestion(page, 'What page am I on now?');
      expect(response).toContain(siteConfig.navigationTest.expectedContent);
    });

    test('widget is responsive on mobile', async ({ page, browserName }) => {
      if (!['chromium', 'webkit'].includes(browserName)) {
        test.skip();
      }
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await waitForWidget(page);
      
      // Check widget adapts to mobile
      const widget = page.locator(WIDGET_SELECTORS.container);
      const box = await widget.boundingBox();
      
      expect(box!.width).toBeLessThanOrEqual(375);
      expect(box!.bottom).toBeLessThanOrEqual(667);
      
      // Test interaction on mobile
      await expandWidget(page);
      
      // Chat viewport should be mobile-optimized
      const chatViewport = page.locator(WIDGET_SELECTORS.chatViewport);
      const chatBox = await chatViewport.boundingBox();
      expect(chatBox!.width).toBeLessThanOrEqual(375);
    });

    test('widget performance metrics', async ({ page }) => {
      // Measure widget load time
      const startTime = Date.now();
      await waitForWidget(page);
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3 second budget
      
      // Measure interaction responsiveness
      const interactionStart = Date.now();
      await page.click(WIDGET_SELECTORS.button);
      await page.waitForSelector(WIDGET_SELECTORS.input, { state: 'visible' });
      const interactionTime = Date.now() - interactionStart;
      
      expect(interactionTime).toBeLessThan(500); // 500ms budget
      
      // Log metrics
      console.log(`Performance metrics for ${siteName}:`, {
        loadTime,
        interactionTime
      });
    });

    test('widget accessibility compliance', async ({ page }) => {
      await waitForWidget(page);
      
      // Check ARIA attributes
      const button = page.locator(WIDGET_SELECTORS.button);
      await expect(button).toHaveAttribute('aria-label', /.+/);
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'INPUT']).toContain(focusedElement);
      
      // Check color contrast (simplified)
      const buttonStyles = await button.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });
      
      // Verify button is visible
      expect(buttonStyles.backgroundColor).not.toBe('transparent');
    });

    test('widget error handling', async ({ page }) => {
      await waitForWidget(page);
      await expandWidget(page);
      
      // Test with very long input
      const longQuestion = 'a'.repeat(1000);
      await page.fill(WIDGET_SELECTORS.input, longQuestion);
      await page.press(WIDGET_SELECTORS.input, 'Enter');
      
      // Should handle gracefully
      await page.waitForTimeout(2000);
      
      // Widget should still be functional
      await askQuestion(page, 'Hello');
      
      // No console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(errors.length).toBe(0);
    });

    test('widget CSP compatibility', async ({ page }) => {
      // Add CSP header
      await page.route('**/*', route => {
        const headers = route.request().headers();
        headers['content-security-policy'] = "default-src 'self'; script-src 'self' https://widget.gist.ai https://*.vercel.app; style-src 'self' 'unsafe-inline';";
        route.continue({ headers });
      });
      
      await page.goto(siteConfig.url);
      await waitForWidget(page);
      
      // Widget should still load
      const widget = page.locator(WIDGET_SELECTORS.container);
      await expect(widget).toBeVisible();
    });

    test('widget memory usage', async ({ page }) => {
      if (siteConfig.type !== 'static') {
        test.skip(); // Only test on static sites for consistency
      }
      
      await waitForWidget(page);
      
      // Get initial memory
      const initialMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return null;
      });
      
      if (initialMetrics === null) {
        test.skip(); // Browser doesn't support memory API
      }
      
      // Interact with widget multiple times
      for (let i = 0; i < 10; i++) {
        await expandWidget(page);
        await askQuestion(page, `Test question ${i}`);
        await page.click(WIDGET_SELECTORS.button); // Collapse
      }
      
      // Check memory hasn't grown excessively
      const finalMetrics = await page.evaluate(() => {
        if ('memory' in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return null;
      });
      
      const memoryGrowth = finalMetrics! - initialMetrics!;
      expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024); // 50MB limit
    });
  });
});