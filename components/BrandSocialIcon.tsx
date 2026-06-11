import Image from "next/image";
import type { SocialKind } from "@/types/content";

interface BrandSocialIconProps {
  kind: SocialKind;
  className?: string;
}

const logoSrc: Partial<Record<SocialKind, string>> = {
  instagram: "/brand_logo/instagram-circle.svg",
  soundcloud: "/brand_logo/soundcloud-1.svg",
  spotify: "/brand_logo/spotify-2026-black-logo.svg",
  youtube: "/brand_logo/black-youtube.svg",
};

export function BrandSocialIcon({ kind, className }: BrandSocialIconProps) {
  const src = logoSrc[kind];

  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt=""
      width={18}
      height={18}
      className={className}
      aria-hidden="true"
      unoptimized
    />
  );
}
