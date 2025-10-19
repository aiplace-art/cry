import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design with mobile-first breakpoints
 * Breakpoints:
 * - mobile: 320px - 640px
 * - tablet: 641px - 1024px
 * - desktop: 1025px+
 */

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export const breakpoints = {
  mobile: '(max-width: 640px)',
  tablet: '(min-width: 641px) and (max-width: 1024px)',
  desktop: '(min-width: 1025px)',
  touchDevice: '(pointer: coarse)',
  hoverDevice: '(hover: hover)',
} as const;

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handler);
      return () => mediaQuery.removeListener(handler);
    }
  }, [query]);

  // Prevent hydration mismatch by returning false on server
  return mounted ? matches : false;
}

export function useBreakpoint(): Breakpoint {
  const isMobile = useMediaQuery(breakpoints.mobile);
  const isTablet = useMediaQuery(breakpoints.tablet);
  const isDesktop = useMediaQuery(breakpoints.desktop);

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  if (isDesktop) return 'desktop';
  return 'mobile'; // Default fallback
}

export function useIsTouchDevice(): boolean {
  return useMediaQuery(breakpoints.touchDevice);
}

export function useIsHoverDevice(): boolean {
  return useMediaQuery(breakpoints.hoverDevice);
}

export function useResponsive() {
  const breakpoint = useBreakpoint();
  const isTouchDevice = useIsTouchDevice();
  const isHoverDevice = useIsHoverDevice();

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isTouchDevice,
    isHoverDevice,
    minTouchTarget: isTouchDevice ? 44 : 32, // iOS minimum 44px
  };
}
