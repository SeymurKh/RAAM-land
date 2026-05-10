interface SectionTransitionProps {
  /** Position of the gradient transition. "top" = fade-in from previous section, "bottom" = fade-out to next section */
  position: "top" | "bottom";
}

export function SectionTransition({ position }: SectionTransitionProps) {
  return (
    <div
      className={`pointer-events-none absolute left-0 right-0 z-10 h-24 ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        background:
          position === "top"
            ? "linear-gradient(to bottom, #080706, transparent)"
            : "linear-gradient(to top, #080706, transparent)",
      }}
    />
  );
}
