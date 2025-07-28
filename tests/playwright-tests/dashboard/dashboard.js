// Dashboard JavaScript for Widget Compatibility Tests

class CompatibilityDashboard {
    constructor() {
        this.testResults = null;
        this.filters = {
            browser: 'all',
            siteType: 'all',
            status: 'all'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadTestResults();
        this.setupFilters();
        this.render();
        
        // Auto-refresh every 30 seconds
        setInterval(() => this.loadTestResults(), 30000);
    }
    
    async loadTestResults() {
        try {
            // Try to load from multiple sources
            const sources = [
                '../test-results/results.json',
                './sample-results.json',
                '/api/test-results'
            ];
            
            let data = null;
            for (const source of sources) {
                try {
                    const response = await fetch(source);
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!data) {
                // Generate sample data for demo
                data = this.generateSampleData();
            }
            
            this.testResults = this.processTestResults(data);
            this.render();
        } catch (error) {
            console.error('Failed to load test results:', error);
            this.showError('Failed to load test results. Please check the console.');
        }
    }
    
    processTestResults(rawData) {
        const processed = {
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                skipped: 0,
                duration: 0
            },
            byBrowser: {},
            bySiteType: {},
            testCases: [],
            performance: {},
            lastUpdated: new Date().toISOString()
        };
        
        // Process raw Playwright results or API data
        if (rawData.suites) {
            // Playwright JSON reporter format
            this.processPlaywrightResults(rawData, processed);
        } else if (rawData.testResults) {
            // Custom API format
            processed.testCases = rawData.testResults;
            this.calculateSummary(processed);
        } else {
            // Use raw data as is
            Object.assign(processed, rawData);
        }
        
        return processed;
    }
    
    processPlaywrightResults(data, processed) {
        const processTest = (test, suiteName) => {
            const result = {
                title: test.title,
                suite: suiteName,
                status: test.outcome,
                duration: test.duration,
                browser: test.projectName || 'unknown',
                error: test.error,
                siteType: this.extractSiteType(suiteName),
                siteName: this.extractSiteName(suiteName)
            };
            
            processed.testCases.push(result);
            
            // Update summary
            processed.summary.total++;
            processed.summary[result.status]++;
            processed.summary.duration += result.duration;
            
            // Update by browser
            if (!processed.byBrowser[result.browser]) {
                processed.byBrowser[result.browser] = { passed: 0, failed: 0, skipped: 0 };
            }
            processed.byBrowser[result.browser][result.status]++;
            
            // Update by site type
            if (!processed.bySiteType[result.siteType]) {
                processed.bySiteType[result.siteType] = { passed: 0, failed: 0, skipped: 0 };
            }
            processed.bySiteType[result.siteType][result.status]++;
            
            // Track performance metrics
            if (test.title.includes('performance')) {
                const loadTime = this.extractMetric(test, 'loadTime');
                if (loadTime) {
                    if (!processed.performance[result.siteName]) {
                        processed.performance[result.siteName] = {};
                    }
                    processed.performance[result.siteName].loadTime = loadTime;
                }
            }
        };
        
        // Recursively process suites
        const processSuite = (suite, parentName = '') => {
            const suiteName = parentName ? `${parentName} - ${suite.title}` : suite.title;
            
            if (suite.tests) {
                suite.tests.forEach(test => processTest(test, suiteName));
            }
            
            if (suite.suites) {
                suite.suites.forEach(s => processSuite(s, suiteName));
            }
        };
        
        data.suites.forEach(suite => processSuite(suite));
    }
    
    extractSiteType(suiteName) {
        const types = ['static', 'spa', 'cms', 'ecommerce', 'docs'];
        for (const type of types) {
            if (suiteName.toLowerCase().includes(type)) {
                return type;
            }
        }
        return 'other';
    }
    
    extractSiteName(suiteName) {
        const match = suiteName.match(/Widget Compatibility - (.+)/);
        return match ? match[1] : suiteName;
    }
    
    extractMetric(test, metricName) {
        // Try to extract metric from test output or attachments
        if (test.attachments) {
            const metric = test.attachments.find(a => a.name === metricName);
            if (metric && metric.body) {
                return parseFloat(metric.body);
            }
        }
        return null;
    }
    
    calculateSummary(processed) {
        processed.testCases.forEach(test => {
            processed.summary.total++;
            processed.summary[test.status]++;
            
            if (!processed.byBrowser[test.browser]) {
                processed.byBrowser[test.browser] = { passed: 0, failed: 0, skipped: 0 };
            }
            processed.byBrowser[test.browser][test.status]++;
            
            if (!processed.bySiteType[test.siteType]) {
                processed.bySiteType[test.siteType] = { passed: 0, failed: 0, skipped: 0 };
            }
            processed.bySiteType[test.siteType][test.status]++;
        });
    }
    
    setupFilters() {
        document.getElementById('browserFilter').addEventListener('change', (e) => {
            this.filters.browser = e.target.value;
            this.render();
        });
        
        document.getElementById('siteTypeFilter').addEventListener('change', (e) => {
            this.filters.siteType = e.target.value;
            this.render();
        });
        
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.render();
        });
    }
    
    render() {
        if (!this.testResults) return;
        
        this.renderSummary();
        this.renderMatrix();
        this.renderPerformance();
        
        document.getElementById('lastUpdated').textContent = 
            new Date(this.testResults.lastUpdated).toLocaleString();
    }
    
    renderSummary() {
        const summary = this.testResults.summary;
        const passRate = summary.total > 0 ? 
            ((summary.passed / summary.total) * 100).toFixed(1) : 0;
        
        const avgDuration = summary.total > 0 ? 
            (summary.duration / summary.total / 1000).toFixed(1) : 0;
        
        document.getElementById('summary').innerHTML = `
            <div class="metric-card">
                <div class="metric-value">${summary.total}</div>
                <div class="metric-label">Total Tests</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value ${passRate >= 95 ? 'success' : passRate >= 80 ? 'warning' : 'error'}">
                    ${passRate}%
                </div>
                <div class="metric-label">Pass Rate</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value success">${summary.passed}</div>
                <div class="metric-label">Passed</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value error">${summary.failed}</div>
                <div class="metric-label">Failed</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">${avgDuration}s</div>
                <div class="metric-label">Avg Duration</div>
            </div>
        `;
    }
    
    renderMatrix() {
        const filteredTests = this.getFilteredTests();
        const matrix = this.buildCompatibilityMatrix(filteredTests);
        
        let html = '<table><thead><tr><th>Site</th>';
        
        // Add browser columns
        const browsers = Object.keys(this.testResults.byBrowser);
        browsers.forEach(browser => {
            html += `<th>${this.formatBrowserName(browser)}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        // Add rows for each site
        Object.entries(matrix).forEach(([site, browserResults]) => {
            html += `<tr><td>${site}</td>`;
            
            browsers.forEach(browser => {
                const result = browserResults[browser];
                if (result) {
                    const badge = this.getStatusBadge(result);
                    html += `<td>${badge}</td>`;
                } else {
                    html += '<td>-</td>';
                }
            });
            
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        document.getElementById('matrixContainer').innerHTML = html;
    }
    
    renderPerformance() {
        const performanceData = this.testResults.performance;
        
        if (Object.keys(performanceData).length === 0) {
            document.getElementById('performanceContainer').innerHTML = 
                '<p>No performance data available</p>';
            return;
        }
        
        // Create performance chart
        const canvas = document.createElement('canvas');
        canvas.id = 'performanceChart';
        document.getElementById('performanceContainer').innerHTML = '';
        document.getElementById('performanceContainer').appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const sites = Object.keys(performanceData);
        const loadTimes = sites.map(site => performanceData[site].loadTime || 0);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sites,
                datasets: [{
                    label: 'Load Time (ms)',
                    data: loadTimes,
                    backgroundColor: loadTimes.map(time => 
                        time < 3000 ? '#10b981' : time < 5000 ? '#f59e0b' : '#ef4444'
                    ),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Load Time (ms)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Widget Load Performance by Site'
                    }
                }
            }
        });
    }
    
    getFilteredTests() {
        return this.testResults.testCases.filter(test => {
            if (this.filters.browser !== 'all' && test.browser !== this.filters.browser) {
                return false;
            }
            if (this.filters.siteType !== 'all' && test.siteType !== this.filters.siteType) {
                return false;
            }
            if (this.filters.status !== 'all' && test.status !== this.filters.status) {
                return false;
            }
            return true;
        });
    }
    
    buildCompatibilityMatrix(tests) {
        const matrix = {};
        
        tests.forEach(test => {
            if (!matrix[test.siteName]) {
                matrix[test.siteName] = {};
            }
            
            if (!matrix[test.siteName][test.browser]) {
                matrix[test.siteName][test.browser] = { passed: 0, failed: 0, total: 0 };
            }
            
            matrix[test.siteName][test.browser].total++;
            if (test.status === 'passed') {
                matrix[test.siteName][test.browser].passed++;
            } else if (test.status === 'failed') {
                matrix[test.siteName][test.browser].failed++;
            }
        });
        
        return matrix;
    }
    
    getStatusBadge(result) {
        const passRate = (result.passed / result.total) * 100;
        let status, text;
        
        if (passRate === 100) {
            status = 'pass';
            text = '✓ Pass';
        } else if (passRate >= 80) {
            status = 'pass';
            text = `${passRate.toFixed(0)}%`;
        } else if (passRate > 0) {
            status = 'fail';
            text = `${passRate.toFixed(0)}%`;
        } else {
            status = 'fail';
            text = '✗ Fail';
        }
        
        return `<span class="status-badge status-${status}">${text}</span>`;
    }
    
    formatBrowserName(browser) {
        const names = {
            chromium: 'Chrome',
            firefox: 'Firefox',
            webkit: 'Safari',
            edge: 'Edge',
            'Mobile Chrome': 'Chrome Mobile',
            'Mobile Safari': 'Safari Mobile'
        };
        return names[browser] || browser;
    }
    
    showError(message) {
        document.getElementById('summary').innerHTML = 
            `<div class="error-message">${message}</div>`;
    }
    
    generateSampleData() {
        // Generate sample data for demo purposes
        const sites = ['nextjs-app', 'react-app', 'wordpress-site', 'shopify-store', 'static-html'];
        const browsers = ['chromium', 'firefox', 'webkit'];
        const testTypes = ['loads correctly', 'extracts content', 'handles navigation', 'performance'];
        
        const testCases = [];
        
        sites.forEach(site => {
            browsers.forEach(browser => {
                testTypes.forEach(testType => {
                    const passed = Math.random() > 0.1; // 90% pass rate
                    testCases.push({
                        title: `widget ${testType}`,
                        suite: `Widget Compatibility - ${site}`,
                        status: passed ? 'passed' : 'failed',
                        duration: Math.random() * 5000 + 1000,
                        browser: browser,
                        siteType: this.extractSiteType(site),
                        siteName: site
                    });
                });
            });
        });
        
        return { testResults: testCases };
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CompatibilityDashboard();
});