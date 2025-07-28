import { Page, expect } from '@playwright/test';

export interface WidgetHelpers {
  waitForWidget: (timeout?: number) => Promise<void>;
  expandWidget: () => Promise<void>;
  collapseWidget: () => Promise<void>;
  askQuestion: (question: string) => Promise<string>;
  getWidgetDimensions: () => Promise<{ width: number; height: number }>;
  checkWidgetVisibility: () => Promise<boolean>;
  takeScreenshot: (name: string) => Promise<void>;
  checkPerformance: () => Promise<PerformanceMetrics>;
  injectWidget: (scriptUrl?: string) => Promise<void>;
}

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number | null;
  resourceCount: number;
  errorCount: number;
}

// Default widget script URL
const DEFAULT_WIDGET_URL = 'https://widget-deploy-hazel.vercel.app/widget.js';

// Widget selectors with fallbacks
export const WIDGET_SELECTORS = {
  container: '[data-testid="ai-widget-container"], .tw-widget-container, .gist-widget-container, #gist-ai-widget',
  button: '[data-testid="ai-widget-button"], button[aria-label*="AI"], button[aria-label*="Ask"], .tw-widget-button',
  input: '[data-testid="ai-widget-input"], input[placeholder*="Ask"], .tw-chat-input input',
  chatViewport: '[data-testid="chat-viewport"], .tw-chat-viewport, .tw-messages-container',
  response: '[data-testid="ai-response"], .tw-chat-message:last-child, .tw-message:last-child',
  loading: '[data-testid="loading-indicator"], .tw-loading, .tw-typing-indicator',
  closeButton: '[data-testid="close-button"], button[aria-label="Close"], .tw-close-button'
};

export function createWidgetHelpers(page: Page): WidgetHelpers {
  return {
    async waitForWidget(timeout = 10000) {
      try {
        // Try each selector in order
        const selectors = Object.values(WIDGET_SELECTORS.container.split(', '));
        let found = false;
        
        for (const selector of selectors) {
          try {
            await page.waitForSelector(selector, { 
              state: 'visible',
              timeout: timeout / selectors.length 
            });
            found = true;
            break;
          } catch {
            // Continue to next selector
          }
        }
        
        if (!found) {
          throw new Error('Widget not found with any known selector');
        }
      } catch (error) {
        console.error('Failed to find widget:', error);
        throw error;
      }
    },

    async expandWidget() {
      const button = page.locator(WIDGET_SELECTORS.button).first();
      await button.click();
      await page.waitForSelector(WIDGET_SELECTORS.input, { state: 'visible' });
    },

    async collapseWidget() {
      const closeButton = page.locator(WIDGET_SELECTORS.closeButton).first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
      } else {
        // Fallback: click the main button again
        const button = page.locator(WIDGET_SELECTORS.button).first();
        await button.click();
      }
      await page.waitForSelector(WIDGET_SELECTORS.input, { state: 'hidden' });
    },

    async askQuestion(question: string): Promise<string> {
      const input = page.locator(WIDGET_SELECTORS.input).first();
      await input.fill(question);
      await input.press('Enter');
      
      // Wait for loading to start
      try {
        await page.waitForSelector(WIDGET_SELECTORS.loading, { 
          state: 'visible',
          timeout: 5000 
        });
      } catch {
        console.warn('Loading indicator not found, continuing...');
      }
      
      // Wait for loading to finish
      try {
        await page.waitForSelector(WIDGET_SELECTORS.loading, { 
          state: 'hidden',
          timeout: 30000 
        });
      } catch {
        console.warn('Loading indicator still visible after 30s');
      }
      
      // Get response
      const responseElement = page.locator(WIDGET_SELECTORS.response).last();
      const response = await responseElement.textContent({ timeout: 5000 });
      return response || '';
    },

    async getWidgetDimensions() {
      const widget = page.locator(WIDGET_SELECTORS.container).first();
      const box = await widget.boundingBox();
      if (!box) {
        throw new Error('Could not get widget dimensions');
      }
      return { width: box.width, height: box.height };
    },

    async checkWidgetVisibility(): Promise<boolean> {
      const widget = page.locator(WIDGET_SELECTORS.container).first();
      return await widget.isVisible();
    },

    async takeScreenshot(name: string) {
      await page.screenshot({ 
        path: `tests/playwright-tests/test-results/screenshots/${name}.png`,
        fullPage: true 
      });
    },

    async checkPerformance(): Promise<PerformanceMetrics> {
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const resources = performance.getEntriesByType('resource');
        
        // Count widget-related resources
        const widgetResources = resources.filter(r => 
          r.name.includes('widget') || 
          r.name.includes('gist') ||
          r.name.includes('vercel.app')
        );
        
        // Get memory usage if available
        let memoryUsage = null;
        if ('memory' in performance) {
          memoryUsage = (performance as any).memory.usedJSHeapSize;
        }
        
        // Count console errors
        const errorCount = (window as any).__playwrightErrors || 0;
        
        return {
          loadTime: navigation.loadEventEnd - navigation.fetchStart,
          memoryUsage,
          resourceCount: widgetResources.length,
          errorCount
        };
      });
      
      return metrics;
    },

    async injectWidget(scriptUrl = DEFAULT_WIDGET_URL) {
      // Check if widget already exists
      const widgetExists = await page.evaluate(() => {
        return !!(window as any).GistWidget || document.querySelector('#gist-ai-widget');
      });

      if (!widgetExists) {
        // Inject widget script
        await page.evaluate((url) => {
          const script = document.createElement('script');
          script.src = url;
          script.defer = true;
          document.head.appendChild(script);
        }, scriptUrl);

        // Wait for widget to initialize
        await page.waitForTimeout(2000);
        await this.waitForWidget();
      }
    }
  };
}

// Utility to set up console error tracking
export async function setupErrorTracking(page: Page) {
  await page.evaluateOnNewDocument(() => {
    (window as any).__playwrightErrors = 0;
    const originalError = console.error;
    console.error = (...args: any[]) => {
      (window as any).__playwrightErrors++;
      originalError.apply(console, args);
    };
  });
}

// Utility to generate test report data
export async function generateTestReport(
  siteName: string,
  metrics: PerformanceMetrics,
  status: 'pass' | 'fail',
  errors: string[] = []
) {
  const report = {
    site: siteName,
    timestamp: new Date().toISOString(),
    status,
    metrics,
    errors,
    environment: {
      nodeVersion: process.version,
      platform: process.platform
    }
  };

  // You can extend this to save to a file or send to a reporting service
  console.log('Test Report:', JSON.stringify(report, null, 2));
  return report;
}

// Common test assertions
export async function assertWidgetLoaded(page: Page, helpers: WidgetHelpers) {
  await helpers.waitForWidget();
  const isVisible = await helpers.checkWidgetVisibility();
  expect(isVisible).toBe(true);
  
  const dimensions = await helpers.getWidgetDimensions();
  expect(dimensions.width).toBeGreaterThan(50);
  expect(dimensions.height).toBeGreaterThan(50);
}

export async function assertWidgetResponsive(page: Page, helpers: WidgetHelpers) {
  // Test desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  await assertWidgetLoaded(page, helpers);
  
  // Test tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await assertWidgetLoaded(page, helpers);
  
  // Test mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await assertWidgetLoaded(page, helpers);
  
  const dimensions = await helpers.getWidgetDimensions();
  expect(dimensions.width).toBeLessThanOrEqual(375);
}

// Export default test configuration
export const DEFAULT_TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
};