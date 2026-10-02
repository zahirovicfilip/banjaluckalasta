import data from '@/components/lasta/lasta-data.json';

const diver = (data as unknown as { final: string }).final;

/**
 * The diver from the logo, in the lasta pose (same geometry the hero lands on).
 * Drawn inline so it takes its colour from the surrounding text colour.
 */
export default function LastaMark({ className, title }: { className?: string; title: string }) {
  return (
    <svg viewBox="245 285 510 428" role="img" aria-label={title} className={className}>
      <path d={diver} fill="currentColor" fillRule="evenodd" />
    </svg>
  );
}
