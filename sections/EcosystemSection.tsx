import { capabilities, siteConfig } from "@/data/site";
import { MotionReveal } from "@/components/MotionReveal";

export function EcosystemSection() {
  return (
    <section className="relative px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 border-y border-white/10 py-16 lg:grid-cols-[0.9fr_1.1fr]">
        <MotionReveal>
          <p className="text-xs uppercase tracking-[0.48em] text-stone-300/55">
            We are building
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold uppercase leading-[0.92] tracking-normal text-stone-100 sm:text-6xl">
            The ecosystem
          </h2>
          <p className="mt-7 max-w-xl text-lg leading-8 text-stone-200/64">
            {siteConfig.tagline}
          </p>
        </MotionReveal>

        <div className="grid gap-3 sm:grid-cols-2">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <MotionReveal
                key={item.id}
                delay={index * 0.06}
                className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-stone-100/24 hover:bg-white/[0.065]"
              >
                <div className="mb-8 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/25 text-stone-100">
                  <Icon size={18} />
                </div>
                <h3 className="text-xl font-medium text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-200/58">
                  {item.description}
                </p>
              </MotionReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
