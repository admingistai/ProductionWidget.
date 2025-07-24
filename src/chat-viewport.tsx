import React from 'react';
import type { ChatMessage } from './types/widget';
import { useResponsiveWidth } from './hooks/useResponsiveWidth';

interface ChatViewportProps {
  messages: ChatMessage[];
  isLoading: boolean;
  theme?: 'light' | 'dark';
}

export function ChatViewport({ messages, isLoading, theme = 'light' }: ChatViewportProps) {
  const isDark = theme === 'dark';
  const { getWidgetWidth, getChatHeight } = useResponsiveWidth();
  
  // Render chat content
  const renderChatContent = (messages: ChatMessage[], isLoading: boolean, isDark: boolean) => (
    <>
      {messages.length === 0 && !isLoading && (
        <p className={`tw-text-center tw-text-sm ${
          isDark ? 'tw-text-gray-400' : 'tw-text-gray-500'
        }`}>
          Start a conversation by asking a question below.
        </p>
      )}
      
      {messages.map((message) => (
        <div key={message.id} className="tw-mb-6">
          {/* User Question - Top, left aligned, no bubble */}
          <div className="tw-mb-3">
            <div className={`tw-text-xl tw-font-bold ${
              isDark ? 'tw-text-white' : 'tw-text-black'
            }`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
              {message.question}
            </div>
          </div>
          
          {/* AI Answer - Below question, left aligned */}
          <div>
            <div className={`tw-text-sm tw-leading-relaxed tw-font-normal ${
              isDark ? 'tw-text-gray-200' : 'tw-text-gray-700'
            }`} style={{ fontFamily: 'Work Sans, sans-serif' }}>
              <span className="tw-whitespace-pre-wrap">{message.answer}</span>
            </div>
          </div>
          
          {/* Visual separator between Q&A pairs */}
          <div className={`tw-mt-4 tw-border-b ${
            isDark ? 'tw-border-gray-600' : 'tw-border-gray-200'
          }`}></div>
        </div>
      ))}
      
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
        <div className={`tw-w-full tw-h-full tw-flex tw-flex-col tw-space-y-4 tw-p-4 tw-rounded-lg tw-shadow-lg tw-overflow-y-auto gist-chat-scroll tw-bg-white`}>
          {renderChatContent(messages, isLoading, isDark)}
        </div>
      </div>
    )
  }
  
  // Dark mode with white border
  return (
    <div className={`${getWidgetWidth()} tw-flex tw-flex-col tw-space-y-4 tw-p-4 ${getChatHeight()} tw-overflow-y-auto gist-chat-scroll tw-bg-[#1d1d1d] tw-rounded-lg tw-shadow-lg tw-border-2 tw-border-white`}>
      {renderChatContent(messages, isLoading, isDark)}
    </div>
  );
}