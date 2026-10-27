"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MediaItem } from "@/types/content";

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/media?limit=50")
      .then((response) => response.json())
      .then((data) => {
        setItems(data.items);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this media item?")) {
      return;
    }

    const response = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (response.ok) {
      setItems((current) => current.filter((item) => item.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold uppercase tracking-normal">
          Media Archive
        </h1>
        <Link
          href="/admin/media/new"
          className="rounded-full border border-white/15 bg-white/6 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
        >
          + Add Media
        </Link>
      </div>

      {loading ? (
        <p className="text-stone-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-stone-400">No media items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0a09] px-6 py-4"
            >
              <div>
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-stone-400">
                  {item.kind}
                  {item.provider ? ` / ${item.provider}` : ""} / {item.date} / #
                  {item.order}
                </p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/admin/media/${item.id}/edit`}
                  className="text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="text-xs uppercase tracking-[0.2em] text-red-400/70 transition hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}