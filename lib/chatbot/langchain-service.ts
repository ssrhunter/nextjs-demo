/**
 * LangChainService - Service layer for LangChain integration
 * Handles backend initialization, message processing, and tool execution
 */

import { ChatOpenAI } from '@langchain/openai';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import type { ChatbotConfig, Message, ToolDefinition } from './types';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

/**
 * Error types for better error handling
 */
export enum ErrorType {
  CONFIGURATION = 'configuration',
  NETWORK = 'network',
  STREAMING = 'streaming',
  TOOL_EXECUTION = 'tool_execution',
  UNKNOWN = 'unknown',
}

/**
 * Custom error class for LangChain service errors
 */
export class LangChainServiceError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'LangChainServiceError';
  }
}

/**
 * Formats error messages for user display
 */
export function formatErrorMessage(error: Error | LangChainServiceError): string {
  if (error instanceof LangChainServiceError) {
    switch (error.type) {
      case ErrorType.CONFIGURATION:
        return `Configuration Error: ${error.message}`;
      case ErrorType.NETWORK:
        return `Network Error: Unable to connect to the chatbot service. Please check your connection and try again.`;
      case ErrorType.STREAMING:
        return `Streaming Error: The response was interrupted. Please try again.`;
      case ErrorType.TOOL_EXECUTION:
        return `Tool Error: ${error.message}`;
      default:
        return `Error: ${error.message}`;
    }
  }
  return `Error: ${error.message}`;
}

/**
 * Service class for managing LangChain interactions
 */
export class LangChainService {
  private config: ChatbotConfig;
  private model: BaseChatModel | null = null;
  private tools: DynamicStructuredTool[] = [];

  constructor(config: ChatbotConfig) {
    this.config = config;
    this.validateConfig();
    this.initializeChain();
  }

  /**
   * Validates the chatbot configuration
   * @throws LangChainServiceError if configuration is invalid
   */
  private validateConfig(): void {
    try {
      if (!this.config.backend) {
        throw new LangChainServiceError(
          'Backend type is required',
          ErrorType.CONFIGURATION
        );
      }

      if (!this.config.modelName) {
        throw new LangChainServiceError(
          'Model name is required',
          ErrorType.CONFIGURATION
        );
      }

      if (this.config.backend === 'openai' && !this.config.apiKey) {
        throw new LangChainServiceError(
          'API key is required for OpenAI backend',
          ErrorType.CONFIGURATION
        );
      }

      if (this.config.backend === 'local' && !this.config.baseUrl) {
        throw new LangChainServiceError(
          'Base URL is required for local backend',
          ErrorType.CONFIGURATION
        );
      }

      if (!['openai', 'local'].includes(this.config.backend)) {
        throw new LangChainServiceError(
          `Unsupported backend type "${this.config.backend}"`,
          ErrorType.CONFIGURATION
        );
      }
    } catch (error) {
      console.error('Configuration validation failed:', error);
      throw error;
    }
  }

  /**
   * Initializes the LangChain instance based on backend configuration
   * @throws LangChainServiceError if initialization fails
   */
  private initializeChain(): void {
    try {
      // Initialize the appropriate chat model based on backend type
      if (this.config.backend === 'openai') {
        this.model = new ChatOpenAI({
          openAIApiKey: this.config.apiKey,
          modelName: this.config.modelName,
          temperature: this.config.temperature ?? 0.7,
          streaming: true,
        });
      } else if (this.config.backend === 'local') {
        // For local models, we'll use a placeholder that can be extended
        // Users can install @langchain/community and import ChatOllama separately
        throw new LangChainServiceError(
          'Local backend support requires @langchain/community with ChatOllama. Please configure OpenAI backend or extend this service.',
          ErrorType.CONFIGURATION
        );
      }

      if (!this.model) {
        throw new LangChainServiceError(
          'Failed to initialize chat model',
          ErrorType.CONFIGURATION
        );
      }

      // Register tools if provided
      if (this.config.tools && this.config.tools.length > 0) {
        this.registerTools(this.config.tools);
      }

      console.log(`LangChain initialized with ${this.config.backend} backend`);
    } catch (error) {
      console.error('Error initializing LangChain:', error);
      if (error instanceof LangChainServiceError) {
        throw error;
      }
      throw new LangChainServiceError(
        `Failed to initialize LangChain: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorType.CONFIGURATION,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Registers tools with LangChain for tool calling support
   * @throws LangChainServiceError if tool registration fails
   */
  private registerTools(toolDefinitions: ToolDefinition[]): void {
    try {
      this.tools = toolDefinitions.map(toolDef => {
        return new DynamicStructuredTool({
          name: toolDef.name,
          description: toolDef.description,
          schema: toolDef.parameters as any,
          func: async (input: Record<string, any>) => {
            try {
              const result = await toolDef.execute(input);
              return JSON.stringify(result);
            } catch (error) {
              console.error(`Tool execution error in ${toolDef.name}:`, error);
              throw new LangChainServiceError(
                `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                ErrorType.TOOL_EXECUTION,
                error instanceof Error ? error : undefined
              );
            }
          },
        });
      });

      console.log(`Registered ${this.tools.length} tools`);
    } catch (error) {
      console.error('Error registering tools:', error);
      throw new LangChainServiceError(
        'Failed to register tools',
        ErrorType.CONFIGURATION,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Converts message history to LangChain message format
   */
  private convertHistoryToMessages(history: Message[]): BaseMessage[] {
    const messages: BaseMessage[] = [];

    // Add system prompt if configured
    if (this.config.systemPrompt) {
      messages.push(new SystemMessage(this.config.systemPrompt));
    }

    // Convert history to LangChain messages
    for (const msg of history) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content));
      } else if (msg.role === 'system') {
        messages.push(new SystemMessage(msg.content));
      }
    }

    return messages;
  }

  /**
   * Sends a message and receives a response with optional streaming
   * @param message - The user message to send
   * @param history - Previous conversation messages
   * @param onStream - Optional callback for streaming response chunks
   * @returns The complete assistant response
   * @throws LangChainServiceError if message sending fails
   */
  async sendMessage(
    message: string,
    history: Message[] = [],
    onStream?: (chunk: string) => void
  ): Promise<string> {
    if (!this.model) {
      throw new LangChainServiceError(
        'Chat model not initialized',
        ErrorType.CONFIGURATION
      );
    }

    try {
      // Convert history to LangChain messages
      const messages = this.convertHistoryToMessages(history);
      
      // Add the current user message
      messages.push(new HumanMessage(message));

      // Handle streaming if callback provided
      if (onStream) {
        let fullResponse = '';
        
        try {
          const stream = await this.model.stream(messages);
          
          for await (const chunk of stream) {
            const content = chunk.content.toString();
            fullResponse += content;
            try {
              onStream(content);
            } catch (streamError) {
              console.error('Error in streaming callback:', streamError);
              throw new LangChainServiceError(
                'Streaming callback error',
                ErrorType.STREAMING,
                streamError instanceof Error ? streamError : undefined
              );
            }
          }

          return fullResponse;
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          if (streamError instanceof LangChainServiceError) {
            throw streamError;
          }
          throw new LangChainServiceError(
            'Failed to stream response',
            ErrorType.STREAMING,
            streamError instanceof Error ? streamError : undefined
          );
        }
      } else {
        // Non-streaming response
        const response = await this.model.invoke(messages);
        return response.content.toString();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error instanceof LangChainServiceError) {
        throw error;
      }

      // Detect network errors
      if (error instanceof Error && 
          (error.message.includes('fetch') || 
           error.message.includes('network') ||
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('timeout'))) {
        throw new LangChainServiceError(
          'Network connection failed',
          ErrorType.NETWORK,
          error
        );
      }

      throw new LangChainServiceError(
        `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorType.UNKNOWN,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Executes a tool call by name with provided parameters
   * @param toolName - The name of the tool to execute
   * @param parameters - The parameters to pass to the tool
   * @returns The result of the tool execution
   * @throws LangChainServiceError if tool execution fails
   */
  async executeToolCall(
    toolName: string,
    parameters: Record<string, any>
  ): Promise<any> {
    try {
      // Find the tool definition
      const toolDef = this.config.tools?.find(t => t.name === toolName);
      
      if (!toolDef) {
        throw new LangChainServiceError(
          `Tool "${toolName}" not found`,
          ErrorType.TOOL_EXECUTION
        );
      }

      // Validate parameters against tool definition
      const requiredParams = toolDef.parameters.required || [];
      for (const param of requiredParams) {
        if (!(param in parameters)) {
          throw new LangChainServiceError(
            `Missing required parameter: ${param}`,
            ErrorType.TOOL_EXECUTION
          );
        }
      }

      // Execute the tool
      console.log(`Executing tool: ${toolName}`, parameters);
      const result = await toolDef.execute(parameters);
      console.log(`Tool execution completed: ${toolName}`, result);
      
      return result;
    } catch (error) {
      console.error(`Error executing tool "${toolName}":`, error);
      
      if (error instanceof LangChainServiceError) {
        throw error;
      }

      throw new LangChainServiceError(
        `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ErrorType.TOOL_EXECUTION,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Gets the list of available tools
   * @returns Array of tool names
   */
  getAvailableTools(): string[] {
    return this.config.tools?.map(t => t.name) || [];
  }

  /**
   * Checks if a specific tool is available
   * @param toolName - The name of the tool to check
   * @returns True if the tool is available
   */
  hasToolAvailable(toolName: string): boolean {
    return this.config.tools?.some(t => t.name === toolName) || false;
  }
}
