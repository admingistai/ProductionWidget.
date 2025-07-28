export interface TestSiteConfig {
  url: string;
  type: 'static' | 'spa' | 'cms' | 'ecommerce' | 'docs';
  framework?: string;
  hasDynamicContent?: boolean;
  dynamicContentTrigger?: string;
  expectedContent?: string[];
  navigationTest?: {
    linkSelector: string;
    expectedUrl: string;
    expectedContent: string;
  };
  renderDelay?: number;
}

export const TEST_SITES: Record<string, TestSiteConfig> = {
  // Static Sites
  'static-html': {
    url: 'https://motherfuckingwebsite.com',
    type: 'static',
    expectedContent: ['better', 'website', 'simple'],
    navigationTest: {
      linkSelector: 'a[href*="bettermotherfuckingwebsite"]',
      expectedUrl: '**/bettermotherfuckingwebsite**',
      expectedContent: 'better'
    }
  },
  
  'github-pages': {
    url: 'https://pages.github.com/',
    type: 'static',
    framework: 'jekyll',
    expectedContent: ['github', 'pages', 'websites']
  },
  
  // SPA Frameworks
  'nextjs-app': {
    url: 'https://wsj-article-seven.vercel.app',
    type: 'spa',
    framework: 'nextjs',
    hasDynamicContent: true,
    renderDelay: 3000,
    expectedContent: ['vibecoding', 'developer', 'Thompson'],
    navigationTest: {
      linkSelector: 'a[href="/about"]',
      expectedUrl: '**/about',
      expectedContent: 'about'
    }
  },
  
  'react-app': {
    url: 'https://react.dev',
    type: 'spa',
    framework: 'react',
    hasDynamicContent: true,
    renderDelay: 2000,
    expectedContent: ['react', 'component', 'learn']
  },
  
  'vue-app': {
    url: 'https://vuejs.org',
    type: 'spa',
    framework: 'vue',
    hasDynamicContent: true,
    renderDelay: 2000,
    expectedContent: ['vue', 'framework', 'javascript']
  },
  
  'angular-app': {
    url: 'https://angular.io',
    type: 'spa',
    framework: 'angular',
    hasDynamicContent: true,
    renderDelay: 3000,
    expectedContent: ['angular', 'platform', 'developer']
  },
  
  // CMS Platforms  
  'wordpress-site': {
    url: 'https://techcrunch.com',
    type: 'cms',
    framework: 'wordpress',
    hasDynamicContent: true,
    dynamicContentTrigger: '.load-more',
    expectedContent: ['tech', 'startup', 'news'],
    navigationTest: {
      linkSelector: 'article h2 a:first-of-type',
      expectedUrl: '**/20**/**',
      expectedContent: 'article'
    }
  },
  
  'medium-site': {
    url: 'https://medium.com',
    type: 'cms',
    framework: 'custom',
    expectedContent: ['stories', 'writers', 'read']
  },
  
  // E-commerce (Using demo/example stores)
  'shopify-store': {
    url: 'https://www.allbirds.com',
    type: 'ecommerce',
    framework: 'shopify',
    hasDynamicContent: true,
    dynamicContentTrigger: '.product-grid-load-more',
    expectedContent: ['shoes', 'sustainable', 'comfort'],
    navigationTest: {
      linkSelector: 'a[href*="/products/"]:first-of-type',
      expectedUrl: '**/products/**',
      expectedContent: 'product'
    }
  },
  
  'ecommerce-demo': {
    url: 'https://demo.vercel.store',
    type: 'ecommerce',
    framework: 'nextjs',
    hasDynamicContent: true,
    expectedContent: ['product', 'price', 'cart']
  },
  
  // Documentation Sites
  'docusaurus-docs': {
    url: 'https://docusaurus.io',
    type: 'docs',
    framework: 'docusaurus',
    expectedContent: ['documentation', 'build', 'site'],
    navigationTest: {
      linkSelector: 'a[href="/docs"]',
      expectedUrl: '**/docs/**',
      expectedContent: 'getting started'
    }
  },
  
  'mdx-docs': {
    url: 'https://mdxjs.com',
    type: 'docs',
    framework: 'nextjs',
    hasDynamicContent: true,
    renderDelay: 2000,
    expectedContent: ['markdown', 'jsx', 'component']
  },
  
  // Website Builders and additional sites
  'vercel-site': {
    url: 'https://vercel.com',
    type: 'spa',
    framework: 'nextjs',
    hasDynamicContent: true,
    renderDelay: 2000,
    expectedContent: ['deploy', 'frontend', 'develop']
  },
  
  'gatsby-site': {
    url: 'https://www.gatsbyjs.com',
    type: 'spa',
    framework: 'gatsby',
    hasDynamicContent: true,
    renderDelay: 2000,
    expectedContent: ['gatsby', 'static', 'react']
  },
  
  'tailwind-site': {
    url: 'https://tailwindcss.com',
    type: 'spa',
    framework: 'nextjs',
    hasDynamicContent: true,
    expectedContent: ['utility', 'css', 'classes']
  }
};

// Test data for different scenarios
export const TEST_QUESTIONS = {
  general: [
    'What is this website about?',
    'What services or products are offered?',
    'How can I contact the company?',
    'What are the main features?'
  ],
  
  ecommerce: [
    'What products are available?',
    'What is the price of the featured product?',
    'What is the return policy?',
    'How do I track my order?'
  ],
  
  documentation: [
    'How do I get started?',
    'What are the API endpoints?',
    'Where can I find examples?',
    'What are the system requirements?'
  ],
  
  blog: [
    'What are the latest posts about?',
    'Who is the author?',
    'What topics are covered?',
    'How can I subscribe?'
  ]
};

// Performance budgets by site type
export const PERFORMANCE_BUDGETS = {
  static: {
    loadTime: 2000,
    interactionTime: 300,
    memoryLimit: 30 * 1024 * 1024 // 30MB
  },
  spa: {
    loadTime: 4000,
    interactionTime: 500,
    memoryLimit: 50 * 1024 * 1024 // 50MB
  },
  cms: {
    loadTime: 3000,
    interactionTime: 400,
    memoryLimit: 40 * 1024 * 1024 // 40MB
  },
  ecommerce: {
    loadTime: 3500,
    interactionTime: 450,
    memoryLimit: 45 * 1024 * 1024 // 45MB
  },
  docs: {
    loadTime: 2500,
    interactionTime: 350,
    memoryLimit: 35 * 1024 * 1024 // 35MB
  }
};