/**
 * OpenAI API Client for direct integration
 * This replaces the secure-api-client for direct OpenAI API usage
 */

export interface OpenAIConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class OpenAIClient {
  private config: OpenAIConfig
  private conversationHistory: OpenAIMessage[] = []

  constructor(config: OpenAIConfig) {
    this.config = {
      model: 'gpt-4',
      maxTokens: 500,
      temperature: 0.7,
      systemPrompt: 'You are a helpful AI assistant embedded in a website. Answer as if you ARE the website. For example instead of saying "this companys hours are 9-5", you should say "our hours are 9-5". Answer questions concisely and helpfully. If you cannot answer a question, attempt to find any sort of contact info and tell the user to contact the website/business/person/etc and provide whatever contact info u can. Do not hallucinate',
      ...config
    }
    
    // Initialize with system prompt
    if (this.config.systemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.systemPrompt
      })
    }
  }

  /**
   * Send a question to OpenAI and get a response
   */
  async ask(question: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: question
      })

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: this.conversationHistory.slice(-10), // Keep last 10 messages for context
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }))
        throw new Error(error.error?.message || `API Error: ${response.status}`)
      }

      const data = await response.json()
      const answer = data.choices[0]?.message?.content || 'No response received'
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: answer
      })

      return answer
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw error
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = this.config.systemPrompt ? [{
      role: 'system',
      content: this.config.systemPrompt
    }] : []
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OpenAIConfig>) {
    this.config = { ...this.config, ...config }
    if (config.systemPrompt && this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory[0].content = config.systemPrompt
    }
  }
}