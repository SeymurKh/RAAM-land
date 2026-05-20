"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, Send, Share2 } from "lucide-react";
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

export function ContactsSection() {
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
  const showContact = isDesktop || activeTab === "contact";

  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contact Us"
      intro="Two clear routes: book RAAM for formats and artists, or contact the team directly."
      bgImage="/assets/images/contact.png"
      className="pb-12"
    >
      {/* Mobile tab bar */}
      {!isDesktop && (
        <div className="mb-4 flex gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
          <button
            type="button"
            onClick={() => setActiveTab("book")}
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
            onClick={() => setActiveTab("contact")}
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

      <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 lg:grid-cols-2">
        {showBook && (
          <MotionReveal direction="left" className="bg-[#0b0a09]/92 p-4 sm:p-6 lg:p-8">
            <div className="mb-4 flex items-start justify-between gap-4 sm:mb-6 sm:gap-6 lg:mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
                  Book
                </p>
                <h3 className="mt-1 text-xl font-semibold uppercase leading-[0.9] tracking-normal text-white sm:mt-2 sm:text-2xl lg:mt-4 lg:text-4xl">
                  Start a booking
                </h3>
              </div>
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-100 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
                <CalendarDays size={16} />
              </span>
            </div>

            <form onSubmit={onSubmit} noValidate>
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-2">
                    Name
                  </span>
                  <input
                    name="name"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:h-14 sm:text-base"
                    placeholder="Your name"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-2">
                    Email
                  </span>
                  <input
                    name="email"
                    type="email"
                    className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:h-14 sm:text-base"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <label className="mt-3 block sm:mt-5">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-2">
                  Booking type
                </span>
                <div className="relative">
                  <select
                    name="type"
                    className="h-11 w-full appearance-none rounded-2xl border border-white/10 bg-black/25 px-4 pr-10 text-sm text-stone-100 outline-none transition focus:border-stone-100/35 focus:bg-black/40 sm:h-14 sm:text-base"
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

              <label className="mt-3 block sm:mt-5">
                <span className="mb-1.5 block text-xs uppercase tracking-[0.28em] text-stone-300/50 sm:mb-2">
                  Message
                </span>
                <textarea
                  name="message"
                  rows={2}
                  className="w-full resize-none rounded-3xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40 sm:rows-4 sm:py-4 sm:text-base"
                  placeholder="Tell RAAM the date, place, format, and idea."
                />
              </label>

              <div className="mt-4 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
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

        {showContact && (
          <MotionReveal direction="right" delay={0.08} className="bg-[#0b0a09]/92 p-4 sm:p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
              Contact
            </p>
            <h3 className="mt-1 text-xl font-semibold uppercase leading-[0.9] tracking-normal text-white sm:mt-2 sm:text-2xl lg:mt-4 lg:text-4xl">
              Direct channel
            </h3>
            <p className="mt-3 max-w-md text-sm leading-6 text-stone-200/60 sm:mt-4 lg:mt-6">
              Reach the team for resident portfolios, event details, press, and
              community inquiries.
            </p>

            <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3 lg:mt-10 lg:space-y-4">
              {contactLinks.map((link) => {
                const Icon = contactIcons[link.kind] ?? Share2;
                return (
                  <a
                    key={link.id}
                    href={link.href}
                    target={link.kind === "linktree" ? "_blank" : undefined}
                    rel={link.kind === "linktree" ? "noreferrer" : undefined}
                    className="group flex items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.035] p-3 backdrop-blur-xl transition hover:border-stone-100/24 hover:bg-white/[0.065] sm:gap-4 sm:rounded-[1.5rem] sm:p-4 lg:p-5"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100 sm:h-10 sm:w-10 lg:h-12 lg:w-12">
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
