// Widget state and API types for AI Chat Widget

export type WidgetState = 'collapsed' | 'expanded' | 'loading' | 'chat-visible' | 'error'

export interface ChatMessage {
  id: string
  question: string
  answer: string
  timestamp: Date
}

export interface WidgetConfig {
  apiEndpoint?: string // Backend API endpoint
  serviceKey?: string // Optional service key for authentication
  position?: 'bottom-left' | 'bottom-center' | 'bottom-right'
  theme?: 'light' | 'dark' | 'auto'
  placeholder?: string
  maxMessages?: number
  enableWebsiteContext?: boolean
  customSystemPrompt?: string
}

export interface APIResponse {
  success: boolean
  data?: {
    answer: string
    usage?: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  }
  error?: {
    message: string
    type: string
    code?: string
  }
}

export interface ChatRequest {
  question: string
  conversation?: ChatMessage[]
  websiteContext?: WebsiteContext
}

// Website Context Types
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
}

export interface OptimizedContext {
  summary: string
  businessProfile: string
  pageContext: string
  keyFeatures: string[]
  estimatedTokens: number
}

export interface FaviconInfo {
  url: string
  type: string
  sizes?: string
}

export interface WidgetProps {
  config?: Partial<WidgetConfig>
  onStateChange?: (state: WidgetState) => void
  onMessageSent?: (message: ChatMessage) => void
  onError?: (error: string) => void
}