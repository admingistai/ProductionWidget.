"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { MorphingWidget } from './morphing-widget'
import { ChatViewport } from './chat-viewport'
import { WebsiteScraper } from './website-scraper'
import { ContentOptimizer } from './content-optimizer'
import { SecureAPIClient } from './secure-api-client'
import { generateMessageId } from './lib/widget-utils'
import { useResponsiveWidth } from './hooks/useResponsiveWidth'
import type { WidgetState, ChatMessage, WidgetProps, WidgetConfig, APIResponse, OptimizedContext } from './types/widget'

const DEFAULT_CONFIG: WidgetConfig = {
  apiEndpoint: import.meta.env.VITE_WIDGET_API_ENDPOINT || 'https://attemptnumberwhatever-8pes44ejn-pro-rata.vercel.app/api/simple-chat',
  serviceKey: process.env.VITE_WIDGET_SERVICE_KEY || '',
  position: 'bottom-center',
  theme: 'light',
  placeholder: 'Ask anything...',
  maxMessages: 50,
  enableWebsiteContext: true,
  customSystemPrompt: 'You are a helpful AI assistant embedded in a website. Answer questions concisely and helpfully based on the website context when available.'
}

export function AIWidget({ 
  config = {}, 
  onStateChange,
  onMessageSent,
  onError 
}: WidgetProps) {
  const [state, setState] = useState<WidgetState>('collapsed')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [websiteContext, setWebsiteContext] = useState<OptimizedContext | null>(null)
  const [isContextLoading, setIsContextLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [faviconUrl, setFaviconUrl] = useState<string | undefined>(undefined)
  const widgetRef = useRef<HTMLDivElement>(null)
  const apiClientRef = useRef<SecureAPIClient | null>(null)
  const { getWidgetWidth, getContainerPadding } = useResponsiveWidth()

  const finalConfig: WidgetConfig = { ...DEFAULT_CONFIG, ...config }
  
  // Initialize theme
  useEffect(() => {
    if (finalConfig.theme === 'auto') {
      // Simple auto theme detection
      const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(isDark ? 'dark' : 'light')
    } else {
      setTheme(finalConfig.theme || 'light')
    }
  }, [finalConfig.theme])

  // Theme toggle handler
  const handleThemeToggle = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  // Initialize website context and API client
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        console.log('🔧 Widget initialization starting...', { 
          hasEndpoint: !!finalConfig.apiEndpoint,
          endpoint: finalConfig.apiEndpoint,
          hasServiceKey: !!finalConfig.serviceKey,
          enableWebsiteContext: finalConfig.enableWebsiteContext
        })
        
        // Initialize API client
        if (finalConfig.apiEndpoint) {
          console.log('🤖 Creating Secure API client...')
          apiClientRef.current = new SecureAPIClient({
            apiEndpoint: finalConfig.apiEndpoint,
            serviceKey: finalConfig.serviceKey
          })
          console.log('✅ Secure API client created successfully')
        } else {
          console.warn('⚠️ No API endpoint provided - API client will not be initialized')
          apiClientRef.current = null
        }

        // Extract website context if enabled
        if (finalConfig.enableWebsiteContext && typeof window !== 'undefined') {
          setIsContextLoading(true)
          
          // Wait a bit for page to fully load
          setTimeout(() => {
            try {
              const rawContext = WebsiteScraper.extractContent()
              const optimizedContext = ContentOptimizer.optimize(rawContext)
              
              // Ensure context fits within token limits
              const finalContext = ContentOptimizer.validateContextSize(optimizedContext) 
                ? optimizedContext 
                : ContentOptimizer.truncateIfNeeded(optimizedContext)
              
              setWebsiteContext(finalContext)
              
              // Extract favicon URL from the context
              if (finalContext.faviconUrl) {
                setFaviconUrl(finalContext.faviconUrl)
              }
              
              console.log('Website context extracted:', finalContext)
            } catch (error) {
              console.warn('Failed to extract website context:', error)
              // Continue without context rather than failing
            } finally {
              setIsContextLoading(false)
            }
          }, 1000)
        }
      } catch (error) {
        console.error('Widget initialization error:', error)
      }
    }

    initializeWidget()
  }, [finalConfig.apiEndpoint, finalConfig.serviceKey, finalConfig.enableWebsiteContext])

  // State change handler
  const handleStateChange = useCallback((newState: WidgetState) => {
    setState(newState)
    onStateChange?.(newState)
  }, [onStateChange])

  // Error handler
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage)
    handleStateChange('error')
    onError?.(errorMessage)
    console.error('AI Widget Error:', errorMessage)
  }, [handleStateChange, onError])

  // API call using secure backend with website context
  const callAPI = async (question: string): Promise<string> => {
    console.log('🔍 API call attempted', { 
      hasClient: !!apiClientRef.current,
      question: question.substring(0, 50) + '...',
      hasWebsiteContext: !!websiteContext,
      endpoint: finalConfig.apiEndpoint
    })
    
    if (!apiClientRef.current) {
      console.error('❌ API client not initialized', {
        hasEndpoint: !!finalConfig.apiEndpoint,
        endpoint: finalConfig.apiEndpoint
      })
      throw new Error('API client not initialized. Please check your backend endpoint configuration.')
    }

    try {
      // Use secure API client with website context
      if (websiteContext && finalConfig.enableWebsiteContext) {
        return await apiClientRef.current.chat(
          question,
          websiteContext,
          messages.slice(-5)
        )
      } else {
        // Fallback: direct API call without context
        const response = await fetch(finalConfig.apiEndpoint!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(finalConfig.serviceKey && { 'Authorization': `Bearer ${finalConfig.serviceKey}` })
          },
          body: JSON.stringify({
            question,
            conversation: messages.slice(-5)
          })
        })

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }

        const data: APIResponse = await response.json()
        
        if (!data.success) {
          throw new Error(data.error?.message || 'API request failed')
        }

        if (!data.data?.answer) {
          throw new Error('No answer received from API')
        }

        return data.data.answer
      }
    } catch (error) {
      console.error('Backend API Error:', error)
      throw error
    }
  }

  // Submit question handler
  const handleSubmit = useCallback(async (question: string) => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    handleStateChange('loading')

    try {
      // Get answer from API
      const answer = await callAPI(question)

      // Create new message
      const newMessage: ChatMessage = {
        id: generateMessageId(),
        question,
        answer,
        timestamp: new Date()
      }

      // Update messages
      setMessages(prev => {
        const updated = [...prev, newMessage]
        // Limit messages if configured
        if (finalConfig.maxMessages && updated.length > finalConfig.maxMessages) {
          return updated.slice(-finalConfig.maxMessages)
        }
        return updated
      })

      // Show chat viewport
      handleStateChange('chat-visible')

      // Notify parent
      onMessageSent?.(newMessage)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      handleError(`Failed to get response: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, finalConfig, handleStateChange, handleError, onMessageSent])

  // Expand widget to show search bar
  const handleExpand = useCallback(() => {
    handleStateChange('expanded')
  }, [handleStateChange])

  // Collapse widget to button
  const handleCollapse = useCallback(() => {
    setError(null)
    handleStateChange('collapsed')
  }, [handleStateChange])

  // Position classes
  const getPositionClasses = () => {
    switch (finalConfig.position) {
      case 'bottom-left':
        return 'tw-bottom-6 tw-left-6'
      case 'bottom-right':
        return 'tw-bottom-6 tw-right-6'
      case 'bottom-center':
      default:
        return 'tw-bottom-6 tw-left-1/2 tw-transform -tw-translate-x-1/2'
    }
  }

  // Handle escape key and click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state !== 'collapsed') {
        handleCollapse()
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (
        state !== 'collapsed' && 
        widgetRef.current && 
        !widgetRef.current.contains(e.target as Node)
      ) {
        handleCollapse()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [state, handleCollapse])

  return (
    <div 
      ref={widgetRef}
      className={`tw-fixed ${getPositionClasses()} ${getContainerPadding()} tw-z-50 tw-flex tw-flex-col tw-items-center tw-transition-all tw-duration-500 tw-ease-out`}
    >
      {/* Chat Viewport - shows above morphing widget */}
      {(state === 'chat-visible' || state === 'loading') && (
        <div className={`tw-mb-4 ${getWidgetWidth()} tw-max-w-full`}>
          <ChatViewport 
            messages={messages}
            isLoading={isLoading}
            theme={theme}
          />
        </div>
      )}

      {/* Morphing Widget - handles both button and search bar states */}
      <div 
        className="tw-widget-bounce-in"
        style={{ 
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <MorphingWidget
          isExpanded={state === 'expanded' || state === 'loading' || state === 'chat-visible'}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          onSubmit={handleSubmit}
          onThemeToggle={handleThemeToggle}
          placeholder={finalConfig.placeholder}
          isLoading={isLoading}
          disabled={false}
          theme={theme}
          faviconUrl={faviconUrl}
        />
      </div>

      {/* Error State */}
      {state === 'error' && error && (
        <div className="tw-absolute tw-bottom-full tw-mb-2 tw-max-w-xs tw-p-3 tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-shadow-lg">
          <p className="tw-text-sm tw-text-red-700">{error}</p>
          <button
            onClick={handleCollapse}
            className="tw-mt-2 tw-text-xs tw-text-red-600 hover:tw-text-red-800 tw-underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}