/**
 * Content Optimizer for Token Management
 * Optimizes website content for LLM token efficiency
 */

import type { WebsiteContext } from './website-scraper'

export interface OptimizedContext {
  summary: string
  businessProfile: string
  pageContext: string
  keyFeatures: string[]
  estimatedTokens: number
}

export class ContentOptimizer {
  private static readonly MAX_SUMMARY_TOKENS = 3000
  private static readonly MAX_BUSINESS_TOKENS = 200
  private static readonly MAX_PAGE_TOKENS = 500
  private static readonly CHARS_PER_TOKEN = 4 // Rough estimation

  /**
   * Optimize website context for token efficiency
   */
  static optimize(context: WebsiteContext): OptimizedContext {
    const summary = this.createSummary(context)
    const businessProfile = this.createBusinessProfile(context)
    const pageContext = this.createPageContext(context)
    const keyFeatures = this.extractKeyFeatures(context)
    
    const estimatedTokens = this.estimateTokens(summary + businessProfile + pageContext + keyFeatures.join(' '))

    return {
      summary,
      businessProfile,
      pageContext,
      keyFeatures,
      estimatedTokens
    }
  }

  /**
   * Create concise website summary
   */
  private static createSummary(context: WebsiteContext): string {
    const maxChars = this.MAX_SUMMARY_TOKENS * this.CHARS_PER_TOKEN
    
    // Priority content for summary
    const parts = [
      context.title,
      context.description,
      context.content
    ].filter(Boolean)

    let summary = parts.join(' ').substring(0, maxChars)
    
    // Ensure we end at a word boundary
    const lastSpace = summary.lastIndexOf(' ')
    if (lastSpace > maxChars * 0.8) {
      summary = summary.substring(0, lastSpace)
    }

    return this.cleanText(summary)
  }

  /**
   * Create business profile
   */
  private static createBusinessProfile(context: WebsiteContext): string {
    const maxChars = this.MAX_BUSINESS_TOKENS * this.CHARS_PER_TOKEN
    const business = context.businessInfo
    
    const profileParts = []
    
    if (business.name) {
      profileParts.push(`Business: ${business.name}`)
    }
    
    if (business.industry) {
      profileParts.push(`Industry: ${business.industry}`)
    }
    
    if (business.location) {
      profileParts.push(`Location: ${business.location}`)
    }
    
    if (context.domain) {
      profileParts.push(`Website: ${context.domain}`)
    }

    const profile = profileParts.join('. ')
    
    return profile.length > maxChars 
      ? profile.substring(0, maxChars).trim() + '...'
      : profile
  }

  /**
   * Create page-specific context
   */
  private static createPageContext(context: WebsiteContext): string {
    const maxChars = this.MAX_PAGE_TOKENS * this.CHARS_PER_TOKEN
    
    const contextParts = []
    
    // Page type context
    contextParts.push(`Page type: ${context.pageType}`)
    
    // Key headings
    if (context.headings.length > 0) {
      const headings = context.headings.slice(0, 5).join(', ')
      contextParts.push(`Main sections: ${headings}`)
    }
    
    // Navigation context
    if (context.navigation.length > 0) {
      const nav = context.navigation.slice(0, 8).join(', ')
      contextParts.push(`Site navigation: ${nav}`)
    }

    const pageContext = contextParts.join('. ')
    
    return pageContext.length > maxChars 
      ? pageContext.substring(0, maxChars).trim() + '...'
      : pageContext
  }

  /**
   * Extract key features and value propositions
   */
  private static extractKeyFeatures(context: WebsiteContext): string[] {
    const features: string[] = []
    
    // Use key points from scraper
    if (context.keyPoints && context.keyPoints.length > 0) {
      features.push(...context.keyPoints.slice(0, 6))
    }
    
    // Extract from headings if no key points
    if (features.length === 0 && context.headings.length > 1) {
      features.push(...context.headings.slice(1, 6)) // Skip main title
    }
    
    // Limit feature length
    return features.map(feature => 
      feature.length > 100 ? feature.substring(0, 100) + '...' : feature
    ).slice(0, 5)
  }

  /**
   * Create system prompt with website context
   */
  static createSystemPrompt(optimized: OptimizedContext, customPrompt?: string): string {
    const basePrompt = customPrompt || 
      "You are an AI assistant for this website. Help visitors with questions about the business, services, content, and any other inquiries."

    const contextPrompt = `
${basePrompt}

WEBSITE CONTEXT:
${optimized.businessProfile}

${optimized.summary}

PAGE INFORMATION:
${optimized.pageContext}

KEY FEATURES/SERVICES:
${optimized.keyFeatures.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

Please provide helpful, accurate responses based on this website's content and purpose. If asked about specific details not covered in the context, politely indicate that you'd need more information.`

    return contextPrompt.trim()
  }

  /**
   * Estimate token count (rough approximation)
   */
  private static estimateTokens(text: string): number {
    return Math.ceil(text.length / this.CHARS_PER_TOKEN)
  }

  /**
   * Clean and normalize text
   */
  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim()
  }

  /**
   * Validate context size for API limits
   */
  static validateContextSize(optimized: OptimizedContext, maxTokens = 4000): boolean {
    return optimized.estimatedTokens <= maxTokens
  }

  /**
   * Truncate context if too large
   */
  static truncateIfNeeded(optimized: OptimizedContext, maxTokens = 4000): OptimizedContext {
    if (optimized.estimatedTokens <= maxTokens) {
      return optimized
    }

    // Calculate reduction needed
    const reductionRatio = maxTokens / optimized.estimatedTokens
    const maxChars = Math.floor(maxTokens * this.CHARS_PER_TOKEN * reductionRatio)

    // Truncate summary first as it's usually the largest
    const combinedText = optimized.summary + ' ' + optimized.pageContext
    const truncatedText = combinedText.substring(0, maxChars)
    
    // Split back into summary and page context
    const midPoint = Math.floor(truncatedText.length * 0.7) // 70% for summary
    const lastSpaceInSummary = truncatedText.lastIndexOf(' ', midPoint)
    
    const newSummary = truncatedText.substring(0, lastSpaceInSummary)
    const newPageContext = truncatedText.substring(lastSpaceInSummary + 1)

    return {
      ...optimized,
      summary: newSummary,
      pageContext: newPageContext,
      keyFeatures: optimized.keyFeatures.slice(0, 3), // Reduce features
      estimatedTokens: this.estimateTokens(newSummary + optimized.businessProfile + newPageContext + optimized.keyFeatures.slice(0, 3).join(' '))
    }
  }

  /**
   * Get context statistics for debugging
   */
  static getContextStats(optimized: OptimizedContext): {
    summaryTokens: number
    businessTokens: number
    pageTokens: number
    featuresTokens: number
    totalTokens: number
  } {
    return {
      summaryTokens: this.estimateTokens(optimized.summary),
      businessTokens: this.estimateTokens(optimized.businessProfile),
      pageTokens: this.estimateTokens(optimized.pageContext),
      featuresTokens: this.estimateTokens(optimized.keyFeatures.join(' ')),
      totalTokens: optimized.estimatedTokens
    }
  }
}