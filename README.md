# Gist AI Chat Widget

A production-ready, embeddable AI chat widget that can be integrated into any website with a single script tag. Powered by OpenAI through a secure backend proxy.

## Features

- 🚀 **One-line integration** - Add to any website with a single script tag
- 🎨 **Morphing UI** - Smooth animation from button to chat interface
- 🌐 **Website Context Aware** - Reads page content to provide contextual answers
- 🎯 **Fixed Positioning** - Floats at bottom-center of the page
- 🌓 **Theme Support** - Light and dark themes
- 📦 **Self-contained** - All dependencies bundled, no conflicts
- 🔒 **Secure** - OpenAI API keys stay on your server, never exposed to clients
- 🚦 **Rate Limiting** - Built-in protection against abuse
- ⚡ **Vercel Ready** - Deploy backend and widget together

## Quick Start

### 1. Backend Setup

The widget requires a backend API to communicate with OpenAI. Your API keys stay secure on your server.

```bash
# Quick setup
./setup-backend.sh

# Manual setup
cp .env.local.example .env.local
# Edit .env.local with your OPENAI_API_KEY and SERVICE_KEY
pnpm install
vercel dev  # Run locally
```

### 2. Widget Integration

Add this script tag to your website:

```html
<script src="https://your-domain.vercel.app/widget.iife.js" defer></script>
```

That's it! The widget will automatically appear at the bottom center of your page.

### 3. Custom Configuration

For manual initialization with custom options:

```html
<script src="https://your-domain.vercel.app/widget.iife.js" data-autoinit="false" defer></script>
<script>
  window.addEventListener('load', () => {
    window.GistWidget.init({
      apiEndpoint: 'https://your-domain.vercel.app/api/chat',
      serviceKey: 'your-service-key', // Must match SERVICE_KEY in backend
      theme: 'dark',
      placeholder: 'Ask our AI assistant...',
      position: 'bottom-center',
      maxMessages: 100,
      enableWebsiteContext: true,
      customSystemPrompt: 'You are a helpful assistant for ACME Corp.'
    });
  });
</script>
```

### Inline Configuration

Pass configuration via data attribute:

```html
<script 
  src="https://your-domain.com/widget.iife.js" 
  data-config='{"serviceKey":"pk_abc123","theme":"dark"}'
  defer>
</script>
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiEndpoint` | string | `https://api.gist-widget.com/v1` | Your API endpoint URL |
| `serviceKey` | string | `''` | Public API key (pk_xxx format) |
| `position` | string | `'bottom-center'` | Widget position: `bottom-left`, `bottom-center`, `bottom-right` |
| `theme` | string | `'light'` | Theme: `light`, `dark`, `auto` |
| `placeholder` | string | `'Ask anything...'` | Input placeholder text |
| `maxMessages` | number | `50` | Maximum chat history to maintain |
| `enableWebsiteContext` | boolean | `true` | Enable page content reading |
| `customSystemPrompt` | string | `undefined` | Custom AI behavior prompt |

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
# Open http://localhost:5173/test.html

# Build for production
pnpm build

# Preview production build
pnpm preview
# Open http://localhost:4173/test.html
```

### Project Structure

```
src/
├── index.tsx              # Entry point & bootloader
├── ai-widget.tsx          # Main widget component
├── morphing-widget.tsx    # Animation component
├── chat-viewport.tsx      # Chat messages display
├── website-scraper.ts     # Page content extraction
├── content-optimizer.ts   # Token optimization
├── secure-api-client.ts   # API communication
├── styles.css            # Tailwind CSS
└── types/
    └── widget.ts         # TypeScript types
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SERVICE_KEY`: Generate a secure random string
   - `OPENAI_MODEL`: (Optional) Default: gpt-3.5-turbo
   - `MAX_TOKENS`: (Optional) Default: 1000
4. Deploy!

Your deployment will include:
- Widget: `https://your-domain.vercel.app/widget.iife.js`
- API: `https://your-domain.vercel.app/api/chat`
- Health: `https://your-domain.vercel.app/api/health`

### CDN Options

You can also host on:
- **npm + jsDelivr**: Publish to npm and use `https://cdn.jsdelivr.net/npm/@gist/widget@latest/dist/widget.iife.js`
- **GitHub Releases**: Upload to releases and use GitHub's CDN
- **Your own CDN**: Upload `dist/widget.iife.js` to any static host

## Backend API

The project includes a complete backend API implementation using Vercel Functions. See `/api/README.md` for detailed documentation.

### API Structure

Your backend API accepts POST requests with this structure:

```typescript
{
  question: string;
  websiteContext: {
    summary: string;
    businessProfile: string;
    pageContext: string;
    keyFeatures: string[];
    estimatedTokens: number;
  };
  conversation: Array<{
    id: string;
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  sessionId: string;
}
```

And respond with:

```typescript
{
  success: boolean;
  data?: {
    answer: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}
```

## Security Considerations

- **API Keys**: OpenAI keys stay on your server, never exposed to clients
- **Service Keys**: Use strong, unique service keys for widget authentication
- **Rate Limiting**: Built-in rate limiting prevents abuse
- **CORS**: Properly configured for cross-origin embedding
- **HTTPS**: Always use HTTPS in production
- **Input Validation**: All inputs are validated and sanitized

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Bundle Size

- Target: <120KB gzipped
- Current: ~95KB gzipped (with React 18)

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please visit:
https://github.com/gist-ai/widget/issues