"use client";

import { useEffect } from "react";

export function CursorAtmosphere() {
  useEffect(() => {
    const update = (event: PointerEvent) => {
      document.documentElement.style.setProperty(
        "--cursor-x",
        `${(event.clientX / window.innerWidth) * 100}%`,
      );
      document.documentElement.style.setProperty(
        "--cursor-y",
        `${(event.clientY / window.innerHeight) * 100}%`,
      );
    };

    window.addEventListener("pointermove", update, { passive: true });
    return () => window.removeEventListener("pointermove", update);
  }, []);

  return null;
}
