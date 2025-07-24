/**
 * Secure API Client for Website-Aware Chat
 * Communicates with secure backend endpoints (no exposed API keys)
 */

import type { ChatMessage, APIResponse } from './types/widget'
import type { OptimizedContext } from './content-optimizer'

export interface SecureAPIConfig {
  apiEndpoint: string
  serviceKey?: string
  timeout?: number
  retries?: number
}

export interface ChatRequest {
  question: string
  websiteContext: OptimizedContext
  conversation: ChatMessage[]
  sessionId?: string
}

export class SecureAPIClient {
  private config: SecureAPIConfig
  private sessionId: string

  constructor(config: SecureAPIConfig) {
    this.config = {
      timeout: 30000,
      retries: 2,
      ...config
    }
    this.sessionId = this.generateSessionId()
  }

  /**
   * Send chat request to secure backend
   */
  async chat(
    question: string, 
    websiteContext: OptimizedContext, 
    conversation: ChatMessage[] = []
  ): Promise<string> {
    const request: ChatRequest = {
      question: question.trim(),
      websiteContext,
      conversation: conversation.slice(-5), // Last 5 for context
      sessionId: this.sessionId
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= (this.config.retries || 0); attempt++) {
      try {
        const response = await this.makeRequest(request)
        return this.handleResponse(response)
      } catch (error) {
        lastError = error as Error
        
        if (attempt < (this.config.retries || 0)) {
          // Wait before retry (exponential backoff)
          await this.delay(Math.pow(2, attempt) * 1000)
          continue
        }
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  /**
   * Make HTTP request to backend
   */
  private async makeRequest(request: ChatRequest): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    // Add service key if provided (for hosted proxy services)
    if (this.config.serviceKey) {
      headers['Authorization'] = `Bearer ${this.config.serviceKey}`
    }

    // Add session tracking
    headers['X-Session-ID'] = this.sessionId
    headers['X-Client-Version'] = '1.0.0'

    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
    }, this.config.timeout)

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse(response: Response): Promise<string> {
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      
      switch (response.status) {
        case 400:
          throw new Error('Invalid request format')
        case 401:
          throw new Error('Authentication failed')
        case 403:
          throw new Error('Access forbidden')
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.')
        case 500:
          throw new Error('Server error. Please try again.')
        default:
          throw new Error(`Request failed: ${response.status} ${errorText}`)
      }
    }

    let data: APIResponse
    try {
      data = await response.json()
    } catch {
      throw new Error('Invalid response format')
    }

    if (!data.success) {
      const errorMessage = data.error?.message || 'Request failed'
      throw new Error(errorMessage)
    }

    if (!data.data?.answer) {
      throw new Error('No response received')
    }

    return data.data.answer
  }

  /**
   * Validate request before sending
   */
  private _validateRequest(request: ChatRequest): void {
    if (!request.question || request.question.trim().length === 0) {
      throw new Error('Question is required')
    }

    if (request.question.length > 1000) {
      throw new Error('Question is too long (max 1000 characters)')
    }

    if (!request.websiteContext) {
      throw new Error('Website context is required')
    }

    // Validate website context has required fields
    if (!request.websiteContext.summary && !request.websiteContext.businessProfile) {
      throw new Error('Website context must include summary or business profile')
    }
  }

  /**
   * Test connection to API endpoint
   */
  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    const startTime = Date.now()
    
    try {
      // Simple test request
      const testRequest: Partial<ChatRequest> = {
        question: 'test',
        websiteContext: {
          summary: 'test',
          businessProfile: 'test',
          pageContext: 'test',
          keyFeatures: [],
          estimatedTokens: 10
        },
        conversation: []
      }

      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.serviceKey && { 'Authorization': `Bearer ${this.config.serviceKey}` })
        },
        body: JSON.stringify(testRequest)
      })

      const latency = Date.now() - startTime

      if (response.ok) {
        return { success: true, latency }
      } else {
        return { 
          success: false, 
          latency, 
          error: `HTTP ${response.status}` 
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      return { 
        success: false, 
        latency, 
        error: (error as Error).message 
      }
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Delay utility for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SecureAPIConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }

  /**
   * Reset session (generates new ID)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId()
  }

  /**
   * Static factory method for easy instantiation
   */
  static create(apiEndpoint: string, serviceKey?: string): SecureAPIClient {
    return new SecureAPIClient({ apiEndpoint, serviceKey })
  }

  /**
   * Static method to validate endpoint URL
   */
  static validateEndpoint(endpoint: string): boolean {
    try {
      const url = new URL(endpoint)
      return ['http:', 'https:'].includes(url.protocol)
    } catch {
      return false
    }
  }
}