"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Mail, Phone } from "lucide-react";
import { BrandSocialIcon } from "@/components/BrandSocialIcon";
import { ContactDialog, type InquiryType } from "@/components/ContactDialog";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { ScrollReturnIndicator } from "@/components/ScrollReturnIndicator";
import { VantaBackground } from "@/components/VantaBackground";
import { ArtistsSection } from "@/sections/ArtistsSection";
import { LiveStreamSection } from "@/sections/LiveStreamSection";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import { contactLinks } from "@/data/site";
import type { Artist } from "@/types/content";
import type { ReactNode } from "react";

const ContactsSection = dynamic(
  () => import("@/sections/ContactsSection").then((m) => ({ default: m.ContactsSection })),
  { loading: () => <SectionSkeleton /> },
);

const brandKinds = new Set(["instagram", "soundcloud", "spotify", "youtube", "linktree"]);

const lucideIcons: Record<string, typeof Mail> = {
  email: Mail,
  phone: Phone,
};

interface PageShellProps {
  hero: ReactNode;
  ecosystem: ReactNode;
  projects: ReactNode;
}

export function PageShell({ hero, ecosystem, projects }: PageShellProps) {
  const [activeArtist, setActiveArtist] = useState<Artist>();
  const [dialogType, setDialogType] = useState<InquiryType | null>(null);

  return (
    <>
      <PageIntro />
      <VantaBackground />
      <Header modalOpen={!!activeArtist} />
      <ScrollReturnIndicator />
      <main id="main-content" className="relative z-10 overflow-hidden">
        {hero}
        {ecosystem}
        <ArtistsSection
          activeArtist={activeArtist}
          onSetActiveArtist={setActiveArtist}
          onBook={() => setDialogType("book")}
        />
        <LiveStreamSection />
        {projects}
        <ContactsSection onInquiry={setDialogType} />
        <footer className="border-t border-white/5 bg-[#080706] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between sm:gap-8">
              <div className="text-center sm:text-left">
                <p className="text-xs tracking-[0.2em] uppercase text-stone-400/50">
                  © {new Date().getFullYear()} RAAM — Room All About Music
                </p>
                <p className="mt-1 text-[0.6rem] tracking-[0.15em] uppercase text-stone-500/40">
                  All rights reserved
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {contactLinks.map((link) => {
                  const LucideIcon = lucideIcons[link.kind];
                  const isBrand = brandKinds.has(link.kind);
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target={link.kind === "linktree" ? "_blank" : undefined}
                      rel={link.kind === "linktree" ? "noreferrer" : undefined}
                      className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-stone-300/70 transition hover:border-stone-100/20 hover:bg-white/[0.08] hover:text-white"
                    >
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center">
                        {isBrand ? (
                          <BrandSocialIcon kind={link.kind} className="h-3 w-3 invert" />
                        ) : LucideIcon ? (
                          <LucideIcon size={12} />
                        ) : null}
                      </span>
                      <span>{link.value}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </footer>

        <ContactDialog
          open={dialogType !== null}
          type={dialogType}
          onClose={() => setDialogType(null)}
        />
      </main>
    </>
  );
}