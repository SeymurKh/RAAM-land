import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const baseClass =
  "group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] px-6 text-sm font-medium uppercase tracking-[0.2em] text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_18px_60px_rgba(0,0,0,0.32)] backdrop-blur-xl transition duration-500 hover:border-stone-200/35 hover:bg-stone-100/12 focus:outline-none focus:ring-2 focus:ring-stone-200/40";

function Inner({ children }: { children: ReactNode }) {
  return (
    <>
      <span className="absolute inset-0 translate-y-full rounded-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_55%)] transition duration-500 group-hover:translate-y-0" />
      <span className="absolute -left-8 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-stone-200/10 blur-xl transition duration-700 group-hover:left-[72%]" />
      <span className="relative z-10">{children}</span>
    </>
  );
}

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: never;
  children: ReactNode;
};

export function FluidButton({
  children,
  className,
  ...props
}: AnchorProps | ButtonProps) {
  if ("href" in props) {
    const anchorProps = props as AnchorProps;
    return (
      <a className={cn(baseClass, className)} {...anchorProps}>
        <Inner>{children}</Inner>
      </a>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <button className={cn(baseClass, className)} {...buttonProps}>
      <Inner>{children}</Inner>
    </button>
  );
}
