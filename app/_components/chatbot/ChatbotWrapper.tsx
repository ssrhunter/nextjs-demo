'use client';

import { ChatbotProvider } from '@/lib/chatbot/chatbot-context';
import { ChatbotPopup } from './ChatbotPopup';
import { ChatbotConfig } from '@/lib/chatbot/types';

/**
 * Default chatbot configuration
 * Uses API route for secure server-side communication
 */
const defaultConfig: ChatbotConfig = {
  backend: 'api',
  apiKey: '', // Not needed for API route
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  systemPrompt: 'You are a helpful AI assistant who works as a star salesman. You help customers choose the right star which will help them satisfy their energy needs. The stars provide energy similar to how solar power works. Provide clear, concise, and accurate responses.',
  tools: [],
};

/**
 * ChatbotWrapper component
 * 
 * Wraps the application with ChatbotProvider and renders ChatbotPopup
 * This is a client component that can be imported into the server-side layout
 */
export function ChatbotWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ChatbotProvider config={defaultConfig}>
      {children}
      <ChatbotPopup />
    </ChatbotProvider>
  );
}
