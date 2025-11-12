/**
 * Type definitions for the chatbot system
 */

/**
 * Represents a single message in the conversation
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCall?: ToolCall;
  error?: string;
}

/**
 * Configuration for the chatbot backend
 */
export interface ChatbotConfig {
  backend: 'openai' | 'local' | 'api';
  apiKey?: string; // For OpenAI (not used with 'api' backend)
  modelName: string;
  baseUrl?: string; // For local models
  temperature?: number;
  tools?: ToolDefinition[];
  systemPrompt?: string;
}

/**
 * Definition of a tool that the chatbot can call
 */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
  execute: (params: Record<string, any>) => Promise<any>;
}

/**
 * Represents a tool call made by the chatbot
 */
export interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

/**
 * The complete state of the chatbot
 */
export interface ChatbotState {
  messages: Message[];
  isMinimized: boolean;
  isOpen: boolean;
  isLoading: boolean;
  currentToolCall: ToolCall | null;
}
