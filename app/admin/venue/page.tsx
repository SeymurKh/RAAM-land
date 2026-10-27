"use client";

import { useEffect, useState } from "react";
import { VenueForm } from "@/components/VenueForm";
import type { VenuePageContent } from "@/types/content";

export default function AdminVenuePage() {
  const [venue, setVenue] = useState<VenuePageContent | null>(null);

  useEffect(() => {
    fetch("/api/venue")
      .then((response) => response.json())
      .then((data) => setVenue(data));
  }, []);

  if (!venue) {
    return <p className="text-stone-400">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Radio Stream Bar
      </h1>
      <VenueForm venue={venue} />
    </div>
  );
}