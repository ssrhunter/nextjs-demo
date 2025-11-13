'use client';

import { ChatbotProvider } from '@/lib/chatbot/chatbot-context';
import { ChatbotPopup } from './ChatbotPopup';
import { ChatbotConfig } from '@/lib/chatbot/types';
import { starTools } from '@/lib/chatbot/star-tools';

/**
 * Default chatbot configuration
 * Uses API route for secure server-side communication
 * 
 * To customize the theme, import a theme from '@/lib/chatbot/theme' and add it to the config:
 * import { greenTheme, purpleTheme } from '@/lib/chatbot/theme';
 * 
 * Then add: theme: greenTheme
 */
const defaultConfig: ChatbotConfig = {
  backend: 'api',
  apiKey: '', // Not needed for API route
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  systemPrompt: `You are a helpful AI assistant who works as a star salesman. You help customers choose the right star which will help them satisfy their energy needs. The stars provide energy similar to how solar power works.

You have access to the following tools:
- search_stars: Search the star database for information about stars by name, constellation, or properties. Use this when users ask about specific stars or want to find stars.
- navigate_to_page: Navigate users to star detail pages or the homepage. Use this when users want to view detailed information about a specific star or return to the main page.

When users ask about stars, use the search_stars tool to find relevant information. When users want to see more details or navigate to a star's page, first use search_stars to get the star's ID, then use navigate_to_page to direct them there.

Provide clear, concise, and accurate responses.`,
  tools: starTools,
  // theme: greenTheme, // Uncomment and import to use a different theme
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
