# Implementation Plan

- [x] 1. Install dependencies and create type definitions
  - Install LangChain packages: `langchain`, `@langchain/openai`, `@langchain/community`
  - Create TypeScript type definitions file at `lib/chatbot/types.ts` with Message, ChatbotConfig, ToolDefinition, ToolCall, and ChatbotState interfaces
  - _Requirements: 7.1, 8.1, 9.1_

- [x] 2. Implement LangChainService
  - [x] 2.1 Create LangChainService class with backend initialization
    - Write `lib/chatbot/langchain-service.ts` with class constructor that accepts ChatbotConfig
    - Implement `initializeChain()` method to create LangChain instance based on backend type (OpenAI or local)
    - Add configuration validation logic
    - _Requirements: 7.1, 8.1, 8.2, 8.3, 8.4_
  
  - [x] 2.2 Implement message sending with streaming support
    - Write `sendMessage()` method that accepts message, history, and optional streaming callback
    - Implement conversation memory creation using LangChain's BufferMemory
    - Add streaming response handling with chunk processing
    - _Requirements: 7.2, 7.3, 5.1, 5.2_
  
  - [x] 2.3 Add tool calling support
    - Implement `executeToolCall()` method to invoke tool functions
    - Add tool registration logic in `initializeChain()` for LangChain tool binding
    - Implement error handling for tool execution failures
    - _Requirements: 9.2, 9.3, 9.4, 9.5_
  
  - [x] 2.4 Implement error handling
    - Add try-catch blocks for network errors, configuration errors, and streaming errors
    - Create error message formatting utilities
    - Add error logging to console
    - _Requirements: 5.4, 7.4, 8.5_

- [x] 3. Create ChatbotProvider context
  - [x] 3.1 Implement context and state management
    - Create `lib/chatbot/chatbot-context.tsx` with React Context
    - Implement useState hooks for messages, isMinimized, isOpen, isLoading, and currentToolCall
    - Write action functions: addMessage, toggleMinimize, toggleOpen, setLoading, setToolCall
    - _Requirements: 11.1, 11.2, 2.2, 2.4_
  
  - [x] 3.2 Add localStorage persistence
    - Implement useEffect hook to save state to localStorage with debouncing (300ms)
    - Write state restoration logic on component mount
    - Add version field for migration support
    - Implement validation for restored state data
    - _Requirements: 11.3, 11.4, 11.5_
  
  - [x] 3.3 Create provider component
    - Write ChatbotProvider component that wraps children with context
    - Accept config prop for LangChain configuration
    - Export useChatbot hook for consuming context
    - _Requirements: 12.1, 12.2_

- [x] 4. Build MessageInput component
  - Create `components/chatbot/message-input.tsx` with textarea and send button
  - Implement controlled input with useState
  - Add Enter key handler (send on Enter, new line on Shift+Enter)
  - Implement input validation to prevent empty messages
  - Add disabled state styling when loading
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. Build MessageList component
  - [x] 5.1 Create message display component
    - Create `components/chatbot/message-list.tsx` with scrollable container
    - Implement message rendering with distinct styling for user vs assistant messages
    - Add timestamp display for each message using formatted dates
    - _Requirements: 4.1, 4.2, 4.4, 4.5_
  
  - [x] 5.2 Add auto-scroll functionality
    - Implement useEffect hook with ref to scroll to bottom on new messages
    - Add smooth scroll behavior
    - _Requirements: 4.3_
  
  - [x] 5.3 Add loading and tool call indicators
    - Create loading spinner component for message loading state
    - Implement tool call indicator showing tool name and status
    - Add visual distinction for tool-related messages
    - Display tool execution errors with error styling
    - _Requirements: 5.1, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6. Build PopupContainer component
  - Create `components/chatbot/popup-container.tsx` with header and content area
  - Implement header with title text and minimize button
  - Add conditional rendering of content based on isMinimized prop
  - Style with Tailwind: rounded corners, shadow, border
  - Ensure minimize button has minimum 44px touch target
  - _Requirements: 2.1, 2.3, 2.5, 6.5_

- [x] 7. Build ChatbotInterface component
  - [x] 7.1 Create main interface component
    - Create `components/chatbot/chatbot-interface.tsx` that consumes chatbot context
    - Initialize LangChainService with config from context
    - Compose MessageList and MessageInput components
    - _Requirements: 7.1, 8.1_
  
  - [x] 7.2 Implement message submission handler
    - Write handleSendMessage function that adds user message to state
    - Call LangChainService.sendMessage() with conversation history
    - Handle streaming responses by updating message content in real-time
    - Add assistant response to state when complete
    - _Requirements: 3.3, 3.4, 5.2, 7.3_
  
  - [x] 7.3 Add tool calling integration
    - Detect tool calls in LangChain responses
    - Update currentToolCall state when tool is invoked
    - Execute tool using LangChainService.executeToolCall()
    - Pass tool result back to LangChain for response generation
    - Clear currentToolCall state when complete
    - _Requirements: 9.3, 9.4, 10.1, 10.2_
  
  - [x] 7.4 Implement error handling UI
    - Catch errors from LangChainService
    - Display error messages in chat with distinct styling
    - Add retry functionality for failed messages
    - _Requirements: 5.4, 7.4, 8.5, 9.5_

- [x] 8. Build ChatbotPopup component
  - Create `_components/chatbot/chatbot-popup.tsx` that consumes chatbot context
  - Implement fixed positioning at bottom-right with Tailwind classes
  - Add slide-up/slide-down animations using CSS transitions
  - Set z-index to 50 for proper layering
  - Implement responsive width and max-height constraints
  - Render PopupContainer with ChatbotInterface as children
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.4, 2.5, 6.1, 6.2, 12.5_

- [x] 9. Integrate chatbot into root layout
  - Modify `app/layout.tsx` to import and wrap children with ChatbotProvider
  - Add ChatbotPopup component after children in layout
  - Create default ChatbotConfig object with OpenAI backend configuration
  - Add 'use client' directive to layout or create separate client wrapper component
  - _Requirements: 12.1, 12.2, 12.3_

- [x] 10. Add responsive design and accessibility
  - [x] 10.1 Implement responsive breakpoints
    - Add mobile-specific styles for viewport width < 768px
    - Adjust popup width to full screen minus margins on mobile
    - Update max-height calculation based on viewport height changes
    - Ensure text remains readable at all screen sizes
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 10.2 Add accessibility features
    - Add ARIA labels to all interactive elements (buttons, inputs)
    - Implement keyboard navigation support (Tab, Enter, Escape)
    - Add focus management for popup open/close
    - Ensure sufficient color contrast for all text
    - _Requirements: 6.5_

- [x] 11. Create example tool definitions
  - Create `lib/chatbot/example-tools.ts` with sample tool definitions
  - Implement a simple calculator tool with add/subtract operations
  - Implement a weather lookup tool (mock data)
  - Export tools array for use in ChatbotConfig
  - _Requirements: 9.1, 9.2_

- [x] 12. Add configuration documentation
  - Create `lib/chatbot/README.md` with usage instructions
  - Document ChatbotConfig interface and all configuration options
  - Provide examples for OpenAI and local model configurations
  - Document how to create custom tools
  - Add troubleshooting section for common errors
  - _Requirements: 8.1, 8.2, 8.3, 9.1_
