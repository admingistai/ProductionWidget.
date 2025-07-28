import React from 'react';
import { createRoot } from 'react-dom/client';
import { AIWidget } from './ai-widget';
import { WidgetConfig } from './types/widget';
import { analytics } from './services/analytics';
import './styles.css';

// Global namespace
declare global {
  interface Window {
    GistWidget: {
      init: (config?: Partial<WidgetConfig>) => void;
      destroy: () => void;
      _mounted: boolean;
    };
  }
}

// Widget container management
let root: ReturnType<typeof createRoot> | null = null;
let container: HTMLDivElement | null = null;

const DEFAULT_CONFIG: WidgetConfig = {
  apiEndpoint: import.meta.env.VITE_WIDGET_API_ENDPOINT || 'https://attemptnumberwhatever-ekpwcd6xz-pro-rata.vercel.app/api/simple-chat',
  serviceKey: import.meta.env.VITE_WIDGET_SERVICE_KEY || '',
  position: 'bottom-center',
  theme: 'light',
  placeholder: 'Ask anything..',
  maxMessages: 50,
  enableWebsiteContext: true,
  customSystemPrompt: 'You are a helpful AI assistant embedded in a website. Answer questions concisely and helpfully based on the website context when available.',
  analytics: {
    enabled: true,
    amplitudeApiKey: import.meta.env.VITE_AMPLITUDE_API_KEY,
    debug: import.meta.env.NODE_ENV === 'development',
  },
};

function createContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.id = 'gist-widget-root';
  // Use individual style properties instead of cssText
  div.style.position = 'fixed';
  div.style.bottom = '20px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.zIndex = '2147483647'; // Maximum z-index value
  div.style.pointerEvents = 'auto';
  // Force visibility
  div.style.display = 'block';
  div.style.visibility = 'visible';
  div.style.opacity = '1';
  document.body.appendChild(div);
  return div;
}

async function mountWidget(config: Partial<WidgetConfig> = {}) {
  // Prevent double mounting
  if (window.GistWidget?._mounted) {
    console.warn('GistWidget already mounted');
    return;
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Initialize analytics first
  if (finalConfig.analytics?.enabled) {
    console.log('🚀 [WIDGET] Initializing analytics for website integration');
    console.log('   ├─ Domain:', window.location.hostname);
    console.log('   ├─ URL:', window.location.href);
    console.log('   ├─ User Agent:', navigator.userAgent.substring(0, 80) + '...');
    console.log('   └─ Timestamp:', new Date().toISOString());
    
    await analytics.init({
      apiKey: finalConfig.analytics.amplitudeApiKey,
      disabled: !finalConfig.analytics.enabled,
      debug: finalConfig.analytics.debug,
    });
    
    // Track widget initialization on website - This is the key event!
    console.log('🌟 [WIDGET] Tracking website integration event');
    analytics.track('Widget Initialized on Website', {
      url: window.location.href,
      domain: window.location.hostname,
      referrer: document.referrer || 'direct',
      user_agent: navigator.userAgent,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
      page_title: document.title,
      installation_timestamp: new Date().toISOString(),
    });
  } else {
    console.log('⚠️ [WIDGET] Analytics disabled - website integration will not be tracked');
  }
  
  // Debug logging for API endpoint
  console.log('🔧 Widget API Endpoint:', finalConfig.apiEndpoint);
  console.log('🔑 Widget Service Key:', finalConfig.serviceKey ? 'Set' : 'Missing');
  console.log('📊 Analytics:', finalConfig.analytics?.enabled ? 'Enabled' : 'Disabled');
  console.log('🔍 Environment Variables Debug:');
  console.log('  - VITE_WIDGET_API_ENDPOINT:', import.meta.env.VITE_WIDGET_API_ENDPOINT);
  console.log('  - VITE_WIDGET_SERVICE_KEY:', import.meta.env.VITE_WIDGET_SERVICE_KEY ? 'Set' : 'Missing');
  console.log('  - VITE_AMPLITUDE_API_KEY:', import.meta.env.VITE_AMPLITUDE_API_KEY ? 'Set' : 'Missing');
  
  // Create container if not exists
  if (!container) {
    container = createContainer();
  }

  // Create React root and render
  root = createRoot(container);
  console.log('🎨 Rendering widget...');
  root.render(
    <React.StrictMode>
      <AIWidget config={finalConfig} />
    </React.StrictMode>
  );

  window.GistWidget._mounted = true;
  console.log('✅ Widget mounted successfully');
}

function destroyWidget() {
  if (root) {
    root.unmount();
    root = null;
  }
  if (container) {
    container.remove();
    container = null;
  }
  window.GistWidget._mounted = false;
}

// Initialize global API
window.GistWidget = {
  init: mountWidget,
  destroy: destroyWidget,
  _mounted: false,
};

// Auto-mount unless disabled
const script = document.currentScript as HTMLScriptElement;
const autoInit = script?.getAttribute('data-autoinit') !== 'false';
const configJson = script?.getAttribute('data-config');

if (autoInit) {
  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const config = configJson ? JSON.parse(configJson) : {};
      mountWidget(config);
    });
  } else {
    const config = configJson ? JSON.parse(configJson) : {};
    mountWidget(config);
  }
}