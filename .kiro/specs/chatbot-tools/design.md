# Design Document

## Overview

This design document outlines the implementation of two chatbot tools: a RAG (Retrieval-Augmented Generation) tool for querying star information from the Supabase database, and a Navigation tool for directing users to star detail pages or the homepage. These tools will integrate with the existing LangChain-based chatbot system and leverage the current Supabase infrastructure.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Chatbot Interface                        │
│                  (ChatbotWrapper/Popup)                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Chat API Route                             │
│              (app/api/chat/route.ts)                         │
│  • Receives messages                                         │
│  • Invokes LangChain with tools                              │
│  • Streams responses                                         │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────────┐  ┌────────────────────────────────┐
│    RAG Tool            │  │   Navigation Tool              │
│  • Query stars DB      │  │  • Navigate to star page       │
│  • Semantic search     │  │  • Navigate to homepage        │
│  • Return results      │  │  • Client-side routing         │
└────────────┬───────────┘  └────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Database                          │
│                    (stars table)                             │
└─────────────────────────────────────────────────────────────┘
```

### Tool Integration Flow

1. User sends a message through the chatbot interface
2. Message is sent to the Chat API route
3. LangChain processes the message and determines if tools are needed
4. If tools are needed, LangChain invokes the appropriate tool
5. Tool executes and returns results
6. LangChain incorporates tool results into the response
7. Response is streamed back to the user

### Multi-Tool Workflow Example

When a user wants to navigate to a star's detail page:

1. User: "Show me the detail page for Betelgeuse"
2. LangChain invokes `search_stars` tool with query "Betelgeuse"
3. RAG tool returns star data including `id: 42`
4. LangChain processes the result and determines navigation is needed
5. LangChain invokes `navigate_to_page` tool with `destination: 'star'` and `starId: 42`
6. Navigation tool returns navigation action
7. Chatbot interface detects navigation action and executes client-side routing
8. User is navigated to `/star/42`

This multi-step process allows the chatbot to:
- First search for the star by name to get its ID
- Then use that ID to navigate to the correct page
- Handle cases where the star name is ambiguous or not found

## Components and Interfaces

### 1. RAG Tool (`lib/chatbot/star-tools.ts`)

**Purpose**: Query the Supabase database for star information based on user queries

**Tool Definition**:
```typescript
{
  name: 'search_stars',
  description: 'Searches the star database for stars matching the query. Use this when users ask about specific stars, star characteristics, or want to find stars by name, constellation, or properties.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query (star name, constellation, or description keywords)'
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5, max: 10)'
      }
    },
    required: ['query']
  }
}
```

**Implementation Strategy**:
- Use Supabase's full-text search capabilities on the `name`, `description`, and `constellation` fields
- Implement case-insensitive matching
- Return results ranked by relevance
- Include all star fields in results (id, name, description, constellation, magnitude, distance, photo_url)

**Error Handling**:
- Database connection errors: Return error message indicating service unavailability
- No results found: Return empty array with message
- Invalid parameters: Validate and return parameter error

### 2. Navigation Tool (`lib/chatbot/star-tools.ts`)

**Purpose**: Navigate users to star detail pages or homepage

**Tool Definition**:
```typescript
{
  name: 'navigate_to_page',
  description: 'Navigates the user to a specific page. Use this when the user wants to view detailed information about a star or return to the homepage.',
  parameters: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        description: 'The destination to navigate to',
        enum: ['star', 'homepage']
      },
      starId: {
        type: 'number',
        description: 'The ID of the star to navigate to (required when destination is "star")'
      }
    },
    required: ['destination']
  }
}
```

**Implementation Strategy**:
- Use Next.js router for client-side navigation
- For star pages: construct URL as `/star/[id]`
- For homepage: navigate to `/`
- Return navigation confirmation message
- Handle navigation errors gracefully

**Obtaining Star IDs**:
The Navigation tool requires a star ID to navigate to a star detail page. The chatbot will obtain this ID through the following workflow:
1. When a user requests navigation to a star by name (e.g., "Show me Betelgeuse's page")
2. LangChain first invokes the `search_stars` tool to find the star
3. The RAG tool returns the star data including the `id` field
4. LangChain then invokes the `navigate_to_page` tool with the retrieved `starId`
5. This multi-tool orchestration is handled automatically by LangChain

**Client-Side Execution**:
Since navigation must occur on the client side, the tool will:
1. Return a special response indicating navigation intent
2. The chatbot interface will detect this response
3. Execute the navigation using Next.js `useRouter`

### 3. Tool Registration

**Location**: `app/_components/chatbot/ChatbotWrapper.tsx`

**Integration**:
- Import star tools from `lib/chatbot/star-tools.ts`
- Add tools to the `defaultConfig.tools` array
- Tools will be automatically registered with LangChain

### 4. API Route Enhancement

**Location**: `app/api/chat/route.ts`

**Changes Required**:
- Import and register tools with ChatOpenAI
- Enable tool calling in the model configuration
- Handle tool call responses in the streaming logic
- Process tool results and incorporate into responses

## Data Models

### Star Query Result
```typescript
interface StarQueryResult {
  success: boolean;
  stars: Star[];
  count: number;
  message?: string;
}
```

### Navigation Result
```typescript
interface NavigationResult {
  success: boolean;
  action: 'navigate';
  destination: string;
  url: string;
  message: string;
}
```

### Tool Response Format
```typescript
interface ToolResponse {
  success: boolean;
  data: any;
  error?: string;
}
```

## Error Handling

### RAG Tool Errors

1. **Database Connection Failure**
   - Catch Supabase client errors
   - Return: `{ success: false, error: 'Unable to connect to star database' }`
   - Log error details for debugging

2. **Query Execution Failure**
   - Catch query errors
   - Return: `{ success: false, error: 'Failed to search stars' }`
   - Log query and error details

3. **No Results Found**
   - Return: `{ success: true, stars: [], count: 0, message: 'No stars found matching your query' }`

4. **Invalid Parameters**
   - Validate query is non-empty string
   - Validate limit is positive number ≤ 10
   - Return: `{ success: false, error: 'Invalid parameter: [details]' }`

### Navigation Tool Errors

1. **Invalid Destination**
   - Validate destination is 'star' or 'homepage'
   - Return: `{ success: false, error: 'Invalid destination' }`

2. **Missing Star ID**
   - When destination is 'star', ensure starId is provided
   - Return: `{ success: false, error: 'Star ID required for star navigation' }`

3. **Invalid Star ID**
   - Validate starId is a positive number
   - Return: `{ success: false, error: 'Invalid star ID' }`

### General Error Handling

- All tool functions wrapped in try-catch blocks
- Errors logged to console with context
- User-friendly error messages returned
- LangChain service handles tool execution errors gracefully

## Testing Strategy

### Unit Tests

1. **RAG Tool Tests**
   - Test successful star search with various queries
   - Test empty result handling
   - Test limit parameter validation
   - Test database error handling
   - Test case-insensitive search

2. **Navigation Tool Tests**
   - Test star page navigation with valid ID
   - Test homepage navigation
   - Test missing star ID error
   - Test invalid destination error
   - Test URL construction

### Integration Tests

1. **Tool Registration**
   - Verify tools are registered in ChatbotWrapper
   - Verify tools are available in LangChain service
   - Verify tool definitions match expected schema

2. **End-to-End Flow**
   - Test user query → RAG tool → response flow
   - Test navigation request → Navigation tool → client navigation
   - Test tool error → error message → user feedback

### Manual Testing

1. **RAG Tool Scenarios**
   - "Tell me about Sirius"
   - "What stars are in Orion?"
   - "Find bright stars"
   - "Show me stars with magnitude less than 2"

2. **Navigation Tool Scenarios**
   - "Show me the detail page for Betelgeuse"
   - "Take me to the homepage"
   - "I want to see more about that star"

3. **Combined Scenarios**
   - Search for star → Ask for navigation
   - Ask about multiple stars → Navigate to one
   - Navigate → Ask follow-up questions

## Implementation Notes

### Supabase Query Optimization

- Use `.textSearch()` for full-text search on description field
- Use `.ilike()` for pattern matching on name and constellation
- Combine multiple conditions with `.or()` filters
- Limit results to prevent performance issues
- Consider adding database indexes on searchable fields

### Client-Side Navigation Handling

The Navigation tool requires special handling since navigation must occur on the client:

1. Tool returns a special response format with `action: 'navigate'`
2. Chatbot interface monitors assistant messages for navigation actions
3. When detected, use `useRouter().push()` to navigate
4. Display confirmation message before navigation

### System Prompt Enhancement

Update the system prompt in `ChatbotWrapper.tsx` to inform the chatbot about available tools:

```
You are a helpful AI assistant who works as a star salesman. You help customers choose the right star which will help them satisfy their energy needs. The stars provide energy similar to how solar power works.

You have access to tools:
- search_stars: Search the star database for information
- navigate_to_page: Navigate users to star detail pages or homepage

Use these tools to provide accurate information and help users explore stars.
```

### Performance Considerations

1. **Database Queries**
   - Limit default results to 5 stars
   - Maximum limit of 10 stars
   - Use database indexes for faster searches

2. **Response Streaming**
   - Tool results incorporated into streaming response
   - No blocking on tool execution
   - Graceful degradation if tools fail

3. **Caching**
   - Consider caching frequent star queries
   - Use Next.js caching for star data
   - Implement stale-while-revalidate pattern

## Security Considerations

1. **Input Validation**
   - Sanitize search queries to prevent SQL injection
   - Validate all tool parameters before execution
   - Use Supabase's parameterized queries

2. **Rate Limiting**
   - Consider rate limiting tool calls
   - Prevent abuse of database queries
   - Monitor tool usage patterns

3. **Error Information**
   - Don't expose internal error details to users
   - Log detailed errors server-side only
   - Return generic error messages to client

## Future Enhancements

1. **Advanced RAG Features**
   - Vector embeddings for semantic search
   - Similarity scoring for better ranking
   - Multi-field weighted search

2. **Navigation Enhancements**
   - Navigate to filtered gallery views
   - Deep linking with query parameters
   - Navigation history tracking

3. **Additional Tools**
   - Star comparison tool
   - Favorite stars management
   - Star recommendations based on criteria

4. **Analytics**
   - Track tool usage patterns
   - Monitor search queries
   - Analyze navigation patterns
