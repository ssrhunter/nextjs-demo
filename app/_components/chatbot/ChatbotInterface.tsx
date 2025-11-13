'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useChatbot } from '@/lib/chatbot/chatbot-context';
import { LangChainService, formatErrorMessage } from '@/lib/chatbot/langchain-service';
import { MessageList } from '@/app/_components/MessageList';
import { MessageInput } from '@/app/_components/MessageInput';
import { Message, ToolCall, NavigationResult } from '@/lib/chatbot/types';

/**
 * ChatbotInterface component - Main interface for chatbot interactions
 * Handles message submission, streaming responses, tool calling, and error handling
 */
export function ChatbotInterface() {
  const {
    messages,
    isLoading,
    currentToolCall,
    config,
    addMessage,
    setLoading,
    setToolCall,
  } = useChatbot();

  // Initialize LangChain service with config
  const serviceRef = useRef<LangChainService | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();
  const [pendingNavigation, setPendingNavigation] = useState<NavigationResult | null>(null);

  /**
   * Detects navigation actions in tool responses
   * Parses the response text for navigation tool results
   */
  const detectNavigationAction = useCallback((responseText: string): NavigationResult | null => {
    try {
      // Look for tool result markers in the response
      const toolResultMatch = responseText.match(/\[Tool: navigate_to_page\]\s*(\{[\s\S]*?\})/);
      
      if (toolResultMatch && toolResultMatch[1]) {
        const toolResult = JSON.parse(toolResultMatch[1]);
        
        // Check if this is a navigation result
        if (toolResult.success && toolResult.action === 'navigate' && toolResult.url) {
          return toolResult as NavigationResult;
        }
      }
    } catch (error) {
      console.error('Error parsing navigation action:', error);
    }
    
    return null;
  }, []);

  /**
   * Executes navigation to the specified URL
   */
  const executeNavigation = useCallback((navResult: NavigationResult) => {
    try {
      console.log('Executing navigation:', navResult);
      router.push(navResult.url);
      setPendingNavigation(null);
      
      // Add confirmation message
      addMessage({
        id: `nav-confirm-${Date.now()}`,
        role: 'system',
        content: `✓ ${navResult.message}`,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Navigation error:', error);
      
      // Add error message
      addMessage({
        id: `nav-error-${Date.now()}`,
        role: 'system',
        content: `Failed to navigate: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Navigation failed',
      });
      
      setPendingNavigation(null);
    }
  }, [router, addMessage]);

  /**
   * Cancels pending navigation
   */
  const cancelNavigation = useCallback(() => {
    setPendingNavigation(null);
    
    addMessage({
      id: `nav-cancel-${Date.now()}`,
      role: 'system',
      content: 'Navigation cancelled',
      timestamp: Date.now(),
    });
  }, [addMessage]);

  /**
   * Initialize LangChainService on mount or config change
   */
  useEffect(() => {
    try {
      serviceRef.current = new LangChainService(config);
      setInitError(null);
    } catch (error) {
      console.error('Failed to initialize LangChainService:', error);
      const errorMessage = formatErrorMessage(error as Error);
      setInitError(errorMessage);
      
      // Add error message to chat
      addMessage({
        id: `error-${Date.now()}`,
        role: 'system',
        content: errorMessage,
        timestamp: Date.now(),
        error: errorMessage,
      });
    }
  }, [config, addMessage]);

  /**
   * Add greeting message when chat is first opened (no messages)
   */
  useEffect(() => {
    if (messages.length === 0 && !initError) {
      addMessage({
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        content: "Hello! I'm your star energy consultant. I'm here to help you find the perfect star to meet your energy needs. Whether you're looking for a reliable main sequence star or something more powerful, I can guide you through our stellar catalog. What kind of energy requirements do you have?",
        timestamp: Date.now(),
      });
    }
  }, [messages.length, initError, addMessage]);

  /**
   * Handles message submission with streaming and tool calling support
   */
  const handleSendMessage = useCallback(async (messageContent: string) => {
    // Create and add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Set loading state
    setLoading(true);

    try {
      const assistantMessageId = `assistant-${Date.now()}`;
      
      // Use API route if backend is 'api', otherwise use LangChain service
      if (config.backend === 'api') {
        // Call API route
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageContent,
            history: messages.filter(m => m.role !== 'tool'),
            systemPrompt: config.systemPrompt,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get response from server');
        }

        // Read streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            fullResponse += chunk;
          }
        }

        // Add complete assistant response
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: fullResponse || 'No response received',
          timestamp: Date.now(),
        };
        addMessage(assistantMessage);

        // Check for navigation actions in the response
        const navAction = detectNavigationAction(fullResponse);
        if (navAction) {
          setPendingNavigation(navAction);
        }
      } else {
        // Use LangChain service for direct OpenAI/local calls
        if (!serviceRef.current) {
          throw new Error('LangChainService not initialized');
        }

        const fullResponse = await serviceRef.current.sendMessage(
          messageContent,
          messages
        );

        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: fullResponse || 'No response received',
          timestamp: Date.now(),
        };
        addMessage(assistantMessage);

        // Check for navigation actions in the response
        const navAction = detectNavigationAction(fullResponse);
        if (navAction) {
          setPendingNavigation(navAction);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Format and display error message
      const errorMessage = formatErrorMessage(error as Error);
      
      addMessage({
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error processing your message.',
        timestamp: Date.now(),
        error: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }, [messages, addMessage, setLoading, config]);

  /**
   * Executes a tool call and returns the result
   * Note: This is available for when LangChain provides tool call information
   * in the response. Currently, LangChain handles tool calling internally.
   */
  const executeToolCall = useCallback(async (toolCall: ToolCall): Promise<any> => {
    if (!serviceRef.current) {
      throw new Error('LangChainService not initialized');
    }

    // Update tool call status to executing
    setToolCall({ ...toolCall, status: 'executing' });

    try {
      // Execute the tool
      const result = await serviceRef.current.executeToolCall(
        toolCall.name,
        toolCall.parameters
      );

      // Update tool call with result
      const completedToolCall: ToolCall = {
        ...toolCall,
        status: 'completed',
        result,
      };
      setToolCall(completedToolCall);

      // Add tool result message to chat
      addMessage({
        id: `tool-${Date.now()}`,
        role: 'tool',
        content: `Tool "${toolCall.name}" executed successfully`,
        timestamp: Date.now(),
        toolCall: completedToolCall,
      });

      return result;
    } catch (error) {
      console.error('Tool execution error:', error);
      
      const errorMessage = formatErrorMessage(error as Error);
      const failedToolCall: ToolCall = {
        ...toolCall,
        status: 'failed',
        error: errorMessage,
      };
      setToolCall(failedToolCall);

      // Add tool error message to chat
      addMessage({
        id: `tool-error-${Date.now()}`,
        role: 'tool',
        content: `Tool "${toolCall.name}" failed`,
        timestamp: Date.now(),
        toolCall: failedToolCall,
        error: errorMessage,
      });

      throw error;
    } finally {
      // Clear current tool call after a delay
      setTimeout(() => {
        setToolCall(null);
      }, 1000);
    }
  }, [addMessage, setToolCall]);

  /**
   * Retry handler for failed messages
   */
  const handleRetry = useCallback((messageContent: string) => {
    handleSendMessage(messageContent);
  }, [handleSendMessage]);

  /**
   * Gets the last user message for retry functionality
   */
  const getLastUserMessage = useCallback((): string | null => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content;
      }
    }
    return null;
  }, [messages]);

  /**
   * Checks if the last message was an error
   */
  const hasRecentError = useCallback((): boolean => {
    if (messages.length === 0) return false;
    const lastMessage = messages[messages.length - 1];
    return !!lastMessage.error;
  }, [messages]);

  // Show initialization error if present
  if (initError && messages.length === 0) {
    return (
      <div className="flex flex-col h-full ">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-100 border border-red-300 rounded-lg p-4 max-w-md">
            <h3 className="text-red-900 font-medium mb-2">Configuration Error</h3>
            <p className="text-red-800 text-sm mb-3">{initError}</p>
            <p className="text-red-700 text-xs">
              Please check your chatbot configuration and ensure all required settings are correct.
            </p>
          </div>
        </div>
        <MessageInput onSend={handleSendMessage} disabled={true} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent">
      <MessageList
        messages={messages}
        isLoading={isLoading}
        currentToolCall={currentToolCall}
      />
      
      {/* Navigation confirmation banner */}
      {pendingNavigation && !isLoading && (
        <div className="px-4 py-3 bg-blue-50 border-t border-blue-200" role="alert" aria-live="polite">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Ready to navigate
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  {pendingNavigation.message}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Destination: {pendingNavigation.url}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => executeNavigation(pendingNavigation)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Confirm navigation"
                type="button"
              >
                Go to page
              </button>
              <button
                onClick={cancelNavigation}
                className="px-3 py-1.5 text-sm bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cancel navigation"
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error retry banner */}
      {hasRecentError() && !isLoading && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200" role="alert" aria-live="polite">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-800">
              The last message failed to send
            </span>
            <button
              onClick={() => {
                const lastUserMsg = getLastUserMessage();
                if (lastUserMsg) {
                  handleRetry(lastUserMsg);
                }
              }}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Retry sending message"
              type="button"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      
      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading || !!initError}
      />
    </div>
  );
}
