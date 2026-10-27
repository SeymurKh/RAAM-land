"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollLock } from "@/lib/useScrollLock";
import { FluidButton } from "@/components/FluidButton";
import { HeaderSocials } from "@/components/HeaderSocials";

const navItems = [
  { label: "Artists", href: "/#artists" },
  { label: "Projects", href: "/#projects" },
  { label: "Contact Us", href: "/#contacts" },
];

interface HeaderProps {
  modalOpen?: boolean;
}

export function Header({ modalOpen }: HeaderProps) {
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
            <Link href="/" className="flex items-center" aria-label="RAAM home">
              <Image
                src="/assets/images/logoheader.png"
                alt="RAAM"
                width={176}
                height={56}
                sizes="(min-width: 640px) 160px, 144px"
                className="h-6 w-36 sm:w-40"
                priority
              />
            </Link>
            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-white/10 sm:block"
            />
            <HeaderSocials className="hidden sm:flex" />
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Логотип RSB, разделённый на две органичные кнопки без обвязки */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <Link
                href="/#live"
                aria-label="Live"
                className="inline-flex items-center justify-center rounded-full transition-transform duration-500 hover:scale-110"
              >
                <Image
                  src="/assets/images/rsb-mark.png"
                  alt=""
                  width={148}
                  height={148}
                  sizes="32px"
                  className="rsb-pulse h-7 w-7 rounded-full sm:h-8 sm:w-8"
                />
              </Link>
              <Link
                href="/radio-stream-bar"
                aria-label="Radio Stream Bar"
                aria-current={pathname === "/radio-stream-bar" ? "page" : undefined}
                className="inline-flex items-center transition duration-500 hover:opacity-75"
              >
                <Image
                  src="/assets/images/rsb-wordmark.png"
                  alt="Radio Stream Bar"
                  width={338}
                  height={189}
                  sizes="(min-width: 640px) 72px, 64px"
                  className={cn(
                    "rsb-wordmark h-9 w-auto sm:h-10",
                    pathname === "/radio-stream-bar" && "rsb-wordmark-active",
                  )}
                />
              </Link>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              {navItems.map((item) => {
                const isActive = item.href === pathname;
                return (
                  <FluidButton
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "min-w-30 text-center text-xs tracking-[0.2em]",
                      isActive &&
                        "border-[#E82919]/60 text-white shadow-[0_0_28px_rgba(232,41,25,0.22)]",
                    )}
                  >
                    {item.label}
                  </FluidButton>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={18} />
            </button>
          </div>
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
              <Link href="/" onClick={close} className="flex items-center gap-3">
                <Image
                  src="/assets/images/logoheader.png"
                  alt="RAAM"
                  width={176}
                  height={56}
                  sizes="(min-width: 640px) 160px, 144px"
                  className="h-6 w-36 sm:w-40"
                />
              </Link>
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
              {navItems.map((item) => {
                const isActive = item.href === pathname;
                return (
                  <motion.div
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "block border-b border-white/10 py-5 text-4xl font-semibold uppercase leading-none tracking-normal sm:text-5xl",
                        isActive ? "text-[#E82919]" : "text-stone-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                );
              })}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0 },
                }}
                className="flex items-center gap-3 pt-4"
              >
                <div className="flex items-center gap-2.5">
                  <Link
                    href="/#live"
                    onClick={close}
                    aria-label="Live"
                    className="inline-flex items-center justify-center rounded-full transition-transform duration-500 hover:scale-110"
                  >
                    <Image
                      src="/assets/images/rsb-mark.png"
                      alt=""
                      width={148}
                      height={148}
                      sizes="32px"
                      className="rsb-pulse h-8 w-8 rounded-full"
                    />
                  </Link>
                  <Link
                    href="/radio-stream-bar"
                    onClick={close}
                    aria-label="Radio Stream Bar"
                    aria-current={
                      pathname === "/radio-stream-bar" ? "page" : undefined
                    }
                    className="inline-flex items-center transition duration-500 hover:opacity-75"
                  >
                    <Image
                      src="/assets/images/rsb-wordmark.png"
                      alt="Radio Stream Bar"
                      width={338}
                      height={189}
                      sizes="72px"
                      className={cn(
                        "rsb-wordmark h-10 w-auto",
                        pathname === "/radio-stream-bar" && "rsb-wordmark-active",
                      )}
                    />
                  </Link>
                </div>
                <HeaderSocials />
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
