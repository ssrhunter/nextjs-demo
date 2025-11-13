'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Star } from '@/lib/supabase/types';
import StarCard from '@/app/_components/star-gallery/StarCard';
import StarGalleryEmpty from '@/app/_components/star-gallery/StarGalleryEmpty';
import NavigationArrows from '@/app/_components/star-gallery/NavigationArrows';

interface StarGalleryProps {
  stars: Star[];
}

export default function StarGallery({ stars }: StarGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [cardScales, setCardScales] = useState<Map<number, number>>(new Map());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      // Cleanup debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initialize all cards with default scale
    const initialScales = new Map<number, number>();
    stars.forEach((star) => {
      initialScales.set(star.id, prefersReducedMotion ? 1.0 : 0.75);
    });
    setCardScales(initialScales);

    // Create IntersectionObserver to detect card positions
    const observer = new IntersectionObserver(
      (entries) => {
        const newScales = new Map(cardScales);
        
        entries.forEach((entry) => {
          const cardElement = entry.target as HTMLElement;
          const starIdStr = cardElement.dataset.starId;
          if (!starIdStr) return;
          const starId = parseInt(starIdStr, 10);

          // Calculate position relative to center of viewport
          const rect = entry.boundingClientRect;
          const containerRect = container.getBoundingClientRect();
          
          // Calculate center of card relative to center of container
          const cardCenter = rect.left + rect.width / 2;
          const containerCenter = containerRect.left + containerRect.width / 2;
          const distanceFromCenter = Math.abs(cardCenter - containerCenter);
          
          // Calculate scale based on distance from center
          // If reduced motion is preferred, keep all cards at scale 1.0
          // Center card (distance < card width / 2): scale 1.0
          // Adjacent cards (distance < card width * 1.5): scale 0.9
          // Other cards: scale 0.75
          const cardWidth = rect.width;
          let scale = 0.75;
          
          if (prefersReducedMotion) {
            scale = 1.0;
          } else if (distanceFromCenter < cardWidth / 2) {
            scale = 1.0;
          } else if (distanceFromCenter < cardWidth * 1.5) {
            scale = 0.9;
          }
          
          newScales.set(starId, scale);
        });
        
        setCardScales(newScales);
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: '0px',
      }
    );

    // Observe all card elements
    const cardElements = container.querySelectorAll('[data-star-id]');
    cardElements.forEach((card) => observer.observe(card));

    // Trigger initial calculation
    const handleScroll = () => {
      cardElements.forEach((card) => {
        observer.unobserve(card);
        observer.observe(card);
      });
    };
    
    // Initial calculation
    handleScroll();
    
    // Add scroll listener for updates
    container.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [stars, prefersReducedMotion]);

  // Navigation handler for arrow clicks with debouncing
  const handleNavigate = useCallback((direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Debounce to prevent rapid click conflicts
    if (debounceTimeoutRef.current) {
      return;
    }

    const cardWidth = 320; // Width of card (w-80 = 20rem = 320px)
    const gap = 32; // gap-8 = 2rem = 32px
    const scrollAmount = cardWidth + gap; // 352px total

    // Scroll by one card width plus gap
    const scrollDelta = direction === 'left' ? -scrollAmount : scrollAmount;
    
    // Use smooth scrolling by default, instant if reduced motion is preferred
    container.scrollBy({
      left: scrollDelta,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });

    // Set debounce timeout (300ms to allow smooth scroll to complete)
    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = undefined;
    }, 300) as NodeJS.Timeout;
  }, [prefersReducedMotion]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = 320; // Width of card (w-80 = 20rem = 320px)
    const gap = 32; // gap-8 = 2rem = 32px
    const scrollAmount = cardWidth + gap;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowRight':
        e.preventDefault();
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        container.scrollTo({ left: 0, behavior: 'smooth' });
        break;
      case 'End':
        e.preventDefault();
        container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
        break;
    }
  };

  if (stars.length === 0) {
    return <StarGalleryEmpty />;
  }

  return (
    <section 
      className="w-full py-6"
      aria-label="Star gallery"
      aria-describedby="gallery-instructions"
    >
      <div className="sr-only" id="gallery-instructions">
        Use arrow keys to navigate through the star gallery. Press Home to go to the first star, End to go to the last star.
      </div>
      <div
        ref={scrollContainerRef}
        className="flex gap-8 overflow-x-auto overflow-y-visible px-[calc(50vw-10rem)] scroll-smooth focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: prefersReducedMotion ? 'none' : 'x mandatory',
        }}
        role="region"
        aria-label="Scrollable star cards"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {stars.map((star, index) => {
          const scale = cardScales.get(star.id) || (prefersReducedMotion ? 1.0 : 0.75);
          return (
            <div
              key={star.id}
              data-star-id={star.id}
              ref={(el) => {
                if (el) cardRefs.current.set(star.id, el);
              }}
              style={{ 
                scrollSnapAlign: prefersReducedMotion ? 'none' : 'center',
                zIndex: Math.round(scale * 10),
              }}
              role="group"
              aria-label={`Star ${index + 1} of ${stars.length}`}
            >
              <StarCard
                star={star}
                scale={scale}
              />
            </div>
          );
        })}
      </div>
      <NavigationArrows
        scrollContainerRef={scrollContainerRef}
        onNavigate={handleNavigate}
        prefersReducedMotion={prefersReducedMotion}
      />
    </section>
  );
}
