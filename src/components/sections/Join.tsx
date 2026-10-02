'use client';

import { useState } from 'react';
import { CheckCircleIcon, CircleNotchIcon, WarningCircleIcon, InstagramLogoIcon, TiktokLogoIcon, FacebookLogoIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import { join, socials } from '@/content/site';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

const icons = { instagram: InstagramLogoIcon, tiktok: TiktokLogoIcon, facebook: FacebookLogoIcon };

const field =
  'w-full rounded-[var(--radius)] border border-line bg-bg px-4 py-3 text-base text-ink placeholder:text-muted/80 transition-colors focus:border-accent focus:outline-none';

export default function Join() {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/prijava', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Slanje nije uspjelo.');
      }
      form.reset();
      setStatus({ kind: 'sent' });
    } catch (err) {
      setStatus({ kind: 'error', message: err instanceof Error ? err.message : 'Slanje nije uspjelo.' });
    }
  }

  return (
    <section id="prijava" className="border-t border-line bg-surface">
      <div className="shell grid gap-14 py-24 md:py-32 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="display text-[clamp(3rem,7vw,6.5rem)]">{join.title}</h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-muted">{join.text}</p>

          <ul className="mt-12 grid gap-2">
            {socials.map((s) => {
              const Icon = icons[s.id];
              return (
                <li key={s.id}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-4 rounded-[var(--radius)] py-3 transition-colors hover:text-accent-ink"
                  >
                    <Icon size={26} />
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-muted">{s.handle}</span>
                    <ArrowUpRightIcon size={16} className="ml-auto opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          {status.kind === 'sent' ? (
            <div role="status" className="flex h-full flex-col items-start justify-center gap-4 rounded-[var(--radius)] bg-bg p-8 md:p-12">
              <CheckCircleIcon size={40} weight="fill" className="text-accent" />
              <p className="display text-4xl">Prijava je stigla.</p>
              <p className="max-w-[40ch] text-muted">Javićemo ti se prije sljedećeg treninga.</p>
              <button type="button" onClick={() => setStatus({ kind: 'idle' })} className="btn btn-ghost mt-2">
                Pošalji još jednu
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-6 rounded-[var(--radius)] bg-bg p-6 md:p-10" noValidate={false}>
              <div className="grid gap-6 sm:grid-cols-[1fr_8rem]">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-semibold">Ime i prezime</label>
                  <input id="name" name="name" required minLength={2} autoComplete="name" className={field} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="age" className="text-sm font-semibold">Godine</label>
                  <input id="age" name="age" type="number" inputMode="numeric" min={8} max={99} required className={field} />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="contact" className="text-sm font-semibold">Telefon ili e-mail</label>
                <input id="contact" name="contact" required minLength={5} autoComplete="email" className={field} />
              </div>

              <fieldset className="grid gap-3">
                <legend className="mb-3 text-sm font-semibold">Iskustvo</legend>
                <div className="flex flex-wrap gap-2">
                  {join.levels.map((lvl, i) => (
                    <label key={lvl} className="cursor-pointer">
                      <input type="radio" name="level" value={lvl} defaultChecked={i === 0} className="peer sr-only" />
                      <span className="inline-block rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors peer-checked:border-accent peer-checked:bg-accent peer-checked:text-on-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                        {lvl}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-semibold">
                  Poruka <span className="font-normal text-muted">(nije obavezno)</span>
                </label>
                <textarea id="message" name="message" rows={4} className={`${field} resize-y`} />
              </div>

              <p className="text-sm text-muted">{join.minorNote}</p>

              {status.kind === 'error' && (
                <p role="alert" className="flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400">
                  <WarningCircleIcon size={18} weight="fill" />
                  {status.message}
                </p>
              )}

              <button type="submit" disabled={status.kind === 'sending'} className="btn btn-primary justify-self-start disabled:opacity-70">
                {status.kind === 'sending' && <CircleNotchIcon size={18} className="animate-spin" />}
                {status.kind === 'sending' ? 'Šaljem' : 'Pošalji prijavu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
