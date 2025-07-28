# Widget Compatibility Testing with Playwright

This directory contains comprehensive Playwright tests for validating the AI widget's compatibility across different websites, frameworks, and browsers.

## 🚀 Quick Start

### Installation

First, install Playwright and its dependencies:

```bash
npm run test:install
```

This will install Playwright and all required browser binaries.

### Running Tests

**Run all tests (headless):**
```bash
npm run test:compat
```

**Run tests with visible browser:**
```bash
npm run test:compat:headed
```

**Open Playwright UI (recommended for debugging):**
```bash
npm run test:compat:ui
```

**Run specific test site:**
```bash
./tests/playwright-tests/run-tests.sh --specific "nextjs-app"
```

**View test report:**
```bash
npm run test:compat:report
```

## 📁 Test Structure

```
playwright-tests/
├── playwright.config.ts    # Playwright configuration
├── test-sites-config.ts    # Test site definitions
├── test-helpers.ts         # Reusable test utilities
├── run-tests.sh           # Test runner script
├── e2e/
│   ├── widget-compatibility.spec.ts  # Main compatibility tests
│   └── quick-test.spec.ts            # Quick verification tests
└── test-results/          # Test outputs (auto-generated)
    ├── html/              # HTML reports
    ├── screenshots/       # Test screenshots
    └── videos/           # Test videos (on failure)
```

## 🧪 Test Coverage

### Browsers Tested
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari (WebKit)
- ✅ Edge
- ✅ Mobile Chrome
- ✅ Mobile Safari
- ✅ Tablet

### Site Types Tested
- Static HTML sites
- React applications
- Vue.js applications
- Angular applications
- Next.js sites
- WordPress blogs
- E-commerce platforms
- Documentation sites

### Test Scenarios
1. **Widget Loading** - Verifies widget loads and initializes
2. **Content Understanding** - Tests if widget can read page content
3. **Dynamic Content** - Handles JavaScript-rendered content
4. **Navigation** - Widget persists across page navigation
5. **Responsive Design** - Works on mobile/tablet viewports
6. **Performance** - Measures load times and resource usage
7. **Accessibility** - ARIA attributes and keyboard navigation
8. **Error Handling** - Graceful error recovery
9. **CSP Compatibility** - Works with Content Security Policies
10. **Memory Usage** - No memory leaks during extended use

## 🛠️ Configuration

### Adding New Test Sites

Edit `test-sites-config.ts` to add new sites:

```typescript
'my-site': {
  url: 'https://example.com',
  type: 'spa',
  framework: 'react',
  hasDynamicContent: true,
  renderDelay: 2000,
  expectedContent: ['keyword1', 'keyword2'],
  navigationTest: {
    linkSelector: 'a.nav-link',
    expectedUrl: '**/about',
    expectedContent: 'about'
  }
}
```

### Customizing Tests

The test helpers in `test-helpers.ts` provide reusable functions:

```typescript
const widget = createWidgetHelpers(page);
await widget.waitForWidget();
await widget.expandWidget();
const response = await widget.askQuestion('What is this site about?');
```

## 🐛 Debugging

### Using Playwright UI
The UI mode is best for debugging:
```bash
npm run test:compat:ui
```

Features:
- Step through tests visually
- See browser state at each step
- Time-travel debugging
- Watch mode for development

### Debug a Specific Test
```bash
npx playwright test -c tests/playwright-tests/playwright.config.ts --debug -g "widget loads on React"
```

### View Trace Files
When tests fail, trace files are generated:
```bash
npx playwright show-trace test-results/trace.zip
```

## 📊 Performance Budgets

Performance budgets by site type (defined in `test-sites-config.ts`):

- **Static sites**: 2s load, 300ms interaction
- **SPAs**: 4s load, 500ms interaction  
- **CMS sites**: 3s load, 400ms interaction
- **E-commerce**: 3.5s load, 450ms interaction
- **Documentation**: 2.5s load, 350ms interaction

## 🔧 Troubleshooting

### Common Issues

**Widget not found:**
- Check if the site blocks external scripts
- Verify widget URL is accessible
- Try injecting widget manually with `widget.injectWidget()`

**Tests timing out:**
- Increase timeout in `playwright.config.ts`
- Check if site has slow loading times
- Add explicit waits for dynamic content

**Console errors:**
- Some sites may have their own console errors
- Focus on widget-specific errors only
- Use `setupErrorTracking()` to isolate widget errors

### Local Testing

Test with local HTML files:
```bash
# Start local server
npm run serve:test-sites

# Run tests against local files
TEST_LOCAL=true npm run test:compat
```

## 🚀 CI/CD Integration

The tests are designed to run in CI environments:

```yaml
# Example GitHub Actions
- name: Install Playwright
  run: npm run test:install
  
- name: Run Widget Tests
  run: npm run test:compat
  
- name: Upload Report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: tests/playwright-tests/test-results/
```

## 📝 Best Practices

1. **Keep tests independent** - Each test should be self-contained
2. **Use data-testid attributes** - More reliable than CSS selectors
3. **Handle dynamic content** - Use proper waits, not hard delays
4. **Take screenshots** - Helpful for debugging failures
5. **Check console errors** - Catch issues early
6. **Test real sites** - Use actual websites when possible
7. **Mock sparingly** - Test real integrations when feasible

## 🎯 Next Steps

1. Add more real-world test sites
2. Implement visual regression testing
3. Add performance regression tracking
4. Create custom reporters for better insights
5. Add A/B testing capabilities
6. Implement cross-browser screenshot comparison

---

For questions or issues, check the test output logs or run tests in UI mode for visual debugging.