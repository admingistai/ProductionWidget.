# Gist AI Widget - Backend API

This directory contains the backend API functions for the Gist AI Widget, designed to run on Vercel Functions.

## Architecture

The widget uses a secure proxy architecture:
- **Widget (Frontend)** → **Your Backend API** → **OpenAI API**
- OpenAI API keys are never exposed to the client
- Service keys provide authentication between widget and backend

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `SERVICE_KEY`: A secret key for widget authentication
- `OPENAI_MODEL`: (Optional) Default: gpt-3.5-turbo
- `MAX_TOKENS`: (Optional) Default: 1000

### 2. Local Development

```bash
# Install dependencies
pnpm install

# Run locally with Vercel CLI
vercel dev

# The API will be available at:
# http://localhost:3000/api/chat
# http://localhost:3000/api/health
```

### 3. Testing

Use the provided test files:
- `test-backend.html` - Test the backend API directly
- `test-local.html` - Test the widget with local backend

## API Endpoints

### POST /api/chat

Main chat endpoint for AI responses.

**Headers:**
- `Authorization: Bearer YOUR_SERVICE_KEY`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "question": "User's question",
  "websiteContext": {
    "summary": "Website summary",
    "businessProfile": "Business description",
    "pageContext": "Current page context",
    "keyFeatures": ["feature1", "feature2"],
    "estimatedTokens": 100
  },
  "conversation": [
    {
      "id": "msg-1",
      "question": "Previous question",
      "answer": "Previous answer",
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "AI response",
    "usage": {
      "promptTokens": 150,
      "completionTokens": 50,
      "totalTokens": 200
    }
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0",
  "checks": {
    "serviceKey": true,
    "openaiConfig": true
  }
}
```

## Security Features

1. **Service Key Authentication**: Protects your API from unauthorized use
2. **Rate Limiting**: Prevents abuse (configurable limits)
3. **CORS Headers**: Allows embedding on any website
4. **Input Validation**: Prevents malformed requests
5. **Error Handling**: Safe error messages without exposing internals

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel

Go to your project settings in Vercel and add:
- `OPENAI_API_KEY`
- `SERVICE_KEY`
- `OPENAI_MODEL` (optional)
- `MAX_TOKENS` (optional)
- `RATE_LIMIT_REQUESTS` (optional)
- `RATE_LIMIT_WINDOW` (optional)

## Widget Configuration

Configure your widget to use the deployed API:

```javascript
window.GistWidget.init({
  apiEndpoint: 'https://your-app.vercel.app/api/chat',
  serviceKey: 'your-service-key',
  enableWebsiteContext: true
});
```

## Monitoring

- Check function logs in Vercel dashboard
- Monitor OpenAI usage in OpenAI dashboard
- Use the health endpoint for uptime monitoring

## Cost Management

- Uses GPT-3.5-turbo by default (cost-effective)
- Implements token limits to control costs
- Rate limiting prevents abuse
- Monitor usage through OpenAI dashboard