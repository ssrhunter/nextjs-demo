# Design Document

## Overview

This feature adds retro-styled navigation arrows to the star gallery, enabling users to scroll through star cards with clickable controls. The arrows will feature an 8-bit pixelated aesthetic with a gentle glow effect, positioned on the left and right sides of the gallery near the center card. The arrows will intelligently show/hide based on scroll position and respect accessibility preferences including keyboard navigation and reduced motion settings.

## Architecture

### Component Structure

The navigation system will be implemented as a new component integrated into the existing `StarGallery` component:

```
StarGallery (existing - modified)
├── ScrollContainer (existing)
│   └── StarCard[] (existing)
└── NavigationArrows (new)
    ├── LeftArrow (new)
    └── RightArrow (new)
```

### State Management

The navigation arrows will use React hooks to manage:
- **Scroll position tracking**: Monitor the scroll container's position to determine arrow visibility
- **Scroll boundaries**: Calculate whether the container can scroll left or right
- **Reduced motion preference**: Detect and respect user's motion preferences
- **Hover/focus states**: Track interactive states for visual feedback

### Integration Points

1. **StarGallery.tsx**: Add navigation arrows component and scroll position tracking
2. **New NavigationArrows.tsx**: Implement the arrow UI and click handlers
3. **New navigation-arrows.css** (optional): Custom CSS for pixelated styling if needed

## Components and Interfaces

### NavigationArrows Component

```typescript
interface NavigationArrowsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onNavigate: (direction: 'left' | 'right') => void;
  prefersReducedMotion: boolean;
}

export default function NavigationArrows({
  scrollContainerRef,
  onNavigate,
  prefersReducedMotion
}: NavigationArrowsProps): JSX.Element
```

**Responsibilities:**
- Render left and right arrow buttons
- Track scroll position to determine visibility
- Handle click events and trigger scroll actions
- Apply appropriate ARIA labels and keyboard handlers
- Manage visibility transitions

### Arrow Button Component

```typescript
interface ArrowButtonProps {
  direction: 'left' | 'right';
  visible: boolean;
  onClick: () => void;
  prefersReducedMotion: boolean;
}

function ArrowButton({
  direction,
  visible,
  onClick,
  prefersReducedMotion
}: ArrowButtonProps): JSX.Element
```

**Responsibilities:**
- Render individual arrow with pixelated styling
- Apply glow effect using CSS
- Handle keyboard interactions (Enter/Space)
- Provide hover and focus states
- Manage visibility with appropriate transitions

## Data Models

### Scroll State

```typescript
interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  isAtStart: boolean;
  isAtEnd: boolean;
}
```

This state will be calculated based on:
- `scrollLeft`: Current horizontal scroll position
- `scrollWidth`: Total scrollable width
- `clientWidth`: Visible width of the container

### Arrow Visibility Logic

```typescript
const calculateScrollState = (container: HTMLDivElement): ScrollState => {
  const { scrollLeft, scrollWidth, clientWidth } = container;
  const scrollThreshold = 10; // pixels of tolerance
  
  return {
    canScrollLeft: scrollLeft > scrollThreshold,
    canScrollRight: scrollLeft < (scrollWidth - clientWidth - scrollThreshold),
    isAtStart: scrollLeft <= scrollThreshold,
    isAtEnd: scrollLeft >= (scrollWidth - clientWidth - scrollThreshold)
  };
};
```

## Visual Design

### 8-Bit Pixelated Arrow Style

The arrows will be created using one of two approaches:

**Option 1: CSS Pixel Art**
- Use box-shadow technique to create pixelated appearance
- Build arrow shape from multiple small squares
- Apply image-rendering: pixelated for crisp edges

**Option 2: SVG Graphics**
- Create SVG path with pixelated arrow design
- Use shape-rendering: crispEdges for pixel-perfect rendering
- Easier to scale and maintain

**Recommended: SVG approach** for better scalability and maintainability.

### Glow Effect

```css
.navigation-arrow {
  filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6))
          drop-shadow(0 0 16px rgba(99, 102, 241, 0.3));
  transition: filter 0.3s ease;
}

.navigation-arrow:hover {
  filter: drop-shadow(0 0 12px rgba(99, 102, 241, 0.8))
          drop-shadow(0 0 24px rgba(99, 102, 241, 0.4));
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .navigation-arrow {
    transition: none;
  }
}
```

### Positioning

```css
.navigation-arrows-container {
  position: fixed;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 10;
}

.arrow-button {
  position: absolute;
  pointer-events: auto;
  /* Left arrow */
  &.left {
    left: max(2rem, calc((100vw - 80rem) / 2 - 4rem));
  }
  /* Right arrow */
  &.right {
    right: max(2rem, calc((100vw - 80rem) / 2 - 4rem));
  }
}
```

### Color Scheme

Using existing application colors:
- Primary glow: `indigo-500` (#6366f1)
- Hover glow: `indigo-400` (#818cf8)
- Arrow fill: `slate-50` (#f8fafc)
- Background: `slate-900/80` with backdrop blur

### Responsive Behavior

- **Desktop (>= 1024px)**: Arrows positioned outside gallery area
- **Tablet (768px - 1023px)**: Arrows positioned at viewport edges with padding
- **Mobile (< 768px)**: Arrows positioned with minimum 1rem padding, slightly smaller size

## Error Handling

### Scroll Container Not Found

```typescript
if (!scrollContainerRef.current) {
  console.warn('NavigationArrows: Scroll container ref not available');
  return null; // Don't render arrows
}
```

### Scroll Event Throttling

To prevent performance issues, scroll event listeners will be throttled:

```typescript
const useThrottledScroll = (callback: () => void, delay: number = 100) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(() => {
    if (timeoutRef.current) return;
    
    timeoutRef.current = setTimeout(() => {
      callback();
      timeoutRef.current = undefined;
    }, delay);
  }, [callback, delay]);
};
```

### Edge Cases

1. **Single star**: Hide both arrows when only one star exists
2. **Gallery smaller than viewport**: Hide both arrows when all cards are visible
3. **Rapid clicking**: Debounce click events to prevent scroll conflicts
4. **Browser compatibility**: Fallback for browsers without smooth scrolling support

## Testing Strategy

### Unit Tests

1. **Arrow visibility logic**
   - Test `calculateScrollState` with various scroll positions
   - Verify correct visibility states at boundaries
   - Test threshold tolerance values

2. **Click handlers**
   - Verify correct scroll amount calculation
   - Test smooth vs instant scrolling based on motion preference
   - Verify scroll direction (left vs right)

3. **Keyboard navigation**
   - Test Enter and Space key handlers
   - Verify focus management
   - Test tab order when arrows are hidden

### Integration Tests

1. **Scroll behavior**
   - Test scrolling through entire gallery
   - Verify arrows hide/show at correct positions
   - Test scroll snap alignment remains functional

2. **Accessibility**
   - Verify ARIA labels are present and correct
   - Test keyboard navigation flow
   - Verify screen reader announcements
   - Test with reduced motion enabled

3. **Responsive behavior**
   - Test arrow positioning at different viewport sizes
   - Verify touch target sizes on mobile
   - Test that arrows don't overlap cards

### Visual Regression Tests

1. Arrow appearance and glow effect
2. Hover and focus states
3. Visibility transitions
4. Positioning at different screen sizes

### Manual Testing Checklist

- [ ] Arrows appear with pixelated 8-bit style
- [ ] Glow effect is visible and subtle
- [ ] Clicking arrows scrolls one card at a time
- [ ] Arrows hide at scroll boundaries
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Hover states provide clear feedback
- [ ] Works on touch devices
- [ ] Respects reduced motion preferences
- [ ] Doesn't interfere with existing keyboard shortcuts
- [ ] Accessible with screen readers

## Implementation Notes

### Performance Considerations

1. **Use IntersectionObserver**: Leverage existing observer for scroll position tracking
2. **Throttle scroll events**: Prevent excessive re-renders during scrolling
3. **CSS transforms**: Use transform for positioning to enable GPU acceleration
4. **Conditional rendering**: Only render arrows when gallery has multiple cards

### Accessibility Considerations

1. **ARIA labels**: 
   - `aria-label="Navigate to previous star"` for left arrow
   - `aria-label="Navigate to next star"` for right arrow
2. **Hidden state**: Use `aria-hidden="true"` and `tabIndex={-1}` when arrows are hidden
3. **Focus indicators**: Ensure visible focus ring matches existing card focus styles
4. **Keyboard support**: Support both Enter and Space keys for activation

### Browser Compatibility

- **Smooth scrolling**: Fallback to instant scroll for older browsers
- **CSS filters**: Widely supported, but test glow effect in Safari
- **SVG rendering**: Ensure crisp rendering across browsers with shape-rendering attribute

### Integration with Existing Code

The implementation will:
1. Preserve existing keyboard navigation (arrow keys, Home, End)
2. Maintain scroll snap behavior
3. Work with existing reduced motion detection
4. Use consistent styling with StarCard components
5. Not interfere with card scaling logic
