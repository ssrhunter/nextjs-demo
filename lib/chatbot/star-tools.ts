import { ToolDefinition, StarQueryResult, NavigationResult, ToolResponse } from './types';
import { createServerClient } from '../supabase/client';

/**
 * RAG Tool: Searches the star database for stars matching the query
 * Uses Supabase full-text search and pattern matching
 */
const searchStarsTool: ToolDefinition = {
  name: 'search_stars',
  description: 'Searches the star database for stars matching the query. Use this when users ask about specific stars, star characteristics, or want to find stars by name, constellation, or properties.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query (star name, constellation, or description keywords)',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 5, max: 10)',
      },
    },
    required: ['query'],
  },
  execute: async (params: Record<string, any>): Promise<StarQueryResult> => {
    try {
      // Log incoming parameters for debugging
      console.log('search_stars called with params:', {
        params,
        paramsType: typeof params,
        paramsKeys: params ? Object.keys(params) : [],
        query: params?.query,
        queryType: typeof params?.query,
      });

      // Parameter validation
      const { query, limit = 5 } = params;

      if (query === undefined || query === null) {
        console.error('search_stars: query parameter is missing');
        return {
          success: false,
          stars: [],
          count: 0,
          message: 'Invalid parameter: query is required',
        };
      }

      if (typeof query !== 'string') {
        console.error('search_stars: query parameter is not a string', { query, type: typeof query });
        return {
          success: false,
          stars: [],
          count: 0,
          message: `Invalid parameter: query must be a string, got ${typeof query}`,
        };
      }

      if (query.trim() === '') {
        console.error('search_stars: query parameter is empty string');
        return {
          success: false,
          stars: [],
          count: 0,
          message: 'Invalid parameter: query must be a non-empty string',
        };
      }

      const searchLimit = typeof limit === 'number' ? Math.min(Math.max(1, limit), 10) : 5;

      // Create Supabase client
      const supabase = await createServerClient();

      // Perform case-insensitive search across name, constellation, and description
      // Using ilike for pattern matching (case-insensitive LIKE)
      const searchPattern = `%${query.trim()}%`;
      
      const { data, error } = await supabase
        .from('stars')
        .select('*')
        .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(searchLimit);

      if (error) {
        console.error('Database error searching stars:', {
          query,
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return {
          success: false,
          stars: [],
          count: 0,
          message: 'Unable to connect to star database',
        };
      }

      const stars = data || [];

      if (stars.length === 0) {
        return {
          success: true,
          stars: [],
          count: 0,
          message: 'No stars found matching your query',
        };
      }

      return {
        success: true,
        stars,
        count: stars.length,
        message: `Found ${stars.length} star${stars.length > 1 ? 's' : ''} matching your query`,
      };
    } catch (error) {
      console.error('Error in search_stars tool:', error);
      return {
        success: false,
        stars: [],
        count: 0,
        message: error instanceof Error ? error.message : 'Failed to search stars',
      };
    }
  },
};

/**
 * Navigation Tool: Navigates users to star detail pages or homepage
 * Returns a navigation action that the client-side interface will execute
 */
const navigateToPageTool: ToolDefinition = {
  name: 'navigate_to_page',
  description: 'Navigates the user to a specific page. Use this when the user wants to view detailed information about a star or return to the homepage.',
  parameters: {
    type: 'object',
    properties: {
      destination: {
        type: 'string',
        description: 'The destination to navigate to',
        enum: ['star', 'homepage'],
      },
      starId: {
        type: 'number',
        description: 'The ID of the star to navigate to (required when destination is "star")',
      },
    },
    required: ['destination'],
  },
  execute: async (params: Record<string, any>): Promise<NavigationResult | ToolResponse> => {
    try {
      const { destination, starId } = params;

      // Validate destination
      if (destination !== 'star' && destination !== 'homepage') {
        return {
          success: false,
          data: null,
          error: 'Invalid destination. Must be "star" or "homepage"',
        };
      }

      // Handle homepage navigation
      if (destination === 'homepage') {
        return {
          success: true,
          action: 'navigate',
          destination: 'homepage',
          url: '/',
          message: 'Navigating to homepage',
        };
      }

      // Handle star page navigation
      if (destination === 'star') {
        // Validate starId is provided
        if (starId === undefined || starId === null) {
          return {
            success: false,
            data: null,
            error: 'Star ID required for star navigation',
          };
        }

        // Validate starId is a positive number
        if (typeof starId !== 'number' || starId <= 0 || !Number.isInteger(starId)) {
          return {
            success: false,
            data: null,
            error: 'Invalid star ID. Must be a positive integer',
          };
        }

        const url = `/star/${starId}`;
        return {
          success: true,
          action: 'navigate',
          destination: 'star',
          url,
          message: `Navigating to star detail page`,
        };
      }

      // Fallback error (should never reach here due to validation above)
      return {
        success: false,
        data: null,
        error: 'Invalid navigation request',
      };
    } catch (error) {
      console.error('Error in navigate_to_page tool:', error);
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Failed to navigate',
      };
    }
  },
};

/**
 * Array of star-related tools for use in ChatbotConfig
 */
export const starTools: ToolDefinition[] = [
  searchStarsTool,
  navigateToPageTool,
];

export default starTools;
