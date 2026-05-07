"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface MotionRevealProps extends HTMLMotionProps<"div"> {
  delay?: number;
}

export function MotionReveal({
  children,
  className,
  delay = 0,
  ...props
}: MotionRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
