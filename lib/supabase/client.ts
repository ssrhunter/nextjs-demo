import { createBrowserClient as createBrowserSupabaseClient } from '@supabase/ssr';
import { createServerClient as createServerSupabaseClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for use in Server Components and Server Actions
 * Handles cookie management for authentication
 * @throws Error if Supabase configuration is missing
 */
export async function createServerClient(): Promise<SupabaseClient> {
  // Import cookies only when needed (inside the function)
  const { cookies } = await import('next/headers');
  
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const errorMessage = `Missing Supabase configuration: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    const cookieStore = await cookies();

    return createServerSupabaseClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error) {
    console.error('Failed to create Supabase server client:', error);
    throw new Error('Unable to connect to database');
  }
}

/**
 * Creates a Supabase client for use in Client Components
 * Uses browser-based cookie handling
 * @throws Error if Supabase configuration is missing
 */
export function createBrowserClient(): SupabaseClient {
  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    const errorMessage = `Missing Supabase configuration: ${missingVars.join(', ')}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  try {
    return createBrowserSupabaseClient(
      supabaseUrl,
      supabaseAnonKey
    );
  } catch (error) {
    console.error('Failed to create Supabase browser client:', error);
    throw new Error('Unable to connect to database');
  }
}
