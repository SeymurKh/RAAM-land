"use client";

import { useEffect, useState } from "react";
import type { StreamConfig } from "@/data/stream";

export default function AdminStreamPage() {
  const [config, setConfig] = useState<StreamConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasYoutubeEnv, setHasYoutubeEnv] = useState(false);

  useEffect(() => {
    fetch("/api/stream")
      .then((r) => r.json())
      .then((data) => setConfig(data));

    // Check if YouTube API is configured
    fetch("/api/stream/status")
      .then((r) => r.json())
      .then((data) => {
        setHasYoutubeEnv(data.source !== "none");
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/stream", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  if (!config) {
    return <p className="text-stone-400">Loading...</p>;
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

  // Convert ISO date to datetime-local format (local time, no timezone shift)
  function toDatetimeLocal(iso?: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    // Format as YYYY-MM-DDTHH:mm in local timezone
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Stream Control
      </h1>

      {/* YouTube API status */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-stone-300/50">
          YouTube API Status
        </p>
        <p className="mt-2 text-sm text-stone-200/70">
          {hasYoutubeEnv ? (
            <span className="text-green-400">
              ✓ YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID are configured. Live
              status is auto-detected.
            </span>
          ) : (
            <span className="text-amber-400">
              ⚠ YOUTUBE_API_KEY or YOUTUBE_CHANNEL_ID not set. Set them in
              your environment to enable auto-detection.
            </span>
          )}
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div>
          <label className={labelClass}>Stream Title</label>
          <input
            className={inputClass}
            value={config.streamTitle}
            onChange={(e) =>
              setConfig({ ...config, streamTitle: e.target.value })
            }
          />
        </div>

        <div>
          <label className={labelClass}>YouTube URL (fallback)</label>
          <input
            className={inputClass}
            value={config.youtubeUrl ?? ""}
            onChange={(e) =>
              setConfig({
                ...config,
                youtubeUrl: e.target.value || undefined,
              })
            }
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="mt-1 text-xs text-stone-500">
            Used as fallback when YouTube API is not configured.
          </p>
        </div>

        <div>
          <label className={labelClass}>Next Stream Date</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={toDatetimeLocal(config.nextStreamDate)}
            onChange={(e) => {
              const val = e.target.value;
              if (!val) {
                setConfig({ ...config, nextStreamDate: undefined });
                return;
              }
              // Parse the datetime-local value as local time and store as ISO
              // datetime-local gives "YYYY-MM-DDTHH:mm" which Date() parses as local
              const iso = new Date(val).toISOString();
              setConfig({ ...config, nextStreamDate: iso });
            }}
          />
          <p className="mt-1 text-xs text-stone-500">
            Countdown timer will show when a date is set and stream is offline.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-white/15 bg-white/[0.06] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && (
            <span className="text-sm text-green-400">Saved ✓</span>
          )}
        </div>
      </form>
    </div>
  );
}
