"use client";

import { useEffect } from "react";

export function CursorAtmosphere() {
  useEffect(() => {
    let rafId = 0;

    const update = (event: PointerEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        document.documentElement.style.setProperty(
          "--cursor-x",
          `${(event.clientX / window.innerWidth) * 100}%`,
        );
        document.documentElement.style.setProperty(
          "--cursor-y",
          `${(event.clientY / window.innerHeight) * 100}%`,
        );
      });
    };

    window.addEventListener("pointermove", update, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", update);
    };
  }, []);

  return null;
}
