'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Message, ChatbotConfig, ToolCall, ChatbotState } from './types';

/**
 * Persisted state structure with version for migration support
 */
interface PersistedChatbotState {
  messages: Message[];
  isMinimized: boolean;
  isOpen: boolean;
  version: string;
}

/**
 * Context value interface
 */
interface ChatbotContextValue {
  // State
  messages: Message[];
  isMinimized: boolean;
  isOpen: boolean;
  isLoading: boolean;
  currentToolCall: ToolCall | null;
  config: ChatbotConfig;
  
  // Actions
  addMessage: (message: Message) => void;
  toggleMinimize: () => void;
  toggleOpen: () => void;
  setLoading: (loading: boolean) => void;
  setToolCall: (toolCall: ToolCall | null) => void;
}

/**
 * Provider props
 */
interface ChatbotProviderProps {
  children: React.ReactNode;
  config: ChatbotConfig;
}

// Create context with undefined default
const ChatbotContext = createContext<ChatbotContextValue | undefined>(undefined);

// Current version for migration support
const STORAGE_VERSION = '1.0.0';
const STORAGE_KEY = 'chatbot-state';
const DEBOUNCE_DELAY = 300;

/**
 * Validates restored state data
 */
function validatePersistedState(data: any): data is PersistedChatbotState {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!Array.isArray(data.messages)) return false;
  if (typeof data.isMinimized !== 'boolean') return false;
  if (typeof data.isOpen !== 'boolean') return false;
  if (typeof data.version !== 'string') return false;
  
  // Validate messages structure
  for (const msg of data.messages) {
    if (!msg.id || !msg.role || !msg.content || typeof msg.timestamp !== 'number') {
      return false;
    }
  }
  
  return true;
}

/**
 * Restores state from localStorage
 */
function restoreState(): Partial<ChatbotState> | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Validate the data
    if (!validatePersistedState(parsed)) {
      console.warn('Invalid chatbot state in localStorage, clearing');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    
    // Handle version migration if needed
    if (parsed.version !== STORAGE_VERSION) {
      console.log('Chatbot state version mismatch, migrating');
      // For now, just update the version
      // Add migration logic here in the future if needed
    }
    
    return {
      messages: parsed.messages,
      isMinimized: parsed.isMinimized,
      isOpen: parsed.isOpen,
    };
  } catch (error) {
    console.error('Failed to restore chatbot state:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * ChatbotProvider component that manages global chatbot state
 */
export function ChatbotProvider({ children, config }: ChatbotProviderProps) {
  // Initialize state with restored values or defaults
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentToolCall, setCurrentToolCall] = useState<ToolCall | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Ref for debouncing localStorage writes
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Restore state on mount
  useEffect(() => {
    const restored = restoreState();
    if (restored) {
      if (restored.messages) setMessages(restored.messages);
      if (typeof restored.isMinimized === 'boolean') setIsMinimized(restored.isMinimized);
      if (typeof restored.isOpen === 'boolean') setIsOpen(restored.isOpen);
    }
    setIsInitialized(true);
  }, []);
  
  // Save state to localStorage with debouncing
  useEffect(() => {
    // Don't save until we've initialized (to avoid overwriting with defaults)
    if (!isInitialized) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout
    saveTimeoutRef.current = setTimeout(() => {
      if (typeof window === 'undefined') return;
      
      try {
        const stateToSave: PersistedChatbotState = {
          messages,
          isMinimized,
          isOpen,
          version: STORAGE_VERSION,
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error('Failed to save chatbot state:', error);
      }
    }, DEBOUNCE_DELAY);
    
    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, isMinimized, isOpen, isInitialized]);
  
  // Action functions
  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);
  
  const toggleMinimize = useCallback(() => {
    setIsMinimized(prev => !prev);
  }, []);
  
  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);
  
  const setLoadingCallback = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);
  
  const setToolCallCallback = useCallback((toolCall: ToolCall | null) => {
    setCurrentToolCall(toolCall);
  }, []);
  
  const contextValue: ChatbotContextValue = {
    messages,
    isMinimized,
    isOpen,
    isLoading,
    currentToolCall,
    config,
    addMessage,
    toggleMinimize,
    toggleOpen,
    setLoading: setLoadingCallback,
    setToolCall: setToolCallCallback,
  };
  
  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
    </ChatbotContext.Provider>
  );
}

/**
 * Hook to consume chatbot context
 */
export function useChatbot(): ChatbotContextValue {
  const context = useContext(ChatbotContext);
  
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  
  return context;
}
