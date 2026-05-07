"use client";

import { FormEvent, useMemo, useState } from "react";
import { Mail, Phone, Send, Share2 } from "lucide-react";
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
  const [message, setMessage] = useState("");

  const statusText = useMemo(() => {
    if (status === "ready") {
      return "Inquiry prepared. RAAM can receive this through the next connected channel.";
    }

    if (status === "error") {
      return "Please add your name, a valid email, and a short message.";
    }

    return "For bookings, collaborations, media formats, and coaching.";
  }, [status]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const body = String(form.get("message") ?? "").trim();

    if (!name || !/^\S+@\S+\.\S+$/.test(email) || body.length < 10) {
      setStatus("error");
      return;
    }

    setStatus("ready");
    setMessage(body);
    event.currentTarget.reset();
  }

  return (
    <SectionFrame
      id="contacts"
      eyebrow="Contacts"
      title="Open channel"
      intro="For bookings, collaborations, media production, coaching, and cultural projects connected to the RAAM community."
      className="pb-12"
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <MotionReveal className="space-y-4">
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
                  <span className="mt-1 block text-stone-100">{link.value}</span>
                </span>
              </a>
            );
          })}
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <form
            onSubmit={onSubmit}
            className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_24px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-7"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="group">
                <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
                  Name
                </span>
                <input
                  name="name"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40"
                  placeholder="Your name"
                />
              </label>
              <label className="group">
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
                Inquiry
              </span>
              <textarea
                name="message"
                rows={7}
                className="w-full resize-none rounded-3xl border border-white/10 bg-black/25 px-4 py-4 text-stone-100 outline-none transition placeholder:text-stone-500 focus:border-stone-100/35 focus:bg-black/40"
                placeholder="Tell RAAM what you want to build together."
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

            {message ? (
              <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-stone-300/58">
                Latest prepared message: {message}
              </p>
            ) : null}
          </form>
        </MotionReveal>
      </div>
    </SectionFrame>
  );
}
