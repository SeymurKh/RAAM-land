"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ScrollReturnIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const isEnd = progress > 0.965;

  return (
    <button
      type="button"
      onClick={() => {
        if (isEnd) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className={cn(
        "fixed bottom-6 left-1/2 z-40 flex h-16 w-12 items-center justify-center rounded-full text-stone-100 transition duration-500",
        isEnd
          ? "pointer-events-auto border border-white/12 bg-black/45 backdrop-blur-xl"
          : "pointer-events-none",
      )}
      aria-label={isEnd ? "Back to top" : "Scroll progress"}
      style={{
        transform: `translateX(-50%) translateY(${Math.min(progress * 18, 18)}px)`,
      }}
    >
      <span
        className={cn(
          "relative block overflow-hidden bg-white/12 transition-all duration-500",
          isEnd ? "h-px w-8" : "h-16 w-px",
        )}
      >
        <span
          className={cn(
            "absolute bg-stone-100/85 transition-all duration-500",
            isEnd ? "inset-y-0 left-0 w-full" : "left-0 top-0 h-8 w-px",
          )}
          style={{
            transform: isEnd
              ? "translateX(0)"
              : `translateY(${Math.min(progress * 72, 42)}px)`,
          }}
        />
      </span>
    </button>
  );
}
