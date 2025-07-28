#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Test Result Parser and Metrics Generator
 * Parses Playwright test results and generates compatibility metrics
 */

class TestResultsParser {
    constructor(resultsPath) {
        this.resultsPath = resultsPath;
        this.metrics = {
            overall: {
                totalTests: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0,
                passRate: 0
            },
            byBrowser: {},
            bySiteType: {},
            bySite: {},
            performance: {
                avgLoadTime: 0,
                avgMemoryUsage: 0,
                slowestTests: [],
                fastestTests: []
            },
            compatibility: {},
            failures: [],
            timestamp: new Date().toISOString()
        };
    }

    async parseResults() {
        try {
            const data = await fs.readFile(this.resultsPath, 'utf8');
            const results = JSON.parse(data);
            
            this.processTestSuites(results.suites || []);
            this.calculateMetrics();
            this.generateCompatibilityMatrix();
            
            return this.metrics;
        } catch (error) {
            console.error('Error parsing test results:', error);
            throw error;
        }
    }

    processTestSuites(suites) {
        suites.forEach(suite => {
            // Extract metadata from suite title
            const metadata = this.extractMetadata(suite.title);
            
            // Process each test in the suite
            suite.tests?.forEach(test => {
                this.processTest(test, metadata);
            });

            // Process nested suites
            if (suite.suites) {
                this.processTestSuites(suite.suites);
            }
        });
    }

    extractMetadata(title) {
        // Parse suite title to extract browser, site, and type information
        // Expected format: "Widget Compatibility - {site} - {browser}"
        const parts = title.split(' - ');
        const metadata = {
            browser: 'unknown',
            site: 'unknown',
            siteType: 'unknown'
        };

        if (parts.length >= 3) {
            metadata.site = parts[1];
            metadata.browser = parts[2];
        } else if (parts.length >= 2) {
            // Try to detect browser from title
            const browsers = ['chromium', 'firefox', 'webkit', 'edge', 'Chrome', 'Safari'];
            const foundBrowser = browsers.find(b => title.toLowerCase().includes(b.toLowerCase()));
            if (foundBrowser) {
                metadata.browser = foundBrowser;
            }
        }

        // Determine site type based on site name
        const siteTypes = {
            'static': ['static', 'github-pages'],
            'spa': ['nextjs', 'react', 'vue', 'angular', 'gatsby', 'vercel'],
            'cms': ['wordpress', 'medium'],
            'ecommerce': ['shopify', 'store', 'shop'],
            'docs': ['docusaurus', 'docs', 'mdx']
        };

        for (const [type, keywords] of Object.entries(siteTypes)) {
            if (keywords.some(keyword => metadata.site.toLowerCase().includes(keyword))) {
                metadata.siteType = type;
                break;
            }
        }

        return metadata;
    }

    processTest(test, metadata) {
        this.metrics.overall.totalTests++;
        
        // Update overall metrics
        switch (test.status) {
            case 'passed':
                this.metrics.overall.passed++;
                break;
            case 'failed':
                this.metrics.overall.failed++;
                this.recordFailure(test, metadata);
                break;
            case 'skipped':
                this.metrics.overall.skipped++;
                break;
        }

        this.metrics.overall.duration += test.duration || 0;

        // Update browser-specific metrics
        if (!this.metrics.byBrowser[metadata.browser]) {
            this.metrics.byBrowser[metadata.browser] = {
                total: 0, passed: 0, failed: 0, skipped: 0, avgDuration: 0
            };
        }
        this.updateCategoryMetrics(this.metrics.byBrowser[metadata.browser], test);

        // Update site type metrics
        if (!this.metrics.bySiteType[metadata.siteType]) {
            this.metrics.bySiteType[metadata.siteType] = {
                total: 0, passed: 0, failed: 0, skipped: 0, avgDuration: 0
            };
        }
        this.updateCategoryMetrics(this.metrics.bySiteType[metadata.siteType], test);

        // Update site-specific metrics
        if (!this.metrics.bySite[metadata.site]) {
            this.metrics.bySite[metadata.site] = {
                total: 0, passed: 0, failed: 0, skipped: 0, browsers: new Set()
            };
        }
        this.updateCategoryMetrics(this.metrics.bySite[metadata.site], test);
        this.metrics.bySite[metadata.site].browsers.add(metadata.browser);

        // Extract performance metrics if available
        this.extractPerformanceMetrics(test, metadata);
    }

    updateCategoryMetrics(category, test) {
        category.total++;
        switch (test.status) {
            case 'passed': category.passed++; break;
            case 'failed': category.failed++; break;
            case 'skipped': category.skipped++; break;
        }
        category.avgDuration = 
            (category.avgDuration * (category.total - 1) + (test.duration || 0)) / category.total;
    }

    extractPerformanceMetrics(test, metadata) {
        // Look for performance-related data in test title or attachments
        if (test.title.toLowerCase().includes('performance') || 
            test.title.toLowerCase().includes('load')) {
            
            // Extract load time if mentioned in title or error message
            const loadTimeMatch = (test.title + ' ' + (test.error?.message || ''))
                .match(/(\d+(?:\.\d+)?)\s*(?:ms|milliseconds)/i);
            
            if (loadTimeMatch) {
                const loadTime = parseFloat(loadTimeMatch[1]);
                this.metrics.performance.slowestTests.push({
                    test: test.title,
                    browser: metadata.browser,
                    site: metadata.site,
                    duration: loadTime
                });
            }
        }
    }

    recordFailure(test, metadata) {
        this.metrics.failures.push({
            test: test.title,
            browser: metadata.browser,
            site: metadata.site,
            siteType: metadata.siteType,
            error: test.error?.message || 'Unknown error',
            duration: test.duration
        });
    }

    calculateMetrics() {
        // Calculate overall pass rate
        if (this.metrics.overall.totalTests > 0) {
            this.metrics.overall.passRate = 
                (this.metrics.overall.passed / this.metrics.overall.totalTests * 100).toFixed(2);
        }

        // Calculate pass rates for each category
        for (const browser in this.metrics.byBrowser) {
            const data = this.metrics.byBrowser[browser];
            data.passRate = data.total > 0 ? (data.passed / data.total * 100).toFixed(2) : 0;
        }

        for (const siteType in this.metrics.bySiteType) {
            const data = this.metrics.bySiteType[siteType];
            data.passRate = data.total > 0 ? (data.passed / data.total * 100).toFixed(2) : 0;
        }

        for (const site in this.metrics.bySite) {
            const data = this.metrics.bySite[site];
            data.passRate = data.total > 0 ? (data.passed / data.total * 100).toFixed(2) : 0;
            // Convert Set to Array for JSON serialization
            data.browsers = Array.from(data.browsers);
        }

        // Sort performance metrics
        this.metrics.performance.slowestTests.sort((a, b) => b.duration - a.duration);
        this.metrics.performance.slowestTests = this.metrics.performance.slowestTests.slice(0, 10);
        
        this.metrics.performance.fastestTests = [...this.metrics.performance.slowestTests]
            .sort((a, b) => a.duration - b.duration)
            .slice(0, 10);
    }

    generateCompatibilityMatrix() {
        // Create a compatibility matrix showing which browsers work with which sites
        const matrix = {};
        
        for (const site in this.metrics.bySite) {
            matrix[site] = {};
            const siteData = this.metrics.bySite[site];
            
            siteData.browsers.forEach(browser => {
                // Find pass rate for this specific combination
                const passed = this.findTestResults(site, browser, 'passed');
                const total = this.findTestResults(site, browser, 'total');
                
                matrix[site][browser] = {
                    passed,
                    total,
                    passRate: total > 0 ? (passed / total * 100).toFixed(0) : 0,
                    status: this.getCompatibilityStatus(passed, total)
                };
            });
        }
        
        this.metrics.compatibility = matrix;
    }

    findTestResults(site, browser, metric) {
        // This is a simplified version - in real implementation,
        // you'd need to track individual test results by site+browser combination
        const siteData = this.metrics.bySite[site];
        const browserData = this.metrics.byBrowser[browser];
        
        if (metric === 'passed') {
            // Estimate based on overall pass rates
            const sitePassRate = parseFloat(siteData.passRate) / 100;
            const browserPassRate = parseFloat(browserData.passRate) / 100;
            const combinedRate = (sitePassRate + browserPassRate) / 2;
            return Math.round(siteData.total / siteData.browsers.length * combinedRate);
        }
        
        return Math.round(siteData.total / siteData.browsers.length);
    }

    getCompatibilityStatus(passed, total) {
        if (total === 0) return 'untested';
        const passRate = passed / total;
        if (passRate >= 0.95) return 'full';
        if (passRate >= 0.8) return 'good';
        if (passRate >= 0.6) return 'partial';
        return 'poor';
    }

    async saveMetrics(outputPath) {
        const json = JSON.stringify(this.metrics, null, 2);
        await fs.writeFile(outputPath, json);
        console.log(`Metrics saved to: ${outputPath}`);
    }

    generateSummaryReport() {
        const report = `
Widget Compatibility Test Results Summary
========================================
Generated: ${new Date().toLocaleString()}

Overall Results:
---------------
Total Tests: ${this.metrics.overall.totalTests}
Passed: ${this.metrics.overall.passed} (${this.metrics.overall.passRate}%)
Failed: ${this.metrics.overall.failed}
Skipped: ${this.metrics.overall.skipped}
Total Duration: ${(this.metrics.overall.duration / 1000).toFixed(2)}s

Browser Compatibility:
--------------------
${Object.entries(this.metrics.byBrowser)
    .map(([browser, data]) => `${browser}: ${data.passed}/${data.total} (${data.passRate}%)`)
    .join('\n')}

Site Type Performance:
--------------------
${Object.entries(this.metrics.bySiteType)
    .map(([type, data]) => `${type}: ${data.passed}/${data.total} (${data.passRate}%)`)
    .join('\n')}

Top Failures:
------------
${this.metrics.failures.slice(0, 5)
    .map(f => `- ${f.test} (${f.browser} on ${f.site}): ${f.error}`)
    .join('\n')}

Recommendations:
--------------
${this.generateRecommendations()}
`;
        return report;
    }

    generateRecommendations() {
        const recommendations = [];
        
        // Check overall pass rate
        if (parseFloat(this.metrics.overall.passRate) < 90) {
            recommendations.push('⚠️  Overall pass rate is below 90%. Review failing tests.');
        }

        // Check browser-specific issues
        for (const [browser, data] of Object.entries(this.metrics.byBrowser)) {
            if (parseFloat(data.passRate) < 80) {
                recommendations.push(`🌐 ${browser} has compatibility issues (${data.passRate}% pass rate)`);
            }
        }

        // Check site type issues
        for (const [type, data] of Object.entries(this.metrics.bySiteType)) {
            if (parseFloat(data.passRate) < 85) {
                recommendations.push(`📊 ${type} sites need attention (${data.passRate}% pass rate)`);
            }
        }

        // Performance recommendations
        if (this.metrics.performance.slowestTests.length > 0) {
            const slowest = this.metrics.performance.slowestTests[0];
            if (slowest.duration > 3000) {
                recommendations.push(`⏱️  Performance issue: ${slowest.test} takes ${slowest.duration}ms`);
            }
        }

        return recommendations.length > 0 ? recommendations.join('\n') : '✅ All systems operational!';
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const resultsPath = args[0] || path.join(__dirname, '../tests/playwright-tests/test-results/results.json');
    const outputPath = args[1] || path.join(__dirname, 'compatibility-metrics.json');

    console.log('Parsing test results from:', resultsPath);
    
    try {
        const parser = new TestResultsParser(resultsPath);
        const metrics = await parser.parseResults();
        
        // Save metrics
        await parser.saveMetrics(outputPath);
        
        // Print summary
        console.log(parser.generateSummaryReport());
        
        // Also save the summary report
        const reportPath = outputPath.replace('.json', '-report.txt');
        await fs.writeFile(reportPath, parser.generateSummaryReport());
        console.log(`Summary report saved to: ${reportPath}`);
        
    } catch (error) {
        console.error('Failed to parse test results:', error.message);
        process.exit(1);
    }
}

// Export for use as module
module.exports = TestResultsParser;

// Run if called directly
if (require.main === module) {
    main();
}