# Implementation Plan

- [x] 1. Set up Supabase integration and configuration
  - Install @supabase/supabase-js and @supabase/ssr packages
  - Add Supabase environment variables to .env.local (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - Create Supabase client factory functions for server and browser contexts
  - _Requirements: 4.1, 4.2_

- [x] 2. Create data models and type definitions
  - Define Star interface with all required fields (id, name, photo_url, description, distance_light_years, constellation, magnitude, created_at)
  - Export types from lib/supabase/types.ts
  - _Requirements: 4.3_

- [x] 3. Implement data access layer for Stars table
  - Create getStars() function to fetch all stars from Supabase
  - Create getStarById() function for single star queries
  - Implement error handling for database queries
  - _Requirements: 1.1, 4.2, 4.3, 4.4_

- [x] 4. Build StarCard component
  - Create StarCard component with Star and scale props
  - Implement dark space-themed styling with Tailwind CSS
  - Add star photo display with proper aspect ratio
  - Display star information (name, constellation, distance, magnitude)
  - Implement scale transformation based on position
  - Add smooth transition animations for scale changes
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Build StarGallery scrollable container component
- [x] 5.1 Create StarGallery client component structure
  - Set up horizontal scroll container with overflow hidden
  - Implement flexbox layout for horizontal card arrangement
  - Add padding to allow first/last cards to center
  - Hide scrollbar while maintaining scroll functionality
  - _Requirements: 3.1, 3.3, 3.4_

- [x] 5.2 Implement center-focus scaling logic
  - Add IntersectionObserver to detect card positions
  - Calculate scale values based on distance from center (1.2x for center, 1.0x adjacent, 0.8x others)
  - Update card scales dynamically on scroll
  - Implement smooth transitions between scale states
  - _Requirements: 3.6, 3.7_

- [x] 5.3 Add scroll snap behavior
  - Configure CSS scroll-snap for smooth card-to-card navigation
  - Ensure cards snap to center position
  - Test scroll behavior across different viewport sizes
  - _Requirements: 3.2, 3.5_

- [x] 6. Create loading and empty state components
  - Build StarGalleryLoading skeleton component with pulsing animation
  - Create empty state component for zero stars
  - Style loading states to match space theme
  - _Requirements: 5.1, 5.3_

- [x] 7. Build StarGalleryContainer Server Component
  - Create async Server Component to fetch star data
  - Wrap StarGallery with React Suspense boundary
  - Pass fetched stars data to StarGallery client component
  - Handle error cases with try-catch
  - _Requirements: 1.1, 1.2, 5.1, 5.2, 5.5_

- [x] 8. Integrate StarGallery into home page
  - Import StarGalleryContainer into app/page.tsx
  - Position gallery below existing Logo component
  - Ensure page remains stationary during gallery scroll
  - Test integration with existing GalaxyAnimation background
  - _Requirements: 1.4, 3.3_

- [x] 9. Implement error handling and boundaries
  - Add error.tsx for global error boundary
  - Handle Supabase connection errors gracefully
  - Display user-friendly error messages
  - Log errors for debugging
  - _Requirements: 1.3, 4.4_

- [x] 10. Optimize performance and accessibility
  - Use Next.js Image component for star photos
  - Add lazy loading for images
  - Implement keyboard navigation for gallery
  - Add ARIA labels and semantic HTML
  - Add alt text for star images
  - Test with reduced motion preferences
  - _Requirements: 5.4_
