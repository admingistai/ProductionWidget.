import React, { useMemo } from 'react';
import type { ChatMessage } from './types/widget';
import { useResponsiveWidth } from './hooks/useResponsiveWidth';
import { Search } from 'lucide-react';
import { QuestionHistoryModal } from './components/QuestionHistoryModal';

interface ChatViewportProps {
  messages: ChatMessage[];
  currentMessageIndex: number;
  isLoading: boolean;
  theme?: 'light' | 'dark';
  onOpenHistoryModal?: () => void;
  hasMessages: boolean;
  isHistoryModalOpen: boolean;
  onCloseHistoryModal: () => void;
  onNavigateToMessage: (index: number) => void;
}

export function ChatViewport({ messages, currentMessageIndex, isLoading, theme = 'light', onOpenHistoryModal, hasMessages, isHistoryModalOpen, onCloseHistoryModal, onNavigateToMessage }: ChatViewportProps) {
  const isDark = theme === 'dark';
  const { getWidgetWidth, getChatHeight } = useResponsiveWidth();
  
  // Get current message
  const currentMessage = messages[currentMessageIndex];
  
  // Remove breadcrumb data - not needed anymore

  // Render chat content
  const renderChatContent = (currentMessage: ChatMessage | undefined, isLoading: boolean, isDark: boolean) => (
    <>
      {!currentMessage && !isLoading && (
        <p className={`tw-text-center tw-text-sm ${
          isDark ? 'tw-text-gray-400' : 'tw-text-gray-500'
        }`}>
          Start a conversation by asking a question below.
        </p>
      )}
      
      {currentMessage && (
        <div className="tw-mb-6">
          {/* User Question - Top, left aligned, no bubble */}
          <div className="tw-mb-3">
            <div className={`tw-text-xl tw-font-bold ${
              isDark ? 'tw-text-white' : 'tw-text-black'
            }`} style={{ 
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segeo UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {currentMessage.question}
            </div>
          </div>
          
          {/* AI Answer - Below question, left aligned */}
          <div>
            <div className={`tw-text-sm tw-leading-relaxed tw-font-normal ${
              isDark ? 'tw-text-gray-200' : 'tw-text-gray-700'
            }`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
              <span className="tw-whitespace-pre-wrap">{currentMessage.answer}</span>
            </div>
          </div>
          
          {/* Show message position if there are multiple messages */}
          {messages.length > 1 && (
            <div className={`tw-mt-4 tw-text-xs tw-text-center ${
              isDark ? 'tw-text-gray-400' : 'tw-text-gray-500'
            }`}>
              {currentMessageIndex + 1} of {messages.length}
            </div>
          )}
        </div>
      )}
      
      {isLoading && (
        <div className="tw-mb-6">
          <div className="tw-flex tw-items-center tw-space-x-2">
            <div className="tw-animate-pulse tw-flex tw-space-x-1">
              <div className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce"></div>
              <div className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className={`tw-text-sm ${
              isDark ? 'tw-text-gray-300' : 'tw-text-gray-600'
            }`}>AI is thinking...</span>
          </div>
        </div>
      )}
    </>
  )
  
  // Light mode with gradient border
  if (theme === 'light') {
    return (
      <div 
        className={`tw-relative tw-p-[2px] ${getWidgetWidth()} ${getChatHeight()} tw-rounded-lg`}
        style={{ background: 'linear-gradient(to right, #608097, #CA061A)' }}
      >
        <div className={`tw-relative tw-w-full tw-h-full tw-flex tw-flex-col tw-space-y-4 tw-p-4 tw-rounded-lg tw-shadow-lg tw-overflow-y-auto gist-chat-scroll tw-bg-white`}>
          {/* History Modal Button - Top Right */}
          {messages.length > 1 && onOpenHistoryModal && (
            <button
              onClick={onOpenHistoryModal}
              className={`tw-absolute tw-top-2 tw-right-2 tw-z-10 tw-p-2 tw-rounded-full tw-transition-all tw-duration-200 hover:tw-scale-110 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 ${
                theme === 'light'
                  ? 'tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-600 hover:tw-text-gray-800 focus:tw-ring-gray-400'
                  : 'tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-gray-400 hover:tw-text-gray-200 focus:tw-ring-gray-600'
              }`}
              aria-label="View question history"
            >
              <Search className="tw-w-4 tw-h-4" />
            </button>
          )}
          {renderChatContent(currentMessage, isLoading, isDark)}
          
          {/* Question History Modal - overlays only the chat viewport */}
          <QuestionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={onCloseHistoryModal}
            messages={messages}
            currentIndex={currentMessageIndex}
            onNavigate={onNavigateToMessage}
            theme={theme}
          />
        </div>
      </div>
    )
  }
  
  // Dark mode with white border
  return (
    <div className={`tw-relative ${getWidgetWidth()} tw-flex tw-flex-col tw-space-y-4 tw-p-4 ${getChatHeight()} tw-overflow-y-auto gist-chat-scroll tw-bg-[#1d1d1d] tw-rounded-lg tw-shadow-lg tw-border-2 tw-border-white`}>
      {/* History Modal Button - Top Right */}
      {messages.length > 1 && onOpenHistoryModal && (
        <button
          onClick={onOpenHistoryModal}
          className={`tw-absolute tw-top-2 tw-right-2 tw-z-10 tw-p-2 tw-rounded-full tw-transition-all tw-duration-200 hover:tw-scale-110 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-gray-400 hover:tw-text-gray-200 focus:tw-ring-gray-600`}
          aria-label="View question history"
        >
          <Search className="tw-w-4 tw-h-4" />
        </button>
      )}
      {renderChatContent(currentMessage, isLoading, isDark)}
      
      {/* Question History Modal - overlays only the chat viewport */}
      <QuestionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={onCloseHistoryModal}
        messages={messages}
        currentIndex={currentMessageIndex}
        onNavigate={onNavigateToMessage}
        theme={theme}
      />
    </div>
  );
}