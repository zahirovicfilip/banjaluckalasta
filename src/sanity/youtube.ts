/** Matches any kind of YouTube link and captures its 11-character video ID. */
export const youtubeId = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/;

/** The 11-character YouTube ID from any kind of YouTube link, or null. */
export function youtubeIdFrom(url: string | undefined) {
  return url?.match(youtubeId)?.[1] ?? null;
}
