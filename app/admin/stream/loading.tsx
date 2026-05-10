export default function AdminStreamLoading() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-48 animate-pulse rounded-lg bg-white/8" />
      <div className="h-24 animate-pulse rounded-xl border border-white/5 bg-white/[0.02]" />
      <div className="max-w-lg space-y-6">
        <div className="h-12 animate-pulse rounded-xl bg-white/5" />
        <div className="h-12 animate-pulse rounded-xl bg-white/5" />
        <div className="h-12 animate-pulse rounded-xl bg-white/5" />
      </div>
    </div>
  );
}
