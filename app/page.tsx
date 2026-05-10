import { HeroSection } from "@/sections/HeroSection";
import { EcosystemSection } from "@/sections/EcosystemSection";
import { ProjectsSection } from "@/sections/ProjectsSection";
import { PageShell } from "@/components/PageShell";

export default function Home() {
  return (
    <PageShell
      hero={<HeroSection />}
      ecosystem={<EcosystemSection />}
      projects={<ProjectsSection />}
    />
  );
}
