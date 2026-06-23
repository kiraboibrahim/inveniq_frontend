"use client";

import { useState, useEffect } from "react";

export function useCountUp(endValue: number, duration: number = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mountTimer: number | undefined;
    if (prefersReducedMotion || endValue === 0) {
      mountTimer = window.setTimeout(() => setValue(endValue), 0);
      return () => {
        if (mountTimer) clearTimeout(mountTimer);
      };
    }

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // ease-out quartic
      const easeProgress = 1 - Math.pow(1 - Math.min(progress / duration, 1), 4);
      
      setValue(Math.floor(easeProgress * endValue));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // defer final state update to avoid synchronous setState warnings
        window.setTimeout(() => setValue(endValue), 0);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return value;
}
