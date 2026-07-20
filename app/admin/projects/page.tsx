"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Project } from "@/types/content";

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((data) => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) {
      return;
    }

    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) {
      setProjects((current) => current.filter((project) => project.id !== id));
    }
  }

  if (loading) {
    return <p className="text-stone-400">Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold uppercase tracking-normal">
          Projects
        </h1>
        <Link
          href="/admin/projects/new"
          className="rounded-full border border-white/15 bg-white/6 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
        >
          + Add Project
        </Link>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0b0a09] px-6 py-4"
          >
            <div>
              <p className="font-semibold text-white">{project.title}</p>
              <p className="text-sm text-stone-400">
                {project.category} / {project.status} / #{project.order}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="text-xs uppercase tracking-[0.2em] text-stone-400 transition hover:text-white"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(project.id)}
                className="text-xs uppercase tracking-[0.2em] text-red-400/70 transition hover:text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
