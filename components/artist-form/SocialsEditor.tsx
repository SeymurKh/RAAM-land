"use client";

import type { ArtistSocial, SocialKind } from "@/types/content";

const socialKinds: SocialKind[] = [
  "instagram",
  "soundcloud",
  "spotify",
  "youtube",
  "linktree",
  "apple-music",
  "telegram",
  "email",
  "phone",
];

interface SocialsEditorProps {
  items: ArtistSocial[];
  onChange: (items: ArtistSocial[]) => void;
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";

export function SocialsEditor({ items, onChange }: SocialsEditorProps) {
  function update(index: number, patch: Partial<ArtistSocial>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  function add() {
    onChange([...items, { kind: "instagram", label: "", url: "" }]);
  }

  function remove(index: number) {
    const updated = [...items];
    updated.splice(index, 1);
    onChange(updated);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
          Socials
        </label>
        <button
          type="button"
          onClick={add}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add
        </button>
      </div>
      {items.map((social, i) => (
        <div key={i} className="flex gap-3">
          <select
            className={`${inputClass} w-36`}
            value={social.kind}
            onChange={(e) => update(i, { kind: e.target.value as SocialKind })}
          >
            {socialKinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Label"
            value={social.label}
            onChange={(e) => update(i, { label: e.target.value })}
          />
          <input
            className={inputClass}
            placeholder="URL"
            value={social.url}
            onChange={(e) => update(i, { url: e.target.value })}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="text-red-400/70 hover:text-red-400"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
