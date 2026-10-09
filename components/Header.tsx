"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
import { FluidButton } from "@/components/FluidButton";
import { HeaderSocials } from "@/components/HeaderSocials";

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
          "fixed left-0 right-0 top-0 z-60 px-4 py-4 sm:px-6 will-change-transform",
          shown && !shouldHide ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/30 px-4 py-3 shadow-[0_16px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <a href="#hero" className="flex items-center" aria-label="RAAM home">
              <Image
                src="/assets/images/logoheader.png"
                alt="RAAM"
                width={176}
                height={56}
                sizes="(min-width: 640px) 160px, 144px"
                className="h-6 w-36 sm:w-40"
                priority
              />
            </a>
            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-white/10 sm:block"
            />
            <HeaderSocials className="hidden sm:flex" />
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {navItems.map((item) => (
              <FluidButton
                key={item.href}
                href={item.href}
                className="min-w-30 text-center text-xs tracking-[0.2em]"
              >
                {item.label}
              </FluidButton>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white lg:hidden"
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
            className="fixed inset-0 z-60 bg-black/88 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex items-center justify-between px-5 py-5">
              <a href="#hero" onClick={close} className="flex items-center gap-3">
                <Image
                  src="/assets/images/logoheader.png"
                  alt="RAAM"
                  width={176}
                  height={56}
                  sizes="(min-width: 640px) 160px, 144px"
                  className="h-6 w-36 sm:w-40"
                />
              </a>
              <button
                type="button"
                onClick={close}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white"
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
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex items-center gap-2 pt-4"
              >
                <HeaderSocials />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
