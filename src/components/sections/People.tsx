import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import YouTube from '@/components/ui/YouTube';
import pattern from '@/assets/pattern.png';
import { people } from '@/content/site';

export default function People() {
  const { igor, nenad, family, durovic, club } = people;
  return (
    <section id="skakaci" className="shell py-24 md:py-32">
      <h2 className="display max-w-[14ch] text-[clamp(2.5rem,5.5vw,5rem)]">Ljudi sa ograde</h2>

      <div className="mt-12 grid gap-4 md:mt-16 lg:grid-cols-6 lg:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        {/* Igor: large */}
        <Reveal className="flex flex-col lg:col-span-3 lg:row-span-2">
          <YouTube id={igor.photo.id} frame={igor.photo.frame} title={`${igor.name} na Gradskom mostu`} posterOnly className="aspect-[4/3] lg:aspect-auto lg:min-h-[420px] lg:flex-1" />
          <div className="pt-5">
            <p className="text-sm font-semibold text-accent-ink">{igor.role}</p>
            <h3 className="display mt-2 text-4xl md:text-5xl">{igor.name}</h3>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">{igor.text}</p>
          </div>
        </Reveal>

        {/* Nenad */}
        <Reveal delay={0.06} className="flex flex-col lg:col-span-2 lg:row-span-2">
          <YouTube id={nenad.photo.id} frame={nenad.photo.frame} title={`${nenad.name}, skok sa Gradskog mosta`} posterOnly className="aspect-[4/3] lg:aspect-auto lg:min-h-[420px] lg:flex-1" />
          <div className="pt-5">
            <p className="text-sm font-semibold text-accent-ink">{nenad.role}</p>
            <h3 className="display mt-2 text-3xl md:text-4xl">{nenad.name}</h3>
            <p className="mt-3 leading-relaxed text-muted">{nenad.text}</p>
          </div>
        </Reveal>

        {/* Club stat, on the club's torn-paper pattern */}
        <Reveal delay={0.12} className="relative isolate flex flex-col justify-between overflow-hidden rounded-[var(--radius)] bg-panel p-6 text-on-panel lg:col-span-1 lg:row-span-2">
          <Image src={pattern} alt="" fill sizes="(min-width: 1024px) 16vw, 100vw" className="-z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-panel/55 via-panel/75 to-panel/95" />
          <p className="display text-7xl leading-[0.85]">
            {club.value}
            <span className="block text-3xl opacity-70">/{club.of}</span>
          </p>
          <p className="mt-8 text-sm leading-relaxed">{club.text}</p>
        </Reveal>

        {/* Family */}
        <Reveal className="rounded-[var(--radius)] border border-line p-6 md:p-10 lg:col-span-4">
          <h3 className="display text-3xl md:text-5xl">{family.title}</h3>
          <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted">{family.text}</p>
        </Reveal>

        {/* Đurović */}
        <Reveal delay={0.06} className="relative min-h-[320px] overflow-hidden rounded-[var(--radius)] lg:col-span-2">
          <div className="duotone absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={durovic.image} alt="" loading="lazy" className="size-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-sm font-semibold opacity-80">{durovic.role}</p>
            <h3 className="display mt-1 text-3xl">{durovic.name}</h3>
            <p className="mt-2 text-sm leading-relaxed opacity-85">{durovic.text}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
