import React from 'react';
import { createRoot } from 'react-dom/client';
import { AIWidget } from './ai-widget';
import { WidgetConfig } from './types/widget';
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
  apiEndpoint: process.env.VITE_WIDGET_API_ENDPOINT || 'https://attemptnumberwhatever-ekpwcd6xz-pro-rata.vercel.app/api/simple-chat',
  serviceKey: process.env.VITE_WIDGET_SERVICE_KEY || '',
  position: 'bottom-center',
  theme: 'light',
  placeholder: 'Ask anything...',
  maxMessages: 50,
  enableWebsiteContext: true,
  customSystemPrompt: 'You are a helpful AI assistant embedded in a website. Answer questions concisely and helpfully based on the website context when available.',
};

function createContainer(): HTMLDivElement {
  const div = document.createElement('div');
  div.id = 'gist-widget-root';
  // Use individual style properties instead of cssText
  div.style.position = 'fixed';
  div.style.bottom = '20px';
  div.style.left = '50%';
  div.style.transform = 'translateX(-50%)';
  div.style.zIndex = '9999';
  div.style.pointerEvents = 'none';
  document.body.appendChild(div);
  return div;
}

function mountWidget(config: Partial<WidgetConfig> = {}) {
  // Prevent double mounting
  if (window.GistWidget?._mounted) {
    console.warn('GistWidget already mounted');
    return;
  }

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Debug logging for API endpoint
  console.log('🔧 Widget API Endpoint:', finalConfig.apiEndpoint);
  console.log('🔑 Widget Service Key:', finalConfig.serviceKey ? 'Set' : 'Missing');
  console.log('🔍 Environment Variables Debug:');
  console.log('  - VITE_WIDGET_API_ENDPOINT:', process.env.VITE_WIDGET_API_ENDPOINT);
  console.log('  - VITE_WIDGET_SERVICE_KEY:', process.env.VITE_WIDGET_SERVICE_KEY ? 'Set' : 'Missing');
  
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