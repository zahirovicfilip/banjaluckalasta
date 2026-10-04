import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import CampStage from '@/components/sections/CampStage';
import Reel from '@/components/sections/Reel';
import jerseyPink from '@/assets/jersey-pink.png';
import jerseyWhite from '@/assets/jersey-white.png';
import { actions, jersey } from '@/content/site';
import { ytImage } from '@/lib/youtube';

/**
 * The camp chapter: the drone fly-in over Jezero Manjača as an opener, the
 * week's programme, the jump clips from the finale, then the kit and the
 * club's work off the tower. It follows the winners page.
 */
export default function Camp() {
  return (
    <>
      {/* The third page of the stack (see PageStack): the opener slides over the winners page as
          a sheet, then flows into the programme on one stage (CampStage). */}
      <CampStage />
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
