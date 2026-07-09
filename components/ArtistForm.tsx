"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Artist } from "@/types/content";
import { ArtistPhotoUpload } from "@/components/artist-form/ArtistPhotoUpload";
import { PortfolioEditor } from "@/components/artist-form/PortfolioEditor";
import { SocialsEditor } from "@/components/artist-form/SocialsEditor";
import { ImagePositionPicker } from "@/components/ImagePositionPicker";

interface ArtistFormProps {
  artist?: Artist;
  mode: "create" | "edit";
}

export function ArtistForm({ artist, mode }: ArtistFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [initialsManuallyEdited, setInitialsManuallyEdited] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [tempId] = useState(() => `new-${Date.now()}`);

  const [form, setForm] = useState<Artist>(
    artist ?? {
      id: "",
      name: "",
      origin: "",
      role: "",
      genres: [],
      bio: [""],
      highlights: [""],
      portfolio: [],
      socials: [],
      photo: undefined,
      imagePosition: "50% 50%",
      avatar: undefined,
      avatarPosition: "50% 50%",
      visual: { initials: "", position: "high", tone: "from-stone-300/20" },
    },
  );


  function updateField<K extends keyof Artist>(key: K, value: Artist[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateBio(index: number, value: string) {
    const bio = [...form.bio];
    bio[index] = value;
    updateField("bio", bio);
  }

  function updateHighlight(index: number, value: string) {
    const highlights = [...form.highlights];
    highlights[index] = value;
    updateField("highlights", highlights);
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const artistId = form.id || tempId;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("artistId", artistId);
    formData.append("kind", "avatar");
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        updateField("avatar", `${data.url}?v=${Date.now()}`);
        setAvatarVersion((v) => v + 1);
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url =
      mode === "create"
        ? "/api/artists"
        : `/api/artists/${form.id}`;
    const method = mode === "create" ? "POST" : "PUT";

    const payload = { ...form, photo: form.photo ?? null, avatar: form.avatar ?? null };
    console.log("[ArtistForm] Submitting:", method, url, "photo:", payload.photo, "avatar:", payload.avatar);

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/admin/artists");
      router.refresh();
    } else {
      console.error("[ArtistForm] Submit failed:", res.status);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Фото артиста — Instagram-стиль */}
      <ArtistPhotoUpload
        value={form.photo}
        artistId={form.id || tempId}
        onChange={(url) => updateField("photo", url)}
        onRemove={() => {
          updateField("photo", undefined);
          updateField("imagePosition", undefined);
        }}
      />

      {/* Image Position Picker для фото */}
      {form.photo && (
        <div>
          <label className={labelClass}>Photo Position</label>
          <ImagePositionPicker
            imageUrl={form.photo}
            value={form.imagePosition}
            onChange={(pos) => updateField("imagePosition", pos)}
            shape="modal-photo"
          />
        </div>
      )}

      {/* Аватар артиста */}
      <div>
        <label className={labelClass}>Avatar (circle next to name)</label>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 transition hover:bg-white/[0.06] disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading..." : form.avatar ? "Change Avatar" : "Upload Avatar"}
            </button>
            {form.avatar && (
              <button
                type="button"
                onClick={() => {
                  updateField("avatar", undefined);
                  updateField("avatarPosition", undefined);
                }}
                className="text-xs text-red-400/70 hover:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
          {form.avatar && (
            <ImagePositionPicker
              imageUrl={`${form.avatar}?v=${avatarVersion}`}
              value={form.avatarPosition}
              onChange={(pos) => updateField("avatarPosition", pos)}
              shape="avatar"
            />
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>ID (slug)</label>
          <input
            className={inputClass}
            value={form.id}
            onChange={(e) => updateField("id", e.target.value)}
            disabled={mode === "edit"}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Origin</label>
          <input
            className={inputClass}
            value={form.origin}
            onChange={(e) => updateField("origin", e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <input
            className={inputClass}
            value={form.role}
            onChange={(e) => updateField("role", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Genres (comma-separated)</label>
        <input
          className={inputClass}
          value={form.genres.join(", ")}
          onChange={(e) =>
            updateField(
              "genres",
              e.target.value.split(",").map((g) => g.trim()),
            )
          }
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Bio paragraphs</label>
          <button
            type="button"
            onClick={() => updateField("bio", [...form.bio, ""])}
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add
          </button>
        </div>
        {form.bio.map((paragraph, i) => (
          <textarea
            key={i}
            className="w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-stone-100/35"
            rows={3}
            value={paragraph}
            onChange={(e) => updateBio(i, e.target.value)}
          />
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Highlights</label>
          <button
            type="button"
            onClick={() => updateField("highlights", [...form.highlights, ""])}
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add
          </button>
        </div>
        {form.highlights.map((item, i) => (
          <input
            key={i}
            className={inputClass}
            value={item}
            onChange={(e) => updateHighlight(i, e.target.value)}
          />
        ))}
      </div>

      <PortfolioEditor
        items={form.portfolio}
        onChange={(portfolio) => updateField("portfolio", portfolio)}
      />

      <SocialsEditor
        items={form.socials}
        onChange={(socials) => updateField("socials", socials)}
      />

      <div>
        <label className={labelClass}>Visual Initials</label>
        <input
          className={inputClass}
          value={form.visual.initials}
          onChange={(e) => {
            setInitialsManuallyEdited(true);
            updateField("visual", { ...form.visual, initials: e.target.value });
          }}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border border-white/15 bg-white/[0.06] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving ? "Saving..." : mode === "create" ? "Create Artist" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/artists")}
          className="rounded-full border border-white/10 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}