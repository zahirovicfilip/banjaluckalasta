import Image from 'next/image';
import logo from '@/assets/logo.png';
import { nav, partners, site, socials } from '@/content/site';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="shell grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="flex items-center gap-4">
            <Image src={logo} alt="" width={80} height={80} className="size-20 shrink-0" />
            <div>
              <p className="display text-xl">{site.name}</p>
              <p className="mt-1 text-sm text-muted">{site.legalName}, Banja Luka</p>
            </div>
          </div>
          <p className="mt-8 max-w-[44ch] text-sm leading-relaxed text-muted">
            Saradnja: {partners.join(', ')}.
          </p>
        </div>

        <nav aria-label="Stranica" className="md:col-span-3 md:col-start-7">
          <ul className="grid gap-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-muted transition-colors hover:text-ink">{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="grid content-start gap-2 text-sm md:col-span-3">
          {socials.map((s) => (
            <li key={s.id}>
              <a href={s.href} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-ink">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="shell border-t border-line py-6 text-xs text-muted">
        © {new Date().getFullYear()} {site.legalName}
      </div>
    </footer>
  );
}
