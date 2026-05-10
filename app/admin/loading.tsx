export default function AdminLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
        <p className="text-xs uppercase tracking-[0.32em] text-stone-500">
          Loading…
        </p>
      </div>
    </div>
  );
}
