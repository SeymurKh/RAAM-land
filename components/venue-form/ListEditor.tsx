"use client";

interface ListEditorProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  addLabel?: string;
  multiline?: boolean;
  placeholder?: string;
}

/** Редактор списка строк (теги, абзацы, манифест). */
export function ListEditor({
  label,
  values,
  onChange,
  addLabel = "+ Add",
  multiline = false,
  placeholder,
}: ListEditorProps) {
  function update(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  function remove(index: number) {
    const next = [...values];
    next.splice(index, 1);
    onChange(next.length ? next : [""]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="mb-0 block text-xs uppercase tracking-[0.28em] text-stone-300/50">
          {label}
        </label>
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
        >
          {addLabel}
        </button>
      </div>
      {values.map((value, index) => (
        <div key={index} className="flex gap-3">
          {multiline ? (
            <textarea
              className="min-h-20 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-stone-100/35"
              value={value}
              placeholder={placeholder}
              onChange={(event) => update(index, event.target.value)}
            />
          ) : (
            <input
              className="h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35"
              value={value}
              placeholder={placeholder}
              onChange={(event) => update(index, event.target.value)}
            />
          )}
          <button
            type="button"
            onClick={() => remove(index)}
            className="text-red-400/70 hover:text-red-400"
            aria-label="Remove item"
          >
            x
          </button>
        </div>
      ))}
    </div>
  );
}