"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClass =
  "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition duration-500 hover:border-stone-200/35 hover:bg-stone-100/12 focus:outline-none focus:ring-2 focus:ring-stone-200/40";

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="absolute inset-0 translate-y-full rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)] transition duration-500 group-hover:translate-y-0" />
      <span className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-stone-200/10 blur-xl transition duration-700 group-hover:left-[72%]" />
      <span className="relative z-10">{children}</span>
    </>
  );
}

interface AnchorFluidProps extends HTMLMotionProps<"a"> {
  href: string;
  children: ReactNode;
  className?: string;
}

interface ButtonFluidProps extends HTMLMotionProps<"button"> {
  href?: never;
  children: ReactNode;
  className?: string;
}

export function FluidButton({
  children,
  className,
  ...props
}: AnchorFluidProps | ButtonFluidProps) {
  if ("href" in props && props.href) {
    const { href, ...rest } = props as AnchorFluidProps;
    return (
      <motion.a
        href={href}
        className={cn(baseClass, className)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...rest}
      >
        <Inner>{children}</Inner>
      </motion.a>
    );
  }

  const buttonProps = props as ButtonFluidProps;
  return (
    <motion.button
      className={cn(baseClass, className)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      {...buttonProps}
    >
      <Inner>{children}</Inner>
    </motion.button>
  );
}
