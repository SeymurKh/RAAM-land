"use client";

import { Clock, MapPin, Phone } from "lucide-react";
import { MotionReveal } from "@/components/MotionReveal";
import type { VenuePageContent } from "@/types/content";

interface VenueContactsProps {
  contacts: VenuePageContent["contacts"];
}

export function VenueContacts({ contacts }: VenueContactsProps) {
  return (
    <section
      id="venue-contacts"
      className="relative isolate scroll-mt-24 px-4 py-14 sm:px-6 lg:px-12"
    >
      <MotionReveal className="mx-auto grid max-w-7xl gap-6 rounded-[1.5rem] border border-white/10 bg-white/3 p-6 sm:grid-cols-3 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <MapPin size={16} className="text-stone-200/80" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-stone-400/60">
              Address
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-100">
              {contacts.address}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Phone size={16} className="text-stone-200/80" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-stone-400/60">
              Phone
            </p>
            <a
              href={contacts.phoneHref}
              className="mt-2 block text-sm leading-6 text-stone-100 transition hover:text-white"
            >
              {contacts.phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Clock size={16} className="text-stone-200/80" />
          </span>
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.32em] text-stone-400/60">
              Hours
            </p>
            <p className="mt-2 text-sm leading-6 text-stone-100">
              {contacts.hours}
            </p>
          </div>
        </div>
      </MotionReveal>
    </section>
  );
}