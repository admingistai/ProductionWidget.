import React, { useMemo } from "react";
import type { ChatMessage, BorderGradient } from "./types/widget";
import { useResponsiveWidth } from "./hooks/useResponsiveWidth";
import { Search } from "lucide-react";
import { QuestionHistoryModal } from "./components/QuestionHistoryModal";

interface ChatViewportProps {
  messages: ChatMessage[];
  currentMessageIndex: number;
  isLoading: boolean;
  theme?: "light" | "dark";
  onOpenHistoryModal?: () => void;
  hasMessages: boolean;
  isHistoryModalOpen: boolean;
  onCloseHistoryModal: () => void;
  onNavigateToMessage: (index: number) => void;
  borderGradient?: BorderGradient;
}

export function ChatViewport({
  messages,
  currentMessageIndex,
  isLoading,
  theme = "light",
  onOpenHistoryModal,
  hasMessages,
  isHistoryModalOpen,
  onCloseHistoryModal,
  onNavigateToMessage,
  borderGradient,
}: ChatViewportProps) {
  const isDark = theme === "dark";
  const { getWidgetWidth, getChatHeight } = useResponsiveWidth();

  // Get current message
  const currentMessage = messages[currentMessageIndex];

  // Remove breadcrumb data - not needed anymore

  // Render chat content
  const renderChatContent = (
    currentMessage: ChatMessage | undefined,
    isLoading: boolean,
    isDark: boolean
  ) => (
    <>
      {!currentMessage && !isLoading && (
        <p
          className={`tw-text-center tw-text-sm ${
            isDark ? "tw-text-gray-400" : "tw-text-gray-500"
          }`}
        >
          Start a conversation by asking a question below.
        </p>
      )}

      {currentMessage && (
        <div className="tw-mb-6">
          {/* User Question - Top, left aligned, no bubble */}
          <div className="tw-mb-3">
            <div
              className={`tw-text-xl tw-font-bold ${
                isDark ? "tw-text-white" : "tw-text-black"
              }`}
              style={{
                fontFamily:
                  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segeo UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
              }}
            >
              {currentMessage.question}
            </div>
          </div>

          {/* AI Answer - Below question, left aligned */}
          <div>
            <div
              className={`tw-text-sm tw-leading-relaxed tw-font-normal ${
                isDark ? "tw-text-gray-200" : "tw-text-gray-700"
              }`}
              style={{
                fontFamily: "Work Sans, sans-serif",
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
              }}
            >
              <span
                className="tw-whitespace-pre-wrap"
                style={{
                  userSelect: "text",
                  WebkitUserSelect: "text",
                  MozUserSelect: "text",
                  msUserSelect: "text",
                }}
              >
                {currentMessage.answer}
              </span>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="tw-mb-6">
          <div className="tw-flex tw-items-center tw-space-x-2">
            <div className="tw-animate-pulse tw-flex tw-space-x-1">
              <div className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce"></div>
              <div
                className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="tw-w-2 tw-h-2 tw-bg-gray-400 tw-rounded-full tw-animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
            <span
              className={`tw-text-sm ${
                isDark ? "tw-text-gray-300" : "tw-text-gray-600"
              }`}
            >
              AI is thinking...
            </span>
          </div>
        </div>
      )}
    </>
  );

  // Footer component
  const renderFooter = () => (
    <div className="tw-relative tw-flex tw-justify-between tw-items-center tw-px-4 tw-py-3 tw-flex-shrink-0">
      {/* Page number - left side */}
      {messages.length > 1 ? (
        <div
          className={`tw-text-[10px] ${
            isDark ? "tw-text-gray-400" : "tw-text-gray-500"
          }`}
        >
          {currentMessageIndex + 1} of {messages.length}
        </div>
      ) : (
        <div></div>
      )}

      {/* Powered by - positioned bottom right */}
      <a
        href="https://www.gistanswers.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="tw-absolute tw-transition-opacity hover:tw-opacity-100 tw-inline-block tw-leading-none"
        style={{ bottom: "10px", right: "10px" }}
      >
        <img
          src={
            isDark
              ? "https://widget-deploy-hazel.vercel.app/poweredbygistanswers.png"
              : "https://widget-deploy-hazel.vercel.app/poweredbygistanswerslightmode.png"
          }
          alt="Powered by Gist Answers"
          style={{ height: "12px", width: "auto" }}
        />
      </a>
    </div>
  );

  // Light mode with gradient border
  if (theme === "light") {
    // Use custom gradient if provided, otherwise use default
    const gradientBackground = borderGradient
      ? `linear-gradient(${borderGradient.direction || "to bottom right"}, ${
          borderGradient.from
        } 0%, ${borderGradient.to} 100%)`
      : "linear-gradient(to right, #FFAD00 11%, #ED6142 37%, #8F7CDB 64%, #3C3C8E 90%)";

    return (
      <div
        className={`tw-relative ${getWidgetWidth()} ${getChatHeight()} tw-rounded-lg`}
        style={{
          background: gradientBackground,
          padding: borderGradient?.width || "4px",
        }}
      >
        <div
          className={`tw-relative tw-w-full tw-h-full tw-flex tw-flex-col tw-rounded-lg tw-shadow-lg tw-overflow-hidden`}
          style={{
            backgroundColor: borderGradient?.backgroundColor || "#ffffff",
          }}
        >
          {/* Main content area with scrolling */}
          <div className="tw-flex-1 tw-flex tw-flex-col tw-space-y-4 tw-p-4 tw-overflow-y-auto gist-chat-scroll">
            {/* History Modal Button - Top Right */}
            {messages.length > 1 && onOpenHistoryModal && (
              <button
                onClick={onOpenHistoryModal}
                className={`tw-absolute tw-top-2 tw-right-2 tw-z-10 tw-p-2 tw-rounded-full tw-transition-all tw-duration-200 hover:tw-scale-110 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 ${
                  theme === "light"
                    ? "tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-600 hover:tw-text-gray-800 focus:tw-ring-gray-400"
                    : "tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-gray-400 hover:tw-text-gray-200 focus:tw-ring-gray-600"
                }`}
                aria-label="View question history"
              >
                <Search className="tw-w-4 tw-h-4" />
              </button>
            )}
            {renderChatContent(currentMessage, isLoading, isDark)}
          </div>

          {/* Footer */}
          {renderFooter()}

          {/* Question History Modal - overlays only the chat viewport */}
          <QuestionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={onCloseHistoryModal}
            messages={messages}
            currentIndex={currentMessageIndex}
            onNavigate={onNavigateToMessage}
            theme={theme}
            borderGradient={borderGradient}
          />
        </div>
      </div>
    );
  }

  // Dark mode - use gradient if provided, otherwise white border
  if (borderGradient) {
    const gradientBackground = `linear-gradient(${
      borderGradient.direction || "to bottom right"
    }, ${borderGradient.from} 0%, ${borderGradient.to} 100%)`;

    return (
      <div
        className={`tw-relative ${getWidgetWidth()} ${getChatHeight()} tw-rounded-lg`}
        style={{
          background: gradientBackground,
          padding: borderGradient?.width || "4px",
        }}
      >
        <div
          className={`tw-relative tw-w-full tw-h-full tw-flex tw-flex-col tw-rounded-lg tw-shadow-lg tw-overflow-hidden`}
          style={{
            backgroundColor: borderGradient?.backgroundColor || "#1d1d1d",
          }}
        >
          {/* Main content area with scrolling */}
          <div className="tw-flex-1 tw-flex tw-flex-col tw-space-y-4 tw-p-4 tw-overflow-y-auto gist-chat-scroll">
            {/* History Modal Button - Top Right */}
            {messages.length > 1 && onOpenHistoryModal && (
              <button
                onClick={onOpenHistoryModal}
                className={`tw-absolute tw-top-2 tw-right-2 tw-z-10 tw-p-2 tw-rounded-full tw-transition-all tw-duration-200 hover:tw-scale-110 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-offset-2 ${
                  theme === "light"
                    ? "tw-bg-gray-100 hover:tw-bg-gray-200 tw-text-gray-600 hover:tw-text-gray-800 focus:tw-ring-gray-400"
                    : "tw-bg-gray-800 hover:tw-bg-gray-700 tw-text-gray-400 hover:tw-text-gray-200 focus:tw-ring-gray-600"
                }`}
                aria-label="View question history"
              >
                <Search className="tw-w-4 tw-h-4" />
              </button>
            )}
            {renderChatContent(currentMessage, isLoading, isDark)}
          </div>

          {/* Footer */}
          {renderFooter()}

          {/* Question History Modal - overlays only the chat viewport */}
          <QuestionHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={onCloseHistoryModal}
            messages={messages}
            currentIndex={currentMessageIndex}
            onNavigate={onNavigateToMessage}
            theme={theme}
            borderGradient={borderGradient}
          />
        </div>
      </div>
    );
  }

  // Dark mode with white border (fallback when no gradient provided)
  return (
    <div
      className={`tw-relative ${getWidgetWidth()} tw-flex tw-flex-col ${getChatHeight()} tw-overflow-hidden tw-bg-[#1d1d1d] tw-rounded-lg tw-shadow-lg tw-border-4 tw-border-white`}
    >
      {/* Main content area with scrolling */}
      <div className="tw-flex-1 tw-flex tw-flex-col tw-space-y-4 tw-p-4 tw-overflow-y-auto gist-chat-scroll">
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
      </div>

      {/* Footer */}
      {renderFooter()}

      {/* Question History Modal - overlays only the chat viewport */}
      <QuestionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={onCloseHistoryModal}
        messages={messages}
        currentIndex={currentMessageIndex}
        onNavigate={onNavigateToMessage}
        theme={theme}
        borderGradient={borderGradient}
      />
    </div>
  );
}
