"use client";

import { MediaForm } from "@/components/MediaForm";

export default function NewMediaPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        New Media Item
      </h1>
      <MediaForm mode="create" />
    </div>
  );
}