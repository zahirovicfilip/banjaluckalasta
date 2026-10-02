import Reveal from '@/components/ui/Reveal';
import { results } from '@/content/site';

const podiumHeight: Record<number, string> = { 1: 'h-56 md:h-72', 2: 'h-40 md:h-52', 3: 'h-32 md:h-40' };
const podiumOrder = [2, 1, 3];

export default function Results() {
  const { latest, bridge, away } = results;
  return (
    <section id="rezultati" className="shell py-24 md:py-32">
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <h2 className="display text-[clamp(2.5rem,5.5vw,5rem)]">Gradski most {latest.year}.</h2>
          <p className="mt-4 text-muted">{latest.date}</p>
          <p className="text-muted">{latest.note}</p>

          <ol className="mt-12 grid grid-cols-3 items-end gap-3" aria-label={`Pobjednici ${latest.year}.`}>
            {podiumOrder.map((place) => {
              const r = latest.podium.find((x) => x.place === place)!;
              const first = place === 1;
              return (
                <Reveal as="li" key={place} delay={first ? 0.15 : 0.05} className="flex flex-col" y={48}>
                  <p className={`font-semibold leading-tight ${first ? 'text-lg' : 'text-base'}`}>{r.name}</p>
                  <p className="mb-3 text-sm text-muted">{r.from}</p>
                  <div
                    className={`${podiumHeight[place]} flex items-start rounded-t-[var(--radius)] p-4 ${
                      first ? 'bg-accent text-on-accent' : 'bg-surface text-ink'
                    }`}
                  >
                    <span className="display text-5xl md:text-6xl">{place}</span>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>

        <div className="grid gap-12 sm:grid-cols-2 lg:col-span-6 lg:gap-8">
          <div>
            <h3 className="border-b border-line pb-3 text-sm font-semibold text-muted">Ranije sa Gradskog mosta</h3>
            <ul className="mt-2">
              {bridge.map((b) => (
                <li key={b.year} className="grid grid-cols-[4.5rem_1fr] gap-3 py-3">
                  <span className="display text-2xl text-accent-ink">{b.year}</span>
                  <span>
                    <span className="block font-semibold">{b.winner}</span>
                    <span className="block text-sm text-muted">{b.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="border-b border-line pb-3 text-sm font-semibold text-muted">Van Banjaluke</h3>
            <ul className="mt-2">
              {away.map((a) => (
                <li key={a.place} className="py-3">
                  <span className="display text-2xl text-accent-ink">{a.year}</span>
                  <span className="mt-1 block font-semibold">{a.place}</span>
                  <span className="block text-sm leading-relaxed text-muted">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
