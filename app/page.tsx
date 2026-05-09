"use client";

import { useState } from "react";
import { CursorAtmosphere } from "@/components/CursorAtmosphere";
import { Header } from "@/components/Header";
import { ScrollReturnIndicator } from "@/components/ScrollReturnIndicator";
import { ArtistsSection } from "@/sections/ArtistsSection";
import { ContactsSection } from "@/sections/ContactsSection";
import { EcosystemSection } from "@/sections/EcosystemSection";
import { HeroSection } from "@/sections/HeroSection";
import { LiveStreamSection } from "@/sections/LiveStreamSection";
import { ProjectsSection } from "@/sections/ProjectsSection";
import type { Artist } from "@/types/content";

export default function Home() {
  const [activeArtist, setActiveArtist] = useState<Artist>();

  return (
    <>
      <CursorAtmosphere />
      <Header modalOpen={!!activeArtist} />
      <ScrollReturnIndicator />
      <main id="main-content" className="relative overflow-hidden bg-[#080706]">
        <HeroSection />
        <EcosystemSection />
        <ArtistsSection
          activeArtist={activeArtist}
          onSetActiveArtist={setActiveArtist}
        />
        <LiveStreamSection />
        <ProjectsSection />
        <ContactsSection />
      </main>
    </>
  );
}
