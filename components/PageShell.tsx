"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ContactDialog, type InquiryType } from "@/components/ContactDialog";
import { Header } from "@/components/Header";
import { PageIntro } from "@/components/PageIntro";
import { ScrollReturnIndicator } from "@/components/ScrollReturnIndicator";
import { SiteFooter } from "@/components/SiteFooter";
import { VantaBackground } from "@/components/VantaBackground";
import { ArtistsSection } from "@/sections/ArtistsSection";
import { LiveStreamSection } from "@/sections/LiveStreamSection";
import { SectionSkeleton } from "@/components/SectionSkeleton";
import type { Artist } from "@/types/content";
import type { ReactNode } from "react";

const ContactsSection = dynamic(
  () => import("@/sections/ContactsSection").then((m) => ({ default: m.ContactsSection })),
  { loading: () => <SectionSkeleton /> },
);

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
        <SiteFooter />

        <ContactDialog
          open={dialogType !== null}
          type={dialogType}
          onClose={() => setDialogType(null)}
        />
      </main>
    </>
  );
}