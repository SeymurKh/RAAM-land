"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ScrollReturnIndicator } from "@/components/ScrollReturnIndicator";
import { SiteFooter } from "@/components/SiteFooter";
import { VenueBarSection } from "@/sections/venue/VenueBarSection";
import { VenueContacts } from "@/sections/venue/VenueContacts";
import { VenueEventsSection } from "@/sections/venue/VenueEventsSection";
import { VenueHero } from "@/sections/venue/VenueHero";
import { VenueLiveSection } from "@/sections/venue/VenueLiveSection";
import type { VenuePageContent } from "@/types/content";

/**
 * Оболочка страницы Radio Stream Bar.
 * Контент грузится клиентски из /api/venue — правки из админки видны сразу,
 * без пересборки (та же конвенция, что и на главной).
 */
export function VenuePageShell() {
  const [venue, setVenue] = useState<VenuePageContent | null>(null);

  useEffect(() => {
    fetch("/api/venue")
      .then((response) => response.json())
      .then((data) => setVenue(data))
      .catch(() => setVenue(null));
  }, []);

  return (
    <>
      <Header />
      <ScrollReturnIndicator />
      <main id="main-content" className="relative z-10 overflow-hidden bg-black">
        {venue ? (
          <>
            <VenueHero venue={venue} />
            <VenueLiveSection live={venue.live} />
            <VenueEventsSection events={venue.events} />
            <VenueBarSection bar={venue.bar} />
            <VenueContacts contacts={venue.contacts} />
          </>
        ) : (
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-2 w-40 animate-shimmer rounded-full bg-white/5" />
          </div>
        )}
        <SiteFooter />
      </main>
    </>
  );
}