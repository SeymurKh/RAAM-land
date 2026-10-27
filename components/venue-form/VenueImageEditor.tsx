"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { HeroMedia, VenueImage } from "@/types/content";

async function uploadVenueImage(file: File, key: string): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("venueKey", key);
  try {
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    if (response.ok) {
      const data = await response.json();
      return `${data.url}?v=${Date.now()}`;
    }
  } catch {
    // Upload failed silently
  }
  return null;
}

const labelClass =
  "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

interface VenueImageUploadProps {
  label: string;
  imageKey: string; // фиксированный ключ: "hero" | "video-thumb"
  value?: string;
  onChange: (url: string | undefined) => void;
}

/** Одиночная картинка с фиксированным именем файла (лого, hero, превью). */
export function VenueImageUpload({
  label,
  imageKey,
  value,
  onChange,
}: VenueImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadVenueImage(file, imageKey);
    if (url) onChange(url);
    setUploading(false);
  }

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
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
        {value ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-red-400/70 hover:text-red-400"
          >
            Remove
          </button>
        ) : null}
      </div>
      {value ? (
        <div className="relative mt-3 h-28 w-full max-w-xs overflow-hidden rounded-xl border border-white/10">
          <Image
            src={value}
            alt={label}
            fill
            sizes="320px"
            className="object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

interface ImageSlotsEditorProps {
  label: string;
  images: VenueImage[];
  onChange: (images: VenueImage[]) => void;
  max?: number;
}

/** Список картинок (коллаж ивентов, фото бара) с загрузкой и удалением. */
export function ImageSlotsEditor({
  label,
  images,
  onChange,
  max = 8,
}: ImageSlotsEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const key = `img-${Date.now()}`;
    setUploading(true);
    const url = await uploadVenueImage(file, key);
    if (url) {
      onChange([...images, { id: key, src: url }]);
    }
    setUploading(false);
    event.target.value = "";
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="mb-0 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
          {label}
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= max}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "+ Add image"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      {images.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10"
            >
              <Image
                src={image.src}
                alt={image.alt ?? ""}
                fill
                sizes="20vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  onChange(images.filter((_, i) => i !== index))
                }
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white transition hover:bg-red-500/80"
                aria-label="Remove image"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface HeroColumnsEditorProps {
  label: string;
  columns: HeroMedia[];
  onChange: (columns: HeroMedia[]) => void;
}

/** Загрузка медиа слота hero (фото или видео) на сервер. */
async function uploadHeroMedia(
  file: File,
  slotIndex: number,
): Promise<HeroMedia | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("venueKey", `hero-col-${slotIndex + 1}`);
  const stamp = Date.now();
  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      console.error("[hero-upload] Failed:", data.error);
      return null;
    }
    return {
      id: `hero-${slotIndex + 1}`,
      kind: file.type.startsWith("video/") ? "video" : "image",
      src: `${data.url}?v=${stamp}`,
      poster: data.poster ? `${data.poster}?v=${stamp}` : undefined,
    };
  } catch {
    // Upload failed
    return null;
  }
}

/** Редактор фона hero: 3 слота 9:16, каждый — фото или видео. */
export function HeroColumnsEditor({
  label,
  columns,
  onChange,
}: HeroColumnsEditorProps) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function setSlot(index: number, media: HeroMedia | null) {
    const next = [...columns];
    while (next.length < index) next.push(undefined as unknown as HeroMedia);
    if (media) next[index] = media;
    else next.splice(index, 1);
    onChange(next.filter(Boolean).slice(0, 3));
  }

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setUploadingSlot(index);
    const media = await uploadHeroMedia(file, index);
    if (media) setSlot(index, media);
    else setError("Upload failed");
    setUploadingSlot(null);
  }

  // Гарантируем ровно 3 слота для рендера
  const slots: (HeroMedia | undefined)[] = [0, 1, 2].map((i) => columns[i]);

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-3">
        {slots.map((media, index) => (
          <div key={index}>
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="file"
              accept="image/*,video/mp4,video/webm"
              onChange={(event) => handleUpload(event, index)}
              className="hidden"
            />
            <div className="relative aspect-[9/16] overflow-hidden rounded-xl border border-white/10">
              {media ? (
                media.kind === "video" ? (
                  <video
                    src={media.src}
                    poster={media.poster}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={media.src}
                    alt={media.alt ?? ""}
                    fill
                    sizes="15vw"
                    className="object-cover"
                  />
                )
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#141010,#080706)]" />
              )}

              {uploadingSlot === index ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs uppercase tracking-[0.2em] text-stone-200">
                  Uploading...
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => inputRefs.current[index]?.click()}
                disabled={uploadingSlot !== null}
                className="absolute inset-x-2 bottom-2 rounded-lg border border-white/15 bg-black/60 px-2 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-stone-100 transition hover:bg-black/80 disabled:opacity-50"
              >
                {media ? "Replace" : "+ Photo / Video"}
              </button>

              {media ? (
                <button
                  type="button"
                  onClick={() => setSlot(index, null)}
                  className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs text-white transition hover:bg-red-500/80"
                  aria-label={`Remove column ${index + 1}`}
                >
                  ✕
                </button>
              ) : null}
            </div>
            <p className="mt-1.5 text-center text-[0.65rem] uppercase tracking-[0.22em] text-stone-500">
              Column {index + 1}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-stone-500">
        Photo (up to 5MB) or video MP4/WebM (up to 100MB) — video is compressed
        to 9:16, muted loop.
      </p>
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}