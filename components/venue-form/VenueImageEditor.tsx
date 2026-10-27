"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { VenueImage } from "@/types/content";

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
  imageKey: string; // фиксированный ключ: "logo" | "hero" | "video-thumb"
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