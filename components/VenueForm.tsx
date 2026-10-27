"use client";

import { useState } from "react";
import { ListEditor } from "@/components/venue-form/ListEditor";
import { MenuEditor } from "@/components/venue-form/MenuEditor";
import {
  ImageSlotsEditor,
  VenueImageUpload,
} from "@/components/venue-form/VenueImageEditor";
import type { VenuePageContent } from "@/types/content";

interface VenueFormProps {
  venue: VenuePageContent;
  onSaved?: () => void;
}

export function VenueForm({ venue, onSaved }: VenueFormProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<VenuePageContent>(venue);

  function updateField<K extends keyof VenuePageContent>(
    key: K,
    value: VenuePageContent[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSection<S extends "live" | "events" | "bar">(
    section: S,
    patch: Partial<VenuePageContent[S]>,
  ) {
    setForm((current) => ({
      ...current,
      [section]: { ...current[section], ...patch },
    }));
  }

  function updateContacts(patch: Partial<VenuePageContent["contacts"]>) {
    setForm((current) => ({
      ...current,
      contacts: { ...current.contacts, ...patch },
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    const response = await fetch("/api/venue", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (response.ok) {
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 2000);
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";
  const sectionClass =
    "space-y-6 rounded-2xl border border-white/10 bg-white/3 p-5";
  const sectionTitleClass =
    "text-xs uppercase tracking-[0.28em] text-stone-300/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ─── Hero ─── */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>Hero</p>
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Headline</label>
          <input
            className={inputClass}
            value={form.headline}
            onChange={(event) => updateField("headline", event.target.value)}
          />
        </div>
        <ListEditor
          label="Tags"
          values={form.tags}
          onChange={(tags) => updateField("tags", tags)}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <VenueImageUpload
            label="Logo"
            imageKey="logo"
            value={form.logo}
            onChange={(logo) => updateField("logo", logo)}
          />
          <VenueImageUpload
            label="Hero background"
            imageKey="hero"
            value={form.heroImage}
            onChange={(heroImage) => updateField("heroImage", heroImage)}
          />
        </div>
      </div>

      {/* ─── 01 Live Streaming ─── */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>Live Streaming</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Eyebrow</label>
            <input
              className={inputClass}
              value={form.live.eyebrow}
              onChange={(event) =>
                updateSection("live", { eyebrow: event.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.live.title}
              onChange={(event) =>
                updateSection("live", { title: event.target.value })
              }
            />
          </div>
        </div>
        <ListEditor
          label="Description paragraphs"
          values={form.live.description}
          onChange={(description) => updateSection("live", { description })}
          multiline
        />
        <div className="space-y-3">
          <label className={labelClass}>Platforms</label>
          {form.live.platforms.map((platform, index) => (
            <div key={index} className="flex gap-2">
              <select
                className={`${inputClass} w-44`}
                value={platform.kind}
                onChange={(event) => {
                  const platforms = [...form.live.platforms];
                  platforms[index] = {
                    ...platforms[index],
                    kind: event.target.value as typeof platform.kind,
                  };
                  updateSection("live", { platforms });
                }}
              >
                {[
                  "youtube",
                  "twitch",
                  "instagram",
                  "mixcloud",
                  "soundcloud",
                  "spotify",
                  "telegram",
                  "linktree",
                ].map((kind) => (
                  <option key={kind} value={kind} className="bg-[#0b0a09]">
                    {kind}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                placeholder="Label"
                value={platform.label}
                onChange={(event) => {
                  const platforms = [...form.live.platforms];
                  platforms[index] = {
                    ...platforms[index],
                    label: event.target.value,
                  };
                  updateSection("live", { platforms });
                }}
              />
              <input
                className={inputClass}
                placeholder="https://..."
                value={platform.url}
                onChange={(event) => {
                  const platforms = [...form.live.platforms];
                  platforms[index] = {
                    ...platforms[index],
                    url: event.target.value,
                  };
                  updateSection("live", { platforms });
                }}
              />
              <button
                type="button"
                onClick={() =>
                  updateSection("live", {
                    platforms: form.live.platforms.filter((_, i) => i !== index),
                  })
                }
                className="text-red-400/70 hover:text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              updateSection("live", {
                platforms: [
                  ...form.live.platforms,
                  { kind: "youtube", label: "", url: "" },
                ],
              })
            }
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add platform
          </button>
        </div>
      </div>

      {/* ─── 02 Events ─── */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>Events</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Eyebrow</label>
            <input
              className={inputClass}
              value={form.events.eyebrow}
              onChange={(event) =>
                updateSection("events", { eyebrow: event.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.events.title}
              onChange={(event) =>
                updateSection("events", { title: event.target.value })
              }
            />
          </div>
        </div>
        <ListEditor
          label="Description paragraphs"
          values={form.events.description}
          onChange={(description) => updateSection("events", { description })}
          multiline
        />
        <ListEditor
          label="Manifesto lines"
          values={form.events.manifesto}
          onChange={(manifesto) => updateSection("events", { manifesto })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>CTA label</label>
            <input
              className={inputClass}
              value={form.events.cta.label}
              onChange={(event) =>
                updateSection("events", {
                  cta: { ...form.events.cta, label: event.target.value },
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>CTA link</label>
            <input
              className={inputClass}
              value={form.events.cta.href}
              onChange={(event) =>
                updateSection("events", {
                  cta: { ...form.events.cta, href: event.target.value },
                })
              }
            />
          </div>
        </div>
        <ImageSlotsEditor
          label="Photo collage (up to 3)"
          images={form.events.gallery}
          onChange={(gallery) => updateSection("events", { gallery })}
          max={3}
        />
        <p className="text-xs text-stone-500">
          The media archive below the collage is managed in the Media menu.
        </p>
      </div>

      {/* ─── 03 The Bar ─── */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>The Bar</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Eyebrow</label>
            <input
              className={inputClass}
              value={form.bar.eyebrow}
              onChange={(event) =>
                updateSection("bar", { eyebrow: event.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.bar.title}
              onChange={(event) =>
                updateSection("bar", { title: event.target.value })
              }
            />
          </div>
        </div>
        <ListEditor
          label="Description paragraphs"
          values={form.bar.description}
          onChange={(description) => updateSection("bar", { description })}
          multiline
        />
        <ImageSlotsEditor
          label="Bar photos (up to 2)"
          images={form.bar.images}
          onChange={(images) => updateSection("bar", { images })}
          max={2}
        />
        <MenuEditor
          menu={form.bar.menu}
          onChange={(menu) => updateSection("bar", { menu })}
        />
      </div>

      {/* ─── Contacts ─── */}
      <div className={sectionClass}>
        <p className={sectionTitleClass}>Contacts</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Address</label>
            <input
              className={inputClass}
              value={form.contacts.address}
              onChange={(event) =>
                updateContacts({ address: event.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Working hours</label>
            <input
              className={inputClass}
              value={form.contacts.hours}
              onChange={(event) => updateContacts({ hours: event.target.value })}
              placeholder="Thu, Fri, Sat, Sun · 20:00-04:00"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border border-white/15 bg-white/6 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        {saved ? (
          <span className="text-sm text-green-400">Saved ✓</span>
        ) : null}
      </div>
    </form>
  );
}