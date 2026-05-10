"use client";

import { AnimatePresence, motion } from "framer-motion";

interface AnimatedDigitProps {
  value: number;
}

export function AnimatedDigit({ value }: AnimatedDigitProps) {
  const display = String(value).padStart(2, "0");

  return (
    <div className="relative flex overflow-hidden">
      <AnimatePresence mode="popLayout">
        {display.split("").map((char, i) => (
          <motion.span
            key={`${i}-${char}`}
            className="tabular-nums"
            initial={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
