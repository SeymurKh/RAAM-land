"use client";

import { useEffect, useRef } from "react";

let scrollLockCount = 0;
/** Saved scroll position captured ONLY when the first lock is applied. */
let savedScrollY = 0;

/**
 * Locks body scroll when `active` is true.
 *
 * Uses `position: fixed` + saved scroll offset so it works on iOS Safari
 * where `overflow: hidden` on `<body>` alone does not prevent scroll.
 * Also adds `touch-action: none` to block touch-based scroll passthrough.
 */
export function useScrollLock(active: boolean) {
  const wasActive = useRef(false);

  useEffect(() => {
    // Only act on transitions (active changed to true, or component unmounting while active)
    if (active === wasActive.current) return;

    if (active) {
      // Lock
      wasActive.current = true;

      // Save scroll position only when this is the FIRST active lock
      if (scrollLockCount === 0) {
        savedScrollY = window.scrollY;
      }

      scrollLockCount += 1;

      // Apply fixed positioning to prevent background scroll (iOS-safe)
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.overscrollBehavior = "none";

      return () => {
        // This cleanup runs when active becomes false OR component unmounts
        scrollLockCount = Math.max(0, scrollLockCount - 1);
        wasActive.current = false;

        if (scrollLockCount === 0) {
          // Restore body styles
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.left = "";
          document.body.style.right = "";
          document.body.style.overflow = "";
          document.body.style.touchAction = "";
          document.body.style.overscrollBehavior = "";

          // Restore scroll position to where it was before the FIRST lock
          window.scrollTo(0, savedScrollY);
        }
      };
    } else {
      // active just became false — nothing to do (cleanup from previous effect handles it)
      wasActive.current = false;
    }
  }, [active]);
}