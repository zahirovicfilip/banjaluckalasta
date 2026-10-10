import LastaMark from '@/components/ui/LastaMark';
import Streaks from '@/components/ui/Streaks';
import Reveal from '@/components/ui/Reveal';
import { technique } from '@/content/site';

export default function Technique() {
  return (
    <section id="lasta" className="relative isolate shell py-24 md:py-32">
      <Streaks side="left" />
      <div className="grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <h2 className="display text-[clamp(2.75rem,6vw,5.5rem)]">{technique.title}</h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-muted">{technique.intro}</p>
            <p className="mt-4 max-w-[48ch] leading-relaxed text-muted">{technique.difference}</p>
            {/* The logo pose, as a reference silhouette for the technique */}
            <LastaMark
              title="Položaj banjalučke laste: ruke iznad glave, tijelo ispruženo"
              className="mt-12 hidden w-72 text-accent md:block"
            />
          </div>
        </div>

        <ol className="md:col-span-6 md:col-start-7">
          {technique.phases.map((ph, i) => (
            <Reveal as="li" key={ph.name} delay={0.05 * i} className="grid gap-3 py-10 first:pt-0 md:py-14">
              <h3 className="display text-[clamp(3rem,7vw,6rem)]">{ph.name}</h3>
              <p className="max-w-[44ch] text-lg leading-relaxed text-muted">{ph.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
