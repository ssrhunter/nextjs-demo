'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface NavigationArrowsProps {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (direction: 'left' | 'right') => void;
  prefersReducedMotion: boolean;
}

interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export default function NavigationArrows({
  scrollContainerRef,
  onNavigate,
  prefersReducedMotion,
}: NavigationArrowsProps) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const throttleTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const transitionDelayRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Calculate scroll state based on container position
  const calculateScrollState = useCallback((): ScrollState => {
    const container = scrollContainerRef.current;
    if (!container) {
      return { canScrollLeft: false, canScrollRight: false };
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollThreshold = 10; // pixels of tolerance

    return {
      canScrollLeft: scrollLeft > scrollThreshold,
      canScrollRight: scrollLeft < scrollWidth - clientWidth - scrollThreshold,
    };
  }, [scrollContainerRef]);

  // Throttled scroll handler to prevent excessive re-renders
  const handleScroll = useCallback(() => {
    // Clear existing timeout
    if (throttleTimeoutRef.current) {
      return;
    }

    // Set new timeout with delay to prevent flickering during scroll
    throttleTimeoutRef.current = setTimeout(() => {
      const newScrollState = calculateScrollState();
      
      // Add transition delay to prevent flickering during scroll
      // Only apply delay if not using reduced motion
      if (!prefersReducedMotion && transitionDelayRef.current) {
        clearTimeout(transitionDelayRef.current);
      }
      
      if (!prefersReducedMotion) {
        transitionDelayRef.current = setTimeout(() => {
          setScrollState(newScrollState);
          transitionDelayRef.current = undefined;
        }, 50) as NodeJS.Timeout;
      } else {
        // Instant update for reduced motion
        setScrollState(newScrollState);
      }
      
      throttleTimeoutRef.current = undefined;
    }, 100) as NodeJS.Timeout;
  }, [calculateScrollState, prefersReducedMotion]);

  // Attach scroll event listeners
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    // Handle edge case where scroll container is not available
    if (!container) {
      console.warn('NavigationArrows: Scroll container ref not available');
      return;
    }

    // Initial calculation
    const initialState = calculateScrollState();
    setScrollState(initialState);

    // Add scroll listener
    container.addEventListener('scroll', handleScroll);

    // Cleanup
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
      if (transitionDelayRef.current) {
        clearTimeout(transitionDelayRef.current);
      }
    };
  }, [scrollContainerRef, calculateScrollState, handleScroll]);

  // Don't render if container is not available
  if (!scrollContainerRef.current) {
    return null;
  }

  return (
    <div 
      className="navigation-arrows-container"
      style={{
        position: 'fixed',
        top: '45%',
        left: 0,
        right: 0,
        transform: 'translateY(-50%)',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <ArrowButton
        direction="left"
        visible={scrollState.canScrollLeft}
        onClick={() => onNavigate('left')}
        prefersReducedMotion={prefersReducedMotion}
      />
      <ArrowButton
        direction="right"
        visible={scrollState.canScrollRight}
        onClick={() => onNavigate('right')}
        prefersReducedMotion={prefersReducedMotion}
      />
    </div>
  );
}

// ArrowButton component with 8-bit pixelated styling
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
  prefersReducedMotion,
}: ArrowButtonProps) {
  // Keyboard handler for Enter and Space keys
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // Support both Enter and Space keys for activation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Calculate responsive positioning based on viewport width
  const getPositionStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      pointerEvents: 'auto',
    };

    // Card width is 320px (20rem), so half is 160px (10rem)
    // Center card is at 50vw, so edges are at 50vw ± 10rem
    if (direction === 'left') {
      return {
        ...baseStyle,
        // Desktop: center on left edge of center card (50vw - 10rem)
        // Mobile/Tablet: use minimum 1rem padding from viewport edge
        left: 'max(1rem, calc(50vw - 10rem))',
        transform: 'translate(-50%, 0)', // Center the button on the edge
      };
    } else {
      return {
        ...baseStyle,
        // Desktop: center on right edge of center card (50vw + 10rem)
        // Mobile/Tablet: use minimum 1rem padding from viewport edge
        right: 'max(1rem, calc(50vw - 10rem))',
        transform: 'translate(50%, 0)', // Center the button on the edge
      };
    }
  };

  // Pixelated arrow SVG - 8-bit style
  const PixelatedArrow = ({ direction }: { direction: 'left' | 'right' }) => {
    const isLeft = direction === 'left';
    
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        className="pixelated-arrow"
      >
        {isLeft ? (
          // Left arrow - pixelated design
          <>
            <rect x="16" y="4" width="4" height="4" fill="#f8fafc" />
            <rect x="12" y="8" width="4" height="4" fill="#f8fafc" />
            <rect x="8" y="12" width="4" height="4" fill="#f8fafc" />
            <rect x="4" y="16" width="4" height="4" fill="#f8fafc" />
            <rect x="8" y="20" width="4" height="4" fill="#f8fafc" />
            <rect x="12" y="24" width="4" height="4" fill="#f8fafc" />
            <rect x="16" y="28" width="4" height="4" fill="#f8fafc" />
          </>
        ) : (
          // Right arrow - pixelated design
          <>
            <rect x="12" y="4" width="4" height="4" fill="#f8fafc" />
            <rect x="16" y="8" width="4" height="4" fill="#f8fafc" />
            <rect x="20" y="12" width="4" height="4" fill="#f8fafc" />
            <rect x="24" y="16" width="4" height="4" fill="#f8fafc" />
            <rect x="20" y="20" width="4" height="4" fill="#f8fafc" />
            <rect x="16" y="24" width="4" height="4" fill="#f8fafc" />
            <rect x="12" y="28" width="4" height="4" fill="#f8fafc" />
          </>
        )}
      </svg>
    );
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      aria-label={direction === 'left' ? 'Navigate to previous star' : 'Navigate to next star'}
      className={`
        arrow-button
        ${direction}
        ${visible ? 'visible' : 'hidden'}
        ${prefersReducedMotion ? 'reduced-motion' : ''}
        focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950
      `}
      style={{
        ...getPositionStyle(),
        // Glow effect using drop-shadow filters
        filter: visible
          ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 16px rgba(99, 102, 241, 0.3))'
          : 'none',
        // Smooth fade in/out transitions for visibility changes
        // Respect reduced motion preferences - no transitions when enabled
        transition: prefersReducedMotion 
          ? 'none' 
          : 'filter 0.3s ease, opacity 0.3s ease, transform 0.3s ease',
        // Use opacity for smooth visibility transitions
        opacity: visible ? 1 : 0,
        // Use pointer-events to hide arrows smoothly without affecting layout
        pointerEvents: visible ? 'auto' : 'none',
        // Background with backdrop blur
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '2px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '0.5rem',
        // Responsive padding and sizing
        // Desktop: 1rem padding (64px total with 32px SVG)
        // Mobile: Ensure minimum 44x44px touch target
        padding: '1rem',
        minWidth: '44px',
        minHeight: '44px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Ensure smooth rendering
        willChange: prefersReducedMotion ? 'auto' : 'opacity, filter, transform',
      }}
      onMouseEnter={(e) => {
        if (!prefersReducedMotion && visible) {
          e.currentTarget.style.filter =
            'drop-shadow(0 0 12px rgba(99, 102, 241, 0.8)) drop-shadow(0 0 24px rgba(99, 102, 241, 0.4))';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (!prefersReducedMotion && visible) {
          e.currentTarget.style.filter =
            'drop-shadow(0 0 8px rgba(99, 102, 241, 0.6)) drop-shadow(0 0 16px rgba(99, 102, 241, 0.3))';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        }
      }}
    >
      <PixelatedArrow direction={direction} />
    </button>
  );
}
