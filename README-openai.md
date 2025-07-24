# OpenAI Integration for AI Widget

The widget now supports direct OpenAI API integration, allowing you to add AI chat functionality to any website without requiring a backend server.

## Quick Setup

1. **Get your OpenAI API key** from https://platform.openai.com/api-keys

2. **Add the widget to your website:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Load the widget -->
  <script src="./dist/widget.iife.js"></script>
  
  <script>
    // Initialize with your OpenAI API key
    window.GistWidget.init({
      apiKey: 'sk-your-openai-api-key-here',
      theme: 'light',
      placeholder: 'Ask me anything...'
    });
  </script>
</body>
</html>
```

## Configuration Options

```javascript
window.GistWidget.init({
  // Required
  apiKey: 'sk-your-openai-api-key-here',
  
  // Optional OpenAI settings
  model: 'gpt-3.5-turbo',           // or 'gpt-4', 'gpt-4-turbo', etc.
  maxTokens: 500,                   // Max response length
  temperature: 0.7,                 // Creativity (0-1)
  
  // Widget appearance
  theme: 'light',                   // 'light', 'dark', or 'auto'
  position: 'bottom-center',        // 'bottom-left', 'bottom-center', 'bottom-right'
  placeholder: 'Ask anything...',   // Input placeholder text
  
  // Features
  enableWebsiteContext: true,       // Include website content in queries
  maxMessages: 50,                  // Conversation history limit
  
  // Custom system prompt
  customSystemPrompt: 'You are a helpful assistant for this website. Answer questions based on the website context when available.'
});
```

## Website Context Integration

When `enableWebsiteContext: true`, the widget automatically:

1. **Scrapes website content** - Extracts text, headings, and metadata
2. **Optimizes for AI** - Summarizes and structures the content
3. **Includes in queries** - Provides context to OpenAI for better answers

This allows the AI to answer questions about your specific website content.

## Features

✅ **Direct OpenAI Integration** - No backend server needed  
✅ **Website Context Awareness** - AI knows about your site  
✅ **Conversation Memory** - Maintains chat history  
✅ **Theme Support** - Light/dark modes with auto-detection  
✅ **Mobile Responsive** - Works on all devices  
✅ **Easy Integration** - Single script tag  
✅ **Error Handling** - Graceful fallbacks  
✅ **Customizable** - Flexible configuration options  

## Testing

1. Open `test-openai.html` in your browser
2. Enter your OpenAI API key
3. Click "Initialize Widget"
4. Test the chat functionality

## Security Notes

⚠️ **API Key Security**: The API key is used client-side. For production:
- Consider using a proxy server to hide your key
- Set usage limits on your OpenAI account
- Monitor API usage for unexpected costs

## Error Handling

The widget handles common errors gracefully:

- **Invalid API key** - Shows clear error message
- **Network issues** - Retry mechanism with backoff
- **Rate limits** - User-friendly error messages
- **Context too long** - Automatic truncation

## Example Queries

Once initialized, users can ask:

- "What is this website about?"
- "How do I use [your product/service]?"
- "What are the main features?"
- "Where can I find more information about X?"

The AI will use your website's content to provide contextual answers.

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Mobile browsers: Full support

## Development

To modify the widget:

```bash
npm install
npm run dev      # Development server
npm run build    # Build for production
```

## Support

The widget now uses OpenAI directly instead of requiring a backend server, making it much easier to integrate and deploy.