# Implementation Plan

- [x] 1. Create NavigationArrows component with scroll state management
  - Create new file `app/_components/star-gallery/NavigationArrows.tsx`
  - Implement scroll state tracking using scroll event listeners
  - Calculate arrow visibility based on scroll position (canScrollLeft, canScrollRight)
  - Add throttled scroll event handler to prevent excessive re-renders
  - Implement useEffect hook to attach/detach scroll listeners
  - Handle edge case where scroll container is not available
  - _Requirements: 1.1, 1.4, 1.5_

- [x] 2. Create ArrowButton component with 8-bit pixelated styling
  - Create SVG arrow graphics with pixelated design in NavigationArrows.tsx
  - Implement left and right arrow variants
  - Apply CSS glow effect using drop-shadow filters
  - Add hover state with enhanced glow effect
  - Ensure crisp pixel rendering with shape-rendering attribute
  - Use indigo color scheme matching existing application theme
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Implement click handlers and scroll navigation logic
  - Add onClick handler that scrolls by one card width plus gap (352px)
  - Use smooth scrolling behavior by default
  - Calculate scroll amount based on existing card width constant (320px + 32px gap)
  - Ensure scroll aligns with existing scroll-snap behavior
  - Add debouncing to prevent rapid click conflicts
  - _Requirements: 1.2, 1.3_

- [x] 4. Add keyboard accessibility and ARIA attributes
  - Implement onKeyDown handler for Enter and Space keys
  - Add appropriate ARIA labels for left and right arrows
  - Make buttons keyboard focusable with proper tabIndex
  - Add visible focus indicators matching existing card focus styles
  - Set aria-hidden and tabIndex={-1} when arrows are hidden
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 5. Implement responsive positioning and mobile optimization
  - Position arrows using fixed positioning at 50% viewport height
  - Calculate horizontal position to appear outside gallery area on desktop
  - Add responsive positioning for tablet and mobile viewports
  - Ensure minimum 44x44px touch target size on mobile
  - Add appropriate spacing to prevent overlap with star cards
  - Test positioning at breakpoints: mobile (<768px), tablet (768-1023px), desktop (>=1024px)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Add reduced motion support
  - Use existing prefersReducedMotion state from StarGallery
  - Pass prefersReducedMotion prop to NavigationArrows component
  - Disable transition animations when reduced motion is enabled
  - Use instant scroll instead of smooth scroll when reduced motion is enabled
  - Remove animated glow effects when reduced motion is enabled
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Integrate NavigationArrows into StarGallery component
  - Import NavigationArrows component in StarGallery.tsx
  - Pass scrollContainerRef to NavigationArrows
  - Create scroll handler function and pass to NavigationArrows
  - Pass prefersReducedMotion state to NavigationArrows
  - Position NavigationArrows component in JSX after scroll container
  - Ensure z-index layering doesn't interfere with existing elements
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 8. Add visibility transitions and polish
  - Implement fade in/out transitions for arrow visibility changes
  - Use opacity and pointer-events to hide arrows smoothly
  - Ensure transitions respect reduced motion preferences
  - Add transition delays to prevent flickering during scroll
  - Test visibility transitions at scroll boundaries
  - _Requirements: 1.4, 1.5, 5.1_

- [x] 9. Write integration tests for navigation arrows
  - Create test file `tests/navigation-arrows.spec.ts`
  - Test arrow visibility at different scroll positions
  - Test click navigation scrolls correct amount
  - Test keyboard navigation (Enter and Space keys)
  - Test arrows hide at scroll boundaries
  - Test reduced motion behavior
  - Test responsive positioning at different viewport sizes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 4.3, 5.1, 5.3_
