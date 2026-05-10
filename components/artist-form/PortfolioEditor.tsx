"use client";

import type { ArtistMedia, MediaKind } from "@/types/content";

const mediaKinds: MediaKind[] = ["image", "video", "audio"];

interface PortfolioEditorProps {
  items: ArtistMedia[];
  onChange: (items: ArtistMedia[]) => void;
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";

export function PortfolioEditor({ items, onChange }: PortfolioEditorProps) {
  function update(index: number, patch: Partial<ArtistMedia>) {
    const updated = [...items];
    updated[index] = { ...updated[index], ...patch };
    onChange(updated);
  }

  function add() {
    onChange([
      ...items,
      { id: `item-${Date.now()}`, title: "", kind: "audio" },
    ]);
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
          Portfolio items
        </label>
        <button
          type="button"
          onClick={add}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          + Add
        </button>
      </div>
      {items.map((item, i) => (
        <div key={item.id} className="flex gap-3">
          <input
            className={inputClass}
            placeholder="Title"
            value={item.title}
            onChange={(e) => update(i, { title: e.target.value })}
          />
          <select
            className={`${inputClass} w-32`}
            value={item.kind}
            onChange={(e) => update(i, { kind: e.target.value as MediaKind })}
          >
            {mediaKinds.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="URL (optional)"
            value={item.url ?? ""}
            onChange={(e) => update(i, { url: e.target.value || undefined })}
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
