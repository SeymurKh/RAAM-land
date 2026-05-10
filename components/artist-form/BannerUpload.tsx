"use client";

import Image from "next/image";
import { useRef, useState } from "react";

interface BannerUploadProps {
  value: string | undefined;
  artistId: string;
  onChange: (url: string) => void;
}

export function BannerUpload({ value, artistId, onChange }: BannerUploadProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("artistId", artistId || `new-${Date.now()}`);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      onChange(url);
      setPreview(url);
      return url;
    }
    return null;
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
        Banner Image
      </label>
      <div className="mt-2 flex items-start gap-4">
        {preview ? (
          <div className="relative h-32 w-48 overflow-hidden rounded-xl border border-white/10">
            <Image
              src={preview}
              alt="Banner preview"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-32 w-48 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 text-xs text-stone-500">
            No image
          </div>
        )}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="text-sm text-stone-300 file:mr-3 file:rounded-full file:border file:border-white/10 file:bg-white/[0.06] file:px-4 file:py-2 file:text-xs file:uppercase file:tracking-[0.2em] file:text-stone-100"
          />
          <p className="text-xs text-stone-500">PNG, JPEG, WebP or GIF. Max 5MB.</p>
        </div>
      </div>
    </div>
  );
}
