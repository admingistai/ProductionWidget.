"use client"

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { MorphingWidget } from './morphing-widget'
import { ChatViewport } from './chat-viewport'
import { WebsiteScraper } from './website-scraper'
import { ContentOptimizer } from './content-optimizer'
import { SecureAPIClient } from './secure-api-client'
import { generateMessageId } from './lib/widget-utils'
import { useResponsiveWidth } from './hooks/useResponsiveWidth'
import { useKeyboardAdjustedPosition } from './hooks/useIOSKeyboard'
// Analytics tracking for widget events
import { trackWidgetEvent, showAnalyticsStatus } from './services/analytics'
import type { WidgetState, ChatMessage, WidgetProps, WidgetConfig, APIResponse, OptimizedContext } from './types/widget'

const DEFAULT_CONFIG: WidgetConfig = {
  apiEndpoint: import.meta.env.VITE_WIDGET_API_ENDPOINT || 'https://attemptnumberwhatever-ekpwcd6xz-pro-rata.vercel.app/api/simple-chat',
  serviceKey: import.meta.env.VITE_WIDGET_SERVICE_KEY || '',
  position: 'bottom-center',
  theme: 'light',
  placeholder: 'Ask anything...',
  maxMessages: 50,
  enableWebsiteContext: true,
  customSystemPrompt: undefined // Let ContentOptimizer use the standardized template
}

export function AIWidget({ 
  config = {}, 
  onStateChange,
  onMessageSent,
  onError 
}: WidgetProps) {
  const [state, setState] = useState<WidgetState>('collapsed')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [websiteContext, setWebsiteContext] = useState<OptimizedContext | null>(null)
  const [isContextLoading, setIsContextLoading] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [faviconUrl, setFaviconUrl] = useState<string | undefined>(undefined)
  const [shouldClearInput, setShouldClearInput] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)
  const apiClientRef = useRef<SecureAPIClient | null>(null)
  const { getWidgetWidth, getContainerPadding, isMobile } = useResponsiveWidth()
  const keyboard = useKeyboardAdjustedPosition(100) // 100px default bottom position on mobile

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

  // History modal handlers
  const handleOpenHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(true)
  }, [])

  const handleCloseHistoryModal = useCallback(() => {
    setIsHistoryModalOpen(false)
  }, [])

  // Navigate to specific message
  const handleNavigateToMessage = useCallback((index: number) => {
    if (index >= 0 && index < messages.length) {
      setCurrentMessageIndex(index)
    }
  }, [messages.length])

  // Initialize website context and API client
  useEffect(() => {
    const initializeWidget = async () => {
      try {
        // console.log('🔧 Widget initialization starting...', { 
        //   hasEndpoint: !!finalConfig.apiEndpoint,
        //   endpoint: finalConfig.apiEndpoint,
        //   hasServiceKey: !!finalConfig.serviceKey,
        //   enableWebsiteContext: finalConfig.enableWebsiteContext
        // })
        
        // Extract favicon immediately for better UX
        if (typeof window !== 'undefined') {
          try {
            const initialFavicon = WebsiteScraper.extractFaviconOnly()
            if (initialFavicon) {
              setFaviconUrl(initialFavicon)
              // console.log('🎨 Initial favicon extracted:', initialFavicon)
            }
          } catch (error) {
            // console.warn('Failed to extract initial favicon:', error)
          }
        }
        
        // Initialize API client
        if (finalConfig.apiEndpoint) {
          // console.log('🤖 Creating Secure API client...')
          apiClientRef.current = new SecureAPIClient({
            apiEndpoint: finalConfig.apiEndpoint,
            serviceKey: finalConfig.serviceKey
          })
          // console.log('✅ Secure API client created successfully')
        } else {
          // console.warn('⚠️ No API endpoint provided - API client will not be initialized')
          apiClientRef.current = null
        }

        // Extract website context if enabled
        if (finalConfig.enableWebsiteContext && typeof window !== 'undefined') {
          setIsContextLoading(true)
          
          let extractionAttempts = 0
          const maxAttempts = 3
          const minContentLength = 500 // Minimum chars to consider content meaningful
          let observer: MutationObserver | null = null
          
          const attemptExtraction = () => {
            extractionAttempts++
            // console.log(`🔍 Attempting content extraction (attempt ${extractionAttempts}/${maxAttempts})...`)
            
            try {
              const rawContext = WebsiteScraper.extractContent()
              const contentLength = rawContext.content.length
              // console.log(`📊 Extracted content length: ${contentLength} characters`)
              
              // Check if we have meaningful content
              if (contentLength < minContentLength && extractionAttempts < maxAttempts) {
                // console.log('⏳ Content seems incomplete, waiting for more...')
                
                // Set up MutationObserver if not already done
                if (!observer && extractionAttempts === 1) {
                  // console.log('👁️ Setting up MutationObserver for dynamic content...')
                  observer = new MutationObserver((mutations) => {
                    // Check if significant content was added
                    const hasSignificantChanges = mutations.some(mutation => {
                      return mutation.addedNodes.length > 0 && 
                             Array.from(mutation.addedNodes).some(node => 
                               node.nodeType === Node.ELEMENT_NODE || 
                               (node.nodeType === Node.TEXT_NODE && (node.textContent?.trim()?.length || 0) > 50)
                             )
                    })
                    
                    if (hasSignificantChanges) {
                      // console.log('🔄 Detected DOM changes, re-attempting extraction...')
                      observer?.disconnect()
                      attemptExtraction()
                    }
                  })
                  
                  // Start observing
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    characterData: true
                  })
                  
                  // Also set a timeout for next attempt
                  setTimeout(() => {
                    if (observer) {
                      observer.disconnect()
                      attemptExtraction()
                    }
                  }, 2000)
                }
                return
              }
              
              // We have content or reached max attempts
              if (observer) {
                observer.disconnect()
                observer = null
              }
              
              const optimizedContext = ContentOptimizer.optimize(rawContext)
              
              // Ensure context fits within token limits
              const finalContext = ContentOptimizer.validateContextSize(optimizedContext) 
                ? optimizedContext 
                : ContentOptimizer.truncateIfNeeded(optimizedContext)
              
              setWebsiteContext(finalContext)
              
              // Update favicon only if we get a better one from full context extraction
              if (rawContext.faviconUrl && (!faviconUrl || rawContext.faviconUrl !== faviconUrl)) {
                setFaviconUrl(rawContext.faviconUrl)
                // console.log('🎨 Updated favicon from context:', rawContext.faviconUrl)
              }
              
              // console.log('✅ Website context extracted successfully:', {
              //   contentLength,
              //   summaryLength: finalContext.summary.length,
              //   keyFeatures: finalContext.keyFeatures.length
              // })
            } catch (error) {
              // console.warn('Failed to extract website context:', error)
              // Continue without context rather than failing
            } finally {
              if (extractionAttempts >= maxAttempts || observer === null) {
                setIsContextLoading(false)
              }
            }
          }
          
          // Initial attempt after short delay
          setTimeout(attemptExtraction, 1000)
        }
        
        // Track widget mounted event
        trackWidgetEvent.mounted({
          has_api_endpoint: !!finalConfig.apiEndpoint,
          has_service_key: !!finalConfig.serviceKey,
          website_context_enabled: finalConfig.enableWebsiteContext,
          theme: theme,
          position: finalConfig.position,
          max_messages: finalConfig.maxMessages,
        })
        
      } catch (error) {
        // console.error('Widget initialization error:', error)
        trackWidgetEvent.error(error instanceof Error ? error.message : 'Widget initialization failed', {
          error_type: 'initialization_error',
          has_api_endpoint: !!finalConfig.apiEndpoint,
          has_service_key: !!finalConfig.serviceKey,
        })
      }
    }

    initializeWidget()
  }, [finalConfig.apiEndpoint, finalConfig.serviceKey, finalConfig.enableWebsiteContext, theme, finalConfig.position, finalConfig.maxMessages])

  // Add debug helper to global window object for developers
  useEffect(() => {
    if (typeof window !== 'undefined' && import.meta.env.NODE_ENV === 'development') {
      (window as any).showWidgetAnalytics = showAnalyticsStatus
      // console.log('🔧 [DEBUG] Use window.showWidgetAnalytics() to check analytics status')
    }
  }, [])

  // Reset clearInput flag after a brief delay to ensure it's processed
  useEffect(() => {
    if (shouldClearInput) {
      const timer = setTimeout(() => {
        setShouldClearInput(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouldClearInput])

  // State change handler
  const handleStateChange = useCallback((newState: WidgetState) => {
    setState(newState)
    onStateChange?.(newState)
  }, [onStateChange])

  // Error handler
  const handleError = useCallback((errorMessage: string) => {
    trackWidgetEvent.error(errorMessage, {
      error_type: 'widget_error',
      current_state: state,
      has_messages: messages.length > 0,
      conversation_length: messages.length,
      theme: theme,
    })
    setError(errorMessage)
    handleStateChange('error')
    onError?.(errorMessage)
    // console.error('AI Widget Error:', errorMessage)
  }, [handleStateChange, onError, state, messages.length, theme])

  // API call using secure backend with website context
  const callAPI = async (question: string): Promise<string> => {
    // console.log('🔍 API call attempted', { 
    //   hasClient: !!apiClientRef.current,
    //   question: question.substring(0, 50) + '...',
    //   hasWebsiteContext: !!websiteContext,
    //   endpoint: finalConfig.apiEndpoint
    // })
    
    if (!apiClientRef.current) {
      // console.error('❌ API client not initialized', {
      //   hasEndpoint: !!finalConfig.apiEndpoint,
      //   endpoint: finalConfig.apiEndpoint
      // })
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
      // console.error('Backend API Error:', error)
      throw error
    }
  }

  // Submit question handler
  const handleSubmit = useCallback(async (question: string) => {
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setShouldClearInput(false) // Reset clear flag
    handleStateChange('loading')

    // Track message sent event
    trackWidgetEvent.messageSent({
      question_length: question.length,
      has_website_context: !!websiteContext,
      conversation_length: messages.length,
      message_id: generateMessageId(),
    })

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

      // Track message received event
      trackWidgetEvent.messageReceived({
        answer_length: answer.length,
        question_length: question.length,
        response_time_ms: Date.now() - newMessage.timestamp.getTime(),
        has_website_context: !!websiteContext,
        conversation_length: messages.length + 1,
        message_id: newMessage.id,
      })

      // Update messages
      setMessages(prev => {
        const updated = [...prev, newMessage]
        // Limit messages if configured
        if (finalConfig.maxMessages && updated.length > finalConfig.maxMessages) {
          const sliced = updated.slice(-finalConfig.maxMessages)
          // Update current message index to the latest message
          setCurrentMessageIndex(sliced.length - 1)
          return sliced
        }
        // Update current message index to the latest message
        setCurrentMessageIndex(updated.length - 1)
        return updated
      })

      // Show chat viewport
      handleStateChange('chat-visible')
      
      // Clear input after successful submission
      setShouldClearInput(true)

      // Notify parent
      onMessageSent?.(newMessage)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      
      // Track error event
      trackWidgetEvent.error(errorMessage, {
        error_type: 'api_call_failed',
        question_length: question.length,
        has_website_context: !!websiteContext,
        conversation_length: messages.length,
        endpoint: finalConfig.apiEndpoint,
      })
      
      // On error, keep the widget in expanded state so user can retry
      handleStateChange('expanded')
      handleError(`Failed to get response: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, finalConfig, handleStateChange, handleError, onMessageSent, websiteContext])

  // Expand widget to show search bar
  const handleExpand = useCallback(() => {
    trackWidgetEvent.expanded({
      conversation_length: messages.length,
      has_messages: messages.length > 0,
      theme: theme,
      current_state: state,
    })
    handleStateChange('expanded')
  }, [handleStateChange, messages.length, theme, state])

  // Collapse widget to button
  const handleCollapse = useCallback(() => {
    trackWidgetEvent.collapsed({
      conversation_length: messages.length,
      has_messages: messages.length > 0,
      theme: theme,
      previous_state: state,
      session_duration_ms: Date.now() - (messages[0]?.timestamp.getTime() || Date.now()),
    })
    setError(null)
    setIsHistoryModalOpen(false)  // Close history modal when collapsing
    handleStateChange('collapsed')
  }, [handleStateChange, messages, theme, state])

  // Position styles with consistent transform-based positioning
  const getPositionStyles = () => {
    // For mobile, handle in getBottomStyle
    if (isMobile) {
      return {}
    }
    
    // Always use left: 50% as base, adjust with transform
    const baseStyle = {
      left: '50%',
      transition: 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }
    
    // When widget is expanded, center it
    if (isWidgetExpanded) {
      return {
        ...baseStyle,
        transform: 'translateX(-50%)'
      }
    }
    
    // When collapsed, position based on configuration
    const position = finalConfig?.position || 'bottom-center'
    
    switch (position) {
      case 'bottom-left':
        // Move to left: from center (-50%) to left edge with margin
        return {
          ...baseStyle,
          transform: 'translateX(calc(-50vw + 84px))' // Half viewport - half widget - margin
        }
      case 'bottom-right':
        // Move to right: from center (-50%) to right edge with margin
        return {
          ...baseStyle,
          transform: 'translateX(calc(50vw - 84px))' // Half viewport - half widget - margin
        }
      case 'bottom-center':
      default:
        // Stay centered
        return {
          ...baseStyle,
          transform: 'translateX(-50%)'
        }
    }
  }

  // Get keyboard-aware positioning
  const getBottomStyle = (isMobile: boolean) => {
    if (isMobile) {
      // Mobile: fixed bottom positioning that doesn't move with keyboard
      return {
        bottom: `${keyboard.bottomPosition}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50
      }
    } else {
      // Desktop: normal bottom positioning
      return {
        bottom: '20px',
        zIndex: 50
      }
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

  // Determine if widget is in expanded state
  const isWidgetExpanded = state === 'expanded' || state === 'loading' || state === 'chat-visible'

  // Debug logging with dimension analysis
  useEffect(() => {
    if (widgetRef.current) {
      const rect = widgetRef.current.getBoundingClientRect();
      const computed = window.getComputedStyle(widgetRef.current);
      // console.log('🔍 AIWidget Dimensions:', {
      //   state,
      //   isWidgetExpanded,
      //   boundingRect: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
      //   computedStyles: {
      //     width: computed.width,
      //     height: computed.height,
      //     minWidth: computed.minWidth,
      //     minHeight: computed.minHeight,
      //     display: computed.display,
      //     position: computed.position,
      //     visibility: computed.visibility,
      //     opacity: computed.opacity
      //   },
      //   inlineStyles: widgetRef.current.style.cssText,
      //   className: widgetRef.current.className
      // });
      
      // Log all children dimensions
      Array.from(widgetRef.current.children).forEach((child, index) => {
        const childRect = child.getBoundingClientRect();
        const childComputed = window.getComputedStyle(child);
        // console.log(`🔍 AIWidget Child ${index}:`, {
        //   tagName: child.tagName,
        //   className: child.className,
        //   boundingRect: { width: childRect.width, height: childRect.height },
        //   computedStyles: {
        //     width: childComputed.width,
        //     height: childComputed.height,
        //     display: childComputed.display
        //   }
        // });
      });
    }
  }, [state, isWidgetExpanded])
  
  // console.log('AIWidget state:', { state, isWidgetExpanded })

  return (
    <>
      <div 
        ref={widgetRef}
        className="tw-fixed tw-z-50"
        style={{ 
          ...getBottomStyle(isMobile),
          ...getPositionStyles(),
          // Fallback dimensions to ensure visibility
          minWidth: '120px',
          minHeight: '60px'
        }}
      >
      {/* Chat Viewport - positioned absolutely relative to widget center with natural sizing */}
      {(state === 'chat-visible' || state === 'loading') && (
        <div 
          className="tw-absolute tw-bottom-full tw-mb-4"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: '300px',
            maxWidth: '90vw',
            width: 'max-content'
          }}
        >
          <ChatViewport 
            messages={messages}
            currentMessageIndex={currentMessageIndex}
            isLoading={isLoading}
            theme={theme}
            onOpenHistoryModal={handleOpenHistoryModal}
            hasMessages={messages.length > 0}
            isHistoryModalOpen={isHistoryModalOpen}
            onCloseHistoryModal={handleCloseHistoryModal}
            onNavigateToMessage={handleNavigateToMessage}
            borderGradient={finalConfig.borderGradient}
          />
        </div>
      )}

      {/* Morphing Widget - handles both button and search bar states, with container padding */}
      <div 
        className={`tw-widget-bounce-in ${getContainerPadding(isWidgetExpanded)}`}
        style={{ 
          transform: 'translateZ(0)' // Force hardware acceleration
        }}
      >
        <MorphingWidget
          isExpanded={isWidgetExpanded}
          onExpand={handleExpand}
          onCollapse={handleCollapse}
          onSubmit={handleSubmit}
          onThemeToggle={finalConfig.borderGradient?.backgroundColor ? undefined : handleThemeToggle}
          onOpenHistoryModal={handleOpenHistoryModal}
          placeholder={finalConfig.placeholder}
          isLoading={isLoading}
          disabled={false}
          theme={theme}
          faviconUrl={faviconUrl}
          hasMessages={messages.length > 0}
          clearInput={shouldClearInput}
          borderColor={finalConfig.borderColor}
          borderGradient={finalConfig.borderGradient}
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
    </>
  )
}