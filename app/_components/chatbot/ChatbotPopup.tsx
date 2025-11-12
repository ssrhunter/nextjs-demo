'use client';

import { useEffect, useRef } from 'react';
import { useChatbot } from '@/lib/chatbot/chatbot-context';
import { PopupContainer } from './PopupContainer';
import { ChatbotInterface } from './ChatbotInterface';

/**
 * ChatbotPopup component - Main popup container with positioning and animations
 * 
 * Features:
 * - Fixed positioning at bottom-right of screen
 * - Slide-up/slide-down animations
 * - Responsive width and max-height constraints
 * - Proper z-index layering
 * - Keyboard navigation (Escape to close)
 * - Focus management
 * - Integrates PopupContainer and ChatbotInterface
 */
export function ChatbotPopup() {
  const { isOpen, isMinimized, toggleMinimize, toggleOpen } = useChatbot();
  const popupRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  /**
   * Handle keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close popup on Escape key
      if (e.key === 'Escape' && isOpen) {
        toggleOpen();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, toggleOpen]);

  /**
   * Manage focus when popup opens/closes
   */
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the popup container after a brief delay to allow animation
      setTimeout(() => {
        const firstFocusable = popupRef.current?.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }, 100);
    } else if (!isOpen && previousFocusRef.current) {
      // Restore focus to the previously focused element
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen, isMinimized]);

  return (
    <>
      {/* Main popup container */}
      <div
        ref={popupRef}
        role="dialog"
        aria-label="Chat assistant"
        aria-modal="true"
        aria-hidden={!isOpen}
        className={`
          fixed z-50
          transition-all duration-300 ease-in-out
          ${isOpen 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none'
          }
          ${isMinimized ? 'h-auto' : 'max-h-[80vh]'}
          
          // Mobile styles (< 768px): full width with margins
          bottom-2 left-2 right-2
          md:bottom-4 md:left-auto md:right-4
          md:w-96 md:max-w-[calc(100vw-2rem)]
          
          // Height adjustments for mobile
          ${!isMinimized && 'h-[calc(100vh-1rem)] md:h-[600px]'}
        `}
        style={{
          // Ensure smooth transitions
          transitionProperty: 'transform, opacity, height',
        }}
      >
        <PopupContainer
          isMinimized={isMinimized}
          onMinimize={toggleMinimize}
        >
          <ChatbotInterface />
        </PopupContainer>
      </div>

      {/* Floating action button to open chat when closed */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="
            fixed z-50
            bg-gradient-to-r from-blue-500 to-blue-600
            text-white rounded-full shadow-lg
            flex items-center justify-center
            hover:from-blue-600 hover:to-blue-700
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-300
            active:scale-95
            
            // Mobile: 56px touch target, bottom-right with margin
            bottom-4 right-4
            w-14 h-14 min-w-[3.5rem] min-h-[3.5rem]
          "
          aria-label="Open chat assistant"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Close button when popup is open and not minimized */}
      {isOpen && !isMinimized && (
        <button
          onClick={toggleOpen}
          className="
            fixed z-50
            bg-gray-800 text-white rounded-full shadow-md
            flex items-center justify-center
            hover:bg-gray-900
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-600
            opacity-70 hover:opacity-100
            
            // Mobile: positioned at top of popup
            right-4
            w-10 h-10 min-w-[2.75rem] min-h-[2.75rem]
          "
          style={{
            // Dynamic positioning based on viewport
            bottom: 'calc(min(100vh - 1rem, 80vh) + 0.5rem)',
          }}
          aria-label="Close chat assistant"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </>
  );
}
