"use client";

import { useEffect } from "react";
import { useScroll } from "framer-motion";

/**
 * Subtly shifts the page background color based on scroll position.
 * Creates a barely-perceptible depth effect as the user scrolls.
 */
export function ScrollBackground() {
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const unsubscribe = scrollYProgress.on("change", (v) => {
      // Map scroll 0..1 to a subtle hue shift
      // Base: #080706 → slight warm shift at 0.5 → back to #080706
      const r = Math.round(8 + v * 3);
      const g = Math.round(7 + v * 1.5);
      const b = Math.round(6 + v * 0.5);
      document.body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return null;
}
