import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/3 text-[0.68rem] font-semibold tracking-[0.32em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]",
        className,
      )}
      aria-hidden="true"
    >
      <span className="absolute inset-1 rounded-full bg-[radial-gradient(circle_at_35%_25%,rgba(255,255,255,0.24),transparent_36%),linear-gradient(145deg,rgba(120,95,70,0.22),transparent)]" />
      <span className="relative translate-x-[0.08em]">RA</span>
    </span>
  );
}
