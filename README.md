# Banjalučka lasta: website

Site for **Sportsko rekreativno udruženje „Banjalučka lasta“** (Banja Luka). Next.js 16 (App Router), Tailwind v4, Motion and Phosphor icons. The page is built around the scroll-driven `LastaHero` dive and the club's own photo and video material.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run media      # rebuild web images and videos from the transfer folder (macOS)
```

## Where things live

| Path | What |
|---|---|
| `src/content/site.ts` | **All copy and data.** Text, results, people, camp programme, clip list, links. |
| `src/app/page.tsx` | Section order |
| `src/app/globals.css` | Design tokens (brand colors, radius, display type), light/dark |
| `src/components/lasta/` | The original hero engine (untouched), from `lasta-hero-nextjs.zip` |
| `src/components/sections/` | One file per section |
| `src/components/ui/` | `Reveal` (scroll fade-in), `BgVideo` (lazy background video), `Drift` (scroll drift), `YouTube` (video facade), `LastaMark` (diver silhouette) |
| `src/assets/` | Web-sized images built from the club's material: logo, camp badge, cutout, textures, jerseys, camp photos |
| `public/media/` | Web-sized videos and posters: drone fly-in (`kamp-*`), jump clips (`skok-NN`) |
| `src/app/icon.png`, `apple-icon.png`, `opengraph-image.jpg` | Favicon and share image, built from the official logo |
| `src/app/api/prijava/route.ts` | Join-form endpoint. Validates and logs for now. |
| `scripts/build-media.sh`, `scripts/media/` | The asset pipeline (see below) |
| `transfer-*/` | The club's source material, 2+ GB. Ignored by git. |
| `RESEARCH.md` | Everything known about the club, with sources and open questions. Local working notes, ignored by git. |

## Brand

Taken from the club's 2026 brochure and logo PSD:

- Navy `#003156`, blue `#009DE1`, deep `#001928`. The blue is the one accent.
- The torn-paper texture appears behind the quote and on the stat tile.
- Official logo in the nav, footer, favicon and share image.
- The navbar is a floating pill (same shape as the buttons) in the flat brand blue. Left: the crest, hanging off the bottom edge, and the name as a two-line miniature of the hero title. Right: from 768px up the five links as darker pills with white labels; below that a menu button that opens a full-screen blue menu (a circle grows out of the button until it covers the screen, the links rise in behind it, closing runs it back). There is no "Prijavi se" button in the bar. Below 360px the crest, the name and the gap tighten slightly so the menu button stays inside the bar.
- Theme follows the system light/dark setting. Buttons, chips and tabs are pills; everything else uses a 14px radius.

In the animated hero the diver is navy on light and blue on dark. That is one token, `--hero-figure` in `globals.css`.

## Page flow

1. **Hero** (poster): two headline numbers next to each other (73 years, 12 m) on the left, the brochure-style poster as a tall card on the right, at every width. Igor's cutout is wider than the card, so he leaves the frame. The card tilts toward the mouse, he slides the other way. From 640px the explanation and the buttons sit under the numbers. On phones the numbers sit at the foot of the poster, below the diver's head, with short labels (`short` in `hero.stats`), and the explanation and buttons run full width underneath. The quote always starts below the diver: on a small card the card grows taller instead of the words ending up under him. The name is in the navbar; the page title here is for screen readers and search engines only.
   - The scroll-driven dive is still in the code (`HeroDive.tsx`), hidden. Set `hero.animated` to `true` in `site.ts` to bring it back; the quote poster then returns to its own section after the results.
2. **Numbers**: 1936, 7 titles, 2021, 75 at camp, plus a wide shot of Gradski most. (73 years and 12 m are in the hero.)
3. **Lasta** (`#lasta`): the technique in four steps.
4. **Istorija** (`#istorija`): 1936 to 2026. Pins and pans sideways on desktop, swipes on phones.
5. **Skakači** (`#skakaci`): bento with Igor, Nenad, the club stat on the torn-paper pattern, the Arsenić family and Igor Đurović.
6. **Rezultati** (`#rezultati`): 2026 podium, earlier winners, results away from Banja Luka.
7. **Quote**: only shown when the animated hero is on (otherwise the quote lives in the hero poster).
8. **Video** (`#video`): three YouTube videos from Gradski most. The player only loads on click.
9. **Kamp** (`#kamp`): the camp chapter.
   - Opener: drone fly-in over Jezero Manjača behind the headline, camp badge, three facts.
   - Programme (`#program`): one tab per day with a photo and that day's timetable, then the coaches.
   - Finale (`#finale`): a rail of 12 jump clips from the final competition. Only clips on screen load and play.
   - Camp jersey and the club's community work.
10. **Prijava** (`#prijava`): join form with loading, success and error states, plus social links.

## Media pipeline

`npm run media` runs `scripts/build-media.sh`, which rebuilds everything in `src/assets/` and `public/media/` from the transfer folder. It needs macOS (it uses AVFoundation through a small Swift tool, so no ffmpeg) and takes a few minutes.

```bash
npm run media                             # everything
bash scripts/build-media.sh "" images     # images only
bash scripts/build-media.sh "" videos     # videos only
```

To change which jump clips are shown, edit the `REEL` list in `scripts/build-media.sh` (source clip, trim, poster time), rerun, then match the list in `finale.clips` in `site.ts`.

Video weights: jump clips are 720x1280 at about 1.4 Mbps (0.7 to 2 MB each); the fly-in is 5 MB wide and 3.5 MB tall. None of it loads until it is near the screen.

## Before launch (TODO)

- [ ] **Clip names.** Only two source clips were named (Dušan, Sanel). Names for the others would let the reel carry captions.
- [ ] **Emblem of Republika Srpska.** It sits above the camp badge, as on the brochure. Confirm the wording of the patronage, or set `camp.showSeal` to `false`.
- [ ] **Hero emblem text.** The animated emblem reads "Удружење"; the official logo reads "Спортско рекреативно удружење". The hero data would need regenerating to match.
- [ ] **Photos.** The Igor Đurović card is still a placeholder. The Gradski most and people images are YouTube frames that belong to the uploaders. Camp photos for Wednesday, Friday, Saturday and Sunday are cropped out of the brochure, so originals would be sharper.
- [ ] **Form delivery.** Wire `api/prijava` to e-mail, a Google Sheet or Notion.
- [ ] **Contact and domain.** Add the club's e-mail and phone, set `site.url`.
- [ ] **Facts to confirm** (see RESEARCH.md): bridge year 1930 or 1936, 1995 or 1996 rename, 2nd place 2026 (Bajrić or Brajić), partner list.
- [ ] **Deploy.** Keep `transfer-*/` out of the upload (it is in `.gitignore`).
