#!/bin/bash

# Widget Compatibility Test Runner
# This script helps run Playwright tests for widget compatibility

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 Widget Compatibility Test Runner${NC}"
echo "======================================"

# Check if Playwright is installed
if ! command -v playwright &> /dev/null; then
    echo -e "${YELLOW}⚠️  Playwright not found. Installing...${NC}"
    npm run test:install
fi

# Parse command line arguments
MODE="all"
HEADED=""
UI=""
SPECIFIC=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --headed)
            HEADED="--headed"
            shift
            ;;
        --ui)
            UI="--ui"
            shift
            ;;
        --specific)
            SPECIFIC="$2"
            MODE="specific"
            shift 2
            ;;
        --help)
            echo "Usage: ./run-tests.sh [options]"
            echo ""
            echo "Options:"
            echo "  --headed          Run tests in headed mode (visible browser)"
            echo "  --ui              Open Playwright Test UI"
            echo "  --specific NAME   Run specific test site (e.g., 'nextjs-app')"
            echo "  --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run-tests.sh                    # Run all tests headless"
            echo "  ./run-tests.sh --headed           # Run all tests with visible browser"
            echo "  ./run-tests.sh --ui               # Open test UI"
            echo "  ./run-tests.sh --specific nextjs  # Run only NextJS tests"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

# Create test results directory
mkdir -p tests/playwright-tests/test-results

# Run tests based on mode
if [ "$UI" = "--ui" ]; then
    echo -e "${GREEN}🎭 Opening Playwright Test UI...${NC}"
    npx playwright test -c tests/playwright-tests/playwright.config.ts --ui
elif [ "$MODE" = "specific" ]; then
    echo -e "${GREEN}🎯 Running tests for: $SPECIFIC${NC}"
    npx playwright test -c tests/playwright-tests/playwright.config.ts -g "$SPECIFIC" $HEADED
else
    echo -e "${GREEN}🚀 Running all compatibility tests...${NC}"
    npx playwright test -c tests/playwright-tests/playwright.config.ts $HEADED
fi

# Check test results
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tests completed successfully!${NC}"
    echo ""
    echo "View detailed report with:"
    echo "  npm run test:compat:report"
else
    echo -e "${RED}❌ Some tests failed.${NC}"
    echo ""
    echo "View detailed report with:"
    echo "  npm run test:compat:report"
    exit 1
fi