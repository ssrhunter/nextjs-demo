'use client';

import { useState, KeyboardEvent, ChangeEvent } from 'react';
import { useChatbot } from '@/lib/chatbot/chatbot-context';

/**
 * Props for MessageInput component
 */
interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

/**
 * MessageInput component for user text input
 * Handles message submission with Enter key and validation
 */
export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const { theme } = useChatbot();
  const [input, setInput] = useState('');

  /**
   * Handles input change
   */
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  /**
   * Validates and sends the message
   */
  const handleSend = () => {
    const trimmedInput = input.trim();
    
    // Validate: prevent empty messages
    if (!trimmedInput) {
      return;
    }

    // Send message and clear input
    onSend(trimmedInput);
    setInput('');
  };

  /**
   * Handles keyboard events
   * Enter: send message
   * Shift+Enter: new line
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter allows default behavior (new line)
  };

  return (
    <div className={`flex gap-2 p-3 md:p-4 border-t ${theme.containerBorder}`}>
      <textarea
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Type your message..."
        rows={1}
        className={`
          flex-1 resize-none rounded-lg border px-3 py-2
          text-sm md:text-base
          focus:outline-none focus:ring-2 focus:border-transparent
          ${theme.inputBorder} ${theme.inputFocusRing}
          ${disabled ? `${theme.inputDisabledBg} text-gray-500 cursor-not-allowed` : theme.inputBg}
        `}
        style={{
          minHeight: '40px',
          maxHeight: '120px',
        }}
        aria-label="Message input"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className={`
          px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-colors
          text-sm md:text-base
          min-w-[3.5rem] min-h-[2.75rem]
          ${
            disabled || !input.trim()
              ? `${theme.sendButtonDisabledBg} ${theme.sendButtonDisabledText} cursor-not-allowed`
              : `${theme.sendButtonBg} ${theme.sendButtonText} ${theme.sendButtonHover} active:opacity-90 focus:outline-none focus:ring-2 ${theme.fabRing}`
          }
        `}
        aria-label="Send message"
        type="button"
      >
        Send
      </button>
    </div>
  );
}
