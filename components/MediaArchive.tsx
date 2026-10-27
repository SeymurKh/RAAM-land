"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Music, Play } from "lucide-react";
import { MediaModal } from "@/components/MediaModal";
import { getMediaCover } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { ArchiveMediaKind, MediaItem } from "@/types/content";

const filters: { value: ArchiveMediaKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
  { value: "audio", label: "Audio" },
];

const PAGE_SIZE = 12;

/** Медиа-архив: сетка с фильтрами и догрузкой (растёт со временем). */
export function MediaArchive() {
  const [kind, setKind] = useState<ArchiveMediaKind | "all">("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<MediaItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/media?kind=${kind}&page=1&limit=${PAGE_SIZE}`)
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) return;
        setItems(data.items);
        setHasMore(data.hasMore);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  function selectKind(next: ArchiveMediaKind | "all") {
    setKind(next);
    setLoading(true);
  }

  async function loadMore() {
    const nextPage = Math.floor(items.length / PAGE_SIZE) + 1;
    const response = await fetch(
      `/api/media?kind=${kind}&page=${nextPage}&limit=${PAGE_SIZE}`,
    );
    const data = await response.json();
    setItems((current) => [...current, ...data.items]);
    setHasMore(data.hasMore);
  }

  return (
    <div className="mt-12 sm:mt-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
          Media Archive
        </h3>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => selectKind(filter.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] transition",
                kind === filter.value
                  ? "border-white/25 bg-white/10 text-stone-100"
                  : "border-white/10 bg-transparent text-stone-400 hover:border-white/20 hover:text-stone-200",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/3] animate-shimmer rounded-xl border border-white/8 bg-white/3"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-sm text-stone-400/70">
          No media items yet - check back soon.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const cover = getMediaCover(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 bg-white/3 text-left transition hover:border-white/25"
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={item.title}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.08),transparent_60%)]">
                    <Music size={22} className="text-stone-500" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.82))]" />
                {item.kind !== "photo" ? (
                  <span className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/55 backdrop-blur">
                    <Play size={12} className="translate-x-[1px]" />
                  </span>
                ) : null}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-100">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-stone-400/70">
                    {item.date}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {hasMore && !loading ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full border border-white/15 bg-white/6 px-8 py-3 text-xs font-medium uppercase tracking-[0.24em] text-stone-100 transition hover:bg-white/12"
          >
            Load more
          </button>
        </div>
      ) : null}

      <MediaModal item={active} onClose={() => setActive(null)} />
    </div>
  );
}