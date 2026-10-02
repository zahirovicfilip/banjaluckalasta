import Reveal from '@/components/ui/Reveal';
import YouTube from '@/components/ui/YouTube';
import { videos } from '@/content/site';

export default function Videos() {
  const [main, ...rest] = videos;
  return (
    <section id="video" className="shell py-24 md:py-32">
      <h2 className="display text-[clamp(2.5rem,5.5vw,5rem)]">Pogledaj skok</h2>

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <YouTube id={main.id} frame={main.frame} title={`${main.title}, ${main.who}`} className="aspect-video w-full" />
          <p className="mt-4 font-semibold">{main.title}</p>
          <p className="text-sm text-muted">{main.who}</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {rest.map((v, i) => (
            <Reveal key={v.id} delay={0.08 * (i + 1)}>
              <YouTube id={v.id} frame={v.frame} title={`${v.title}, ${v.who}`} className="aspect-video w-full" />
              <p className="mt-3 font-semibold">{v.title}</p>
              <p className="text-sm text-muted">{v.who}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
