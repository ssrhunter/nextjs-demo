import { createServerClient } from './client';
import type { Star } from './types';

/**
 * Fetches all stars from the Stars table
 * @returns Promise resolving to array of Star objects
 * @throws Error if database query fails
 */
export async function getStars(): Promise<Star[]> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching stars:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error('Unable to retrieve star data from database');
    }

    return data || [];
  } catch (error) {
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error in getStars:', {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('Unexpected error in getStars:', error);
    }
    
    // Re-throw with user-friendly message
    if (error instanceof Error && error.message.includes('Missing Supabase configuration')) {
      throw new Error('Database configuration error. Please contact support.');
    }
    
    throw error;
  }
}

/**
 * Fetches a single star by ID from the Stars table
 * @param id - The unique identifier of the star
 * @returns Promise resolving to Star object or null if not found
 * @throws Error if database query fails
 */
export async function getStarById(id: number): Promise<Star | null> {
  try {
    const supabase = await createServerClient();
    
    const { data, error } = await supabase
      .from('stars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Handle "not found" case gracefully
      if (error.code === 'PGRST116') {
        console.warn(`Star with id ${id} not found`);
        return null;
      }
      
      console.error('Database error fetching star by id:', {
        id,
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw new Error('Unable to retrieve star data from database');
    }

    return data;
  } catch (error) {
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error in getStarById:', {
        id,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('Unexpected error in getStarById:', { id, error });
    }
    
    // Re-throw with user-friendly message
    if (error instanceof Error && error.message.includes('Missing Supabase configuration')) {
      throw new Error('Database configuration error. Please contact support.');
    }
    
    throw error;
  }
}
