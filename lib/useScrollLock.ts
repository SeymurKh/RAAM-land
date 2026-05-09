"use client";

import { useEffect } from "react";

let scrollLockCount = 0;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    scrollLockCount += 1;
    document.body.style.overflow = "hidden";

    return () => {
      scrollLockCount -= 1;
      if (scrollLockCount <= 0) {
        scrollLockCount = 0;
        document.body.style.overflow = "";
      }
    };
  }, [active]);
}
