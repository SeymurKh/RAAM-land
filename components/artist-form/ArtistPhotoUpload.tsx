"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera } from "lucide-react";

interface ArtistPhotoUploadProps {
  /** Текущий URL фото */
  value: string | undefined;
  /** ID артиста — используется как имя файла */
  artistId: string;
  /** Вызывается при успешной загрузке с новым URL */
  onChange: (url: string) => void;
  /** Вызывается при удалении фото */
  onRemove: () => void;
}

export function ArtistPhotoUpload({
  value,
  artistId,
  onChange,
  onRemove,
}: ArtistPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    console.log("[ArtistPhotoUpload] Starting upload for artistId:", artistId, "file:", file.name);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("artistId", artistId || `new-${Date.now()}`);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      console.log("[ArtistPhotoUpload] Upload response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        const urlWithBust = `${data.url}?v=${Date.now()}`;
        console.log("[ArtistPhotoUpload] Upload success, URL:", urlWithBust);
        onChange(urlWithBust);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("[ArtistPhotoUpload] Upload failed:", res.status, data);
        setError(data.error || `Ошибка загрузки (${res.status})`);
      }
    } catch (err) {
      console.error("[ArtistPhotoUpload] Upload exception:", err);
      setError("Сетевая ошибка при загрузке");
    } finally {
      setUploading(false);
      // Сбросить input чтобы можно было выбрать тот же файл повторно
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleClick() {
    fileInputRef.current?.click();
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Круглый аватар — Instagram-стиль */}
      <div className="group relative h-40 w-40 cursor-pointer" onClick={handleClick}>
        <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/15 bg-white/[0.04]">
          {value ? (
            <Image
              src={value}
              alt="Фото артиста"
              fill
              sizes="160px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-4xl font-semibold uppercase text-white/15">
                {artistId ? artistId.slice(0, 2).toUpperCase() : "?"}
              </span>
            </div>
          )}
          {/* Оверлей при наведении */}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera size={28} className="text-white" />
          </div>
          {/* Спиннер загрузки */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          )}
        </div>
      </div>

      {/* Скрытый file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Подпись и кнопка удаления */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white disabled:opacity-50"
        >
          {value ? "Сменить фото" : "Загрузить фото"}
        </button>
        {value && (
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="text-xs uppercase tracking-[0.2em] text-red-400/60 transition hover:text-red-400 disabled:opacity-50"
          >
            Удалить
          </button>
        )}
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        <p className="text-[0.65rem] text-stone-500">PNG, JPEG, WebP или GIF • макс. 5 МБ</p>
      </div>
    </div>
  );
}
