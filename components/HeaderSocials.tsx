import { BrandSocialIcon } from "@/components/BrandSocialIcon";
import { headerSocials } from "@/data/site";
import { cn } from "@/lib/utils";

interface HeaderSocialsProps {
  className?: string;
}

export function HeaderSocials({ className }: HeaderSocialsProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {headerSocials.map((social) => (
        <a
          key={social.kind}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={`RAAM on ${social.label}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/4 text-white transition hover:border-stone-100/20 hover:bg-white/8"
        >
          <BrandSocialIcon
            kind={social.kind}
            className="h-3.5 w-3.5 object-contain invert"
          />
        </a>
      ))}
    </div>
  );
}