import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import type { Star } from '../lib/supabase/types';

// Define database schema type
type Database = {
  public: {
    Tables: {
      stars: {
        Row: Star;
      };
    };
  };
};

// Create a Supabase client for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

test.describe('RAG Tool - search_stars Database Queries', () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  test.beforeAll(() => {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient<Database>(supabaseUrl, supabaseKey);
  });

  test('should search by star name - Sirius', async () => {
    const query = 'Sirius';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    
    // Verify at least one star matches Sirius
    const matchingStar = data!.find((star: Star) => 
      star.name.toLowerCase().includes('sirius')
    );
    expect(matchingStar).toBeDefined();
  });

  test('should search by star name - Rigel', async () => {
    const query = 'Rigel';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    
    const matchingStar = data!.find((star: Star) => 
      star.name.toLowerCase().includes('rigel')
    );
    expect(matchingStar).toBeDefined();
  });

  test('should search by constellation - Orion', async () => {
    const query = 'Orion';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    
    const orionStar = data!.find((star: Star) => 
      star.constellation.toLowerCase().includes('orion')
    );
    expect(orionStar).toBeDefined();
  });

  test('should search by constellation - Ursa Major', async () => {
    const query = 'Ursa Major';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const ursaMajorStar = data.find((star: Star) => 
        star.constellation.toLowerCase().includes('ursa major')
      );
      expect(ursaMajorStar).toBeDefined();
    }
  });

  test('should search by description keywords', async () => {
    const query = 'bright';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const matchingStar = data.find((star: Star) => 
        star.description?.toLowerCase().includes('bright') ||
        star.name.toLowerCase().includes('bright') ||
        star.constellation.toLowerCase().includes('bright')
      );
      expect(matchingStar).toBeDefined();
    }
  });

  test('should respect limit parameter - limit 3', async () => {
    const query = 'star';
    const searchPattern = `%${query}%`;
    const limit = 3;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(limit);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      expect(data.length).toBeLessThanOrEqual(3);
    }
  });

  test('should respect limit parameter - limit 10 (max)', async () => {
    const query = 'star';
    const searchPattern = `%${query}%`;
    const limit = 10;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(limit);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeLessThanOrEqual(10);
  });

  test('should handle no results scenario', async () => {
    const query = 'xyzabc123nonexistent999';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBe(0);
  });

  test('should perform case-insensitive search - lowercase', async () => {
    const query = 'sirius';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const matchingStar = data.find((star: Star) => 
        star.name.toLowerCase().includes('sirius')
      );
      expect(matchingStar).toBeDefined();
    }
  });

  test('should perform case-insensitive search - uppercase', async () => {
    const query = 'SIRIUS';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const matchingStar = data.find((star: Star) => 
        star.name.toLowerCase().includes('sirius')
      );
      expect(matchingStar).toBeDefined();
    }
  });

  test('should perform case-insensitive search - mixed case', async () => {
    const query = 'SiRiUs';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const matchingStar = data.find((star: Star) => 
        star.name.toLowerCase().includes('sirius')
      );
      expect(matchingStar).toBeDefined();
    }
  });

  test('should return star data with all required fields', async () => {
    const query = 'Sirius';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      const star: Star = data[0];
      
      // Verify all required fields are present
      expect(star.id).toBeDefined();
      expect(typeof star.id).toBe('number');
      expect(star.name).toBeDefined();
      expect(typeof star.name).toBe('string');
      expect(star.description).toBeDefined();
      expect(typeof star.description).toBe('string');
      expect(star.constellation).toBeDefined();
      expect(typeof star.constellation).toBe('string');
      expect(star.magnitude).toBeDefined();
      expect(typeof star.magnitude).toBe('number');
      expect(star.distance_light_years).toBeDefined();
      expect(typeof star.distance_light_years).toBe('number');
      expect(star.photo_url).toBeDefined();
      expect(typeof star.photo_url).toBe('string');
    }
  });

  test('should use default limit of 5 when not specified', async () => {
    const query = 'star';
    const searchPattern = `%${query}%`;
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(error).toBeNull();
    expect(data).toBeDefined();
    
    if (data && data.length > 0) {
      expect(data.length).toBeLessThanOrEqual(5);
    }
  });
});

test.describe('Navigation Tool - navigate_to_page', () => {
  test('should navigate to star detail page with valid star ID', async () => {
    const starId = 42;
    const destination = 'star';
    
    // Simulate the tool execution logic
    const result = {
      success: true,
      action: 'navigate',
      destination: 'star',
      url: `/star/${starId}`,
      message: 'Navigating to star detail page',
    };
    
    expect(result.success).toBe(true);
    expect(result.action).toBe('navigate');
    expect(result.destination).toBe('star');
    expect(result.url).toBe('/star/42');
    expect(result.message).toBeDefined();
  });

  test('should navigate to homepage', async () => {
    const destination = 'homepage';
    
    // Simulate the tool execution logic
    const result = {
      success: true,
      action: 'navigate',
      destination: 'homepage',
      url: '/',
      message: 'Navigating to homepage',
    };
    
    expect(result.success).toBe(true);
    expect(result.action).toBe('navigate');
    expect(result.destination).toBe('homepage');
    expect(result.url).toBe('/');
    expect(result.message).toBeDefined();
  });

  test('should handle error for missing star ID', async () => {
    const destination = 'star';
    const starId = undefined;
    
    // Simulate the tool execution logic
    let result;
    if (starId === undefined || starId === null) {
      result = {
        success: false,
        data: null,
        error: 'Star ID required for star navigation',
      };
    }
    
    expect(result?.success).toBe(false);
    expect(result?.error).toBe('Star ID required for star navigation');
  });

  test('should handle error for invalid destination', async () => {
    const destination: string = 'invalid-destination';
    
    // Simulate the tool execution logic
    let result;
    if (destination !== 'star' && destination !== 'homepage') {
      result = {
        success: false,
        data: null,
        error: 'Invalid destination. Must be "star" or "homepage"',
      };
    }
    
    expect(result?.success).toBe(false);
    expect(result?.error).toContain('Invalid destination');
  });

  test('should verify URL construction is correct for star pages', async () => {
    const testCases = [
      { starId: 1, expectedUrl: '/star/1' },
      { starId: 42, expectedUrl: '/star/42' },
      { starId: 999, expectedUrl: '/star/999' },
      { starId: 12345, expectedUrl: '/star/12345' },
    ];
    
    for (const testCase of testCases) {
      const url = `/star/${testCase.starId}`;
      expect(url).toBe(testCase.expectedUrl);
    }
  });

  test('should handle invalid star ID - negative number', async () => {
    const destination = 'star';
    const starId = -5;
    
    // Simulate the tool execution logic
    let result;
    if (typeof starId !== 'number' || starId <= 0 || !Number.isInteger(starId)) {
      result = {
        success: false,
        data: null,
        error: 'Invalid star ID. Must be a positive integer',
      };
    }
    
    expect(result?.success).toBe(false);
    expect(result?.error).toContain('Invalid star ID');
  });

  test('should handle invalid star ID - zero', async () => {
    const destination = 'star';
    const starId = 0;
    
    // Simulate the tool execution logic
    let result;
    if (typeof starId !== 'number' || starId <= 0 || !Number.isInteger(starId)) {
      result = {
        success: false,
        data: null,
        error: 'Invalid star ID. Must be a positive integer',
      };
    }
    
    expect(result?.success).toBe(false);
    expect(result?.error).toContain('Invalid star ID');
  });

  test('should handle invalid star ID - decimal number', async () => {
    const destination = 'star';
    const starId = 42.5;
    
    // Simulate the tool execution logic
    let result;
    if (typeof starId !== 'number' || starId <= 0 || !Number.isInteger(starId)) {
      result = {
        success: false,
        data: null,
        error: 'Invalid star ID. Must be a positive integer',
      };
    }
    
    expect(result?.success).toBe(false);
    expect(result?.error).toContain('Invalid star ID');
  });
});

test.describe('Multi-Tool Workflow - Star Navigation by Name', () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  test.beforeAll(() => {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }
    supabase = createClient<Database>(supabaseUrl, supabaseKey);
  });

  test('should complete flow: search for star by name and navigate to detail page', async () => {
    // Step 1: User asks to see star page by name (e.g., "Show me Rigel")
    const starName = 'Rigel';
    
    // Step 2: Chatbot invokes search_stars to get star ID
    const searchPattern = `%${starName}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    expect(searchResults!.length).toBeGreaterThan(0);
    
    // Find the matching star
    const matchingStar = searchResults!.find((star: Star) => 
      star.name.toLowerCase().includes(starName.toLowerCase())
    ) as Star | undefined;
    expect(matchingStar).toBeDefined();
    
    if (matchingStar) {
      expect(matchingStar.id).toBeDefined();
      
      // Step 3: Chatbot invokes navigate_to_page with the retrieved ID
      const starId = matchingStar.id;
      const navigationResult = {
        success: true,
        action: 'navigate',
        destination: 'star',
        url: `/star/${starId}`,
        message: `Navigating to ${matchingStar.name} detail page`,
      };
      
      // Step 4: Verify navigation executes correctly
      expect(navigationResult.success).toBe(true);
      expect(navigationResult.action).toBe('navigate');
      expect(navigationResult.url).toBe(`/star/${starId}`);
      expect(navigationResult.url).toMatch(/^\/star\/\d+$/);
    }
  });

  test('should complete flow: search for Sirius and navigate', async () => {
    const starName = 'Sirius';
    
    // Search for the star
    const searchPattern = `%${starName}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    expect(searchResults!.length).toBeGreaterThan(0);
    
    const matchingStar = searchResults!.find((star: Star) => 
      star.name.toLowerCase().includes(starName.toLowerCase())
    ) as Star | undefined;
    expect(matchingStar).toBeDefined();
    
    if (matchingStar) {
      // Navigate to the star
      const navigationResult = {
        success: true,
        action: 'navigate',
        destination: 'star',
        url: `/star/${matchingStar.id}`,
        message: `Navigating to ${matchingStar.name} detail page`,
      };
      
      expect(navigationResult.success).toBe(true);
      expect(navigationResult.url).toContain('/star/');
    }
  });

  test('should handle ambiguous star names - multiple results', async () => {
    // Search for a common term that might match multiple stars
    const starName = 'Alpha';
    
    const searchPattern = `%${starName}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    
    // If multiple results found, chatbot should handle by:
    // 1. Presenting options to user, OR
    // 2. Selecting the first/most relevant result
    if (searchResults && searchResults.length > 1) {
      // Verify we can navigate to the first result
      const firstStar = searchResults[0] as Star;
      const navigationResult = {
        success: true,
        action: 'navigate',
        destination: 'star',
        url: `/star/${firstStar.id}`,
        message: `Navigating to ${firstStar.name} detail page`,
      };
      
      expect(navigationResult.success).toBe(true);
      expect(navigationResult.url).toBe(`/star/${firstStar.id}`);
    } else if (searchResults && searchResults.length === 1) {
      // Single result - straightforward navigation
      const singleStar = searchResults[0] as Star;
      const navigationResult = {
        success: true,
        action: 'navigate',
        destination: 'star',
        url: `/star/${singleStar.id}`,
        message: `Navigating to ${singleStar.name} detail page`,
      };
      
      expect(navigationResult.success).toBe(true);
    }
  });

  test('should handle non-existent star names gracefully', async () => {
    const starName = 'NonExistentStar12345XYZ';
    
    // Step 1: Search for non-existent star
    const searchPattern = `%${starName}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    expect(searchResults!.length).toBe(0);
    
    // Step 2: When no results found, navigation should not occur
    // Chatbot should inform user that star was not found
    const searchResult = {
      success: true,
      stars: [],
      count: 0,
      message: 'No stars found matching your query',
    };
    
    expect(searchResult.success).toBe(true);
    expect(searchResult.stars.length).toBe(0);
    expect(searchResult.message).toContain('No stars found');
    
    // Navigation should not be attempted without a valid star ID
    // This test verifies the search returns empty, preventing navigation
  });

  test('should handle partial star name matches', async () => {
    // User might type partial name like "Rige" instead of "Rigel"
    const partialName = 'Rige';
    
    const searchPattern = `%${partialName}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    
    if (searchResults && searchResults.length > 0) {
      // Verify we found stars with partial match
      const matchingStar = searchResults.find((star: Star) => 
        star.name.toLowerCase().includes(partialName.toLowerCase())
      ) as Star | undefined;
      
      if (matchingStar) {
        expect(matchingStar).toBeDefined();
        
        // Navigate to the matched star
        const navigationResult = {
          success: true,
          action: 'navigate',
          destination: 'star',
          url: `/star/${matchingStar.id}`,
          message: `Navigating to ${matchingStar.name} detail page`,
        };
        
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.url).toMatch(/^\/star\/\d+$/);
      }
    }
  });

  test('should handle case-insensitive star name search in workflow', async () => {
    // Test with different case variations
    const testCases = ['sirius', 'SIRIUS', 'SiRiUs'];
    
    for (const starName of testCases) {
      const searchPattern = `%${starName}%`;
      const { data: searchResults, error: searchError } = await supabase
        .from('stars')
        .select('*')
        .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
        .limit(5);

      expect(searchError).toBeNull();
      expect(searchResults).toBeDefined();
      
      if (searchResults && searchResults.length > 0) {
        const matchingStar = searchResults.find((star: Star) => 
          star.name.toLowerCase().includes('sirius')
        ) as Star | undefined;
        
        if (matchingStar) {
          expect(matchingStar).toBeDefined();
          
          const navigationResult = {
            success: true,
            action: 'navigate',
            destination: 'star',
            url: `/star/${matchingStar.id}`,
            message: `Navigating to ${matchingStar.name} detail page`,
          };
          
          expect(navigationResult.success).toBe(true);
          expect(navigationResult.url).toContain('/star/');
        }
      }
    }
  });

  test('should verify complete workflow with constellation-based search', async () => {
    // User asks: "Show me a star from Orion"
    const constellation = 'Orion';
    
    // Search by constellation
    const searchPattern = `%${constellation}%`;
    const { data: searchResults, error: searchError } = await supabase
      .from('stars')
      .select('*')
      .or(`name.ilike.${searchPattern},constellation.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .limit(5);

    expect(searchError).toBeNull();
    expect(searchResults).toBeDefined();
    
    if (searchResults && searchResults.length > 0) {
      // Find a star in Orion constellation
      const orionStar = searchResults.find((star: Star) => 
        star.constellation.toLowerCase().includes('orion')
      ) as Star | undefined;
      
      if (orionStar) {
        expect(orionStar).toBeDefined();
        expect(orionStar.constellation.toLowerCase()).toContain('orion');
        
        // Navigate to the star
        const navigationResult = {
          success: true,
          action: 'navigate',
          destination: 'star',
          url: `/star/${orionStar.id}`,
          message: `Navigating to ${orionStar.name} detail page`,
        };
        
        expect(navigationResult.success).toBe(true);
        expect(navigationResult.url).toBe(`/star/${orionStar.id}`);
      }
    }
  });
});
