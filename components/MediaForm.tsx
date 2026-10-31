"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  detectKindFromFileUrl,
  detectProviderFromUrl,
  slugifyMediaId,
} from "@/lib/media";
import type { ArchiveMediaKind, MediaItem } from "@/types/content";

interface MediaFormProps {
  mode: "create" | "edit";
  item?: MediaItem;
}

const kindLabels: Record<ArchiveMediaKind, string> = {
  photo: "Photo",
  video: "Video",
  audio: "Audio",
};

/** Тип определяется автоматически: ссылка → сервис, файл → расширение. */
function detect(
  content: string,
): { kind: ArchiveMediaKind; provider?: MediaItem["provider"] } | undefined {
  const value = content.trim();
  if (!value) return undefined;
  if (value.startsWith("/uploads/")) {
    const kind = detectKindFromFileUrl(value);
    return kind ? { kind } : undefined;
  }
  const link = detectProviderFromUrl(value);
  return link ? { kind: link.kind, provider: link.provider } : undefined;
}

export function MediaForm({ mode, item }: MediaFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(item?.title ?? "");
  const [date, setDate] = useState(
    item?.date ?? new Date().toISOString().slice(0, 10),
  );
  // Одно поле контента: внешняя ссылка или загруженный файл
  const [content, setContent] = useState(item?.url ?? item?.image ?? "");
  // Обложка/постер (для видео и аудио); для фото не используется
  const [cover, setCover] = useState<string | undefined>(
    item?.kind === "photo" ? undefined : item?.image,
  );

  const detected = detect(content);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("mediaId", item?.id || `new-media-${Date.now()}`);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setContent(`${data.url}?v=${Date.now()}`);
      if (data.poster) setCover(`${data.poster}?v=${Date.now()}`);
      else if (file.type.startsWith("image/")) setCover(undefined);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const current = detect(content);
    if (!current) {
      setError(
        content.trim()
          ? "Unsupported link - use YouTube, SoundCloud or Spotify"
          : "Add a photo, video or audio file / link",
      );
      return;
    }
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    const isPhoto = current.kind === "photo";
    const payload: MediaItem = {
      id: item?.id ?? slugifyMediaId(title),
      title: title.trim(),
      date,
      kind: current.kind,
      provider: current.provider,
      url: isPhoto ? undefined : content.trim(),
      image: isPhoto ? content.trim() : cover?.trim() || undefined,
    };
    try {
      const response = await fetch(
        mode === "create" ? "/api/media" : `/api/media/${item?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (response.ok) {
        router.push("/admin/media");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Save failed");
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className={labelClass}>Title</label>
        <input
          className={inputClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Date</label>
        <input
          type="date"
          className={inputClass}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>Link or file</label>
        <div className="flex items-center gap-4">
          <input
            className={inputClass}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Link or upload a file"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="h-12 shrink-0 rounded-xl border border-white/10 bg-black/25 px-4 text-sm text-stone-100 transition hover:bg-white/6 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        <p className="mt-1 text-xs text-stone-500">
          Paste a YouTube / SoundCloud / Spotify link or upload a photo, video
          or audio file - the type is detected automatically.
        </p>
        {detected ? (
          <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#E82919]">
            {kindLabels[detected.kind]}
            {detected.provider ? ` · ${detected.provider}` : ""}
          </p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving || uploading}
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
