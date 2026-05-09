"use client";

import { useEffect, useState } from "react";
import type { StreamConfig } from "@/data/stream";

export default function AdminStreamPage() {
  const [config, setConfig] = useState<StreamConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/stream")
      .then((r) => r.json())
      .then((data) => setConfig(data));
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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Stream Control
      </h1>

      <form onSubmit={handleSave} className="max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          <label className={labelClass}>Live Status</label>
          <button
            type="button"
            onClick={() => setConfig({ ...config, isLive: !config.isLive })}
            className={`rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${
              config.isLive
                ? "bg-red-500/20 text-red-400 border border-red-500/30"
                : "bg-white/[0.04] text-stone-400 border border-white/10"
            }`}
          >
            {config.isLive ? "● Live" : "○ Offline"}
          </button>
        </div>

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
          <label className={labelClass}>YouTube URL</label>
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
        </div>

        <div>
          <label className={labelClass}>Next Stream Date</label>
          <input
            type="datetime-local"
            className={inputClass}
            value={
              config.nextStreamDate
                ? new Date(config.nextStreamDate).toISOString().slice(0, 16)
                : ""
            }
            onChange={(e) =>
              setConfig({
                ...config,
                nextStreamDate: e.target.value
                  ? new Date(e.target.value).toISOString()
                  : undefined,
              })
            }
          />
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
