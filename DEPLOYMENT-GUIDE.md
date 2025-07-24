# 🚀 Widget Deployment Guide

## Architecture Overview

**Secure 3-Tier Architecture:**
```
Website User → Widget (Frontend) → Your Backend → OpenAI API
```

- **Frontend Widget**: No API keys, completely safe for public distribution
- **Your Backend**: Holds OpenAI API key securely in environment variables
- **OpenAI API**: Only accessed from your secure backend

## 📋 Prerequisites

1. **OpenAI API Key**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Backend Hosting**: Vercel, Railway, Netlify Functions, or your choice
3. **CDN/Static Hosting**: For widget distribution (optional)

## 🔧 Backend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Backend**:
   ```bash
   # From your project directory
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel Dashboard:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_MAX_TOKENS=500
   OPENAI_TEMPERATURE=0.7
   WIDGET_SERVICE_KEY=optional-extra-security-key
   ```

4. **Your API endpoint will be**:
   ```
   https://your-project.vercel.app/api/simple-chat
   ```

### Option 2: Railway

1. **Connect GitHub repo** to Railway
2. **Set environment variables**:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   OPENAI_MAX_TOKENS=500
   OPENAI_TEMPERATURE=0.7
   ```
3. **Deploy** - Railway will auto-deploy from your repo

### Option 3: Netlify Functions

1. **Create `netlify/functions/chat.js`**:
   ```javascript
   // Copy content from api/simple-chat.ts but adapt for Netlify
   exports.handler = async (event, context) => {
     // Your handler code here
   }
   ```

2. **Deploy to Netlify** with environment variables

## 🏗️ Widget Build & Distribution

### Build Widget with Your Backend

1. **Set environment variables** (`.env.local`):
   ```env
   VITE_WIDGET_API_ENDPOINT=https://your-backend.vercel.app/api/simple-chat
   VITE_WIDGET_SERVICE_KEY=optional-extra-security-key
   ```

2. **Build widget**:
   ```bash
   npm run build
   ```

3. **Your widget file**: `dist/widget.iife.js`

### Option A: CDN Distribution

Upload `dist/widget.iife.js` to:
- **Vercel Static**: `vercel --prod` (from dist folder)
- **Netlify**: Drag & drop dist folder
- **AWS S3 + CloudFront**
- **Your own CDN**

### Option B: Direct Distribution

Host the `widget.iife.js` file on your own domain and provide the URL to users.

## 🌐 Integration for Website Owners

### Simple Integration (Most Common)

Website owners just add one script tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Website content -->
  
  <!-- Add your widget - NO API KEY NEEDED! -->
  <script src="https://your-cdn.com/widget.iife.js"></script>
</body>
</html>
```

### Advanced Integration with Configuration

```html
<script 
  src="https://your-cdn.com/widget.iife.js"
  data-config='{"theme":"light","placeholder":"How can I help you?"}'
></script>
```

### Programmatic Integration

```html
<script src="https://your-cdn.com/widget.iife.js" data-autoinit="false"></script>
<script>
window.addEventListener('load', () => {
  window.GistWidget.init({
    theme: 'dark',
    placeholder: 'Ask me anything...',
    position: 'bottom-right'
  });
});
</script>
```

## 🔒 Security Configuration

### Basic Security (Recommended)

Set `WIDGET_SERVICE_KEY` in your backend environment:

```env
WIDGET_SERVICE_KEY=your-secret-service-key-123
```

This adds authentication between your widget and backend.

### Advanced Security (Optional)

1. **Domain Restrictions**: Modify backend to check `Origin` header
2. **Rate Limiting**: Implement per-IP rate limiting
3. **User Authentication**: Add user-based authentication
4. **API Key Rotation**: Regularly rotate your OpenAI API key

## 📊 Monitoring & Analytics

### Basic Logging

Your backend automatically logs:
- Request counts
- Error rates  
- Response times
- OpenAI usage

### Advanced Monitoring

Add monitoring services:
- **Vercel Analytics**: Built-in for Vercel deployments
- **DataDog**: Application monitoring
- **LogRocket**: Frontend monitoring
- **Sentry**: Error tracking

### Cost Tracking

Monitor OpenAI usage:
- Check backend logs for usage statistics
- Set up OpenAI usage alerts
- Implement usage limits per session/day

## 🧪 Testing Your Deployment

### Test Backend API

```bash
curl -X POST https://your-backend.vercel.app/api/simple-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-service-key" \
  -d '{
    "question": "Hello, this is a test",
    "websiteContext": {
      "summary": "Test website",
      "businessProfile": "Testing",
      "pageContext": "Test page",
      "keyFeatures": ["Testing"]
    }
  }'
```

### Test Widget Integration

Create a test HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
</head>
<body>
  <h1>Test Page</h1>
  <p>Your widget should appear at the bottom center.</p>
  
  <script src="https://your-cdn.com/widget.iife.js"></script>
</body>
</html>
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend sets proper CORS headers
2. **API Key Invalid**: Check OpenAI API key in backend environment
3. **Widget Not Loading**: Check browser console for errors
4. **No Response**: Verify backend endpoint URL in widget config

### Debug Mode

Enable debug logging by building with:
```bash
NODE_ENV=development npm run build
```

### Health Check

Add a health check endpoint to your backend:

```javascript
// In your backend
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    openai: !!process.env.OPENAI_API_KEY
  })
}
```

## 📈 Scaling Considerations

### Performance

- **CDN**: Use a CDN for widget distribution
- **Caching**: Implement response caching for common questions
- **Connection Pooling**: For high-traffic backends

### Cost Management

- **Token Limits**: Set max tokens per request
- **Rate Limiting**: Prevent abuse
- **Usage Monitoring**: Track costs per user/domain
- **Model Selection**: Use appropriate OpenAI model for your needs

### High Availability

- **Multiple Regions**: Deploy backend to multiple regions
- **Fallback Endpoints**: Configure backup API endpoints
- **Error Handling**: Graceful degradation when backend is down

---

## 🎯 Quick Start Summary

1. **Deploy Backend**: Upload `api/simple-chat.ts` to Vercel with your OpenAI API key
2. **Build Widget**: `npm run build` with your backend endpoint URL  
3. **Distribute**: Host `dist/widget.iife.js` on a CDN
4. **Integration**: Website owners add one `<script>` tag

**No API keys exposed to end users!** ✅