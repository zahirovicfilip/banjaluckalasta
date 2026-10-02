import Image from 'next/image';
import Drift from '@/components/ui/Drift';
import Reveal from '@/components/ui/Reveal';
import igor from '@/assets/igor.png';
import textureTall from '@/assets/texture-tall.jpg';
import textureWide from '@/assets/texture-wide.jpg';
import { quote } from '@/content/site';

/**
 * The brochure cover, rebuilt for the page: the club's torn-paper texture,
 * a navy panel for the words, and the diver crossing over its edge.
 */
export default function Quote() {
  return (
    <section aria-label="Izjava" className="relative isolate overflow-hidden bg-deep">
      <Image src={textureWide} alt="" fill sizes="100vw" placeholder="blur" className="-z-10 hidden object-cover md:block" />
      <Image src={textureTall} alt="" fill sizes="100vw" placeholder="blur" className="-z-10 object-cover md:hidden" />

      <div className="shell grid items-center py-16 md:grid-cols-12 md:py-28">
        <Drift className="pointer-events-none relative z-10 mx-auto -mb-14 w-[88%] max-w-md md:col-span-6 md:col-start-7 md:row-start-1 md:mb-0 md:w-full md:max-w-none">
          <Image
            src={igor}
            alt={quote.photoAlt}
            sizes="(min-width: 768px) 46vw, 88vw"
            className="h-auto w-full drop-shadow-[0_28px_36px_rgb(0_25_40/0.5)]"
          />
        </Drift>

        <Reveal className="md:col-span-7 md:col-start-1 md:row-start-1">
          <blockquote className="rounded-[var(--radius)] bg-panel px-7 pb-9 pt-20 text-on-panel md:py-14 md:pl-12 md:pr-[18%]">
            <p className="display text-[clamp(1.6rem,3vw,2.75rem)] leading-[1.02]">„{quote.text}“</p>
            <footer className="mt-8 text-base md:text-lg">
              <span className="font-semibold">{quote.author}</span>
              <span className="opacity-75">, {quote.role}</span>
            </footer>
          </blockquote>
        </Reveal>
      </div>
    </section>
  );
}
