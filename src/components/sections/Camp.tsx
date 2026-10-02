import Image from 'next/image';
import BgVideo from '@/components/ui/BgVideo';
import Reveal from '@/components/ui/Reveal';
import CampProgram from '@/components/sections/CampProgram';
import Reel from '@/components/sections/Reel';
import badge from '@/assets/kamp-badge.png';
import jerseyPink from '@/assets/jersey-pink.png';
import jerseyWhite from '@/assets/jersey-white.png';
import seal from '@/assets/seal.png';
import { actions, camp, cta, jersey } from '@/content/site';
import { ytImage } from '@/lib/youtube';

/**
 * The camp chapter: the drone fly-in over Jezero Manjača as an opener, the
 * week's programme, the jump clips from the finale, then the kit and the
 * club's work off the tower. It follows the history page.
 */
export default function Camp() {
  return (
    <>
      {/*
        The third page of the stack (see PageStack): it slides over the history page as a sheet
        with a rounded top edge, and the drone shot eases out of a slight zoom as it arrives.
        The negative scroll margin cancels the page's 88px anchor offset and adds the corner
        radius, so the "Kamp" link lands with the video filling the screen and the rounded
        corners just above it. The section is that much taller to make up for it.
      */}
      <section
        id="kamp"
        className="relative isolate flex min-h-[calc(92svh+2.25rem)] -scroll-mt-[calc(88px+2.25rem)] flex-col justify-end overflow-hidden rounded-t-[2.25rem] bg-deep text-white sm:min-h-[calc(92svh+3rem)] sm:-scroll-mt-[calc(88px+3rem)] sm:rounded-t-[3rem]"
      >
        <BgVideo {...camp.video} settle className="absolute inset-0 -z-20" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-deep via-deep/50 to-deep/10" />

        <div className="shell pb-14 pt-44 md:pb-20">
          <Reveal>
            <div className="flex items-center gap-5">
              {camp.showSeal && <Image src={seal} alt={camp.sealAlt} className="size-14 md:size-16" />}
              <Image src={badge} alt={camp.badgeAlt} className="h-auto w-40 md:w-52" />
            </div>
            <h2 className="display mt-8 max-w-[13ch] text-[clamp(2.75rem,7.5vw,7rem)]">{camp.title}</h2>
            <p className="mt-6 max-w-[50ch] text-lg leading-relaxed text-white/85">{camp.text}</p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <ul className="flex flex-wrap gap-x-12 gap-y-6">
              {camp.facts.map((f, i) => (
                <Reveal as="li" key={f.label} delay={0.06 * i}>
                  <span className="display block text-4xl md:text-5xl">{f.value}</span>
                  <span className="mt-2 block text-sm text-white/75">{f.label}</span>
                </Reveal>
              ))}
            </ul>
            <a href={cta.join.href} className="btn btn-primary self-start md:self-auto">
              {cta.join.label}
            </a>
          </div>
        </div>
      </section>

      <CampProgram />
      <Reel />

      <section aria-label="Dres kampa i akcije" className="shell grid gap-16 border-t border-line py-24 md:py-32 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-7">
          <div className="overflow-hidden rounded-[var(--radius)] bg-surface px-4 py-10 md:px-10 md:py-14">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
              <Image
                src={jerseyPink}
                alt={jersey.altPink}
                sizes="(min-width: 1024px) 28vw, 55vw"
                className="absolute left-0 top-[8%] h-auto w-[56%] -rotate-6"
              />
              <Image
                src={jerseyWhite}
                alt={jersey.altWhite}
                sizes="(min-width: 1024px) 32vw, 62vw"
                className="absolute right-0 top-0 h-auto w-[63%] rotate-3 drop-shadow-[0_18px_24px_rgb(0_25_40/0.25)]"
              />
            </div>
          </div>
          <h3 className="display mt-8 text-3xl md:text-4xl">{jersey.title}</h3>
          <p className="mt-3 max-w-[52ch] leading-relaxed text-muted">{jersey.text}</p>
        </Reveal>

        <div className="lg:col-span-5">
          <h3 className="display text-3xl md:text-4xl">Klub van mosta</h3>
          <ul className="mt-8 grid gap-4">
            {actions.map((a, i) => (
              <Reveal as="li" key={a.title} delay={0.06 * i} className="flex gap-5 rounded-[var(--radius)] bg-surface p-4 md:p-5">
                {'photo' in a && a.photo && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={ytImage(a.photo.id, a.photo.frame)}
                    alt=""
                    loading="lazy"
                    className="hidden aspect-square w-28 shrink-0 rounded-[calc(var(--radius)-4px)] object-cover sm:block"
                  />
                )}
                <div className="py-1">
                  <p className="text-xl font-semibold">{a.title}</p>
                  <p className="mt-2 leading-relaxed text-muted">{a.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
