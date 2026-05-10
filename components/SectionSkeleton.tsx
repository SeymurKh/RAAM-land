export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <section className={`relative isolate min-h-screen scroll-mt-24 overflow-hidden px-5 pt-10 pb-24 sm:px-8 lg:px-12 ${className ?? ""}`}>
      <div className="relative mx-auto max-w-7xl">
        {/* Eyebrow skeleton */}
        <div className="mb-12">
          <div className="h-3 w-24 animate-shimmer rounded-full bg-white/8" />
        </div>

        {/* Content blocks skeleton */}
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-shimmer rounded-xl bg-white/6" />
          <div className="h-6 w-1/2 animate-shimmer rounded-xl bg-white/5" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-48 animate-shimmer rounded-[1.5rem] border border-white/5 bg-white/[0.02]"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
