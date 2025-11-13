'use client';

import React from 'react';
import { useChatbot } from '@/lib/chatbot/chatbot-context';

interface PopupContainerProps {
  isMinimized: boolean;
  onMinimize: () => void;
  children: React.ReactNode;
}

export function PopupContainer({ isMinimized, onMinimize, children }: PopupContainerProps) {
  const { theme } = useChatbot();
  
  return (
    <div className={`flex flex-col rounded-lg shadow-lg border overflow-hidden h-full ${theme.containerBg} ${theme.containerBorder}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 ${theme.headerBg} ${theme.headerText}`}>
        <h2 className="text-base md:text-lg font-semibold">Chat Assistant</h2>
        <button
          onClick={onMinimize}
          className={`flex items-center justify-center w-11 h-11 min-w-[2.75rem] min-h-[2.75rem] rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 ${theme.headerButtonHover}`}
          aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
          type="button"
        >
          {isMinimized ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Content Area - Conditionally rendered based on isMinimized */}
      {!isMinimized && (
        <div className={`flex-1 overflow-hidden ${theme.containerBg}`}>
          {children}
        </div>
      )}
    </div>
  );
}
