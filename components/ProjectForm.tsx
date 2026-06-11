"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/content";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
}

const statuses: Project["status"][] = [
  "Active",
  "Developing",
  "Seasonal",
  "Archive",
];

export function ProjectForm({ mode, project }: ProjectFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Project>(
    project ?? {
      id: "",
      title: "",
      category: "",
      status: "Active",
      accent: "",
      order: 1,
      youtubeUrl: "",
      description: [""],
    },
  );

  function updateField<K extends keyof Project>(key: K, value: Project[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateDescription(index: number, value: string) {
    const description = [...form.description];
    description[index] = value;
    updateField("description", description);
  }

  function removeDescription(index: number) {
    const description = [...form.description];
    description.splice(index, 1);
    updateField("description", description.length ? description : [""]);
  }

  async function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    const projectId = form.id || "new-project";
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("projectId", projectId);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        updateField("image", data.url);
      }
    } catch {
      // Upload failed silently
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const url =
      mode === "create" ? "/api/projects" : `/api/projects/${form.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        order: Number(form.order) || 0,
        description: form.description.filter((paragraph) => paragraph.trim()),
        youtubeUrl: form.youtubeUrl?.trim() || undefined,
        image: form.image?.trim() || undefined,
      }),
    });
    setSaving(false);
    if (response.ok) {
      router.push("/admin/projects");
      router.refresh();
    }
  }

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-black/25 px-4 text-stone-100 outline-none transition focus:border-stone-100/35";
  const labelClass =
    "mb-2 block text-xs uppercase tracking-[0.28em] text-stone-300/50";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>ID (slug)</label>
          <input
            className={inputClass}
            value={form.id}
            onChange={(event) => updateField("id", event.target.value)}
            disabled={mode === "edit"}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input
            className={inputClass}
            value={form.category}
            onChange={(event) => updateField("category", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Accent</label>
          <input
            className={inputClass}
            value={form.accent}
            onChange={(event) => updateField("accent", event.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(event) =>
              updateField("status", event.target.value as Project["status"])
            }
          >
            {statuses.map((status) => (
              <option key={status} value={status} className="bg-[#0b0a09]">
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Order</label>
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.order}
            onChange={(event) => updateField("order", Number(event.target.value))}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Project Image</label>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-stone-100 transition hover:bg-white/[0.06] disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Choose Image"}
          </button>
          {form.image && (
            <span className="text-xs text-stone-300/55">{form.image}</span>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>YouTube playlist URL</label>
        <input
          className={inputClass}
          value={form.youtubeUrl ?? ""}
          onChange={(event) => updateField("youtubeUrl", event.target.value)}
          placeholder="https://www.youtube.com/playlist?list=..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Description paragraphs</label>
          <button
            type="button"
            onClick={() =>
              updateField("description", [...form.description, ""])
            }
            className="text-xs uppercase tracking-[0.2em] text-stone-400 hover:text-white"
          >
            + Add
          </button>
        </div>
        {form.description.map((paragraph, index) => (
          <div key={index} className="flex gap-3">
            <textarea
              className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-stone-100 outline-none transition focus:border-stone-100/35"
              value={paragraph}
              onChange={(event) => updateDescription(index, event.target.value)}
            />
            <button
              type="button"
              onClick={() => removeDescription(index)}
              className="text-red-400/70 hover:text-red-400"
              aria-label="Remove description paragraph"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full border border-white/15 bg-white/[0.06] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10 disabled:opacity-50"
        >
          {saving
            ? "Saving..."
            : mode === "create"
              ? "Create Project"
              : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/projects")}
          className="rounded-full border border-white/10 px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}