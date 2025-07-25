/**
 * Analytics Service for AI Widget
 * Handles Amplitude integration and event tracking
 */

import * as amplitude from '@amplitude/analytics-browser';

interface AnalyticsConfig {
  apiKey?: string;
  disabled?: boolean;
  debug?: boolean;
}

class AnalyticsService {
  private initialized = false;
  private config: AnalyticsConfig = {};
  private eventQueue: Array<{ eventType: string; eventProperties?: any; timestamp: number }> = [];
  private processedEvents = 0;
  private failedEvents = 0;

  /**
   * Initialize Amplitude analytics
   */
  async init(config: AnalyticsConfig = {}) {
    this.config = config;
    
    console.log('🚀 [AMPLITUDE] Initializing Analytics Service');
    console.log('   ├─ API Key:', config.apiKey ? '✅ Provided' : '❌ Missing');
    console.log('   ├─ Debug Mode:', config.debug ? '✅ Enabled' : '❌ Disabled');
    console.log('   ├─ Disabled:', config.disabled ? '✅ Yes' : '❌ No');
    console.log('   └─ Queued Events:', this.eventQueue.length);

    // Skip initialization if disabled or no API key
    if (config.disabled) {
      console.log('⚠️ [AMPLITUDE] Analytics explicitly disabled');
      return;
    }
    
    if (!config.apiKey) {
      console.error('❌ [AMPLITUDE] No API key provided!');
      console.log('💡 [AMPLITUDE] Add AMPLITUDE_API_KEY to your .env.local file');
      console.log('   Example: AMPLITUDE_API_KEY=your_amplitude_api_key_here');
      return;
    }

    try {
      console.log('🔧 [AMPLITUDE] Initializing Amplitude SDK...');
      
      // Initialize Amplitude
      amplitude.init(config.apiKey, {
        defaultTracking: {
          sessions: true,
          pageViews: false, // Widget doesn't have page views
          formInteractions: false,
          fileDownloads: false,
        },
        logLevel: config.debug ? amplitude.Types.LogLevel.Debug : amplitude.Types.LogLevel.Warn,
      });

      this.initialized = true;
      console.log('✅ [AMPLITUDE] Analytics initialized successfully!');
      console.log('📊 [AMPLITUDE] SDK Status:', {
        initialized: this.initialized,
        queuedEvents: this.eventQueue.length,
        processedEvents: this.processedEvents,
        failedEvents: this.failedEvents
      });

      // Process any queued events
      this.processEventQueue();
    } catch (error) {
      console.error('💥 [AMPLITUDE] Initialization failed:', error);
      console.error('🔍 [AMPLITUDE] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        config: { ...config, apiKey: config.apiKey ? '[REDACTED]' : 'missing' }
      });
    }
  }

  /**
   * Track an event
   */
  track(eventType: string, eventProperties?: Record<string, any>) {
    const timestamp = Date.now();
    const eventData = {
      ...eventProperties,
      timestamp,
      widget_version: '1.0.0',
    };

    // Always log the event attempt
    console.log(`🎯 [AMPLITUDE] ${eventType}`);
    console.log('   ├─ Properties:', eventProperties || 'none');
    console.log('   ├─ Domain:', window.location?.hostname || 'unknown');
    console.log('   ├─ URL:', window.location?.href || 'unknown');
    console.log('   ├─ Timestamp:', new Date(timestamp).toISOString());
    
    if (!this.initialized) {
      // Queue event for later processing
      this.eventQueue.push({ eventType, eventProperties, timestamp });
      console.log('   ├─ Status: ⏳ Queued (Analytics not initialized)');
      console.log('   └─ Queue Length:', this.eventQueue.length);
      return;
    }

    try {
      amplitude.track(eventType, eventData);
      this.processedEvents++;
      console.log('   ├─ Status: ✅ Sent to Amplitude');
      console.log('   └─ Processed Count:', this.processedEvents);
    } catch (error) {
      this.failedEvents++;
      console.error('   ├─ Status: ❌ Failed to send');
      console.error('   ├─ Error:', error instanceof Error ? error.message : 'Unknown error');
      console.error('   └─ Failed Count:', this.failedEvents);
      
      // Log detailed error for debugging
      console.error('💥 [AMPLITUDE] Event tracking error details:', {
        eventType,
        eventProperties,
        error: error instanceof Error ? error.stack : error,
        timestamp: new Date(timestamp).toISOString()
      });
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized) return;

    try {
      amplitude.setUserId(undefined); // Keep anonymous
      amplitude.identify(new amplitude.Identify().setOnce('widget_user', true));
    } catch (error) {
      console.error('📊 User properties failed:', error);
    }
  }

  /**
   * Process queued events after initialization
   */
  private processEventQueue() {
    if (this.eventQueue.length === 0) {
      console.log('📊 [AMPLITUDE] No queued events to process');
      return;
    }
    
    console.log(`🔄 [AMPLITUDE] Processing ${this.eventQueue.length} queued events`);
    const startTime = Date.now();
    let processedCount = 0;
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        const queueDelay = Date.now() - event.timestamp;
        console.log(`📤 [AMPLITUDE] Processing queued event (${queueDelay}ms delay)`);
        this.track(event.eventType, event.eventProperties);
        processedCount++;
      }
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`✅ [AMPLITUDE] Queue processed: ${processedCount} events in ${totalTime}ms`);
  }

  /**
   * Check if analytics is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

// Helper functions for common events with enhanced debugging
export const trackWidgetEvent = {
  initialized: (properties?: Record<string, any>) => {
    console.log('🎪 [WIDGET EVENT] Widget Initialized');
    analytics.track('widget_initialized', properties);
  },
  
  mounted: (properties?: Record<string, any>) => {
    console.log('🎭 [WIDGET EVENT] Widget Mounted');
    analytics.track('widget_mounted', properties);
  },
  
  expanded: (properties?: Record<string, any>) => {
    console.log('📈 [WIDGET EVENT] Widget Expanded');
    analytics.track('widget_expanded', properties);
  },
  
  collapsed: (properties?: Record<string, any>) => {
    console.log('📉 [WIDGET EVENT] Widget Collapsed');
    analytics.track('widget_collapsed', properties);
  },
  
  messageSent: (properties?: Record<string, any>) => {
    console.log('💬 [WIDGET EVENT] Message Sent');
    analytics.track('message_sent', properties);
  },
  
  messageReceived: (properties?: Record<string, any>) => {
    console.log('💭 [WIDGET EVENT] Message Received');
    analytics.track('message_received', properties);
  },
  
  error: (error: string, properties?: Record<string, any>) => {
    console.log('💥 [WIDGET EVENT] Widget Error:', error);
    analytics.track('widget_error', { error, ...properties });
  },
};

// Debug helper to show analytics status
export const showAnalyticsStatus = () => {
  console.log('📊 [AMPLITUDE] Current Status:');
  console.log('   ├─ Initialized:', analytics.isInitialized());
  console.log('   ├─ Queue Length:', (analytics as any).eventQueue?.length || 0);
  console.log('   ├─ Processed Events:', (analytics as any).processedEvents || 0);
  console.log('   ├─ Failed Events:', (analytics as any).failedEvents || 0);
  console.log('   └─ Timestamp:', new Date().toISOString());
};