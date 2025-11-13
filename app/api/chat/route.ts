import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { starTools } from '@/lib/chatbot/star-tools';

// Additional documentation and resources
// LangChain Chatbot: https://chat.langchain.com/?threadId=39e1f6d0-c52e-44bd-b2a6-8c176bc3f235

// Use Node.js runtime for full environment variable access (required for LangSmith)
export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  systemPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, systemPrompt }: ChatRequest = await req.json();

    // Validate API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Log LangSmith configuration for debugging
    if (process.env.LANGCHAIN_TRACING_V2 === 'true') {
      console.log('LangSmith tracing enabled:', {
        project: process.env.LANGCHAIN_PROJECT,
        endpoint: process.env.LANGCHAIN_ENDPOINT,
        hasApiKey: !!process.env.LANGCHAIN_API_KEY,
      });
    }

    // Convert star tools to LangChain tool format
    const langchainTools = starTools.map(toolDef => {
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return JSON.stringify({
              success: false,
              error: `Tool execution failed: ${errorMessage}`,
            });
          }
        },
      });
    });

    // Initialize ChatOpenAI with tool binding
    // LangSmith will automatically trace if LANGCHAIN_TRACING_V2=true
    const model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      streaming: true,
    });

    // Bind tools to the model using bindTools method
    const modelWithTools = model.bindTools(langchainTools);

    // Build messages array
    const messages = [];
    
    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    // Add history
    for (const msg of history) {
      if (msg.role === 'user') {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        messages.push(new AIMessage(msg.content));
      } else if (msg.role === 'system') {
        messages.push(new SystemMessage(msg.content));
      }
    }

    // Add current message
    messages.push(new HumanMessage(message));

    // First, invoke the model to get complete tool calls (non-streaming)
    let response = await modelWithTools.invoke(messages);
    
    console.log('Initial model response:', {
      hasToolCalls: !!response.tool_calls,
      toolCallsLength: response.tool_calls?.length || 0,
      content: response.content,
    });

    // Track tool messages and calls for later use
    const toolMessages: Array<{ role: string; content: string; tool_call_id?: string; toolName: string }> = [];
    const originalToolCalls = response.tool_calls;

    // Handle tool calls if present - execute them and get final response
    if (response.tool_calls && response.tool_calls.length > 0) {
      // Execute all tool calls
      
      for (const toolCall of response.tool_calls) {
        try {
          console.log('Tool call detected:', {
            name: toolCall.name,
            args: toolCall.args,
            argsType: typeof toolCall.args,
            argsKeys: toolCall.args ? Object.keys(toolCall.args) : [],
          });
          
          // Find the matching tool
          const tool = langchainTools.find(t => t.name === toolCall.name);
          
          if (tool) {
            // Ensure args is an object and handle empty/undefined values
            const args = toolCall.args || {};
            
            // Log the args being passed to the tool
            console.log('Executing tool with args:', JSON.stringify(args, null, 2));
            
            // Execute the tool
            const toolResult = await tool.func(args);
            console.log('Tool result:', toolResult);
            
            // Store tool result for the next model call
            toolMessages.push({
              role: 'tool',
              content: toolResult,
              tool_call_id: toolCall.id,
              toolName: toolCall.name,
            });
          } else {
            console.error(`Tool not found: ${toolCall.name}`);
            toolMessages.push({
              role: 'tool',
              content: JSON.stringify({ success: false, error: `Tool "${toolCall.name}" not found` }),
              tool_call_id: toolCall.id,
              toolName: toolCall.name,
            });
          }
        } catch (toolError) {
          console.error('Tool execution error:', toolError);
          const errorMessage = toolError instanceof Error ? toolError.message : 'Unknown error';
          toolMessages.push({
            role: 'tool',
            content: JSON.stringify({ success: false, error: `Tool execution failed: ${errorMessage}` }),
            tool_call_id: toolCall.id,
            toolName: toolCall.name,
          });
        }
      }
      
      // Add the assistant's response with tool calls to messages
      messages.push(new AIMessage({
        content: response.content || '',
        tool_calls: response.tool_calls,
      }));
      
      // Add tool results to messages
      for (const toolMsg of toolMessages) {
        messages.push({
          role: 'tool',
          content: toolMsg.content,
          tool_call_id: toolMsg.tool_call_id,
        } as any);
      }
      
      // Get final response from model with tool results
      console.log('Invoking model with tool results...');
      response = await modelWithTools.invoke(messages);
      console.log('Final model response:', { content: response.content });
      
      // If the model still doesn't provide content, we need to handle tool results ourselves
      if (!response.content || response.content.toString().trim() === '') {
        console.log('Model returned empty content, formatting tool results...');
        
        // Check if any tool was a navigation action
        const navigationResult = toolMessages.find(msg => {
          try {
            const parsed = JSON.parse(msg.content);
            return parsed.action === 'navigate';
          } catch {
            return false;
          }
        });
        
        if (navigationResult) {
          const navData = JSON.parse(navigationResult.content);
          response.content = `I'll take you to that page now. ${navData.message || ''}`;
        } else {
          // For other tools, create a summary
          response.content = 'I found the information you requested. Let me know if you need anything else!';
        }
      }
    }

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Log tool results to console for debugging (not sent to client)
          if (toolMessages.length > 0) {
            console.log('Tool execution results:', toolMessages.map(msg => ({
              tool: msg.toolName,
              result: msg.content,
            })));
          }
          
          // Only send the final natural language response to the client
          if (response.content) {
            const content = response.content.toString();
            controller.enqueue(encoder.encode(content));
          } else {
            // Fallback if still no content
            controller.enqueue(encoder.encode('I processed your request.'));
          }
          
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
