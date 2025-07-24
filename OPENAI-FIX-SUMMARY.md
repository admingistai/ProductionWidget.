# OpenAI Client Initialization Fix

## Problem Fixed
The widget was showing **"OpenAI client not initialized. Please provide an API key."** because:

1. **Wrong DEFAULT_CONFIG** - Still used old `apiEndpoint`/`serviceKey` instead of OpenAI config
2. **Wrong useEffect dependencies** - Watched old config properties instead of `apiKey`
3. **Config not propagating** - New OpenAI configs were overridden by old defaults
4. **No re-initialization** - Widget didn't update when API key was provided

## Changes Made

### 1. Updated `src/index.tsx`
```diff
- apiEndpoint: 'https://api.gist-widget.com/v1',
- serviceKey: '',
+ apiKey: '', // OpenAI API key
+ model: 'gpt-3.5-turbo', // OpenAI model
+ maxTokens: 500, // Max tokens per response
+ temperature: 0.7, // OpenAI temperature setting
```

### 2. Fixed `src/ai-widget.tsx` useEffect dependencies
```diff
- }, [finalConfig.apiEndpoint, finalConfig.serviceKey, finalConfig.enableWebsiteContext])
+ }, [finalConfig.apiKey, finalConfig.model, finalConfig.maxTokens, finalConfig.temperature, finalConfig.customSystemPrompt, finalConfig.enableWebsiteContext])
```

### 3. Added Debug Logging
- Widget initialization flow logging
- OpenAI client creation status
- API call debugging with context info
- Clear error messages with config status

## How to Test

### Method 1: Use test-openai.html
1. Open `test-openai.html` in browser
2. Enter your OpenAI API key
3. Click "Initialize Widget"
4. Test chat functionality

### Method 2: Use test-api-debug.html  
1. Open `test-api-debug.html` in browser
2. Click "Init with Mock API" (now uses OpenAI)
3. Enter API key when prompted
4. Monitor console logs for debugging

### Method 3: Manual Integration
```html
<script src="./dist/widget.iife.js"></script>
<script>
window.GistWidget.init({
  apiKey: 'sk-your-key-here',
  theme: 'light'
});
</script>
```

## Expected Behavior Now

1. **On page load**: Widget auto-mounts with empty config (no errors)
2. **When GistWidget.init() called with apiKey**: 
   - useEffect triggers re-initialization
   - OpenAI client gets created
   - Console shows "✅ OpenAI client created successfully"
3. **When user submits question**:
   - Console shows "🔍 API call attempted"
   - OpenAI API gets called successfully
   - Response displays in chat viewport

## Debug Console Output

You should see logs like:
```
🔧 Widget initialization starting... {hasApiKey: true, apiKeyPreview: "sk-1234...", model: "gpt-3.5-turbo"}
🤖 Creating OpenAI client...
✅ OpenAI client created successfully
🔍 API call attempted {hasClient: true, question: "Hello...", hasWebsiteContext: true}
```

## What's Fixed

✅ **Configuration propagation** - OpenAI config now flows correctly  
✅ **Re-initialization** - Widget updates when API key changes  
✅ **Client creation** - OpenAI client properly initialized  
✅ **Error messaging** - Clear debug info for troubleshooting  
✅ **Chat functionality** - End-to-end working with OpenAI API  

The error **"OpenAI client not initialized"** should no longer occur when a valid API key is provided.