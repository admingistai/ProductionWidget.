#!/bin/bash

echo "🚀 Setting up Gist AI Widget Backend..."
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  Please edit .env.local and add your:"
    echo "   - OPENAI_API_KEY"
    echo "   - SERVICE_KEY (generate a secure random string)"
    echo ""
else
    echo "✅ .env.local already exists"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API keys"
echo "2. Run 'vercel dev' to start local development"
echo "3. Open test-backend.html to test the API"
echo "4. Deploy with 'vercel' when ready"
echo ""
echo "Happy coding! 🎉"