import type { Config } from 'tailwindcss';

const config: Config = {
  prefix: 'tw-',
  content: ['./src/**/*.{ts,tsx}'],
  important: '#gist-widget-root',
  theme: {
    extend: {
      colors: {
        gist: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
          accent: '#10B981',
          dark: '#1F2937',
          light: '#F9FAFB',
        },
      },
      animation: {
        'morph-in': 'morphIn 0.3s ease-out',
        'morph-out': 'morphOut 0.3s ease-in',
        'fade-in': 'fadeIn 0.2s ease-out',
        'widget-expand': 'widgetExpand 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'widget-collapse': 'widgetCollapse 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'widget-glow': 'widgetGlow 2s ease-in-out infinite',
        'widget-pulse': 'widgetPulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        morphIn: {
          '0%': { width: '56px', height: '56px', borderRadius: '28px' },
          '100%': { width: '320px', height: '400px', borderRadius: '12px' },
        },
        morphOut: {
          '0%': { width: '320px', height: '400px', borderRadius: '12px' },
          '100%': { width: '56px', height: '56px', borderRadius: '28px' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        widgetExpand: {
          '0%': { 
            transform: 'scaleX(0.24) translateZ(0)',
            opacity: '0.95',
          },
          '60%': {
            transform: 'scaleX(1.02) translateZ(0)',
            opacity: '1',
          },
          '100%': { 
            transform: 'scaleX(1) translateZ(0)',
            opacity: '1',
          }
        },
        widgetCollapse: {
          '0%': { 
            transform: 'scaleX(1) translateZ(0)',
            opacity: '1',
          },
          '40%': {
            transform: 'scaleX(0.98) translateZ(0)',
            opacity: '1',
          },
          '100%': { 
            transform: 'scaleX(0.24) translateZ(0)',
            opacity: '0.95',
          }
        },
        widgetGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        widgetPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};

export default config;