"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardData {
  artistCount: number;
  isLive: boolean;
  streamTitle: string;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/artists").then((r) => r.json()),
      fetch("/api/stream").then((r) => r.json()),
    ]).then(([artists, stream]) => {
      setData({
        artistCount: artists.length,
        isLive: stream.isLive,
        streamTitle: stream.streamTitle,
      });
    });
  }, []);

  if (!data) {
    return <p className="text-stone-400">Loading...</p>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-[#0b0a09] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-300/50">
            Artists
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">
            {data.artistCount}
          </p>
          <Link
            href="/admin/artists"
            className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
          >
            Manage →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0a09] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-300/50">
            Stream
          </p>
          <p className="mt-3 text-4xl font-semibold text-white">
            {data.isLive ? "Live" : "Offline"}
          </p>
          <Link
            href="/admin/stream"
            className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
          >
            Configure →
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0b0a09] p-6">
          <p className="text-xs uppercase tracking-[0.32em] text-stone-300/50">
            Site
          </p>
          <p className="mt-3 text-lg text-stone-200/70">{data.streamTitle}</p>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
          >
            View site →
          </a>
        </div>
      </div>
    </div>
  );
}
