/**
 * Universal Website Content Scraper
 * Extracts relevant content from any website for AI context
 */

export interface WebsiteContext {
  url: string
  domain: string
  title: string
  description: string
  content: string
  businessInfo: {
    name?: string
    industry?: string
    location?: string
  }
  pageType: string
  language: string
  headings: string[]
  navigation: string[]
  keyPoints: string[]
  faviconUrl?: string
}

export class WebsiteScraper {
  private static readonly MAX_CONTENT_LENGTH = 50000
  private static readonly MIN_CONTENT_LENGTH = 50

  /**
   * Extract optimized website content for AI context
   */
  static extractContent(): WebsiteContext {
    return {
      url: this.sanitizeUrl(window.location.href),
      domain: window.location.hostname,
      title: document.title || '',
      description: this.getMetaDescription(),
      content: this.getOptimizedContent(),
      businessInfo: this.detectBusinessInfo(),
      pageType: this.detectPageType(),
      language: this.detectLanguage(),
      headings: this.extractHeadings(),
      navigation: this.extractNavigation(),
      keyPoints: this.extractKeyPoints(),
      faviconUrl: this.getFaviconUrl()
    }
  }

  /**
   * Get main content using intelligent fallback strategy
   */
  private static getMainContent(): string {
    // Priority selectors for main content
    const contentSelectors = [
      // Next.js specific selectors first
      '#__next main',
      '#__next article',
      '#__next [role="main"]',
      '#__next .main-content',
      '#__next .content',
      '[data-testid="main-content"]',
      // Common selectors
      'main',
      '[role="main"]',
      '.main-content',
      '#main',
      '#content',
      'article',
      '.content',
      '.page-content',
      '.post-content',
      '.entry-content',
      '.container main',
      '.wrapper .content',
      // Next.js app container as fallback
      '#__next',
      'body'
    ]

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector)
      if (element && this.hasSubstantialContent(element)) {
        return this.cleanText(element.textContent || '')
      }
    }

    // Fallback: get body content excluding common non-content areas
    const body = document.body
    if (body) {
      const clone = body.cloneNode(true) as HTMLElement
      this.removeNonContentElements(clone)
      return this.cleanText(clone.textContent || '')
    }

    return ''
  }

  /**
   * Remove non-content elements from cloned DOM
   */
  private static removeNonContentElements(element: HTMLElement): void {
    const nonContentSelectors = [
      'nav', 'header', 'footer', 'aside',
      '.navigation', '.nav', '.menu',
      '.header', '.footer', '.sidebar',
      '.widget', '.advertisement', '.ads',
      'script', 'style', 'noscript',
      '[style*="display: none"]',
      '[style*="visibility: hidden"]',
      '.hidden', '.sr-only'
    ]

    nonContentSelectors.forEach(selector => {
      const elements = element.querySelectorAll(selector)
      elements.forEach(el => el.remove())
    })
  }

  /**
   * Check if element has substantial content
   */
  private static hasSubstantialContent(element: Element): boolean {
    const text = element.textContent || ''
    const cleanedText = this.cleanText(text)
    
    return (
      cleanedText.length >= this.MIN_CONTENT_LENGTH &&
      cleanedText.split(/\s+/).length >= 10 &&
      !this.isNavigationOnly(cleanedText)
    )
  }

  /**
   * Check if content is primarily navigation
   */
  private static isNavigationOnly(text: string): boolean {
    const navKeywords = ['home', 'about', 'contact', 'services', 'products', 'menu', 'login', 'signup']
    const words = text.toLowerCase().split(/\s+/)
    const navWordCount = words.filter(word => navKeywords.includes(word)).length
    
    return navWordCount > words.length * 0.5
  }

  /**
   * Clean and normalize text content
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .replace(/\n+/g, ' ')          // Remove line breaks
      .replace(/[^\w\s.,!?-]/g, '')  // Remove special characters
      .trim()
  }

  /**
   * Get optimized content within token limits
   */
  private static getOptimizedContent(): string {
    const content = this.getMainContent()
    
    if (content.length <= this.MAX_CONTENT_LENGTH) {
      return content
    }

    // Prioritize first paragraphs and key sections
    const sentences = content.split(/[.!?]+/)
    let optimized = ''
    
    for (const sentence of sentences) {
      const trimmed = sentence.trim()
      if (trimmed && (optimized.length + trimmed.length + 2) <= this.MAX_CONTENT_LENGTH) {
        optimized += (optimized ? '. ' : '') + trimmed
      } else {
        break
      }
    }

    return optimized || content.substring(0, this.MAX_CONTENT_LENGTH)
  }

  /**
   * Extract meta description
   */
  private static getMetaDescription(): string {
    const metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement
    return metaDesc?.content || ''
  }

  /**
   * Detect business information from page content
   */
  private static detectBusinessInfo(): WebsiteContext['businessInfo'] {
    const businessInfo: WebsiteContext['businessInfo'] = {}

    // Extract business name from various sources
    businessInfo.name = this.extractBusinessName()
    businessInfo.industry = this.extractIndustry()
    businessInfo.location = this.extractLocation()

    return businessInfo
  }

  /**
   * Extract business name from various sources with smart prioritization
   */
  private static extractBusinessName(): string {
    // Priority 1: JSON-LD Structured Data (most reliable)
    const jsonLdName = this.extractFromJsonLd()
    if (jsonLdName) {
      // console.log('🎯 Company name from JSON-LD:', jsonLdName)
      return jsonLdName
    }

    // Priority 2: Meta Tags (Open Graph, Twitter, etc.)
    const metaName = this.extractFromMetaTags()
    if (metaName) {
      // console.log('🎯 Company name from meta tags:', metaName)
      return metaName
    }

    // Priority 3: Logo Alt Text
    const logoName = this.extractFromLogoAlt()
    if (logoName) {
      // console.log('🎯 Company name from logo:', logoName)
      return logoName
    }

    // Priority 4: H1 (less reliable, often page-specific)
    const h1 = document.querySelector('h1')
    if (h1 && h1.textContent && h1.textContent.length < 100) {
      const h1Text = h1.textContent.trim()
      // Skip if it looks like a page title
      if (!this.looksLikePageTitle(h1Text)) {
        // console.log('🎯 Company name from H1:', h1Text)
        return h1Text
      }
    }

    // Priority 5: Title tag (least reliable)
    const title = document.title
    const cleanedTitle = title
      .replace(/\s*[-|]\s*(Home|Welcome|About|Contact|Services|Products|Blog).*$/i, '')
      .replace(/\s*[-|]\s*$/, '')
      .trim()
    
    if (cleanedTitle && cleanedTitle.length < 50 && !this.looksLikePageTitle(cleanedTitle)) {
      // console.log('🎯 Company name from title:', cleanedTitle)
      return cleanedTitle
    }

    // console.log('⚠️ No company name found, using fallback')
    return ''
  }

  /**
   * Extract company name from JSON-LD structured data
   */
  private static extractFromJsonLd(): string {
    try {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || '{}')
          
          // Handle single object or array of objects
          const objects = Array.isArray(data) ? data : [data]
          
          for (const obj of objects) {
            // Check for Organization or LocalBusiness types
            if (obj['@type'] && typeof obj['@type'] === 'string') {
              const type = obj['@type'].toLowerCase()
              if (type.includes('organization') || type.includes('business') || type.includes('company')) {
                if (obj.name && typeof obj.name === 'string') {
                  return obj.name.trim()
                }
              }
            }
            
            // Check for WebSite type which often has publisher info
            if (obj['@type'] === 'WebSite' && obj.publisher?.name) {
              return obj.publisher.name.trim()
            }
          }
        } catch (e) {
          // Invalid JSON in this script tag, continue to next
          // console.warn('Invalid JSON-LD:', e)
        }
      }
    } catch (e) {
      // console.warn('Error extracting from JSON-LD:', e)
    }
    
    return ''
  }

  /**
   * Extract company name from meta tags
   */
  private static extractFromMetaTags(): string {
    // Open Graph site name (most common and reliable)
    const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
    if (ogSiteName && ogSiteName.trim()) {
      return ogSiteName.trim()
    }

    // Twitter site name
    const twitterSite = document.querySelector('meta[name="twitter:site"]')?.getAttribute('content')
    if (twitterSite && twitterSite.trim()) {
      // Remove @ symbol if present
      return twitterSite.trim().replace(/^@/, '')
    }

    // Application name
    const appName = document.querySelector('meta[name="application-name"]')?.getAttribute('content')
    if (appName && appName.trim()) {
      return appName.trim()
    }

    // Author (sometimes contains company name)
    const author = document.querySelector('meta[name="author"]')?.getAttribute('content')
    if (author && author.trim() && !author.includes('@') && author.length < 50) {
      return author.trim()
    }

    return ''
  }

  /**
   * Extract company name from logo alt text
   */
  private static extractFromLogoAlt(): string {
    const logoSelectors = [
      'img[alt*="logo" i]',
      '.logo img',
      '#logo img',
      'header img[alt]',
      '[class*="brand"] img',
      '[class*="logo"] img',
      '[id*="logo"] img',
      'a[href="/"] img[alt]'
    ]

    for (const selector of logoSelectors) {
      const logo = document.querySelector(selector) as HTMLImageElement
      if (logo?.alt) {
        const altText = logo.alt.trim()
        // Clean up common patterns
        const cleaned = altText
          .replace(/logo/gi, '')
          .replace(/icon/gi, '')
          .replace(/^\W+|\W+$/g, '') // Remove leading/trailing non-word chars
          .trim()
        
        if (cleaned && cleaned.length > 2 && cleaned.length < 50) {
          return cleaned
        }
      }
    }

    return ''
  }

  /**
   * Check if text looks like a page-specific title rather than company name
   */
  private static looksLikePageTitle(text: string): boolean {
    const pageTitlePatterns = [
      /^welcome to/i,
      /^about us/i,
      /^contact us/i,
      /^our services/i,
      /^our products/i,
      /^home$/i,
      /^blog$/i,
      /^news$/i,
      /^portfolio$/i,
      /^testimonials/i,
      /^frequently asked/i,
      /^privacy policy/i,
      /^terms/i
    ]

    return pageTitlePatterns.some(pattern => pattern.test(text))
  }

  /**
   * Detect industry from content keywords
   */
  private static extractIndustry(): string {
    const content = document.body.textContent?.toLowerCase() || ''
    
    const industries = {
      'restaurant': ['restaurant', 'dining', 'menu', 'food', 'cuisine'],
      'retail': ['shop', 'store', 'products', 'buy', 'sale'],
      'agency': ['agency', 'marketing', 'advertising', 'brand', 'creative'],
      'consulting': ['consulting', 'consultant', 'advisory', 'strategy'],
      'technology': ['software', 'technology', 'app', 'digital', 'tech'],
      'healthcare': ['medical', 'health', 'doctor', 'clinic', 'patient'],
      'real estate': ['real estate', 'property', 'homes', 'realty'],
      'education': ['school', 'university', 'education', 'learning', 'course']
    }

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return industry
      }
    }

    return ''
  }

  /**
   * Extract location information
   */
  private static extractLocation(): string {
    const content = document.body.textContent || ''
    
    // Look for common location patterns
    const locationRegex = /(?:located in|based in|serving|office in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    const match = content.match(locationRegex)
    
    return match ? match[1] : ''
  }

  /**
   * Detect page type
   */
  private static detectPageType(): string {
    const url = window.location.pathname.toLowerCase()
    const content = document.body.textContent?.toLowerCase() || ''

    if (url.includes('about') || content.includes('about us')) return 'about'
    if (url.includes('contact') || content.includes('contact us')) return 'contact'
    if (url.includes('service') || content.includes('our services')) return 'services'
    if (url.includes('product') || content.includes('our products')) return 'products'
    if (url.includes('blog') || url.includes('news')) return 'blog'
    if (url === '/' || url === '/home') return 'homepage'

    return 'general'
  }

  /**
   * Detect page language
   */
  private static detectLanguage(): string {
    return document.documentElement.lang || 
           document.querySelector('html')?.getAttribute('lang') || 
           'en'
  }

  /**
   * Extract headings for structure understanding
   */
  private static extractHeadings(): string[] {
    const headings: string[] = []
    const headingElements = document.querySelectorAll('h1, h2, h3, h4')
    
    headingElements.forEach(heading => {
      const text = heading.textContent?.trim()
      if (text && text.length < 200) {
        headings.push(text)
      }
    })

    return headings.slice(0, 10) // Limit to first 10 headings
  }

  /**
   * Extract navigation items
   */
  private static extractNavigation(): string[] {
    const navItems: string[] = []
    const navSelectors = ['nav a', '.menu a', '.navigation a', 'header a']
    
    navSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(link => {
        const text = (link as HTMLElement).textContent?.trim()
        if (text && text.length < 50 && !navItems.includes(text)) {
          navItems.push(text)
        }
      })
    })

    return navItems.slice(0, 10) // Limit to 10 nav items
  }

  /**
   * Extract key points and value propositions
   */
  private static extractKeyPoints(): string[] {
    const keyPoints: string[] = []
    
    // First, extract any monetary values from the content
    const monetaryValues = this.extractMonetaryValues()
    keyPoints.push(...monetaryValues)
    
    // Look for lists and highlighted content
    const listItems = document.querySelectorAll('li, .feature, .benefit, .service-item')
    
    listItems.forEach(item => {
      const text = item.textContent?.trim()
      if (text && text.length > 10 && text.length < 200) {
        keyPoints.push(text)
      }
    })

    return keyPoints.slice(0, 10) // Limit to 10 key points
  }

  /**
   * Extract monetary values and pricing information
   */
  private static extractMonetaryValues(): string[] {
    const content = document.body.textContent || ''
    const monetaryValues: string[] = []
    
    // Pattern to match monetary values with context
    const pricePattern = /(?:costs?|priced?|pricing|fee|payment|charge[sd]?|price[sd]?)\s*:?\s*\$[\d,]+(?:\.\d{2})?|\$[\d,]+(?:\.\d{2})?\s+(?:per|for|each|monthly|yearly|annually)/gi
    
    // Also match standalone prices with surrounding context (20 chars before and after)
    const contextPattern = /.{0,20}\$[\d,]+(?:\.\d{2})?.{0,20}/gi
    
    const priceMatches = content.match(pricePattern) || []
    const contextMatches = content.match(contextPattern) || []
    
    // Combine and deduplicate
    const allMatches = [...new Set([...priceMatches, ...contextMatches])]
    
    allMatches.forEach(match => {
      const cleaned = match.trim()
      if (cleaned && !monetaryValues.some(v => v.includes(cleaned))) {
        monetaryValues.push(cleaned)
      }
    })
    
    return monetaryValues.slice(0, 5) // Limit to 5 monetary values
  }

  /**
   * Sanitize URL for context
   */
  private static sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`
    } catch {
      return url
    }
  }

  /**
   * Extract only favicon URL for quick initialization
   */
  static extractFaviconOnly(): string | undefined {
    return this.getFaviconUrl()
  }

  /**
   * Get favicon URL from the website
   */
  private static getFaviconUrl(): string | undefined {
    // Try various favicon link types in order of preference
    const iconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
      'link[rel="apple-touch-icon-precomposed"]'
    ]

    for (const selector of iconSelectors) {
      const iconLink = document.querySelector(selector) as HTMLLinkElement
      if (iconLink?.href) {
        return iconLink.href
      }
    }

    // If no favicon link found, return undefined
    // This allows the widget to hide the favicon area completely
    return undefined
  }
}