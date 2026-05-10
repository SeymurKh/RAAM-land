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
        <ContactsSection />
      </main>
    </>
  );
}
