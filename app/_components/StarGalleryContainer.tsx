import { Suspense } from 'react';
import { getStars } from '@/lib/supabase/stars';
import StarGallery from './StarGallery';
import StarGalleryLoading from './StarGalleryLoading';

/**
 * Server Component that fetches star data and renders the StarGallery
 * Wraps the gallery with Suspense for loading states
 */
export default async function StarGalleryContainer() {
  try {
    // Fetch star data from Supabase
    const stars = await getStars();

    return (
      <Suspense fallback={<StarGalleryLoading />}>
        <StarGallery stars={stars} />
      </Suspense>
    );
  } catch (error) {
    // Log error for debugging
    console.error('Error loading star gallery:', error);
    
    // Return error state UI
    return (
      <div className="w-full py-8 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="text-red-400 text-lg font-semibold">
            Unable to load star gallery
          </div>
          <p className="text-slate-400 text-sm">
            There was a problem connecting to the star database. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
