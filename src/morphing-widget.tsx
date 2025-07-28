"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Loader2, Sun, Moon } from 'lucide-react'
import { Image } from "./ui/image"
import { STARS_SVG_DARK_DATA_URL, STARS_SVG_LIGHT_DATA_URL, STARS_SVG_GRADIENT_DATA_URL, DEFAULT_FAVICON_DATA_URL } from './ui/svg-icons'
import { useResponsiveWidth } from './hooks/useResponsiveWidth'

interface MorphingWidgetProps {
  isExpanded: boolean
  onExpand: () => void
  onCollapse: () => void
  onSubmit: (question: string) => void
  onThemeToggle?: () => void
  onOpenHistoryModal?: () => void
  placeholder?: string
  isLoading?: boolean
  disabled?: boolean
  className?: string
  theme?: 'light' | 'dark'
  faviconUrl?: string
  hasMessages?: boolean
}

export function MorphingWidget({
  isExpanded,
  onExpand,
  onCollapse,
  onSubmit,
  onThemeToggle,
  onOpenHistoryModal,
  placeholder = "Ask anything..",
  isLoading = false,
  disabled = false,
  className = "",
  theme = 'dark',
  faviconUrl,
  hasMessages = false
}: MorphingWidgetProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const widgetElementRef = useRef<HTMLDivElement>(null)
  const { getWidgetWidth, getCollapsedWidth, ...breakpointInfo } = useResponsiveWidth()
  
  // Debug logging with dimension analysis
  useEffect(() => {
    if (widgetElementRef.current) {
      const rect = widgetElementRef.current.getBoundingClientRect();
      const computed = window.getComputedStyle(widgetElementRef.current);
      console.log('🔍 MorphingWidget Dimensions:', {
        isExpanded,
        theme,
        boundingRect: { width: rect.width, height: rect.height },
        computedStyles: {
          width: computed.width,
          height: computed.height,
          minWidth: computed.minWidth,
          minHeight: computed.minHeight,
          display: computed.display,
          overflow: computed.overflow
        },
        inlineStyles: widgetElementRef.current.style.cssText,
        className: widgetElementRef.current.className,
        responsiveClasses: {
          widgetWidth: getWidgetWidth(),
          collapsedWidth: getCollapsedWidth()
        },
        breakpointInfo: { 
          isMobile: breakpointInfo.isMobile, 
          isTablet: breakpointInfo.isTablet, 
          isDesktop: breakpointInfo.isDesktop,
          windowWidth: breakpointInfo.width
        }
      });
    }
  }, [isExpanded, theme, getWidgetWidth, getCollapsedWidth, breakpointInfo.isMobile, breakpointInfo.isTablet, breakpointInfo.isDesktop])
  
  console.log('MorphingWidget rendered:', { 
    isExpanded, 
    theme, 
    className,
    widgetWidth: getWidgetWidth(),
    collapsedWidth: getCollapsedWidth(),
    breakpointInfo: { isMobile: breakpointInfo.isMobile, isTablet: breakpointInfo.isTablet, isDesktop: breakpointInfo.isDesktop }
  })

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      // Delay focus to allow animation to complete
      setTimeout(() => {
        inputRef.current?.focus()
      }, 375)
    }
  }, [isExpanded])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    if (trimmedInput && !isLoading && !disabled) {
      onSubmit(trimmedInput)
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCollapse()
    }
  }


  const canSubmit = input.trim().length > 0 && !isLoading && !disabled

  const handleClick = () => {
    if (!isExpanded) {
      onExpand()
    }
  }

  // Theme-aware styling
  const themeClasses = {
    container: theme === 'light' 
      ? 'tw-bg-white tw-shadow-lg hover:tw-shadow-xl' 
      : 'tw-bg-[#1d1d1d] tw-border-2 tw-border-white tw-shadow-lg hover:tw-shadow-xl',
    text: theme === 'light'
      ? 'tw-text-gray-900 group-hover:tw-text-blue-600'
      : 'tw-text-white group-hover:tw-text-[#B8FFE3]',
    gradientText: 'tw-bg-gradient-to-r tw-from-[#B8FFE3] tw-to-[#C081FF] tw-bg-clip-text tw-text-transparent',
    inputText: theme === 'light'
      ? 'tw-text-gray-900 placeholder:tw-text-gray-500'
      : 'tw-text-white placeholder:tw-text-gray-400',
    glow: theme === 'light'
      ? 'tw-from-blue-600/20 tw-via-blue-600/30 tw-to-blue-600/20'
      : 'tw-from-[#B8FFE3]/20 tw-via-[#B8FFE3]/30 tw-to-[#B8FFE3]/20',
    innerGlow: theme === 'light'
      ? 'tw-from-blue-600/10 tw-to-blue-600/5'
      : 'tw-from-[#B8FFE3]/10 tw-to-[#B8FFE3]/5',
    loadingBg: theme === 'light'
      ? 'tw-bg-blue-600'
      : 'tw-bg-[#B8FFE3]',
    loadingText: theme === 'light'
      ? 'tw-text-white'
      : 'tw-text-[#1d1d1d]',
    hoverShadow: theme === 'light'
      ? 'hover:tw-shadow-[0_0_20px_rgba(37,99,235,0.3)]'
      : 'hover:tw-shadow-[0_0_20px_rgba(184,255,227,0.3)]',
    themeButton: theme === 'light'
      ? 'tw-bg-gray-100 hover:tw-bg-blue-100 tw-text-gray-600 hover:tw-text-blue-600'
      : 'tw-bg-gray-800 hover:tw-bg-[#B8FFE3]/20 tw-text-gray-400 hover:tw-text-[#B8FFE3]'
  }

  // Performance optimization classes
  const performanceClasses = 'tw-transform-gpu tw-backface-hidden tw-perspective-1000 tw-will-change-transform'
  
  // Render the actual widget content
  const renderContent = () => (
    <>
      {!isExpanded ? (
        // Collapsed Button State
        <div className="tw-flex tw-items-center tw-justify-center tw-h-full group tw-gap-2">
          {/* Stars Icon - positioned just to the left of text */}
          <div className="tw-w-5 tw-h-5 tw-max-w-[20px] tw-max-h-[20px] tw-flex-shrink-0 tw-transform-gpu group-hover:tw-scale-110 group-hover:tw-rotate-12" style={{ transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <Image
              src={STARS_SVG_GRADIENT_DATA_URL}
              alt="AI Assistant"
              width={20}
              height={20}
              className="tw-w-full tw-h-full"
            />
          </div>

          {/* Button Text */}
          <span className={`${themeClasses.text} tw-font-medium tw-text-[14px] tw-transition-colors tw-duration-200 tw-whitespace-nowrap`}>
            {placeholder.split(' ')[0] || 'Ask'}
          </span>

          {/* Favicon Icon - only show if we have a real favicon (not the transparent default) */}
          {faviconUrl && faviconUrl !== DEFAULT_FAVICON_DATA_URL && (
            <div className="tw-w-6 tw-h-6 tw-max-w-[24px] tw-max-h-[24px] tw-flex-shrink-0 tw-transform-gpu group-hover:tw-scale-110 group-hover:-tw-rotate-12" style={{ transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
              <Image
                src={faviconUrl}
                alt="Site Favicon"
                width={24}
                height={24}
                className="tw-w-full tw-h-full tw-rounded"
              />
            </div>
          )}

          {/* Enhanced glow effect on hover with GPU acceleration */}
          <div 
            className={`tw-absolute tw-inset-0 tw-rounded-full tw-bg-gradient-to-r ${themeClasses.glow} tw-opacity-0 group-hover:tw-opacity-100 tw-transform-gpu tw-scale-105 group-hover:tw-scale-100 -tw-z-10`}
            style={{
              transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity, transform',
            }}
          />
          
          {/* Subtle inner glow with smooth transition */}
          <div 
            className={`tw-absolute tw-inset-[1px] tw-rounded-full tw-bg-gradient-to-r ${themeClasses.innerGlow} tw-opacity-0 group-hover:tw-opacity-100 -tw-z-10`}
            style={{
              transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity',
            }}
          />
        </div>
      ) : (
        // Expanded Search Bar State
        <form onSubmit={handleSubmit} className="tw-flex tw-items-center tw-h-full tw-gap-2">
          {/* Stars Icon - remains visible and positioned */}
          <div 
            className={`
              tw-w-5 tw-h-5 tw-flex-shrink-0 
              tw-transform-gpu
              ${isExpanded ? 'tw-scale-100 tw-rotate-0' : 'tw-scale-110 tw-rotate-12'}
            `}
            style={{
              transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'transform',
            }}
          >
            <Image
              src={STARS_SVG_GRADIENT_DATA_URL}
              alt="AI Assistant"
              width={20}
              height={20}
              className="tw-w-full tw-h-full"
            />
          </div>

          {/* Input Field */}
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            // iOS-specific optimizations
            autoCapitalize="sentences"
            autoCorrect="on"
            autoComplete="off"
            spellCheck={true}
            className={`
              tw-flex-1 tw-border-0 tw-bg-transparent 
              focus-visible:tw-ring-0 focus-visible:tw-ring-offset-0
              ${themeClasses.inputText}
              tw-px-2 tw-py-3
              ${isExpanded ? 'tw-opacity-100' : 'tw-opacity-0'}
            `}
            style={{
              transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isExpanded ? '100ms' : '0ms',
              // Force 16px font size to prevent iOS zoom
              fontSize: '16px !important',
              lineHeight: '1.5',
              WebkitTextSizeAdjust: '100%',
              textSizeAdjust: '100%',
            }}
            maxLength={500}
          />



          {/* Theme Toggle Button */}
          {onThemeToggle && (
            <div 
              className={`
                tw-flex tw-items-center tw-justify-center tw-flex-shrink-0
                tw-transform-gpu
                ${isExpanded ? 'tw-opacity-100 tw-translate-x-0' : 'tw-opacity-0 tw-translate-x-4'}
              `}
              style={{ 
                transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                transitionDelay: isExpanded ? '125ms' : '0ms',
                willChange: 'opacity, transform',
              }}
            >
              <button
                type="button"
                onClick={onThemeToggle}
                className={`
                  tw-w-8 tw-h-8 tw-rounded-full
                  ${themeClasses.themeButton}
                  tw-transition-all tw-duration-200 tw-transform
                  hover:tw-scale-110 
                  tw-flex tw-items-center tw-justify-center
                  focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 
                  ${theme === 'light' ? 'focus:tw-ring-blue-500' : 'focus:ring-[#B8FFE3]'}
                `}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? (
                  <Moon className="tw-w-4 tw-h-4 tw-transition-transform tw-duration-200" />
                ) : (
                  <Sun className="tw-w-4 tw-h-4 tw-transition-transform tw-duration-200" />
                )}
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div 
            className={`
              tw-flex tw-items-center tw-justify-center tw-flex-shrink-0
              tw-transform-gpu
              ${isExpanded ? 'tw-opacity-100 tw-translate-x-0' : 'tw-opacity-0 tw-translate-x-4'}
            `}
            style={{ 
              transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              transitionDelay: isExpanded ? '150ms' : '0ms',
              willChange: 'opacity, transform',
            }}
          >
            {isLoading ? (
              <div className={`tw-h-9 tw-w-9 tw-rounded-full ${themeClasses.loadingBg} tw-flex tw-items-center tw-justify-center`}>
                <Loader2 className={`tw-h-4 tw-w-4 tw-animate-spin ${themeClasses.loadingText}`} />
              </div>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit}
                className={`
                  tw-transition-all tw-duration-200 tw-transform
                  ${!canSubmit ? 'tw-opacity-50 tw-cursor-not-allowed' : 'hover:tw-scale-105 tw-cursor-pointer'}
                `}
                onClick={canSubmit ? (e) => {
                  e.preventDefault();
                  handleSubmit(e);
                } : undefined}
              >
                <svg 
                  width="36" 
                  height="36" 
                  viewBox="0 0 36 36" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="tw-w-9 tw-h-9"
                >
                  <foreignObject x="-28.4231" y="-28.4231" width="92.0679" height="92.0679">
                    <div style={{backdropFilter: 'blur(14.21px)', clipPath: 'url(#bgblur_0_2220_2992_clip_path)', height: '100%', width: '100%'}}></div>
                  </foreignObject>
                  <g data-figma-bg-blur-radius="28.4231">
                    <rect x="0.374693" y="0.374693" width="34.4724" height="34.4724" rx="17.2362" fill="#343434" fillOpacity="0.3" style={{mixBlendMode: 'luminosity'}}/>
                    <rect x="0.374693" y="0.374693" width="34.4724" height="34.4724" rx="17.2362" stroke="url(#paint0_linear_2220_2992)" strokeWidth="0.749385"/>
                    <path d="M18 23V13M18 13L13 18M18 13L23 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                  <defs>
                    <clipPath id="bgblur_0_2220_2992_clip_path" tw-transform="translate(28.4231 28.4231)">
                      <rect x="0.374693" y="0.374693" width="34.4724" height="34.4724" rx="17.2362"/>
                    </clipPath>
                    <linearGradient id="paint0_linear_2220_2992" x1="-11.3953" y1="3.11412" x2="-7.63119" y2="37.9417" gradientUnits="userSpaceOnUse">
                      <stop stopColor="white" stopOpacity="0.4"/>
                      <stop offset="0.368352" stopColor="white" stopOpacity="0.5"/>
                      <stop offset="0.574372" stopColor="white" stopOpacity="0.5"/>
                      <stop offset="1" stopColor="white" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                </svg>
              </button>
            )}
          </div>
        </form>
      )}

      {/* Character count for expanded state */}
      {isExpanded && input.length > 400 && (
        <div className="tw-absolute tw-bottom-1 tw-right-14 tw-text-xs tw-text-gray-500 tw-pointer-events-none">
          {input.length}/500
        </div>
      )}
    </>
  )
  
  // Gradient border wrapper for light mode
  if (theme === 'light') {
    return (
      <div
        className={`tw-relative tw-p-[2px] tw-rounded-full ${isExpanded ? `${getWidgetWidth()} tw-h-[60px]` : `${getCollapsedWidth()} tw-h-[60px]`}`}
        style={{
          background: 'linear-gradient(to right, #608097, #CA061A)',
          transition: isExpanded 
            ? 'width 350ms cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'width 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          // Fallback dimensions to ensure visibility
          minWidth: isExpanded ? '300px' : '120px',
          height: '60px'
        }}
      >
        <div
          className={`
            tw-relative tw-overflow-hidden
            ${themeClasses.container}
            ${performanceClasses}
            tw-cursor-pointer
            tw-rounded-full
            tw-w-full tw-h-full
            
            ${isExpanded 
              ? 'tw-px-2' 
              : `tw-px-6 hover:tw-scale-[1.02] ${themeClasses.hoverShadow}`
            }
            ${className}
          `}
          style={{
            transition: 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transformOrigin: 'center',
            contain: 'layout style paint',
          }}
          onClick={!isExpanded ? handleClick : undefined}
        >
          {renderContent()}
        </div>
      </div>
    )
  }

  // Dark mode with white border
  return (
    <div
      className={`
        tw-relative tw-overflow-hidden
        ${themeClasses.container}
        ${performanceClasses}
        tw-cursor-pointer
        
        ${isExpanded 
          ? `${getWidgetWidth()} tw-h-14 tw-rounded-full tw-px-2` 
          : `${getCollapsedWidth()} tw-h-14 tw-rounded-full tw-px-6 hover:tw-scale-[1.02] ${themeClasses.hoverShadow}`
        }
        ${className}
      `}
      style={{
        transition: isExpanded 
          ? 'width 350ms cubic-bezier(0.34, 1.56, 0.64, 1), transform 350ms cubic-bezier(0.34, 1.56, 0.64, 1)'
          : 'width 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transformOrigin: 'center',
        contain: 'layout style paint',
        // Fallback dimensions to ensure visibility
        minWidth: isExpanded ? '300px' : '120px',
        height: '56px'
      }}
      onClick={!isExpanded ? handleClick : undefined}
    >
      {renderContent()}
    </div>
  )
}