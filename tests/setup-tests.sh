#!/bin/bash

# Widget Compatibility Test Setup Script
# This script sets up everything needed to run the widget compatibility tests

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Widget Compatibility Test Setup${NC}"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}⚠️  Please run this script from the project root directory${NC}"
    exit 1
fi

# Step 1: Install dependencies
echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

# Step 2: Install Playwright
echo -e "${GREEN}🎭 Installing Playwright browsers...${NC}"
echo "This may take a few minutes on first run..."
npm run test:install

# Step 3: Create test results directory
echo -e "${GREEN}📁 Creating test directories...${NC}"
mkdir -p tests/playwright-tests/test-results/screenshots
mkdir -p tests/playwright-tests/test-results/videos

# Step 4: Show available commands
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Available test commands:"
echo ""
echo -e "${BLUE}Quick test (recommended to start):${NC}"
echo "  npx playwright test tests/playwright-tests/e2e/quick-test.spec.ts --headed"
echo ""
echo -e "${BLUE}Run all tests:${NC}"
echo "  npm run test:compat"
echo ""
echo -e "${BLUE}Run tests with UI (best for debugging):${NC}"
echo "  npm run test:compat:ui"
echo ""
echo -e "${BLUE}Run specific site test:${NC}"
echo "  ./tests/playwright-tests/run-tests.sh --specific nextjs-app"
echo ""
echo -e "${BLUE}View test report after running tests:${NC}"
echo "  npm run test:compat:report"
echo ""
echo -e "${YELLOW}📖 See tests/playwright-tests/README.md for full documentation${NC}"