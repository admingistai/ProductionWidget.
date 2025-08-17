# Gist AI Chat Widget

A production-ready, embeddable AI chat widget that can be integrated into any website with a single script tag. Features intelligent website context understanding, secure API architecture, and comprehensive analytics tracking.

## 🚀 Features

### Core Capabilities
- **One-line integration** - Add to any website with a single `<script>` tag
- **Morphing UI** - Smooth animated transitions between states
- **Website Context Aware** - Automatically reads and understands page content
- **Smart Positioning** - Responsive placement with mobile keyboard detection
- **Theme Support** - Light, dark, and auto-detect themes
- **Self-contained Bundle** - IIFE format with all dependencies included (~509KB)
- **Analytics Integration** - Built-in Amplitude tracking for usage insights

### Security & Performance
- **Secure Architecture** - OpenAI API keys never exposed to frontend
- **Service Key Authentication** - Widget-to-backend secure communication
- **Rate Limiting** - Built-in abuse prevention
- **CORS Enabled** - Works across any domain
- **Response Caching** - Intelligent conversation management
- **Error Recovery** - Automatic retry with exponential backoff

### User Experience
- **Message History** - Full conversation history with navigation
- **Quick Actions** - Suggested questions based on page content
- **Mobile Optimized** - Responsive design with iOS keyboard handling
- **Accessibility** - ARIA labels and keyboard navigation
- **Custom Branding** - Configurable colors, text, and behavior

## 🎯 Quick Start

### Option 1: Use Our Hosted Version (Fastest)

```html
<!-- Add this to your website -->
<script src="https://widget-deploy-hazel.vercel.app/widget.js" defer></script>
```

### Option 2: Self-Host (Full Control)

#### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/admingistai/ProductionWidget.git
cd ProductionWidget

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings:
# - VITE_WIDGET_API_ENDPOINT=https://your-backend.vercel.app/api/simple-chat
# - VITE_WIDGET_SERVICE_KEY=your-secure-key
# - VITE_AMPLITUDE_API_KEY=your-amplitude-key (optional)
```

#### 2. Deploy Backend

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel Dashboard:
# - OPENAI_API_KEY=sk-your-openai-key
# - WIDGET_SERVICE_KEY=your-secure-key
```

#### 3. Build and Deploy Widget

```bash
# Build the widget
npm run build

# Deploy widget separately
cd widget-deploy
vercel --prod
```

#### 4. Integrate on Your Website

```html
<script src="https://your-widget-url.vercel.app/widget.js" defer></script>
```

## ⚙️ Configuration

### Basic Configuration

```html
<!-- Auto-initialize with default settings -->
<script src="https://your-widget-url/widget.js" defer></script>

<!-- Custom configuration via data attribute -->
<script 
  src="https://your-widget-url/widget.js" 
  data-config='{
    "theme": "dark",
    "position": "bottom-center",
    "placeholder": "How can I help you today?"
  }'
  defer>
</script>
```

### Advanced Configuration

```html
<!-- Manual initialization for full control -->
<script src="https://your-widget-url/widget.js" data-autoinit="false" defer></script>
<script>
  window.addEventListener('load', () => {
    window.GistWidget.init({
      // API Configuration
      apiEndpoint: 'https://your-backend.vercel.app/api/simple-chat',
      serviceKey: 'your-service-key',
      
      // UI Configuration
      theme: 'dark', // 'light', 'dark', or 'auto'
      position: 'bottom-center', // 'bottom-left', 'bottom-center', 'bottom-right'
      placeholder: 'Ask our AI assistant...',
      borderColor: '#3B82F6', // Custom border color
      
      // Behavior Configuration
      maxMessages: 50,
      enableWebsiteContext: true,
      customSystemPrompt: 'You are a helpful assistant for ACME Corp.',
      
      // Analytics Configuration
      analytics: {
        enabled: true,
        amplitudeApiKey: 'your-amplitude-key',
        debug: false
      }
    });
  });
</script>
```

### Configuration Options Reference

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| **API Settings** | | | |
| `apiEndpoint` | string | Environment variable | Backend API endpoint URL |
| `serviceKey` | string | Environment variable | Service authentication key |
| **UI Settings** | | | |
| `position` | string | `'bottom-center'` | Widget position on page |
| `theme` | string | `'light'` | Color theme (`light`, `dark`, `auto`) |
| `placeholder` | string | `'Ask anything...'` | Input field placeholder text |
| `borderColor` | string | Theme default | Custom widget border color |
| **Behavior Settings** | | | |
| `maxMessages` | number | `50` | Maximum conversation history |
| `enableWebsiteContext` | boolean | `true` | Read and analyze page content |
| `customSystemPrompt` | string | Auto-generated | Custom AI instructions |
| **Analytics Settings** | | | |
| `analytics.enabled` | boolean | `true` | Enable usage tracking |
| `analytics.amplitudeApiKey` | string | Environment variable | Amplitude API key |
| `analytics.debug` | boolean | `false` | Debug logging for analytics |

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Customer      │    │    Widget        │    │   Backend       │    │     OpenAI      │
│   Website       │───▶│   Frontend       │───▶│     API         │───▶│      API        │
│                 │    │   (Public)       │    │   (Private)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
     Script tag           IIFE Bundle           Service Key Auth        OpenAI API Key
```

### Project Structure

```
ProductionWidget/
├── src/                        # Widget source code
│   ├── index.tsx              # Entry point & auto-initialization
│   ├── ai-widget.tsx          # Main widget component
│   ├── morphing-widget.tsx    # Animated UI transitions
│   ├── chat-viewport.tsx      # Message display & history
│   ├── components/            # UI components
│   │   └── QuestionHistoryModal.tsx
│   ├── services/              # Core services
│   │   └── analytics.ts       # Amplitude integration
│   ├── hooks/                 # React hooks
│   │   ├── useResponsiveWidth.ts
│   │   └── useIOSKeyboard.ts
│   ├── lib/                   # Utilities
│   │   └── widget-utils.ts
│   ├── types/                 # TypeScript definitions
│   │   └── widget.ts
│   ├── website-scraper.ts     # Page content extraction
│   ├── content-optimizer.ts   # Token optimization
│   ├── secure-api-client.ts   # API communication
│   └── styles.css            # Tailwind CSS styles
├── api/                       # Backend API
│   └── simple-chat.ts        # OpenAI integration endpoint
├── widget-deploy/            # Widget deployment files
│   ├── widget.js            # Production bundle
│   └── vercel.json          # Deployment config
├── dist/                     # Build output
│   └── widget.iife.js       # Built widget
├── docs/                     # Documentation
├── logs/                     # Build logs
└── vite.widget.config.ts     # Build configuration
```

## 💻 Development

### Prerequisites

- Node.js 18+ and npm
- Vercel CLI (`npm install -g vercel`)
- OpenAI API key

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
# Widget loads at http://localhost:5173

# Run backend API locally
vercel dev
```

### Build Process

```bash
# Build production widget
npm run build
# Creates dist/widget.iife.js (~509KB)

# Test production build
npm run preview
```

### Testing

```bash
# Run Playwright tests
npm run test:install  # First time setup
npm run test:compat   # Run all tests
npm run test:compat:ui  # Interactive UI mode
```

## 🚀 Deployment

### Two-Deployment Architecture

For security and scalability, the system uses separate deployments:

1. **Backend API** - Hosts the OpenAI integration
2. **Widget Frontend** - Serves the JavaScript bundle

### Step-by-Step Deployment

#### 1. Deploy Backend to Vercel

```bash
# From project root
vercel --prod

# Follow prompts to link/create project
# Note the deployment URL (e.g., https://your-backend.vercel.app)
```

#### 2. Configure Backend Environment

In Vercel Dashboard, add environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `WIDGET_SERVICE_KEY`: Generate a secure key
- `OPENAI_MODEL`: (Optional) Default: `gpt-3.5-turbo`
- `MAX_TOKENS`: (Optional) Default: `1000`

#### 3. Build Widget with Backend URL

```bash
# Update .env.local with your backend URL
echo "VITE_WIDGET_API_ENDPOINT=https://your-backend.vercel.app/api/simple-chat" >> .env.local
echo "VITE_WIDGET_SERVICE_KEY=your-service-key" >> .env.local

# Build the widget
npm run build
```

#### 4. Deploy Widget

```bash
# Copy built widget to deployment folder
cp dist/widget.iife.js widget-deploy/widget.js

# Deploy widget
cd widget-deploy
vercel --prod

# Note the widget URL (e.g., https://widget-deploy.vercel.app/widget.js)
```

### Alternative Deployment Options

- **CDN Hosting**: Upload `dist/widget.iife.js` to any CDN
- **npm Package**: Publish and use via jsDelivr
- **Static Hosting**: Any static file host (S3, GitHub Pages, etc.)
- **Self-Hosted**: Serve from your own servers

## 📡 API Reference

### Backend Endpoint

**POST** `/api/simple-chat`

#### Request Headers
```http
Content-Type: application/json
Authorization: Bearer YOUR_SERVICE_KEY
```

#### Request Body
```json
{
  "question": "User's question",
  "websiteContext": {
    "summary": "Page summary",
    "businessProfile": "Business description",
    "pageContext": "Current page context",
    "keyFeatures": ["feature1", "feature2"],
    "estimatedTokens": 500
  },
  "conversation": [
    {
      "id": "msg-123",
      "question": "Previous question",
      "answer": "Previous answer",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ],
  "sessionId": "session-abc123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "answer": "AI assistant response",
    "usage": {
      "promptTokens": 250,
      "completionTokens": 150,
      "totalTokens": 400
    }
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": "ERROR_CODE"
  }
}
```

## 🔒 Security

### Security Architecture

- **API Key Isolation**: OpenAI keys stored only on backend, never exposed to frontend
- **Service Key Authentication**: Secure widget-to-backend communication
- **CORS Configuration**: Controlled cross-origin access with proper headers
- **Rate Limiting**: Built-in protection against abuse and DOS attacks
- **Input Validation**: All inputs sanitized and validated
- **HTTPS Only**: Always use HTTPS in production environments

### Best Practices

```javascript
// Generate secure service key
const serviceKey = crypto.randomBytes(32).toString('base64');

// Validate requests on backend
if (req.headers.authorization !== `Bearer ${process.env.WIDGET_SERVICE_KEY}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

## 📊 Analytics

### Amplitude Integration

The widget includes built-in analytics to track usage and performance.

#### Events Tracked

- **Widget Initialized on Website** - Widget loads on a page
- **widget_mounted** - Widget successfully mounts
- **widget_expanded/collapsed** - User interactions
- **message_sent** - User sends a message
- **message_received** - AI responds
- **error_occurred** - Error tracking

#### Configuration

```javascript
// Enable analytics (default)
window.GistWidget.init({
  analytics: {
    enabled: true,
    amplitudeApiKey: 'your-key',
    debug: false
  }
});

// Disable analytics
window.GistWidget.init({
  analytics: { enabled: false }
});
```

## 🎨 Customization

### Theming

```css
/* Override widget styles */
#gist-widget-root {
  --widget-primary: #3B82F6;
  --widget-background: #FFFFFF;
  --widget-text: #1F2937;
  --widget-border: #E5E7EB;
}

/* Dark theme */
#gist-widget-root[data-theme="dark"] {
  --widget-background: #1F2937;
  --widget-text: #F9FAFB;
  --widget-border: #374151;
}
```

### Custom Prompts

```javascript
window.GistWidget.init({
  customSystemPrompt: `
    You are a helpful assistant for ACME Corp.
    Focus on our products: widgets, gadgets, and gizmos.
    Always be professional and friendly.
  `
});
```

## 🌐 Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 88+ | Full support |
| Edge | 88+ | Full support |
| Firefox | 78+ | Full support |
| Safari | 14+ | Full support |
| iOS Safari | 14+ | Mobile optimized |
| Chrome Android | Latest | Mobile optimized |

## 📦 Bundle Information

### Size Breakdown

- **Core Widget**: ~214KB minified
- **With Analytics**: ~374KB minified  
- **Production Build**: ~509KB total
- **Gzipped**: ~150KB transferred

### Optimization Tips

1. **Lazy Load**: Use `defer` attribute on script tag
2. **CDN Hosting**: Serve from CDN for better caching
3. **Compression**: Enable gzip/brotli on server
4. **Caching**: Set appropriate cache headers

## 🧪 Testing

### Manual Testing

Test pages included for various scenarios:
- `test-production-border-fix.html` - Border rendering
- `test-gradient-borders.html` - Theme variations
- `test-amplitude-production.html` - Analytics testing
- `test-persistent-domain.html` - Domain testing

### Automated Testing

```bash
# Install Playwright
npm run test:install

# Run all tests
npm run test:compat

# Run with UI
npm run test:compat:ui

# Run specific test
npm run test:compat:specific "test name"
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/admingistai/ProductionWidget/issues)
- **Discussions**: [GitHub Discussions](https://github.com/admingistai/ProductionWidget/discussions)
- **Email**: support@gist.ai

## 🙏 Acknowledgments

- Built with [React](https://react.dev) and [TypeScript](https://www.typescriptlang.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Bundled with [Vite](https://vitejs.dev)
- Deployed on [Vercel](https://vercel.com)
- Powered by [OpenAI](https://openai.com)