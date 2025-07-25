import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔍 Vite Build Environment Variables:');
  console.log('  - VITE_WIDGET_API_ENDPOINT:', env.VITE_WIDGET_API_ENDPOINT);
  console.log('  - VITE_WIDGET_SERVICE_KEY:', env.VITE_WIDGET_SERVICE_KEY ? 'Set' : 'Missing');
  console.log('  - NODE_ENV:', env.NODE_ENV);

  return {
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    cssInjectedByJsPlugin({
      styleId: 'gist-widget-styles',
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'GistWidget',
      formats: ['iife'],
      fileName: () => 'widget.iife.js',
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
        globals: {},
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Keep console logs for debugging
        drop_debugger: true,
      },
    },
    target: 'es2015',
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV || 'production'),
    'process.env.VITE_WIDGET_API_ENDPOINT': JSON.stringify(env.VITE_WIDGET_API_ENDPOINT),
    'process.env.VITE_WIDGET_SERVICE_KEY': JSON.stringify(env.VITE_WIDGET_SERVICE_KEY),
  },
  };
});