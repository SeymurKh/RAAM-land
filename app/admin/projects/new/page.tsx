"use client";

import { ProjectForm } from "@/components/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        New Project
      </h1>
      <ProjectForm mode="create" />
    </div>
  );
}
