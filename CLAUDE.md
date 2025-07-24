# 🤖 AI Widget Project - Final Configuration Reference

## 🎯 **FINAL PRODUCTION ENDPOINTS** (DO NOT CHANGE)

### Customer Integration Script
```html
<script src="https://widget-deploy-dh9vy26of-pro-rata.vercel.app/widget.js" defer></script>
```

### Core Endpoints
- **Widget URL**: `https://widget-deploy-dh9vy26of-pro-rata.vercel.app/widget.js`
- **Backend API**: `https://attemptnumberwhatever-6kukt60s1-pro-rata.vercel.app/api/simple-chat`
- **Service Key**: `vpmM+wDsNG6OXb05l9aLbyyUqgsG/o/GyGtCbBWLymU=`

## ✅ **VERIFIED WORKING STATUS**

**Deployment Verification** (Last Checked: July 24, 2025):
- ✅ Widget accessible: HTTP 200, 214KB file size
- ✅ Backend API functional with OpenAI integration
- ✅ Service key authentication working
- ✅ CORS headers properly configured
- ✅ Dimension fixes included (120px minimum width/height)
- ✅ Cross-origin requests enabled

**Test Command**:
```bash
curl -I https://widget-deploy-dh9vy26of-pro-rata.vercel.app/widget.js
# Should return: HTTP/2 200
```

**API Test**:
```bash
curl -X POST https://attemptnumberwhatever-6kukt60s1-pro-rata.vercel.app/api/simple-chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer vpmM+wDsNG6OXb05l9aLbyyUqgsG/o/GyGtCbBWLymU=" \
  -d '{"question": "Hello"}'
# Should return: {"success":true,"data":{"answer":"..."}}
```

## 🔧 **Environment Configuration**

### Current .env Settings
```env
VITE_WIDGET_API_ENDPOINT=https://attemptnumberwhatever-6kukt60s1-pro-rata.vercel.app/api/simple-chat
VITE_WIDGET_SERVICE_KEY=vpmM+wDsNG6OXb05l9aLbyyUqgsG/o/GyGtCbBWLymU=
```

### Backend Environment (Vercel)
- **OpenAI API Key**: Configured in backend deployment
- **Service Key Validation**: Enabled
- **CORS**: Configured for cross-origin requests
- **Rate Limiting**: Built-in protection

## 📦 **Deployment Architecture**

### Frontend (Widget)
- **Project**: `pro-rata/widget-deploy`
- **URL**: `https://widget-deploy-dh9vy26of-pro-rata.vercel.app`
- **File**: `widget.js` (redirects to `widget.iife.js`)
- **Size**: ~214KB with embedded backend URL

### Backend (API)
- **Project**: `pro-rata/attemptnumberwhatever`
- **URL**: `https://attemptnumberwhatever-6kukt60s1-pro-rata.vercel.app`
- **Endpoint**: `/api/simple-chat`
- **Authentication**: Service key required

## 🚀 **Maintenance & Updates**

### To Update Widget (Without Changing Customer URLs)
1. **Update source code** in main project
2. **Rebuild**: `npm run build`
3. **Copy to deployment**: `cp dist/widget.iife.js widget-deploy/widget.js`
4. **Deploy**: `cd widget-deploy && vercel --prod --yes`
5. **Verify**: Test the widget URL remains the same

### Environment Variable Changes
- Update `.env` file in main project
- Rebuild and redeploy widget
- Backend env vars managed in Vercel dashboard

### Testing New Deployments
- Always test widget accessibility: `curl -I [widget-url]`
- Test API functionality: `curl -X POST [api-url]`
- Verify customer integration remains unchanged

## 🔒 **Security Notes**

- **API Key**: Stored only in backend environment variables
- **Service Key**: Provides widget-to-backend authentication
- **CORS**: Configured to allow cross-origin requests
- **Rate Limiting**: Built-in protection against abuse

## 📊 **Project Structure**

```
attemptnumberwhatever/
├── src/                 # Widget source code
├── dist/               # Built widget files
├── widget-deploy/      # Production deployment (FINAL)
├── api/               # Backend API code
└── CLAUDE.md          # This documentation file
```

## 🎯 **Key Success Metrics**

- **Widget Visibility**: Fixed 0x0 dimension issue
- **Backend Connectivity**: Resolved deployment mismatch
- **Customer Integration**: Stable URL for customer use
- **Functionality**: Full AI chat capabilities working

## 📝 **Project History Summary**

**Initial Issue**: Widget not visible on customer websites (0x0 dimensions)
**Root Cause**: Version mismatch between widget and backend deployments
**Resolution**: 
1. Updated widget to use correct backend URL
2. Added dimension fallback fixes (120px minimum)
3. Deployed to stable production URL
4. Verified end-to-end functionality

**Status**: ✅ **PRODUCTION READY** - Customers can integrate immediately

---

**Last Updated**: July 24, 2025
**Maintained By**: Claude Code
**Status**: Final - Customer integration URL is stable