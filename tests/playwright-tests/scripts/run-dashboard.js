#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs').promises;

/**
 * Simple server to run the test dashboard locally
 */
async function runDashboard() {
    const app = express();
    const PORT = process.env.PORT || 3001;
    
    // Serve static files
    app.use(express.static(path.join(__dirname, '../dashboard')));
    
    // API endpoint for test results
    app.get('/api/test-results', async (req, res) => {
        try {
            const resultsPath = path.join(__dirname, '../test-results/results.json');
            const data = await fs.readFile(resultsPath, 'utf-8');
            res.json(JSON.parse(data));
        } catch (error) {
            // Return sample data if no results exist
            res.json(generateSampleData());
        }
    });
    
    // API endpoint for monitoring results
    app.get('/api/monitoring-results', async (req, res) => {
        try {
            const monitoringPath = path.join(__dirname, '../test-results/monitoring-report.json');
            const data = await fs.readFile(monitoringPath, 'utf-8');
            res.json(JSON.parse(data));
        } catch (error) {
            res.status(404).json({ error: 'No monitoring data available' });
        }
    });
    
    // Start server
    app.listen(PORT, () => {
        console.log(`
🚀 Widget Compatibility Dashboard is running!

   Local URL: http://localhost:${PORT}
   
   Available endpoints:
   - Dashboard: http://localhost:${PORT}/
   - Test Results API: http://localhost:${PORT}/api/test-results
   - Monitoring API: http://localhost:${PORT}/api/monitoring-results
   
   Press Ctrl+C to stop the server.
        `);
    });
}

function generateSampleData() {
    const sites = ['nextjs-app', 'react-app', 'wordpress-site', 'shopify-store', 'static-html'];
    const browsers = ['chromium', 'firefox', 'webkit'];
    const testTypes = ['loads correctly', 'extracts content', 'handles navigation', 'performance'];
    
    const testResults = [];
    
    sites.forEach(site => {
        browsers.forEach(browser => {
            testTypes.forEach(testType => {
                const passed = Math.random() > 0.1; // 90% pass rate
                testResults.push({
                    title: `widget ${testType}`,
                    suite: `Widget Compatibility - ${site}`,
                    status: passed ? 'passed' : 'failed',
                    duration: Math.random() * 5000 + 1000,
                    browser: browser,
                    siteType: site.includes('nextjs') || site.includes('react') ? 'spa' : 
                             site.includes('wordpress') ? 'cms' :
                             site.includes('shopify') ? 'ecommerce' : 'static',
                    siteName: site
                });
            });
        });
    });
    
    return { testResults };
}

// Run the dashboard
runDashboard();