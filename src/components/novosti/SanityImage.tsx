/* eslint-disable @next/next/no-img-element */
import type { SanityImageSource } from '@sanity/image-url';
import { urlFor } from '@/sanity/client';

type SanityImageProps = {
  image: SanityImageSource & { alt?: string; lqip?: string };
  /** Width ÷ height to crop to (respecting the hotspot set in the Studio). Leave out to keep the original shape. */
  aspect?: number;
  sizes: string;
  className?: string;
  priority?: boolean;
  alt?: string;
};

const widths = [480, 768, 1080, 1440, 2000];

/**
 * A picture from Sanity. Sanity's CDN does the resizing and picks WebP or AVIF
 * itself, so this is a plain <img> with a srcset, with the blurred preview
 * Sanity stores as its background while the real picture loads.
 */
export default function SanityImage({ image, aspect, sizes, className = '', priority = false, alt }: SanityImageProps) {
  const url = (w: number) => {
    const b = urlFor(image).width(w).quality(80);
    return (aspect ? b.height(Math.round(w / aspect)).fit('crop') : b).url();
  };
  return (
    <img
      src={url(1080)}
      srcSet={widths.map((w) => `${url(w)} ${w}w`).join(', ')}
      sizes={sizes}
      alt={alt ?? image.alt ?? ''}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      style={image.lqip ? { backgroundImage: `url(${image.lqip})`, backgroundSize: 'cover' } : undefined}
      className={className}
    />
  );
}
