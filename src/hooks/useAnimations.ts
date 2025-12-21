import { useEffect, useRef, useState } from 'react';

/**
 * Hook to trigger animations when element enters viewport
 * Useful for scroll-reveal animations
 */
export function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isVisible };
}

/**
 * Hook to add parallax effect on scroll
 */
export function useParallax(offset: number = 0.5) {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    ref,
    style: {
      transform: `translateY(${scrollY * offset}px)`,
    },
  };
}

/**
 * Hook for detecting mouse position for interactive animations
 */
export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook to add staggered animation delays to children
 */
export function useStaggerAnimation(itemCount: number, baseDelay: number = 0.1) {
  const delays = Array.from({ length: itemCount }, (_, i) => i * baseDelay);
  return delays;
}

/**
 * Hook for smooth number counting animation
 */
export function useCountUp(
  target: number,
  duration: number = 2,
  start: number = 0
) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const increment = (target - start) / (duration * 60);
    let currentValue = start;
    const interval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.ceil(currentValue));
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [start, target, duration]);

  return count;
}

/**
 * Hook to detect element visibility in viewport
 */
export function useInViewport() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '-50px',
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return { ref, isInViewport };
}

/**
 * Hook for window resize listening
 */
export function useWindowSize() {
  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook to add animation on element click
 */
export function useClickAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return { ref, clicked, handleClick };
}
