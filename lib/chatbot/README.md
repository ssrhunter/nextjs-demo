# Chatbot Library Documentation

## Overview

This chatbot library provides a complete, production-ready chatbot interface with LangChain integration, tool calling support, and persistent state management. The system is built with React, TypeScript, and Next.js, offering a flexible popup interface that works across your entire application.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Tool Creation](#tool-creation)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### 1. Install Dependencies

```bash
npm install langchain @langchain/openai @langchain/core
```

### 2. Set Up Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here
```

### 3. Configure the Chatbot

In your root layout (`app/layout.tsx`):

```typescript
import { ChatbotProvider } from '@/lib/chatbot/chatbot-context';
import { ChatbotPopup } from '@/app/_components/chatbot/ChatbotPopup';
import { ChatbotConfig } from '@/lib/chatbot/types';

const chatbotConfig: ChatbotConfig = {
  backend: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant.',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ChatbotProvider config={chatbotConfig}>
          {children}
          <ChatbotPopup />
        </ChatbotProvider>
      </body>
    </html>
  );
}
```

---

## Configuration

### ChatbotConfig Interface

The `ChatbotConfig` interface defines all configuration options for the chatbot:

```typescript
interface ChatbotConfig {
  backend: 'openai' | 'local';
  apiKey?: string;
  modelName: string;
  baseUrl?: string;
  temperature?: number;
  tools?: ToolDefinition[];
  systemPrompt?: string;
}
```

### Configuration Options

#### `backend` (required)
- **Type**: `'openai' | 'local'`
- **Description**: Specifies which backend service to use
- **Options**:
  - `'openai'`: Use OpenAI's API (requires `apiKey`)
  - `'local'`: Use a local model (requires `baseUrl` and additional setup)

#### `apiKey` (conditional)
- **Type**: `string`
- **Required for**: OpenAI backend
- **Description**: Your OpenAI API key
- **Security**: Store in environment variables, never commit to version control
- **Example**: `process.env.NEXT_PUBLIC_OPENAI_API_KEY`

#### `modelName` (required)
- **Type**: `string`
- **Description**: The specific model to use
- **OpenAI Examples**:
  - `'gpt-4'` - Most capable, higher cost
  - `'gpt-4-turbo'` - Fast and capable
  - `'gpt-3.5-turbo'` - Fast and cost-effective
- **Local Examples**:
  - `'llama2'`
  - `'mistral'`
  - `'codellama'`

#### `baseUrl` (conditional)
- **Type**: `string`
- **Required for**: Local backend
- **Description**: The URL endpoint for your local model server
- **Example**: `'http://localhost:11434'` (Ollama default)

#### `temperature` (optional)
- **Type**: `number`
- **Default**: `0.7`
- **Range**: `0.0` to `2.0`
- **Description**: Controls response randomness
  - `0.0`: Deterministic, focused responses
  - `0.7`: Balanced creativity and consistency
  - `1.5+`: More creative and varied responses

#### `tools` (optional)
- **Type**: `ToolDefinition[]`
- **Default**: `[]`
- **Description**: Array of tool definitions the chatbot can invoke
- **See**: [Tool Creation](#tool-creation) section

#### `systemPrompt` (optional)
- **Type**: `string`
- **Default**: None
- **Description**: Initial system message that sets the chatbot's behavior and personality
- **Example**: `'You are a helpful coding assistant specialized in React and TypeScript.'`

---

## Configuration Examples

### Example 1: OpenAI with GPT-4

```typescript
const config: ChatbotConfig = {
  backend: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: 'gpt-4',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant that provides concise, accurate answers.',
};
```

### Example 2: OpenAI with Tools

```typescript
import { exampleTools } from '@/lib/chatbot/example-tools';

const config: ChatbotConfig = {
  backend: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.5,
  tools: exampleTools,
  systemPrompt: 'You are an assistant with access to calculator and weather tools.',
};
```

### Example 3: Local Model (Ollama)

```typescript
const config: ChatbotConfig = {
  backend: 'local',
  baseUrl: 'http://localhost:11434',
  modelName: 'llama2',
  temperature: 0.8,
  systemPrompt: 'You are a friendly local AI assistant.',
};
```

**Note**: Local model support requires additional setup with `@langchain/community` and the `ChatOllama` class. The current implementation focuses on OpenAI but can be extended.

### Example 4: Production Configuration

```typescript
const config: ChatbotConfig = {
  backend: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: process.env.NEXT_PUBLIC_MODEL_NAME || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.NEXT_PUBLIC_TEMPERATURE || '0.7'),
  tools: customTools,
  systemPrompt: `You are a customer support assistant for ${process.env.NEXT_PUBLIC_COMPANY_NAME}.
    Be helpful, professional, and concise. If you don't know something, admit it.`,
};
```

---

## Tool Creation

Tools allow the chatbot to perform actions and retrieve information beyond text generation. The chatbot can invoke these tools automatically when needed.

### ToolDefinition Interface

```typescript
interface ToolDefinition {
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
```

### Creating a Custom Tool

#### Step 1: Define the Tool Structure

```typescript
import { ToolDefinition } from '@/lib/chatbot/types';

const myCustomTool: ToolDefinition = {
  name: 'tool_name',
  description: 'Clear description of what the tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'Description of parameter 1',
      },
      param2: {
        type: 'number',
        description: 'Description of parameter 2',
      },
    },
    required: ['param1'], // List required parameters
  },
  execute: async (params) => {
    // Implementation
    return result;
  },
};
```

#### Step 2: Implement the Execute Function

The `execute` function receives validated parameters and should:
- Perform the tool's action
- Return a result (any JSON-serializable value)
- Throw errors for invalid inputs or failures

```typescript
execute: async (params: Record<string, any>) => {
  const { param1, param2 } = params;
  
  // Validate inputs
  if (!param1 || typeof param1 !== 'string') {
    throw new Error('param1 must be a non-empty string');
  }
  
  // Perform action
  const result = await someAsyncOperation(param1, param2);
  
  // Return result
  return {
    success: true,
    data: result,
  };
}
```

### Tool Examples

#### Example 1: Database Query Tool

```typescript
const databaseQueryTool: ToolDefinition = {
  name: 'query_database',
  description: 'Queries the user database for information',
  parameters: {
    type: 'object',
    properties: {
      query_type: {
        type: 'string',
        description: 'Type of query to perform',
        enum: ['user_count', 'recent_users', 'user_by_id'],
      },
      user_id: {
        type: 'string',
        description: 'User ID (required for user_by_id query)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (for recent_users)',
      },
    },
    required: ['query_type'],
  },
  execute: async (params) => {
    const { query_type, user_id, limit = 10 } = params;
    
    switch (query_type) {
      case 'user_count':
        const count = await db.users.count();
        return { count };
      
      case 'recent_users':
        const users = await db.users.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        });
        return { users };
      
      case 'user_by_id':
        if (!user_id) throw new Error('user_id required for user_by_id query');
        const user = await db.users.findUnique({ where: { id: user_id } });
        return { user };
      
      default:
        throw new Error(`Unknown query type: ${query_type}`);
    }
  },
};
```

#### Example 2: API Integration Tool

```typescript
const fetchDataTool: ToolDefinition = {
  name: 'fetch_external_data',
  description: 'Fetches data from an external API',
  parameters: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'API endpoint to call',
        enum: ['users', 'posts', 'comments'],
      },
      id: {
        type: 'string',
        description: 'Resource ID to fetch',
      },
    },
    required: ['endpoint'],
  },
  execute: async (params) => {
    const { endpoint, id } = params;
    const baseUrl = 'https://api.example.com';
    
    const url = id 
      ? `${baseUrl}/${endpoint}/${id}`
      : `${baseUrl}/${endpoint}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  },
};
```

#### Example 3: File System Tool

```typescript
const fileOperationTool: ToolDefinition = {
  name: 'file_operations',
  description: 'Performs file system operations',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        description: 'Operation to perform',
        enum: ['read', 'list', 'exists'],
      },
      path: {
        type: 'string',
        description: 'File or directory path',
      },
    },
    required: ['operation', 'path'],
  },
  execute: async (params) => {
    const { operation, path } = params;
    const fs = require('fs').promises;
    
    switch (operation) {
      case 'read':
        const content = await fs.readFile(path, 'utf-8');
        return { content };
      
      case 'list':
        const files = await fs.readdir(path);
        return { files };
      
      case 'exists':
        try {
          await fs.access(path);
          return { exists: true };
        } catch {
          return { exists: false };
        }
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  },
};
```

### Tool Best Practices

1. **Clear Descriptions**: Write detailed descriptions for both the tool and its parameters
2. **Input Validation**: Always validate parameters before use
3. **Error Handling**: Throw descriptive errors for invalid inputs or failures
4. **Return Structured Data**: Return JSON-serializable objects with clear structure
5. **Async Operations**: Use `async/await` for any asynchronous operations
6. **Security**: Validate and sanitize all inputs, especially for file system or database operations
7. **Performance**: Keep tool execution fast (< 5 seconds when possible)
8. **Idempotency**: Design tools to be safe to call multiple times with the same parameters

### Using Tools in Configuration

```typescript
import { exampleTools } from '@/lib/chatbot/example-tools';
import { myCustomTool } from '@/lib/my-tools';

const config: ChatbotConfig = {
  backend: 'openai',
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  tools: [
    ...exampleTools,  // Include example tools
    myCustomTool,     // Add your custom tool
  ],
};
```

---

## API Reference

### ChatbotProvider

React context provider that manages chatbot state.

**Props**:
- `children: React.ReactNode` - Child components
- `config: ChatbotConfig` - Chatbot configuration

**Example**:
```typescript
<ChatbotProvider config={config}>
  <App />
</ChatbotProvider>
```

### useChatbot Hook

Hook to access chatbot state and actions.

**Returns**: `ChatbotContextValue`

```typescript
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
```

**Example**:
```typescript
import { useChatbot } from '@/lib/chatbot/chatbot-context';

function MyComponent() {
  const { messages, isOpen, toggleOpen } = useChatbot();
  
  return (
    <button onClick={toggleOpen}>
      {isOpen ? 'Close' : 'Open'} Chat ({messages.length} messages)
    </button>
  );
}
```

### LangChainService

Service class for LangChain integration.

**Constructor**:
```typescript
new LangChainService(config: ChatbotConfig)
```

**Methods**:

#### `sendMessage()`
```typescript
async sendMessage(
  message: string,
  history: Message[],
  onStream?: (chunk: string) => void
): Promise<string>
```

Sends a message and receives a response with optional streaming.

**Parameters**:
- `message`: User message to send
- `history`: Previous conversation messages
- `onStream`: Optional callback for streaming chunks

**Returns**: Complete assistant response

**Throws**: `LangChainServiceError`

#### `executeToolCall()`
```typescript
async executeToolCall(
  toolName: string,
  parameters: Record<string, any>
): Promise<any>
```

Executes a tool by name with provided parameters.

**Parameters**:
- `toolName`: Name of the tool to execute
- `parameters`: Parameters to pass to the tool

**Returns**: Tool execution result

**Throws**: `LangChainServiceError`

#### `getAvailableTools()`
```typescript
getAvailableTools(): string[]
```

Returns array of available tool names.

#### `hasToolAvailable()`
```typescript
hasToolAvailable(toolName: string): boolean
```

Checks if a specific tool is available.

### Message Interface

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  toolCall?: ToolCall;
  error?: string;
}
```

### ToolCall Interface

```typescript
interface ToolCall {
  id: string;
  name: string;
  parameters: Record<string, any>;
  result?: any;
  error?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}
```

---

## Examples

### Example 1: Custom Chat Button

```typescript
'use client';

import { useChatbot } from '@/lib/chatbot/chatbot-context';

export function CustomChatButton() {
  const { isOpen, toggleOpen, messages } = useChatbot();
  
  return (
    <button
      onClick={toggleOpen}
      className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full"
    >
      💬 Chat {messages.length > 0 && `(${messages.length})`}
    </button>
  );
}
```

### Example 2: Programmatic Message Sending

```typescript
'use client';

import { useChatbot } from '@/lib/chatbot/chatbot-context';
import { LangChainService } from '@/lib/chatbot/langchain-service';
import { useEffect } from 'react';

export function AutoGreeting() {
  const { messages, addMessage, config } = useChatbot();
  
  useEffect(() => {
    if (messages.length === 0) {
      // Send automatic greeting
      const service = new LangChainService(config);
      
      const greetingMessage = {
        id: Date.now().toString(),
        role: 'assistant' as const,
        content: 'Hello! How can I help you today?',
        timestamp: Date.now(),
      };
      
      addMessage(greetingMessage);
    }
  }, []);
  
  return null;
}
```

### Example 3: Message Export

```typescript
'use client';

import { useChatbot } from '@/lib/chatbot/chatbot-context';

export function ExportButton() {
  const { messages } = useChatbot();
  
  const exportChat = () => {
    const chatText = messages
      .map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${Date.now()}.txt`;
    a.click();
  };
  
  return (
    <button onClick={exportChat}>
      Export Chat History
    </button>
  );
}
```

---

## Troubleshooting

### Common Errors and Solutions

#### Error: "API key is required for OpenAI backend"

**Cause**: Missing or undefined OpenAI API key

**Solution**:
1. Create `.env.local` file in project root
2. Add: `NEXT_PUBLIC_OPENAI_API_KEY=your_key_here`
3. Restart development server
4. Verify key is loaded: `console.log(process.env.NEXT_PUBLIC_OPENAI_API_KEY)`

#### Error: "Chat model not initialized"

**Cause**: LangChainService failed to initialize

**Solution**:
1. Check configuration is valid
2. Verify all required fields are present
3. Check console for initialization errors
4. Ensure dependencies are installed: `npm install langchain @langchain/openai`

#### Error: "Network connection failed"

**Cause**: Cannot reach OpenAI API or local model server

**Solution**:
1. Check internet connection
2. Verify API key is valid
3. Check for firewall/proxy issues
4. For local models: Ensure server is running at specified `baseUrl`
5. Test API directly: `curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"`

#### Error: "Tool execution failed"

**Cause**: Error in tool's execute function

**Solution**:
1. Check tool parameters are valid
2. Review tool's error message in console
3. Add error handling in tool's execute function
4. Validate required parameters are provided
5. Test tool independently before adding to config

#### Error: "useChatbot must be used within a ChatbotProvider"

**Cause**: Component using `useChatbot` is not wrapped in `ChatbotProvider`

**Solution**:
1. Ensure `ChatbotProvider` wraps your app in root layout
2. Check component hierarchy
3. Verify provider is not conditionally rendered

#### Error: "Failed to restore chatbot state"

**Cause**: Corrupted data in localStorage

**Solution**:
1. Clear localStorage: `localStorage.removeItem('chatbot-state')`
2. Refresh page
3. State will reset to defaults

### Performance Issues

#### Slow Response Times

**Possible Causes**:
- Large conversation history
- Complex tool executions
- Network latency
- Model selection (GPT-4 is slower than GPT-3.5)

**Solutions**:
1. Use GPT-3.5-turbo for faster responses
2. Limit conversation history length
3. Optimize tool execution time
4. Consider response caching for common queries

#### High Memory Usage

**Possible Causes**:
- Very long conversation history
- Large tool results stored in messages

**Solutions**:
1. Implement message limit (e.g., keep last 50 messages)
2. Clear old conversations periodically
3. Avoid storing large data in message content

### Debugging Tips

#### Enable Verbose Logging

```typescript
// In langchain-service.ts, add more console.log statements
console.log('Sending message:', message);
console.log('History length:', history.length);
console.log('Response:', response);
```

#### Inspect localStorage

```javascript
// In browser console
console.log(JSON.parse(localStorage.getItem('chatbot-state')));
```

#### Monitor Network Requests

1. Open browser DevTools
2. Go to Network tab
3. Filter by "openai" or your API domain
4. Check request/response details

#### Test Configuration

```typescript
// Create a test page to verify config
export default function TestPage() {
  const { config } = useChatbot();
  
  return (
    <pre>{JSON.stringify(config, null, 2)}</pre>
  );
}
```

### Getting Help

If you encounter issues not covered here:

1. Check browser console for error messages
2. Review LangChain documentation: https://js.langchain.com/
3. Verify OpenAI API status: https://status.openai.com/
4. Check Next.js documentation for App Router issues
5. Review the implementation files in `lib/chatbot/` for detailed comments

---

## Additional Resources

- **LangChain Documentation**: https://js.langchain.com/
- **OpenAI API Reference**: https://platform.openai.com/docs/api-reference
- **Next.js App Router**: https://nextjs.org/docs/app
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

---

## License

This chatbot library is part of your application. Refer to your project's license for usage terms.


---

## Theme Customization

The chatbot supports easy theme customization through a centralized configuration system. You can use pre-built themes or create your own custom theme.

### Using Pre-built Themes

The library includes three pre-built themes:

1. **defaultTheme** (Blue) - Default professional blue theme
2. **greenTheme** - Fresh green theme
3. **purpleTheme** - Modern purple theme

#### Example: Using a Pre-built Theme

```typescript
import { ChatbotConfig } from '@/lib/chatbot/types';
import { greenTheme } from '@/lib/chatbot/theme';

const config: ChatbotConfig = {
  backend: 'api',
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  systemPrompt: 'You are a helpful assistant.',
  theme: greenTheme, // Apply green theme
};
```

### Creating a Custom Theme

You can create a completely custom theme by defining a `ChatbotTheme` object:

```typescript
import { ChatbotTheme } from '@/lib/chatbot/theme';

const myCustomTheme: ChatbotTheme = {
  // Primary brand colors
  primary: 'bg-orange-500',
  primaryHover: 'hover:bg-orange-600',
  primaryDark: 'bg-orange-600',
  
  // Header
  headerBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  headerText: 'text-white',
  headerButtonHover: 'hover:bg-white/20',
  
  // Messages
  userMessageBg: 'bg-orange-600',
  userMessageText: 'text-white',
  assistantMessageBg: 'bg-gray-100',
  assistantMessageText: 'text-gray-950',
  
  // Tool messages
  toolMessageBg: 'bg-purple-100',
  toolMessageText: 'text-purple-950',
  toolMessageBorder: 'border-purple-300',
  
  // Error messages
  errorMessageBg: 'bg-red-100',
  errorMessageText: 'text-red-950',
  errorMessageBorder: 'border-red-300',
  
  // Input
  inputBorder: 'border-gray-300',
  inputFocusRing: 'focus:ring-orange-500',
  inputBg: 'bg-white',
  inputDisabledBg: 'bg-gray-100',
  
  // Buttons
  sendButtonBg: 'bg-orange-500',
  sendButtonHover: 'hover:bg-orange-600',
  sendButtonText: 'text-white',
  sendButtonDisabledBg: 'bg-gray-300',
  sendButtonDisabledText: 'text-gray-500',
  
  // FAB (Floating Action Button)
  fabBg: 'bg-gradient-to-r from-orange-500 to-red-500',
  fabHover: 'hover:from-orange-600 hover:to-red-600',
  fabText: 'text-white',
  fabRing: 'focus:ring-orange-300',
  
  // Close button
  closeBg: 'bg-gray-800',
  closeHover: 'hover:bg-gray-900',
  closeText: 'text-white',
  
  // Container
  containerBorder: 'border-gray-200',
  containerBg: 'bg-transparent',
  
  // Loading indicator
  loadingDotBg: 'bg-gray-400',
  loadingText: 'text-gray-600',
  
  // Timestamps
  timestampText: 'text-gray-500',
};

// Use in config
const config: ChatbotConfig = {
  backend: 'api',
  modelName: 'gpt-4o-mini',
  theme: myCustomTheme,
};
```

### Theme Properties Reference

| Property | Description | Example |
|----------|-------------|---------|
| `primary` | Primary brand color | `'bg-blue-500'` |
| `primaryHover` | Primary hover state | `'hover:bg-blue-600'` |
| `primaryDark` | Darker primary shade | `'bg-blue-600'` |
| `headerBg` | Header background | `'bg-gradient-to-r from-blue-500 to-blue-600'` |
| `headerText` | Header text color | `'text-white'` |
| `headerButtonHover` | Header button hover | `'hover:bg-white/20'` |
| `userMessageBg` | User message bubble background | `'bg-blue-600'` |
| `userMessageText` | User message text color | `'text-white'` |
| `assistantMessageBg` | Assistant message bubble background | `'bg-gray-100'` |
| `assistantMessageText` | Assistant message text color | `'text-gray-950'` |
| `toolMessageBg` | Tool message background | `'bg-purple-100'` |
| `toolMessageText` | Tool message text | `'text-purple-950'` |
| `toolMessageBorder` | Tool message border | `'border-purple-300'` |
| `errorMessageBg` | Error message background | `'bg-red-100'` |
| `errorMessageText` | Error message text | `'text-red-950'` |
| `errorMessageBorder` | Error message border | `'border-red-300'` |
| `inputBorder` | Input field border | `'border-gray-300'` |
| `inputFocusRing` | Input focus ring | `'focus:ring-blue-500'` |
| `inputBg` | Input background | `'bg-white'` |
| `inputDisabledBg` | Disabled input background | `'bg-gray-100'` |
| `sendButtonBg` | Send button background | `'bg-blue-500'` |
| `sendButtonHover` | Send button hover | `'hover:bg-blue-600'` |
| `sendButtonText` | Send button text | `'text-white'` |
| `sendButtonDisabledBg` | Disabled send button background | `'bg-gray-300'` |
| `sendButtonDisabledText` | Disabled send button text | `'text-gray-500'` |
| `fabBg` | Floating action button background | `'bg-gradient-to-r from-blue-500 to-blue-600'` |
| `fabHover` | FAB hover state | `'hover:from-blue-600 hover:to-blue-700'` |
| `fabText` | FAB text color | `'text-white'` |
| `fabRing` | FAB focus ring | `'focus:ring-blue-300'` |
| `closeBg` | Close button background | `'bg-gray-800'` |
| `closeHover` | Close button hover | `'hover:bg-gray-900'` |
| `closeText` | Close button text | `'text-white'` |
| `containerBorder` | Container border | `'border-gray-200'` |
| `containerBg` | Container background | `'bg-transparent'` |
| `loadingDotBg` | Loading dots color | `'bg-gray-400'` |
| `loadingText` | Loading text color | `'text-gray-600'` |
| `timestampText` | Timestamp text color | `'text-gray-500'` |

### Theme Best Practices

1. **Use Tailwind Classes**: All theme properties should use Tailwind CSS utility classes
2. **Maintain Contrast**: Ensure sufficient contrast between text and backgrounds for accessibility
3. **Test Responsiveness**: Verify your theme works on mobile and desktop
4. **Brand Consistency**: Match your theme to your brand colors
5. **Dark Mode**: Consider creating separate themes for light and dark modes

### Example: Brand-Matched Theme

```typescript
// Match your company's brand colors
const brandTheme: ChatbotTheme = {
  primary: 'bg-[#FF6B35]', // Your brand primary color
  primaryHover: 'hover:bg-[#E55A2B]',
  primaryDark: 'bg-[#CC4A1F]',
  
  headerBg: 'bg-[#FF6B35]',
  headerText: 'text-white',
  headerButtonHover: 'hover:bg-black/10',
  
  userMessageBg: 'bg-[#FF6B35]',
  userMessageText: 'text-white',
  assistantMessageBg: 'bg-gray-50',
  assistantMessageText: 'text-gray-900',
  
  // ... rest of theme properties
};
```

### Dynamic Theme Switching

You can switch themes dynamically by updating the config:

```typescript
'use client';

import { useState } from 'react';
import { ChatbotProvider } from '@/lib/chatbot/chatbot-context';
import { defaultTheme, greenTheme, purpleTheme } from '@/lib/chatbot/theme';

export function App() {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  
  const config = {
    backend: 'api',
    modelName: 'gpt-4o-mini',
    theme: currentTheme,
  };
  
  return (
    <ChatbotProvider config={config}>
      <div>
        <button onClick={() => setCurrentTheme(defaultTheme)}>Blue</button>
        <button onClick={() => setCurrentTheme(greenTheme)}>Green</button>
        <button onClick={() => setCurrentTheme(purpleTheme)}>Purple</button>
      </div>
      {/* Your app content */}
    </ChatbotProvider>
  );
}
```

### Exporting Your Custom Theme

Save your custom theme in a separate file for reusability:

```typescript
// lib/chatbot/custom-themes.ts
import { ChatbotTheme } from './theme';

export const companyTheme: ChatbotTheme = {
  // Your custom theme configuration
};

export const darkModeTheme: ChatbotTheme = {
  // Dark mode theme configuration
};
```

Then import and use:

```typescript
import { companyTheme } from '@/lib/chatbot/custom-themes';

const config: ChatbotConfig = {
  backend: 'api',
  modelName: 'gpt-4o-mini',
  theme: companyTheme,
};
```
