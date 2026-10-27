"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ArchiveMediaKind,
  ArchiveMediaProvider,
  MediaItem,
} from "@/types/content";

interface MediaFormProps {
  mode: "create" | "edit";
  item?: MediaItem;
}

const kinds: ArchiveMediaKind[] = ["photo", "video", "audio"];
const providers: ArchiveMediaProvider[] = ["youtube", "soundcloud", "spotify"];

export function MediaForm({ mode, item }: MediaFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<MediaItem>(
    item ?? {
      id: "",
      title: "",
      date: new Date().toISOString().slice(0, 10),
      kind: "photo",
      order: 1,
    },
  );

  function updateField<K extends keyof MediaItem>(key: K, value: MediaItem[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const mediaId = form.id || `new-media-${Date.now()}`;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaId", mediaId);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        updateField("image", `${data.url}?v=${Date.now()}`);
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const url = mode === "create" ? "/api/media" : `/api/media/${form.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        order: Number(form.order) || 0,
        provider: form.kind === "photo" ? undefined : form.provider,
        url: form.url?.trim() || undefined,
        image: form.image?.trim() || undefined,
      }),
    });
    setSaving(false);
    if (response.ok) {
      router.push("/admin/media");
      router.refresh();
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>ID (slug)</label>
          <input
            className={inputClass}
            value={form.id}
            onChange={(event) => updateField("id", event.target.value)}
            disabled={mode === "edit"}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.date}
            onChange={(event) => updateField("date", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Order</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.order}
            onChange={(event) => updateField("order", Number(event.target.value))}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Kind</label>
          <select
            className={inputClass}
            value={form.kind}
            onChange={(event) => {
              const kind = event.target.value as ArchiveMediaKind;
              updateField("kind", kind);
              if (kind === "photo") {
                updateField("provider", undefined);
                updateField("url", undefined);
              }
            }}
          >
            {kinds.map((kind) => (
              <option key={kind} value={kind} className="bg-[#0b0a09]">
                {kind}
              </option>
            ))}
          </select>
        </div>
        {form.kind !== "photo" ? (
          <div>
            <label className={labelClass}>Provider</label>
            <select
              className={inputClass}
              value={form.provider ?? "youtube"}
              onChange={(event) =>
                updateField("provider", event.target.value as ArchiveMediaProvider)
              }
            >
              {providers.map((provider) => (
                <option key={provider} value={provider} className="bg-[#0b0a09]">
                  {provider}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {form.kind !== "photo" ? (
        <div>
          <label className={labelClass}>Media URL</label>
          <input
            className={inputClass}
            value={form.url ?? ""}
            onChange={(event) => updateField("url", event.target.value)}
            placeholder={
              form.provider === "soundcloud"
                ? "https://soundcloud.com/..."
                : form.provider === "spotify"
                  ? "https://open.spotify.com/track/..."
                  : "https://www.youtube.com/watch?v=..."
            }
            required
          />
          <p className="mt-1 text-xs text-stone-500">
            YouTube video / SoundCloud or Spotify link — embeds into the player.
          </p>
        </div>
      ) : null}

      <div>
        <label className={labelClass}>
          {form.kind === "photo" ? "Photo" : "Cover image (optional)"}
        </label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 transition hover:bg-white/6 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </button>
          {form.image ? (
            <button
              type="button"
              onClick={() => updateField("image", undefined)}
              className="text-xs text-red-400/70 hover:text-red-400"
            >
              Remove
            </button>
          ) : null}
        </div>
        {form.kind !== "photo" ? (
          <p className="mt-1 text-xs text-stone-500">
            Without a cover the YouTube thumbnail is used automatically.
          </p>
        ) : null}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border border-white/15 bg-white/6 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Media"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/media")}
          className="rounded-full border border-white/10 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
