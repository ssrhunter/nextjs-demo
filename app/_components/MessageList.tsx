'use client';

import { useEffect, useRef } from 'react';
import { Message, ToolCall } from '@/lib/chatbot/types';
import { useChatbot } from '@/lib/chatbot/chatbot-context';

/**
 * Props for MessageList component
 */
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  currentToolCall: ToolCall | null;
}

/**
 * MessageList component displays conversation history with auto-scroll
 * Handles user/assistant message styling, timestamps, loading states, and tool calls
 */
export function MessageList({ messages, isLoading, currentToolCall }: MessageListProps) {
  const { theme } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, currentToolCall]);

  /**
   * Format timestamp to readable date/time
   */
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return timeString;
    }

    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeString}`;
  };

  return (
    <div 
      className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4"
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${
            message.role === 'user' ? 'items-end' : 'items-start'
          }`}
          role="article"
          aria-label={`${message.role === 'user' ? 'Your' : 'Assistant'} message`}
        >
          {/* Message bubble */}
          <div
            className={`
              max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 md:px-4 md:py-2 break-words
              text-sm md:text-base
              ${
                message.role === 'user'
                  ? `${theme.userMessageBg} ${theme.userMessageText}`
                  : message.role === 'tool'
                  ? `${theme.toolMessageBg} ${theme.toolMessageText} border ${theme.toolMessageBorder}`
                  : message.error
                  ? `${theme.errorMessageBg} ${theme.errorMessageText} border ${theme.errorMessageBorder}`
                  : `${theme.assistantMessageBg} ${theme.assistantMessageText}`
              }
            `}
          >
            {/* Tool call indicator */}
            {message.toolCall && (
              <div className="mb-2 pb-2 border-b border-purple-300">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-purple-600">🔧</span>
                  <span>Tool: {message.toolCall.name}</span>
                  <span
                    className={`
                      px-2 py-0.5 rounded text-xs
                      ${
                        message.toolCall.status === 'completed'
                          ? 'bg-green-200 text-green-800'
                          : message.toolCall.status === 'failed'
                          ? 'bg-red-200 text-red-800'
                          : message.toolCall.status === 'executing'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                      }
                    `}
                  >
                    {message.toolCall.status}
                  </span>
                </div>
                {message.toolCall.error && (
                  <div className="mt-1 text-xs text-red-700">
                    Error: {message.toolCall.error}
                  </div>
                )}
              </div>
            )}

            {/* Message content */}
            <div className="whitespace-pre-wrap">{message.content}</div>

            {/* Error display */}
            {message.error && !message.toolCall && (
              <div className="mt-2 pt-2 border-t border-red-300 text-sm">
                <span className="font-medium">Error:</span> {message.error}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div className={`text-[0.65rem] md:text-xs mt-1 px-1 ${theme.timestampText}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-start" role="status" aria-live="polite" aria-label="Assistant is thinking">
          <div className={`${theme.assistantMessageBg} rounded-lg px-3 py-2.5 md:px-4 md:py-3`}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1" aria-hidden="true">
                <span className={`w-2 h-2 ${theme.loadingDotBg} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                <span className={`w-2 h-2 ${theme.loadingDotBg} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                <span className={`w-2 h-2 ${theme.loadingDotBg} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
              <span className={`text-xs md:text-sm ${theme.loadingText}`}>Thinking...</span>
            </div>
          </div>
        </div>
      )}

      {/* Tool call indicator (when tool is executing) */}
      {currentToolCall && currentToolCall.status === 'executing' && (
        <div 
          className="flex items-start" 
          role="status" 
          aria-live="polite" 
          aria-label={`Executing tool: ${currentToolCall.name}`}
        >
          <div className="bg-purple-100 border border-purple-300 rounded-lg px-3 py-2.5 md:px-4 md:py-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" 
                aria-hidden="true"
              />
              <span className="text-xs md:text-sm text-purple-950 font-medium">
                Executing tool: {currentToolCall.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}
