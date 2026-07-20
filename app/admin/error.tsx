"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-semibold uppercase tracking-normal text-stone-100">
        Admin Error
      </h2>
      <p className="mt-3 text-sm text-stone-400">
        {error.message || "Something went wrong in the admin panel."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full border border-white/15 bg-white/6 px-6 py-2.5 text-xs font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
      >
        Retry
      </button>
    </div>
  );
}
