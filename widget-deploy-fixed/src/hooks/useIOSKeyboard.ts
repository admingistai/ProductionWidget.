import { useState, useEffect, useCallback, useRef } from 'react'

export interface KeyboardLockState {
  isVisible: boolean
  height: number
  isIOS: boolean
  isLocked: boolean        // Widget locked to keyboard
  isInputFocused: boolean  // Widget-specific input focus
  lockPosition: number     // Calculated lock position
  visualViewportSupported: boolean
}

/**
 * Enhanced iOS keyboard detection with immediate locking capability
 * Provides instant response for native iOS keyboard interaction
 */
export function useIOSKeyboard() {
  const [keyboardState, setKeyboardState] = useState<KeyboardLockState>({
    isVisible: false,
    height: 0,
    isIOS: false,
    isLocked: false,
    isInputFocused: false,
    lockPosition: 24,
    visualViewportSupported: false
  })
  
  const animationFrameRef = useRef<number>()
  const isInitializedRef = useRef(false)

  // Detect iOS device
  const detectIOS = useCallback(() => {
    if (typeof window === 'undefined') return false
    
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
           /iPhone|iPad|iPod|iOS/.test(navigator.userAgent)
  }, [])

  // Check Visual Viewport API support
  const hasVisualViewportSupport = useCallback(() => {
    return typeof window !== 'undefined' && 'visualViewport' in window
  }, [])

  // Immediate keyboard height calculation - no delays
  const calculateKeyboardHeight = useCallback(() => {
    if (typeof window === 'undefined') return 0

    // Primary method: Visual Viewport API (most accurate)
    if (window.visualViewport) {
      const keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport.height)
      return keyboardHeight
    }

    // Fallback: focus-based detection
    return 0
  }, [])

  // Calculate lock position for widget
  const calculateLockPosition = useCallback((keyboardHeight: number, isInputFocused: boolean) => {
    if (isInputFocused && keyboardHeight > 50) {
      // Lock widget to keyboard top with 20px margin
      return keyboardHeight + 20
    }
    // Default position with safe area
    return 24
  }, [])

  // Immediate keyboard state update - no debouncing
  const updateKeyboardState = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const height = calculateKeyboardHeight()
      const isVisible = height > 50 // Threshold for keyboard presence
      
      setKeyboardState(prev => {
        const lockPosition = calculateLockPosition(height, prev.isInputFocused)
        const isLocked = prev.isInputFocused && isVisible
        
        return {
          ...prev,
          height,
          isVisible,
          isLocked,
          lockPosition,
        }
      })
    })
  }, [calculateKeyboardHeight, calculateLockPosition])

  // Handle input focus state changes
  const setInputFocused = useCallback((focused: boolean) => {
    setKeyboardState(prev => {
      const lockPosition = calculateLockPosition(prev.height, focused)
      const isLocked = focused && prev.isVisible
      
      return {
        ...prev,
        isInputFocused: focused,
        isLocked,
        lockPosition
      }
    })
    
    // Immediate position update on focus change
    if (focused) {
      // Small delay to allow keyboard to start animating
      setTimeout(updateKeyboardState, 50)
    } else {
      updateKeyboardState()
    }
  }, [calculateLockPosition, updateKeyboardState])

  // Initialize and set up event listeners
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return

    const isIOS = detectIOS()
    const visualViewportSupported = hasVisualViewportSupport()

    setKeyboardState(prev => ({
      ...prev,
      isIOS,
      visualViewportSupported
    }))

    isInitializedRef.current = true

    // Only set up listeners on iOS devices
    if (!isIOS) return

    // Visual Viewport API listeners (immediate response)
    if (visualViewportSupported && window.visualViewport) {
      const viewport = window.visualViewport
      
      // Use immediate updates for smooth animations
      const handleViewportResize = () => updateKeyboardState()
      const handleViewportScroll = () => updateKeyboardState()
      
      viewport.addEventListener('resize', handleViewportResize)
      viewport.addEventListener('scroll', handleViewportScroll)
      
      // Cleanup function
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
        viewport.removeEventListener('resize', handleViewportResize)
        viewport.removeEventListener('scroll', handleViewportScroll)
      }
    }

    // Fallback listeners for older iOS versions
    const handleResize = () => updateKeyboardState()
    const handleOrientationChange = () => {
      // Slight delay for orientation change completion
      setTimeout(updateKeyboardState, 300)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    // Initial state check
    updateKeyboardState()

    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [detectIOS, hasVisualViewportSupport, updateKeyboardState])

  return {
    ...keyboardState,
    setInputFocused, // Expose for direct input integration
  }
}

/**
 * Simplified hook for keyboard-adjusted positioning
 * Now uses the enhanced locking system
 */
export function useKeyboardAdjustedPosition(defaultBottom: number = 24) {
  const keyboard = useIOSKeyboard()
  
  const getBottomPosition = useCallback(() => {
    return keyboard.lockPosition
  }, [keyboard.lockPosition])

  return {
    ...keyboard,
    bottomPosition: getBottomPosition(),
    keyboardOffset: keyboard.isVisible ? keyboard.height : 0
  }
}