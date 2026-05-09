"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArtistForm } from "@/components/ArtistForm";
import type { Artist } from "@/types/content";

export default function EditArtistPage() {
  const params = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/artists/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => {
        setArtist(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-stone-400">Loading...</p>;
  }

  if (!artist) {
    return <p className="text-red-400">Artist not found</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Edit: {artist.name}
      </h1>
      <ArtistForm artist={artist} mode="edit" />
    </div>
  );
}
