#!/usr/bin/env node

const https = require('https');
const { chromium } = require('@playwright/test');

/**
 * Production widget monitoring script
 * Checks widget availability and functionality on real production sites
 */
class ProductionMonitor {
    constructor() {
        this.widgetUrl = 'https://widget-deploy-hazel.vercel.app/widget.js';
        this.testSites = [
            {
                name: 'WSJ Article',
                url: 'https://wsj-article-seven.vercel.app/',
                expectedContent: ['vibecoding', 'developer', 'Thompson']
            },
            // Add more production sites as needed
        ];
        
        this.results = {
            timestamp: new Date().toISOString(),
            widgetAvailable: false,
            siteResults: [],
            errors: []
        };
    }

    async run() {
        console.log('🔍 Starting production widget monitoring...\n');
        
        try {
            // Check widget availability
            await this.checkWidgetAvailability();
            
            // Test on production sites
            await this.testProductionSites();
            
            // Generate report
            this.generateReport();
            
            // Exit with appropriate code
            const hasErrors = this.results.errors.length > 0 || 
                             !this.results.widgetAvailable ||
                             this.results.siteResults.some(r => !r.success);
            
            process.exit(hasErrors ? 1 : 0);
            
        } catch (error) {
            console.error('❌ Monitoring failed:', error);
            process.exit(1);
        }
    }

    async checkWidgetAvailability() {
        console.log('📡 Checking widget availability...');
        
        return new Promise((resolve) => {
            https.get(this.widgetUrl, (res) => {
                console.log(`   Status: ${res.statusCode}`);
                console.log(`   Content-Type: ${res.headers['content-type']}`);
                
                if (res.statusCode === 200) {
                    let size = 0;
                    res.on('data', (chunk) => { size += chunk.length; });
                    res.on('end', () => {
                        console.log(`   Size: ${(size / 1024).toFixed(1)}KB`);
                        this.results.widgetAvailable = true;
                        console.log('   ✅ Widget is available\n');
                        resolve();
                    });
                } else {
                    this.results.errors.push(`Widget returned status ${res.statusCode}`);
                    console.log('   ❌ Widget unavailable\n');
                    resolve();
                }
            }).on('error', (err) => {
                this.results.errors.push(`Failed to fetch widget: ${err.message}`);
                console.log(`   ❌ Error: ${err.message}\n`);
                resolve();
            });
        });
    }

    async testProductionSites() {
        if (!this.results.widgetAvailable) {
            console.log('⏭️  Skipping site tests - widget unavailable\n');
            return;
        }

        console.log('🌐 Testing production sites...\n');
        
        const browser = await chromium.launch({ headless: true });
        
        for (const site of this.testSites) {
            console.log(`📍 Testing ${site.name}...`);
            
            const result = {
                site: site.name,
                url: site.url,
                success: false,
                metrics: {},
                errors: []
            };
            
            try {
                const context = await browser.newContext();
                const page = await context.newPage();
                
                // Set up console monitoring
                const consoleLogs = [];
                page.on('console', msg => {
                    if (msg.type() === 'error') {
                        result.errors.push(msg.text());
                    }
                    consoleLogs.push({ type: msg.type(), text: msg.text() });
                });
                
                // Navigate to site
                const startTime = Date.now();
                await page.goto(site.url, { waitUntil: 'networkidle' });
                result.metrics.pageLoadTime = Date.now() - startTime;
                
                // Wait for widget
                const widgetStart = Date.now();
                await page.waitForSelector('[data-testid="ai-widget-container"], .tw-widget-container', {
                    timeout: 10000
                });
                result.metrics.widgetLoadTime = Date.now() - widgetStart;
                
                // Check widget visibility
                const widget = page.locator('[data-testid="ai-widget-container"], .tw-widget-container');
                const isVisible = await widget.isVisible();
                
                if (!isVisible) {
                    result.errors.push('Widget not visible');
                } else {
                    // Check widget dimensions
                    const box = await widget.boundingBox();
                    if (!box || box.width === 0 || box.height === 0) {
                        result.errors.push('Widget has zero dimensions');
                    } else {
                        result.metrics.widgetDimensions = { 
                            width: box.width, 
                            height: box.height 
                        };
                    }
                    
                    // Test interaction
                    const button = page.locator('[data-testid="ai-widget-button"], button[aria-label*="AI"]');
                    await button.click();
                    
                    // Wait for input to be visible
                    await page.waitForSelector('[data-testid="ai-widget-input"], input[placeholder*="Ask"]', {
                        state: 'visible',
                        timeout: 5000
                    });
                    
                    // Ask a question
                    const input = page.locator('[data-testid="ai-widget-input"], input[placeholder*="Ask"]');
                    await input.fill('What is this page about?');
                    await input.press('Enter');
                    
                    // Wait for response
                    const responseStart = Date.now();
                    await page.waitForSelector('[data-testid="ai-response"], .tw-chat-message', {
                        timeout: 30000
                    });
                    result.metrics.responseTime = Date.now() - responseStart;
                    
                    // Get response text
                    const response = await page.locator('[data-testid="ai-response"], .tw-chat-message:last-child').textContent();
                    
                    // Check if response contains expected content
                    if (site.expectedContent) {
                        const foundContent = site.expectedContent.filter(content => 
                            response.toLowerCase().includes(content.toLowerCase())
                        );
                        
                        if (foundContent.length > 0) {
                            result.success = true;
                            result.metrics.contentMatches = foundContent;
                        } else {
                            result.errors.push('Response did not contain expected content');
                        }
                    } else {
                        // Just check if we got a response
                        result.success = response.length > 50;
                    }
                }
                
                await context.close();
                
            } catch (error) {
                result.errors.push(error.message);
            }
            
            this.results.siteResults.push(result);
            
            // Log result
            if (result.success) {
                console.log(`   ✅ Success`);
                console.log(`      Page load: ${result.metrics.pageLoadTime}ms`);
                console.log(`      Widget load: ${result.metrics.widgetLoadTime}ms`);
                console.log(`      Response time: ${result.metrics.responseTime}ms`);
            } else {
                console.log(`   ❌ Failed`);
                result.errors.forEach(err => console.log(`      Error: ${err}`));
            }
            console.log('');
        }
        
        await browser.close();
    }

    generateReport() {
        console.log('\n📊 Monitoring Report');
        console.log('===================\n');
        
        console.log(`Timestamp: ${this.results.timestamp}`);
        console.log(`Widget Available: ${this.results.widgetAvailable ? '✅' : '❌'}`);
        console.log('');
        
        if (this.results.siteResults.length > 0) {
            console.log('Site Results:');
            this.results.siteResults.forEach(result => {
                console.log(`  ${result.site}: ${result.success ? '✅' : '❌'}`);
                if (result.metrics.responseTime) {
                    console.log(`    Response time: ${result.metrics.responseTime}ms`);
                }
            });
        }
        
        if (this.results.errors.length > 0) {
            console.log('\nGlobal Errors:');
            this.results.errors.forEach(err => console.log(`  - ${err}`));
        }
        
        // Save results to file
        const fs = require('fs');
        const reportPath = require('path').join(__dirname, '../test-results/monitoring-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}`);
    }
}

// Run monitor if called directly
if (require.main === module) {
    const monitor = new ProductionMonitor();
    monitor.run();
}

module.exports = ProductionMonitor;