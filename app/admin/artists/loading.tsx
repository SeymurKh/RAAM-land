export default function AdminArtistsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-32 animate-pulse rounded-lg bg-white/8" />
        <div className="h-10 w-32 animate-pulse rounded-full bg-white/6" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-white/5 bg-white/2"
          />
        ))}
      </div>
    </div>
  );
}
