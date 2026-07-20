"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function usePrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PageIntro() {
  const [visible, setVisible] = useState(!usePrefersReducedMotion());

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="page-intro"
          className="fixed inset-0 z-200 flex items-center justify-center bg-[#080706]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{
              opacity: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
              scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
            }}
          >
            {/* RAAM logo image */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src="/assets/images/logo.png"
                alt="RAAM"
                width={400}
                height={170}
                className="h-32 w-auto sm:h-44"
                priority
              />
            </motion.div>

            {/* Subtle line */}
            <motion.div
              className="mt-6 h-px bg-linear-to-r from-transparent via-stone-200/30 to-transparent"
              initial={{ width: 0 }}
              animate={{ width: 120 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}