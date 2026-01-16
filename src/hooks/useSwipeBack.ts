import { useEffect, useRef, useState } from 'react';

interface SwipeBackConfig {
  threshold?: number; // Pixel distance to trigger back (default: 80)
  velocityThreshold?: number; // Minimum velocity to trigger (default: 0.3)
  onSwipeBack?: () => void;
}

export const useSwipeBack = (config: SwipeBackConfig = {}) => {
  const {
    threshold = 80,
    velocityThreshold = 0.3,
    onSwipeBack,
  } = config;

  const [swipeProgress, setSwipeProgress] = useState(0);
  const startXRef = useRef(0);
  const startTimeRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Only track swipes from the left edge (within 50px)
      if (e.touches[0].clientX > 50) return;

      startXRef.current = e.touches[0].clientX;
      startTimeRef.current = Date.now();
      isDraggingRef.current = true;
      setSwipeProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      const currentX = e.touches[0].clientX;
      const deltaX = currentX - startXRef.current;

      // Only track rightward movement
      if (deltaX > 0) {
        const progress = Math.min(deltaX / threshold, 1);
        setSwipeProgress(progress);
      } else {
        setSwipeProgress(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      const deltaX = startXRef.current - (startXRef.current - swipeProgress * threshold);
      const timeDelta = Date.now() - startTimeRef.current;
      const velocity = Math.abs((swipeProgress * threshold) / (timeDelta / 1000));

      // Trigger back if threshold reached or velocity is sufficient
      if (swipeProgress > 0.3 || velocity > velocityThreshold) {
        if (onSwipeBack) {
          onSwipeBack();
        }
        setSwipeProgress(0);
      } else {
        // Animate back to 0
        setSwipeProgress(0);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [swipeProgress, threshold, velocityThreshold, onSwipeBack]);

  return { swipeProgress };
};
