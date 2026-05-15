"use client";

import { useEffect } from "react";

let scrollLockCount = 0;

/**
 * Locks body scroll when `active` is true.
 *
 * Uses `position: fixed` + saved scroll offset so it works on iOS Safari
 * where `overflow: hidden` on `<body>` alone does not prevent scroll.
 * Also adds `touch-action: none` to block touch-based scroll passthrough.
 */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const scrollY = window.scrollY;

    scrollLockCount += 1;

    // Apply fixed positioning to prevent background scroll (iOS-safe)
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.body.style.overscrollBehavior = "none";

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount <= 0) {
        scrollLockCount = 0;

        // Restore body styles
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.body.style.overscrollBehavior = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      }
    };
  }, [active]);
}
