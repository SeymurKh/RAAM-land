"use client";

import { ArtistForm } from "@/components/ArtistForm";

export default function NewArtistPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        New Artist
      </h1>
      <ArtistForm mode="create" />
    </div>
  );
}
