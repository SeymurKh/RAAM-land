"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MediaForm } from "@/components/MediaForm";
import type { MediaItem } from "@/types/content";

export default function EditMediaPage() {
  const params = useParams();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/media/${params.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Not found");
        }
        return response.json();
      })
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return <p className="text-stone-400">Loading...</p>;
  }

  if (!item) {
    return <p className="text-red-400">Media item not found</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold uppercase tracking-normal">
        Edit: {item.title}
      </h1>
      <MediaForm item={item} mode="edit" />
    </div>
  );
}