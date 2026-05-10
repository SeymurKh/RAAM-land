"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#080706] px-6 text-center">
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
        <span className="text-5xl font-semibold uppercase tracking-[0.16em] text-white/20">
          !
        </span>
        <div className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.12),transparent_36%)]" />
      </div>
      <h1 className="text-3xl font-semibold uppercase tracking-normal text-stone-100 sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-4 max-w-md text-base leading-7 text-stone-200/60">
        An unexpected error occurred. Please try again.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-stone-500">Digest: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full border border-white/15 bg-white/[0.06] px-8 py-3 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 transition hover:bg-white/10"
      >
        Try again
      </button>
    </div>
  );
}
