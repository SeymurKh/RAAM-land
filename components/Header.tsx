"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";

const navItems = [
  { label: "Artists", href: "#artists" },
  { label: "Live", href: "#live" },
  { label: "Projects", href: "#projects" },
  { label: "Contact Us", href: "#contacts" },
];

interface HeaderProps {
  modalOpen?: boolean;
}

export function Header({ modalOpen }: HeaderProps) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShown(window.scrollY > window.innerHeight * 0.1);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useScrollLock(open);

  const close = () => setOpen(false);

  const shouldHide = modalOpen;

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{
          opacity: shouldHide ? 0 : shown ? 1 : 0,
          y: shouldHide ? -24 : shown ? 0 : -24,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 px-4 py-4 sm:px-6",
          shown && !shouldHide ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/45 px-4 py-3 shadow-[0_16px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <a
            href="#hero"
            className="flex items-center gap-3"
            aria-label="RAAM home"
          >
            <Image
              src="/assets/images/logo.png"
              alt="RAAM"
              width={176}
              height={56}
              className="h-10 w-28 sm:w-32"
            />
          </a>

          <div className="hidden items-center gap-9 md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs uppercase tracking-[0.32em] text-stone-200/62 transition hover:text-stone-50"
              >
                {item.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white md:hidden"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/88 backdrop-blur-2xl md:hidden"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <a href="#hero" onClick={close} className="flex items-center gap-3">
                <Image
                  src="/assets/images/logo.png"
                  alt="RAAM"
                  width={176}
                  height={56}
                  className="h-10 w-28 sm:w-32"
                />
              </a>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="flex h-[calc(100vh-84px)] flex-col justify-center gap-5 px-6"
            >
              {navItems.map((item) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    show: { opacity: 1, y: 0 },
                  }}
                  className="border-b border-white/10 py-5 text-5xl font-semibold uppercase leading-none tracking-normal text-stone-100"
                >
                  {item.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
