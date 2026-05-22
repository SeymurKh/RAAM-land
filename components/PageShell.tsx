"use client";

import { useState } from "react";
import { CursorAtmosphere } from "@/components/CursorAtmosphere";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { ScrollBackground } from "@/components/ScrollBackground";
import { ScrollReturnIndicator } from "@/components/ScrollReturnIndicator";
import { ArtistsSection } from "@/sections/ArtistsSection";
import { LiveStreamSection } from "@/sections/LiveStreamSection";
import { ContactsSection } from "@/sections/ContactsSection";
import type { Artist } from "@/types/content";
import type { ReactNode } from "react";

interface PageShellProps {
  hero: ReactNode;
  ecosystem: ReactNode;
  projects: ReactNode;
}

export function PageShell({ hero, ecosystem, projects }: PageShellProps) {
  const [activeArtist, setActiveArtist] = useState<Artist>();
  const [isContactActive, setIsContactActive] = useState(false);

  return (
    <>
      <PageIntro />
      <CursorAtmosphere />
      <ScrollBackground />
      <Header modalOpen={!!activeArtist} />
      <ScrollReturnIndicator />
      <main id="main-content" className="relative overflow-hidden bg-[#080706]">
        {hero}
        {ecosystem}
        <ArtistsSection
          activeArtist={activeArtist}
          onSetActiveArtist={setActiveArtist}
        />
        <LiveStreamSection />
        {projects}
        <ContactsSection onContactActiveChange={setIsContactActive} />
        {!isContactActive && (
          <footer className="mt-8 border-t border-white/5 bg-[#080706] py-8 text-center sm:py-10">
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400/50">
              © {new Date().getFullYear()} RAAM — Room All About Music
            </p>
            <p className="mt-1 text-[0.6rem] tracking-[0.15em] uppercase text-stone-500/40">
              All rights reserved
            </p>
          </footer>
        )}
      </main>
    </>
  );
}
