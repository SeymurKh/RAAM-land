import { CursorAtmosphere } from "@/components/CursorAtmosphere";
import { Header } from "@/components/Header";
import { ArtistsSection } from "@/sections/ArtistsSection";
import { ContactsSection } from "@/sections/ContactsSection";
import { EcosystemSection } from "@/sections/EcosystemSection";
import { HeroSection } from "@/sections/HeroSection";
import { ProjectsSection } from "@/sections/ProjectsSection";

export default function Home() {
  return (
    <>
      <CursorAtmosphere />
      <Header />
      <main className="relative overflow-hidden bg-[#080706]">
        <HeroSection />
        <EcosystemSection />
        <ArtistsSection />
        <ProjectsSection />
        <ContactsSection />
      </main>
    </>
  );
}
