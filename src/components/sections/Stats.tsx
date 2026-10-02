import Reveal from '@/components/ui/Reveal';
import { bridgePhoto, stats } from '@/content/site';
import { ytImage } from '@/lib/youtube';

export default function Stats() {
  const [lead, ...rest] = stats;
  return (
    <section aria-label="Lasta u brojkama" className="shell py-24 md:py-32">
      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <Reveal className="md:col-span-6">
          <p className="display text-[clamp(5rem,15vw,13rem)] text-accent">
            {lead.value}
            <span className="text-[0.4em] align-top">{lead.unit}</span>
          </p>
          <p className="mt-4 max-w-[28ch] text-lg text-muted">{lead.label}</p>
        </Reveal>
        <div className="grid gap-10 self-end sm:grid-cols-3 md:col-span-6 md:gap-6">
          {rest.map((s, i) => (
            <Reveal key={s.value} delay={0.08 * (i + 1)} className="border-t border-line pt-5">
              <p className="display text-5xl md:text-6xl">
                {s.value}
                {s.unit}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-20 md:mt-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={ytImage(bridgePhoto.id, bridgePhoto.frame)}
          alt={bridgePhoto.alt}
          width={1280}
          height={720}
          loading="lazy"
          className="aspect-[21/9] w-full rounded-[var(--radius)] object-cover"
        />
      </Reveal>
    </section>
  );
}
