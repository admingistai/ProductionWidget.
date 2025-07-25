# 🔍 Amplitude Dashboard Troubleshooting Guide

## 🎯 API Key: `19e735be5fa8c1ba8413eec5978b65e4`

## 📊 **Step-by-Step Amplitude Dashboard Check**

### **1. Verify Project & Account Access**

#### Login & Organization Check
1. **Go to**: https://analytics.amplitude.com/
2. **Check organization dropdown** (top-left corner)
3. **Verify you're in the correct organization** that owns the API key
4. **Look for project** containing API key `19e735be5fa8c1ba8413eec5978b65e4`

#### API Key Verification
1. **Navigate to**: Settings → Projects
2. **Search for**: `19e735be5fa8c1ba8413eec5978b65e4`
3. **Confirm**: You have access to the project containing this API key
4. **Note**: The project name and organization

---

### **2. Live Events Troubleshooting**

#### Clear All Filters
1. **Go to**: Data → Live Stream
2. **Time Range**: Set to "Last 24 hours" or "Last 7 days"
3. **Event Type Filter**: Clear all event filters (should show "All Events")
4. **User Filter**: Remove any user ID or device ID filters
5. **Properties Filter**: Clear any event property filters

#### Expected Events to Look For
- `Widget Initialized on Website`
- `widget_mounted`
- `widget_expanded`
- `message_sent`
- `message_received`
- `widget_collapsed`

---

### **3. Alternative Data Views**

#### A. Event Explorer (Most Reliable)
1. **Navigate to**: Analytics → Event Explorer
2. **Time Range**: "Last 7 days"
3. **Search for events**: Type "Widget" or "widget_"
4. **Check total counts**: Should show event occurrences
5. **View by domain**: Group by `domain` property

#### B. Data Sources Check
1. **Navigate to**: Data → Sources
2. **Find your project**: Look for API key `19e735be5fa8c1ba8413eec5978b65e4`
3. **Check status**: Should show "Active" with recent data
4. **View errors**: Look for any ingestion errors or warnings

#### C. Raw Data Export
1. **Navigate to**: Analytics → Charts
2. **Create new chart**: Event Segmentation
3. **Select event**: `Widget Initialized on Website`
4. **Time range**: Last 7 days
5. **Add domain**: Group by `domain` property
6. **Check results**: Should show data if events are being received

---

### **4. Common Issues & Solutions**

#### Issue: API Key Not Found
**Symptoms**: Can't find API key in project settings
**Solution**: 
- Check all organizations you have access to
- Contact admin for correct organization access
- Verify API key wasn't rotated/changed

#### Issue: No Data in Any View
**Symptoms**: Live Stream, Event Explorer, and Charts all empty
**Solutions**:
1. **Wait 10-15 minutes**: Data ingestion can have delays
2. **Check time zone**: Amplitude might be in different timezone
3. **Verify network**: Use debug tools to confirm requests reach Amplitude
4. **Check project limits**: Free tier has data retention limits

#### Issue: Data in Sources but Not Live Stream
**Symptoms**: Data Sources shows activity but Live Stream empty
**Solutions**:
1. **Clear browser cache**: Force refresh of Live Stream
2. **Check Live Stream filters**: May have hidden filters active
3. **Use Event Explorer**: More reliable than Live Stream
4. **Wait for processing**: Live Stream can have longer delays

---

### **5. Debug Test Results Interpretation**

#### Console Shows "✅ Sent to Amplitude" BUT No Dashboard Data
**Most Likely Causes**:
1. **Wrong Project** (85% of cases): You're viewing different project
2. **Account Access** (10% of cases): API key in different organization
3. **Processing Delay** (5% of cases): Wait 15-30 minutes

#### Network Requests Successful BUT No Events
**Diagnosis Steps**:
1. **Check API response**: Look for HTTP 200 status
2. **Verify payload**: Ensure event structure is correct
3. **Check rate limits**: API might be throttling requests
4. **Validate API key**: Key might be invalid or rotated

---

### **6. Final Verification Steps**

#### Manual API Test
Use the debug tools provided to send direct API requests:
```bash
curl -X POST https://api2.amplitude.com/2/httpapi \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "19e735be5fa8c1ba8413eec5978b65e4",
    "events": [{
      "event_type": "Manual Test Event",
      "time": '$(date +%s000)',
      "user_id": "test_user",
      "event_properties": {
        "test_source": "curl_command"
      }
    }]
  }'
```

#### Success Indicators
- **API Response**: HTTP 200 with success message
- **Data Sources**: Shows recent activity
- **Event Explorer**: Events appear within 15 minutes
- **Live Stream**: Events visible (may take longer)

---

### **7. Contact Support If Needed**

If all steps above show successful API calls but no data appears:

#### Amplitude Support Information
- **Email**: support@amplitude.com
- **Required Info**: 
  - API Key: `19e735be5fa8c1ba8413eec5978b65e4`
  - Organization name
  - Time range of missing events
  - Screenshots of successful API calls
  - Network request logs

#### What to Include
1. **Test file results**: Share screenshots from debug tools
2. **Network logs**: Browser DevTools network tab
3. **Console output**: Full console logs showing "Sent to Amplitude"
4. **API responses**: Status codes and response bodies