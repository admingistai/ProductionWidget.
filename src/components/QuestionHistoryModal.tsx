'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ChatMessage } from '../types/widget';

interface QuestionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  theme?: 'light' | 'dark';
}

export const QuestionHistoryModal: React.FC<QuestionHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  currentIndex,
  onNavigate,
  theme = 'dark',
}) => {
  // Local state for carousel navigation
  const [carouselIndex, setCarouselIndex] = useState(currentIndex);

  // Sync carousel index with current index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCarouselIndex(currentIndex);
    }
  }, [isOpen, currentIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        setCarouselIndex(prev => prev > 0 ? prev - 1 : messages.length - 1);
        break;
      case 'ArrowRight':
        setCarouselIndex(prev => prev < messages.length - 1 ? prev + 1 : 0);
        break;
    }
  }, [isOpen, onClose, messages.length]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    setCarouselIndex(prev => prev > 0 ? prev - 1 : messages.length - 1);
  }, [messages.length]);

  const handleNext = useCallback(() => {
    setCarouselIndex(prev => prev < messages.length - 1 ? prev + 1 : 0);
  }, [messages.length]);

  // Handle question selection
  const handleGoToQuestion = useCallback(() => {
    onNavigate(carouselIndex);
    onClose();
  }, [carouselIndex, onNavigate, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Theme-based styling
  const isDark = theme === 'dark';
  const themeStyles = {
    backdrop: isDark 
      ? 'rgba(0, 0, 0, 0.7)' 
      : 'rgba(0, 0, 0, 0.5)',
    modalBg: isDark 
      ? 'rgba(26, 26, 26, 0.95)' 
      : 'rgba(255, 255, 255, 0.95)',
    border: isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    text: isDark 
      ? '#ffffff' 
      : '#000000',
    cardBg: isDark 
      ? 'rgba(255, 255, 255, 0.05)' 
      : 'rgba(0, 0, 0, 0.03)',
    navButton: isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    navButtonHover: isDark 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)',
    numberBg: isDark 
      ? 'linear-gradient(to right, #B8FFE3, #C081FF)' 
      : 'linear-gradient(to right, #608097, #CA061A)',
    closeButtonBg: isDark 
      ? 'rgba(255, 255, 255, 0.1)' 
      : 'rgba(0, 0, 0, 0.1)',
    closeButtonHoverBg: isDark 
      ? 'rgba(255, 255, 255, 0.2)' 
      : 'rgba(0, 0, 0, 0.2)',
    shadowColor: isDark 
      ? 'rgba(0, 0, 0, 0.5)' 
      : 'rgba(0, 0, 0, 0.3)',
  };

  const currentMessage = messages[carouselIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-p-4"
          style={{
            zIndex: 10, // Reduced from 2147483640
            backgroundColor: themeStyles.backdrop,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
        >
          {/* Modal Container - Fixed height */}
          <motion.div
            className="tw-relative tw-w-full tw-max-w-md tw-h-80 tw-rounded-2xl tw-shadow-2xl tw-flex tw-flex-col"
            style={{
              background: themeStyles.modalBg,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid ${themeStyles.border}`,
              boxShadow: `
                0 20px 60px 0 ${themeStyles.shadowColor},
                inset 0 0 0 1px rgba(255, 255, 255, 0.05),
                inset 0 1px 0 0 rgba(255, 255, 255, 0.1)
              `
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="tw-flex tw-items-center tw-justify-between tw-p-6 tw-pb-4">
              <h3 
                className="tw-text-lg tw-font-medium"
                style={{ 
                  color: themeStyles.text,
                  fontFamily: 'Work Sans, sans-serif'
                }}
              >
                Question History
              </h3>
              <button
                onClick={onClose}
                className="tw-w-8 tw-h-8 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-transition-all tw-duration-150 hover:tw-scale-105"
                style={{
                  background: themeStyles.closeButtonBg,
                  color: themeStyles.text
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = themeStyles.closeButtonHoverBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = themeStyles.closeButtonBg;
                }}
              >
                ×
              </button>
            </div>

            {/* Carousel Content Area */}
            <div className="tw-flex-1 tw-px-6 tw-pb-4 tw-overflow-hidden">
              {messages.length === 0 ? (
                <div className="tw-flex tw-items-center tw-justify-center tw-h-full">
                  <p 
                    className="tw-text-sm"
                    style={{ color: `${themeStyles.text}80` }}
                  >
                    No questions yet. Start a conversation!
                  </p>
                </div>
              ) : (
                <div className="tw-relative tw-h-full">
                  {/* Question Card with Fade Transition */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={carouselIndex}
                      className="tw-absolute tw-inset-0 tw-p-4 tw-rounded-lg"
                      style={{ background: themeStyles.cardBg }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      {/* Question Number Badge */}
                      <div 
                        className="tw-inline-flex tw-items-center tw-justify-center tw-w-8 tw-h-8 tw-rounded-full tw-mb-3"
                        style={{
                          background: themeStyles.numberBg,
                          color: isDark ? '#000' : '#fff'
                        }}
                      >
                        <span className="tw-text-sm tw-font-bold">{carouselIndex + 1}</span>
                      </div>

                      {/* Question Text with ellipsis truncation */}
                      <p 
                        className="tw-text-base tw-leading-relaxed"
                        style={{ 
                          color: themeStyles.text,
                          fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segeo UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {currentMessage?.question}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            {messages.length > 0 && (
              <div className="tw-px-6 tw-pb-6 tw-space-y-4">
                {/* Progress Indicator */}
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={messages.length <= 1}
                    className="tw-p-2 tw-rounded-full tw-transition-all tw-duration-150 hover:tw-scale-110 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                    style={{
                      background: themeStyles.navButton,
                      color: themeStyles.text
                    }}
                    onMouseEnter={(e) => {
                      if (messages.length > 1) {
                        e.currentTarget.style.background = themeStyles.navButtonHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = themeStyles.navButton;
                    }}
                  >
                    <ChevronLeft className="tw-w-4 tw-h-4" />
                  </button>

                  <span 
                    className="tw-text-sm tw-min-w-[60px] tw-text-center"
                    style={{ color: `${themeStyles.text}80` }}
                  >
                    {carouselIndex + 1} of {messages.length}
                  </span>

                  <button
                    onClick={handleNext}
                    disabled={messages.length <= 1}
                    className="tw-p-2 tw-rounded-full tw-transition-all tw-duration-150 hover:tw-scale-110 disabled:tw-opacity-50 disabled:tw-cursor-not-allowed"
                    style={{
                      background: themeStyles.navButton,
                      color: themeStyles.text
                    }}
                    onMouseEnter={(e) => {
                      if (messages.length > 1) {
                        e.currentTarget.style.background = themeStyles.navButtonHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = themeStyles.navButton;
                    }}
                  >
                    <ChevronRight className="tw-w-4 tw-h-4" />
                  </button>
                </div>

                {/* Dot Indicators */}
                <div className="tw-flex tw-items-center tw-justify-center tw-gap-1">
                  {messages.map((_, index) => (
                    <motion.div
                      key={index}
                      className="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-transition-all tw-duration-200"
                      style={{
                        background: index === carouselIndex 
                          ? themeStyles.numberBg
                          : `${themeStyles.text}30`
                      }}
                      animate={{
                        scale: index === carouselIndex ? 1.2 : 1
                      }}
                    />
                  ))}
                </div>

                {/* Go to Question Button */}
                <motion.button
                  onClick={handleGoToQuestion}
                  className="tw-w-full tw-py-3 tw-rounded-lg tw-font-medium tw-transition-all tw-duration-150"
                  style={{
                    background: carouselIndex === currentIndex 
                      ? `${themeStyles.text}10`
                      : themeStyles.numberBg,
                    color: carouselIndex === currentIndex 
                      ? themeStyles.text
                      : isDark ? '#000' : '#fff',
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={carouselIndex === currentIndex}
                >
                  {carouselIndex === currentIndex ? 'Currently Viewing' : 'Go to Question'}
                </motion.button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};