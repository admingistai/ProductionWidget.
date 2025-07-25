import { useState, useEffect } from 'react'
import { useIOSKeyboard } from './useIOSKeyboard'

export interface ResponsiveWidthConfig {
  mobile: string
  tablet: string
  desktop: string
}

export interface BreakpointInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
}

const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
}

/**
 * Custom hook for responsive width management
 * Returns appropriate width classes and breakpoint information
 */
export function useResponsiveWidth() {
  const [breakpointInfo, setBreakpointInfo] = useState<BreakpointInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
  })
  const keyboardState = useIOSKeyboard()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBreakpoint = () => {
      const width = window.innerWidth
      const isMobile = width < BREAKPOINTS.mobile
      const isTablet = width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet
      const isDesktop = width >= BREAKPOINTS.tablet

      setBreakpointInfo({
        isMobile,
        isTablet,
        isDesktop,
        width,
      })
    }

    // Initial check
    updateBreakpoint()

    // Listen for resize events
    window.addEventListener('resize', updateBreakpoint)
    
    return () => {
      window.removeEventListener('resize', updateBreakpoint)
    }
  }, [])

  /**
   * Get responsive width classes for the widget
   * Provides mobile-first responsive approach with keyboard awareness
   */
  const getWidgetWidth = () => {
    if (breakpointInfo.isMobile) {
      // On mobile with keyboard visible, use slightly smaller width for better fit
      if (keyboardState.isVisible && keyboardState.isIOS) {
        return 'tw-w-[calc(100vw-24px)] tw-max-w-[440px]'
      }
      return 'tw-w-[calc(100vw-32px)] tw-max-w-[460px]'
    }
    if (breakpointInfo.isTablet) {
      return 'tw-w-[calc(100vw-48px)] tw-max-w-[500px]'
    }
    return 'tw-w-[500px]'
  }

  /**
   * Get responsive width for collapsed button state
   */
  const getCollapsedWidth = () => {
    if (breakpointInfo.isMobile) {
      return 'tw-w-[100px]'
    }
    return 'tw-w-[120px]'
  }

  /**
   * Get responsive padding for the widget container
   */
  const getContainerPadding = () => {
    if (breakpointInfo.isMobile) {
      return 'tw-px-4'
    }
    if (breakpointInfo.isTablet) {
      return 'tw-px-6'
    }
    return ''
  }

  /**
   * Get responsive height for chat viewport with keyboard adjustment
   */
  const getChatHeight = () => {
    if (breakpointInfo.isMobile) {
      // Reduce height when keyboard is visible on iOS to prevent overflow
      if (keyboardState.isVisible && keyboardState.isIOS) {
        return 'tw-h-[200px]'
      }
      return 'tw-h-[250px]'
    }
    return 'tw-h-[300px]'
  }

  /**
   * Get keyboard-aware container classes
   */
  const getKeyboardAwareClasses = () => {
    const baseClasses = 'tw-transition-all tw-duration-300'
    if (keyboardState.isIOS && keyboardState.isVisible) {
      return `${baseClasses} ios-keyboard-visible`
    }
    return `${baseClasses} ios-keyboard-hidden`
  }

  return {
    ...breakpointInfo,
    getWidgetWidth,
    getCollapsedWidth,
    getContainerPadding,
    getChatHeight,
    getKeyboardAwareClasses,
    keyboardState,
  }
}