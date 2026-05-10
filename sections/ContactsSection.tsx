"use client";

import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, Send, Share2 } from "lucide-react";
import { FluidButton } from "@/components/FluidButton";
import { MotionReveal } from "@/components/MotionReveal";
import { SectionFrame } from "@/components/SectionFrame";
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

export function ContactsSection() {
  const [status, setStatus] = useState<"idle" | "error" | "ready">("idle");

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

  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contact Us"
      intro="Two clear routes: book RAAM for formats and artists, or contact the team directly."
      bgImage="/assets/images/contact.png"
      className="pb-12"
    >
      <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/10 lg:grid-cols-2">
        <MotionReveal direction="left" className="bg-[#0b0a09]/92 p-6 sm:p-8">
          <div className="mb-10 flex items-start justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
                Book
              </p>
              <h3 className="mt-4 text-4xl font-semibold uppercase leading-[0.9] tracking-normal text-white">
                Start a booking
              </h3>
            </div>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-100">
              <CalendarDays size={18} />
            </span>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
                  Name
                </span>
                <input
                  name="name"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40"
                  placeholder="Your name"
                />
              </label>
              <label>
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
                Booking type
              </span>
              <div className="relative">
                <select
                  name="type"
                  className="h-14 w-full appearance-none rounded-2xl border border-white/10 bg-black/25 px-4 pr-10 text-stone-100 outline-none transition focus:border-stone-100/35 focus:bg-black/40"
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

            <label className="mt-5 block">
              <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
                Message
              </span>
              <textarea
                name="message"
                rows={6}
                className="w-full resize-none rounded-3xl border border-white/10 bg-black/25 px-4 py-4 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40"
                placeholder="Tell RAAM the date, place, format, and idea."
              />
            </label>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p
                className={
                  status === "error"
                    ? "text-sm text-red-200/80"
                    : "text-sm text-stone-300/58"
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

        <MotionReveal direction="right" delay={0.08} className="bg-[#0b0a09]/92 p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.42em] text-stone-300/50">
            Contact
          </p>
          <h3 className="mt-4 text-4xl font-semibold uppercase leading-[0.9] tracking-normal text-white">
            Direct channel
          </h3>
          <p className="mt-6 max-w-md text-sm leading-6 text-stone-200/60">
            Reach the team for resident portfolios, event details, press, and
            community inquiries.
          </p>

          <div className="mt-10 space-y-4">
            {contactLinks.map((link) => {
              const Icon = contactIcons[link.kind] ?? Share2;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.kind === "linktree" ? "_blank" : undefined}
                  rel={link.kind === "linktree" ? "noreferrer" : undefined}
                  className="group flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition hover:border-stone-100/24 hover:bg-white/[0.065]"
                >
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100">
                    <Icon size={18} />
                  </span>
                  <span>
                    <span className="block text-xs uppercase tracking-[0.32em] text-stone-300/50">
                      {link.label}
                    </span>
                    <span className="mt-1 block text-stone-100">
                      {link.value}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
        </MotionReveal>
      </div>
    </SectionFrame>
  );
}
