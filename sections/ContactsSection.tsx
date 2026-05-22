"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mail, Phone, Send, Share2 } from "lucide-react";
import { FluidButton } from "@/components/FluidButton";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { contactLinks } from "@/data/site";

const contactIcons = {
  email: Mail,
  phone: Phone,
  linktree: Share2,
  instagram: Share2,
  soundcloud: Share2,
  spotify: Share2,
  youtube: Share2,
} as const;

type Tab = "book" | "contact";

interface ContactsSectionProps {
  onContactActiveChange?: (active: boolean) => void;
}

export function ContactsSection({ onContactActiveChange }: ContactsSectionProps) {
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");
  const [activeTab, setActiveTab] = useState<Tab>("book");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const statusText = useMemo(() => {
    if (status === "ready") {
      return "Your email client should open with a pre-filled booking request.";
    }

    if (status === "error") {
      return "Please add your name, a valid email, and a short message.";
    }

    return "Use this for bookings, collaborations, coaching, and media production.";
  }, [status]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    onContactActiveChange?.(tab === "contact");
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const body = String(form.get("message") ?? "").trim();
    const type = String(form.get("type") ?? "").trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || body.length < 10) {
      setStatus("error");
      return;
    }

    const subject = encodeURIComponent(`RAAM Booking: ${type} — from ${name}`);
    const mailBody = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${type}\n\n${body}`,
    );
    window.location.href = `mailto:roomallaboutmusic@gmail.com?subject=${subject}&body=${mailBody}`;

    setStatus("ready");
    event.currentTarget.reset();
  }

  const showBook = isDesktop || activeTab === "book";
  const showContact = !isDesktop && activeTab === "contact";

  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contact Us"
      bgImage="/assets/images/contact.png"
      className="pb-8"
    >
      {/* Mobile tab bar */}
      {!isDesktop && (
        <div className="mb-4 flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => handleTabChange("book")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs uppercase tracking-[0.28em] transition ${
              activeTab === "book"
                ? "bg-white/10 text-white"
                : "text-stone-300/50 hover:text-stone-200/70"
            }`}
          >
            Book
          </button>
          <button
            type="button"
            onClick={() => handleTabChange("contact")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-xs uppercase tracking-[0.28em] transition ${
              activeTab === "contact"
                ? "bg-white/10 text-white"
                : "text-stone-300/50 hover:text-stone-200/70"
            }`}
          >
            Contact
          </button>
        </div>
      )}

      <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 lg:grid-cols-1">
        {showBook && (
          <MotionReveal direction="left" className="relative bg-[#0b0a09]/92 p-3 sm:p-5 lg:p-6">
            <div className="mb-3 flex items-start justify-between gap-4 sm:mb-4 sm:gap-6 lg:mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
                  Book
                </p>
                <h3 className="mt-1 text-xl font-semibold uppercase leading-[0.9] tracking-normal text-white sm:mt-2 sm:text-2xl lg:mt-3 lg:text-3xl">
                  Start a booking
                </h3>
              </div>
              {/* Desktop flyout trigger for Contact */}
              {isDesktop && (
                <div className="group/contact relative">
                  <span className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-100 transition hover:bg-white/10">
                    <Mail size={16} />
                  </span>
                  {/* Flyout dropdown — appears on hover */}
                  <div className="pointer-events-none absolute right-0 top-full z-50 pt-2 opacity-0 transition-all duration-300 group-hover/contact:pointer-events-auto group-hover/contact:opacity-100">
                    <div className="w-[24rem] rounded-[1.5rem] border border-white/10 bg-[#0b0a09]/95 p-5 shadow-2xl backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
                        Contact
                      </p>
                      <h3 className="mt-1 text-lg font-semibold uppercase leading-[0.9] tracking-normal text-white sm:mt-2 sm:text-xl">
                        Direct channel
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-6 text-stone-200/60 sm:mt-3">
                        Reach the team for resident portfolios, event details, press, and
                        community inquiries.
                      </p>

                      <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
                        {contactLinks.map((link) => {
                          const Icon = contactIcons[link.kind] ?? Share2;
                          return (
                            <a
                              key={link.id}
                              href={link.href}
                              target={link.kind === "linktree" ? "_blank" : undefined}
                              rel={link.kind === "linktree" ? "noreferrer" : undefined}
                              className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl transition hover:border-stone-100/24 hover:bg-white/[0.065] sm:gap-4 sm:rounded-[1.5rem] sm:p-3.5"
                            >
                              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 sm:h-10 sm:w-10">
                                <Icon size={16} />
                              </span>
                              <span>
                                <span className="block text-xs uppercase tracking-[0.32em] text-stone-300/50">
                                  {link.label}
                                </span>
                                <span className="mt-0.5 block text-sm text-stone-100 sm:mt-1 sm:text-base">
                                  {link.value}
                                </span>
                              </span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={onSubmit} noValidate>
              <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-1.5">
                    Name
                  </span>
                  <input
                    name="name"
                    className="h-10 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:h-12 sm:text-base"
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-1.5">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="h-10 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:h-12 sm:text-base"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label className="mt-2 block sm:mt-3">
                <span className="mb-1 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-1.5">
                  Booking type
                </span>
                <div className="relative">
                  <select
                    name="type"
                    className="h-10 w-full appearance-none rounded-2xl border border-white/10 bg-black/25 px-4 pr-10 text-sm text-stone-100 outline-none transition focus:border-stone-100/35 focus:bg-black/40 sm:h-12 sm:text-base"
                    defaultValue="artist-booking"
                  >
                    <option value="artist-booking" className="bg-[#0b0a09] text-stone-100">Artist booking</option>
                    <option value="media-production" className="bg-[#0b0a09] text-stone-100">Media production</option>
                    <option value="coaching" className="bg-[#0b0a09] text-stone-100">Coaching</option>
                    <option value="collaboration" className="bg-[#0b0a09] text-stone-100">Collaboration</option>
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-300/50">
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L7 6.5L13 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </label>

              <label className="mt-2 block sm:mt-3">
                <span className="mb-1 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-1.5">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={2}
                  className="w-full resize-none rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:rows-3 sm:py-3 sm:text-base"
                  placeholder="Tell us the date, place, format, and idea."
                />
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <p
                  className={
                    status === "error"
                      ? "text-xs sm:text-sm text-red-200/80"
                      : "text-xs sm:text-sm text-stone-300/58"
                  }
                  aria-live="polite"
                >
                  {statusText}
                </p>
                <FluidButton type="submit" className="sm:min-w-44">
                  <span className="inline-flex items-center gap-2">
                    Send <Send size={14} />
                  </span>
                </FluidButton>
              </div>
            </form>
          </MotionReveal>
        )}

        {/* Mobile-only Contact panel (shown via tab on mobile) */}
        {showContact && (
          <MotionReveal direction="right" delay={0.08} className="bg-[#0b0a09]/92 p-3 sm:p-5 lg:p-6">
            <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
              Contact
            </p>
            <h3 className="mt-1 text-xl font-semibold uppercase leading-[0.9] tracking-normal text-white sm:mt-2 sm:text-2xl lg:mt-3 lg:text-3xl">
              Direct channel
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-stone-200/60 sm:mt-3 lg:mt-4">
              Reach the team for resident portfolios, event details, press, and
              community inquiries.
            </p>

            <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5 lg:mt-6 lg:space-y-3">
              {contactLinks.map((link) => {
                const Icon = contactIcons[link.kind] ?? Share2;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.kind === "linktree" ? "_blank" : undefined}
                    rel={link.kind === "linktree" ? "noreferrer" : undefined}
                    className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl transition hover:border-stone-100/24 hover:bg-white/[0.065] sm:gap-4 sm:rounded-[1.5rem] sm:p-3.5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 sm:h-10 sm:w-10">
                      <Icon size={16} />
                    </span>
                    <span>
                      <span className="block text-xs uppercase tracking-[0.32em] text-stone-300/50">
                        {link.label}
                      </span>
                      <span className="mt-0.5 block text-sm text-stone-100 sm:mt-1 sm:text-base">
                        {link.value}
                      </span>
                    </span>
                  </a>
                );
              })}
            </div>
          </MotionReveal>
        )}
      </div>
    </SectionFrame>
  );
}
