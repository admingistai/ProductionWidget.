#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * Generate a comprehensive compatibility report from test results
 */
class CompatibilityReportGenerator {
    constructor() {
        this.resultsPath = path.join(__dirname, '../test-results/results.json');
        this.outputPath = path.join(__dirname, '../test-results/compatibility-report.html');
    }

    async generate() {
        try {
            console.log('📊 Generating compatibility report...');
            
            // Load test results
            const results = await this.loadResults();
            
            // Process results
            const report = this.processResults(results);
            
            // Generate HTML report
            const html = this.generateHTML(report);
            
            // Save report
            await fs.writeFile(this.outputPath, html);
            
            console.log(`✅ Report generated: ${this.outputPath}`);
            console.log(`📈 Overall pass rate: ${report.overallPassRate}%`);
            
            // Also generate a simplified JSON report
            await this.generateJSONReport(report);
            
        } catch (error) {
            console.error('❌ Failed to generate report:', error);
            process.exit(1);
        }
    }

    async loadResults() {
        try {
            const data = await fs.readFile(this.resultsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Failed to load results:', error);
            throw error;
        }
    }

    processResults(rawResults) {
        const report = {
            generated: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0
            },
            compatibility: {},
            performance: {},
            issues: [],
            recommendations: []
        };

        // Process each test
        const processTest = (test, suiteName) => {
            report.summary.total++;
            report.summary[test.outcome]++;

            // Extract site and browser info
            const site = this.extractSiteName(suiteName);
            const browser = test.projectName || 'unknown';

            // Build compatibility matrix
            if (!report.compatibility[site]) {
                report.compatibility[site] = {};
            }
            if (!report.compatibility[site][browser]) {
                report.compatibility[site][browser] = {
                    total: 0,
                    passed: 0,
                    failed: 0,
                    tests: []
                };
            }

            report.compatibility[site][browser].total++;
            if (test.outcome === 'expected') {
                report.compatibility[site][browser].passed++;
            } else {
                report.compatibility[site][browser].failed++;
                
                // Track issues
                if (test.error) {
                    report.issues.push({
                        site,
                        browser,
                        test: test.title,
                        error: test.error.message || test.error
                    });
                }
            }

            report.compatibility[site][browser].tests.push({
                title: test.title,
                status: test.outcome,
                duration: test.duration
            });

            // Extract performance metrics
            if (test.title.includes('performance')) {
                if (!report.performance[site]) {
                    report.performance[site] = {};
                }
                // Try to extract metrics from test attachments or results
                // This would need to be adapted based on how metrics are stored
                report.performance[site].loadTime = test.duration;
            }
        };

        // Process test suites recursively
        const processSuite = (suite, parentName = '') => {
            const suiteName = parentName ? `${parentName} - ${suite.title}` : suite.title;
            
            if (suite.tests) {
                suite.tests.forEach(test => processTest(test, suiteName));
            }
            
            if (suite.suites) {
                suite.suites.forEach(s => processSuite(s, suiteName));
            }
        };

        if (rawResults.suites) {
            rawResults.suites.forEach(suite => processSuite(suite));
        }

        // Calculate overall pass rate
        report.overallPassRate = report.summary.total > 0
            ? ((report.summary.passed / report.summary.total) * 100).toFixed(1)
            : 0;

        // Generate recommendations
        report.recommendations = this.generateRecommendations(report);

        return report;
    }

    extractSiteName(suiteName) {
        const match = suiteName.match(/Widget Compatibility - (.+)/);
        return match ? match[1] : suiteName;
    }

    generateRecommendations(report) {
        const recommendations = [];

        // Check browser compatibility
        const browserStats = {};
        Object.values(report.compatibility).forEach(site => {
            Object.entries(site).forEach(([browser, stats]) => {
                if (!browserStats[browser]) {
                    browserStats[browser] = { total: 0, passed: 0 };
                }
                browserStats[browser].total += stats.total;
                browserStats[browser].passed += stats.passed;
            });
        });

        Object.entries(browserStats).forEach(([browser, stats]) => {
            const passRate = (stats.passed / stats.total) * 100;
            if (passRate < 90) {
                recommendations.push({
                    type: 'browser',
                    severity: passRate < 70 ? 'high' : 'medium',
                    message: `${browser} has a low pass rate (${passRate.toFixed(1)}%). Consider browser-specific fixes.`
                });
            }
        });

        // Check site-specific issues
        Object.entries(report.compatibility).forEach(([site, browsers]) => {
            let totalTests = 0;
            let passedTests = 0;
            
            Object.values(browsers).forEach(stats => {
                totalTests += stats.total;
                passedTests += stats.passed;
            });
            
            const passRate = (passedTests / totalTests) * 100;
            if (passRate < 90) {
                recommendations.push({
                    type: 'site',
                    severity: passRate < 70 ? 'high' : 'medium',
                    message: `${site} has compatibility issues (${passRate.toFixed(1)}% pass rate).`
                });
            }
        });

        // Check performance
        Object.entries(report.performance).forEach(([site, metrics]) => {
            if (metrics.loadTime > 3000) {
                recommendations.push({
                    type: 'performance',
                    severity: metrics.loadTime > 5000 ? 'high' : 'medium',
                    message: `${site} has slow widget load time (${metrics.loadTime}ms).`
                });
            }
        });

        return recommendations;
    }

    generateHTML(report) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Compatibility Report - ${new Date().toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        h1 {
            margin: 0 0 10px 0;
            color: #2563eb;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #666;
            font-size: 0.9em;
        }
        
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        
        .section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e5e5;
        }
        
        th {
            background: #f9fafb;
            font-weight: 600;
        }
        
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 500;
        }
        
        .badge-success {
            background: #d1fae5;
            color: #065f46;
        }
        
        .badge-error {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }
        
        .recommendation {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid;
        }
        
        .recommendation.high {
            background: #fee2e2;
            border-color: #ef4444;
        }
        
        .recommendation.medium {
            background: #fef3c7;
            border-color: #f59e0b;
        }
        
        .recommendation.low {
            background: #dbeafe;
            border-color: #3b82f6;
        }
        
        .footer {
            text-align: center;
            color: #666;
            margin-top: 50px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧪 Widget Compatibility Report</h1>
        <p>Generated on ${new Date(report.generated).toLocaleString()}</p>
    </div>
    
    <div class="summary">
        <div class="stat-card">
            <div class="stat-value">${report.summary.total}</div>
            <div class="stat-label">Total Tests</div>
        </div>
        <div class="stat-card">
            <div class="stat-value ${report.overallPassRate >= 90 ? 'success' : report.overallPassRate >= 70 ? 'warning' : 'error'}">
                ${report.overallPassRate}%
            </div>
            <div class="stat-label">Pass Rate</div>
        </div>
        <div class="stat-card">
            <div class="stat-value success">${report.summary.passed}</div>
            <div class="stat-label">Passed</div>
        </div>
        <div class="stat-card">
            <div class="stat-value error">${report.summary.failed}</div>
            <div class="stat-label">Failed</div>
        </div>
    </div>
    
    <div class="section">
        <h2>Compatibility Matrix</h2>
        <table>
            <thead>
                <tr>
                    <th>Site</th>
                    ${Object.keys(Object.values(report.compatibility)[0] || {}).map(browser => 
                        `<th>${browser}</th>`
                    ).join('')}
                </tr>
            </thead>
            <tbody>
                ${Object.entries(report.compatibility).map(([site, browsers]) => `
                    <tr>
                        <td><strong>${site}</strong></td>
                        ${Object.entries(browsers).map(([browser, stats]) => {
                            const passRate = (stats.passed / stats.total) * 100;
                            const badgeClass = passRate === 100 ? 'success' : passRate >= 80 ? 'warning' : 'error';
                            return `<td><span class="badge badge-${badgeClass}">${passRate.toFixed(0)}%</span></td>`;
                        }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    
    ${report.recommendations.length > 0 ? `
    <div class="section">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation ${rec.severity}">
                <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${report.issues.length > 0 ? `
    <div class="section">
        <h2>Issues Found</h2>
        <table>
            <thead>
                <tr>
                    <th>Site</th>
                    <th>Browser</th>
                    <th>Test</th>
                    <th>Error</th>
                </tr>
            </thead>
            <tbody>
                ${report.issues.slice(0, 20).map(issue => `
                    <tr>
                        <td>${issue.site}</td>
                        <td>${issue.browser}</td>
                        <td>${issue.test}</td>
                        <td><code>${issue.error}</code></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${report.issues.length > 20 ? `<p><em>Showing first 20 of ${report.issues.length} issues</em></p>` : ''}
    </div>
    ` : ''}
    
    <div class="footer">
        <p>Widget Compatibility Testing Suite v1.0</p>
    </div>
</body>
</html>`;
    }

    async generateJSONReport(report) {
        const jsonPath = path.join(__dirname, '../test-results/compatibility-report.json');
        const summary = {
            generated: report.generated,
            overallPassRate: report.overallPassRate,
            summary: report.summary,
            browserCompatibility: {},
            siteCompatibility: {},
            criticalIssues: report.recommendations.filter(r => r.severity === 'high'),
            performance: report.performance
        };

        // Calculate browser compatibility
        const browserStats = {};
        Object.values(report.compatibility).forEach(site => {
            Object.entries(site).forEach(([browser, stats]) => {
                if (!browserStats[browser]) {
                    browserStats[browser] = { total: 0, passed: 0 };
                }
                browserStats[browser].total += stats.total;
                browserStats[browser].passed += stats.passed;
            });
        });

        Object.entries(browserStats).forEach(([browser, stats]) => {
            summary.browserCompatibility[browser] = {
                passRate: ((stats.passed / stats.total) * 100).toFixed(1),
                total: stats.total,
                passed: stats.passed,
                failed: stats.total - stats.passed
            };
        });

        // Calculate site compatibility
        Object.entries(report.compatibility).forEach(([site, browsers]) => {
            let total = 0, passed = 0;
            Object.values(browsers).forEach(stats => {
                total += stats.total;
                passed += stats.passed;
            });
            
            summary.siteCompatibility[site] = {
                passRate: ((passed / total) * 100).toFixed(1),
                total,
                passed,
                failed: total - passed
            };
        });

        await fs.writeFile(jsonPath, JSON.stringify(summary, null, 2));
        console.log(`📄 JSON report saved: ${jsonPath}`);
    }
}

// Run the generator
if (require.main === module) {
    const generator = new CompatibilityReportGenerator();
    generator.generate();
}