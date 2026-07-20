"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Artist } from "@/types/content";

export default function AdminArtists() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artists")
      .then((r) => r.json())
      .then((data) => {
        setArtists(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this artist?")) {
      return;
    }
    const res = await fetch(`/api/artists/${id}`, { method: "DELETE" });
    if (res.ok) {
      setArtists((prev) => prev.filter((a) => a.id !== id));
    }
  }

  if (loading) {
    return <p className="text-stone-400">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold uppercase tracking-normal">
          Artists
        </h1>
        <Link
          href="/admin/artists/new"
          className="rounded-full border border-white/15 bg-white/6 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
        >
          + Add Artist
        </Link>
      </div>

      <div className="space-y-3">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0a09] px-6 py-4"
          >
            <div>
              <p className="font-semibold text-white">{artist.name}</p>
              <p className="text-sm text-stone-400">
                {artist.role} / {artist.origin}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/artists/${artist.id}/edit`}
                className="text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(artist.id)}
                className="text-xs uppercase tracking-[0.2em] text-red-400/70 transition hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
