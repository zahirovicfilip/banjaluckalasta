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
| `src/components/sections/Interlude.tsx`, `Interludes.tsx` | The chapter breaks after the hero and after the winners: still words, falling photos |
| `src/components/lasta/` | The original hero engine (untouched), from `lasta-hero-nextjs.zip` |
| `src/components/sections/` | One file per section |
| `src/sanity/`, `sanity.config.ts` | News: the Sanity connection, the post type and the Studio setup |
| `src/components/ui/` | `Reveal` (scroll fade-in), `BgVideo` (lazy background video), `Drift` (scroll drift), `YouTube` (video facade), `LastaMark` (diver silhouette) |
| `src/assets/` | Web-sized images built from the club's material: logo, camp badge, cutout, textures, camp photos, interlude stills, airsoft images |
| `public/media/` | Web-sized videos and posters: drone fly-in (`kamp-*`), drone orbit past the tower (`tower-*`), jump clips (`skok-NN`) |
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
- The navbar is a floating pill (same shape as the buttons) in the flat brand blue. Left: the crest, hanging off the bottom edge, and the name as a two-line miniature of the hero title. Right: from 1024px up the six links as darker pills with white labels; below that a menu button that opens a full-screen blue menu (a circle grows out of the button until it covers the screen, the links rise in behind it, closing runs it back). There is no "Prijavi se" button in the bar. Below 360px the crest, the name and the gap tighten slightly so the menu button stays inside the bar.
- Type (Google Fonts via `next/font`, all with latin-ext for č ć š ž đ): **Big Shoulders** for headlines and numbers (`.display`: heavy, upper case, no added tracking, line-height 0.9), **Geist** for reading text, and **Big Shoulders Stencil** only in the airsoft section (`font-stencil`). Reading text stays within about 45 to 75 characters a line (`max-w-[44ch]` to `[65ch]`) at a line-height near 1.5.
- Background life, kept quiet: the brochure's torn-paper streaks bleed in faintly from one screen edge behind every section on a plain background, from the hero to the footer and on the news pages (`Streaks.tsx`, alternating left and right, drifting slower than the page; stronger in dark mode, where the navy of the pattern disappears), and a barely visible film grain sits over the whole site (`body::after` in `globals.css`).
- No small upper-case labels above headings, and no boxed cards: sections group with space, type size and the odd hairline instead.
- Theme follows the device's light/dark setting by default. The menu has a switch (`ThemeSwitch.tsx`): Kao uređaj, Svijetla, Tamna. A choice is remembered in the browser and applied before the first paint (`src/lib/theme.ts`, a tiny script in `<head>`), so there is no flash. All dark styles go through one rule, `@custom-variant dark` in `globals.css`: chosen dark, or the device is dark and light was not chosen. Buttons, chips and tabs are pills; everything else uses a 14px radius.

In the animated hero the diver is navy on light and blue on dark. That is one token, `--hero-figure` in `globals.css`.

## Page flow

1. **Hero** (poster): two headline numbers next to each other (73 years, 12 m) on the left, the brochure-style poster as a tall card on the right, at every width. Igor's cutout is wider than the card, so he leaves the frame. The card tilts toward the mouse, he slides the other way. From 640px the explanation and the buttons sit under the numbers. On phones the numbers sit at the foot of the poster, below the diver's head, with short labels (`short` in `hero.stats`), and the explanation and buttons run full width underneath. The quote always starts below the diver: on a small card the card grows taller instead of the words ending up under him. The name is in the navbar; the page title here is for screen readers and search engines only.
   - The scroll-driven dive is still in the code (`HeroDive.tsx`), hidden. Set `hero.animated` to `true` in `site.ts` to bring it back; the quote poster then returns to its own section after the results.
2. **Pobjednici skokova** (`#pobjednici`): every winner from the board "Pobjednici skokova sa Gradskog mosta od 1979." plus 2025 and 2026, as a circular carousel of tall rounded cards, one per year. Each card has the year, the winner and one line on what Banja Luka lived through that year (`winners` in `site.ts`, each line checked against press or encyclopedia sources in October 2026). Five are on screen: the middle one at full size with the torn-paper pattern, one smaller card on each side, and one more on each side cut in half by the screen edge. It has no end: after 2026 comes 1979 again. It moves with a finger or mouse drag, a sideways trackpad scroll, the arrow keys, two buttons (from 768px) or a click on a side card, and settles on the nearest card. Below 768px the cards are too narrow for text, so they show the year upright and the winner and the city's line for the middle card sit under the carousel. The sizes live in `.era-rail` in `globals.css` and in `SHRINK` in `Winners.tsx`.
3. **Kamp** (`#kamp`): the camp chapter, after the camp interlude.
   - Opener and programme share one stage (`CampStage.tsx`): the drone fly-in holds still behind them and dissolves into the orbit past the jump tower (`tower-*.mp4`) as the programme comes up. The camp badge flies from the opener into the navbar, takes the place of the name "Banjalučka lasta" through the programme, and hands it back when the finale comes up.
   - Programme (`CampProgram.tsx`): the visitor picks a day on a rail of seven buttons (tap, arrow keys, or swipe the day on a phone). The highlight pill and the day's photo, name, summary and full timetable move with critically damped springs, in the direction of travel, and can be interrupted at any point. All days share one spot as tall as the longest, so the page never shifts. Then the coaches.
   - Finale clips (`Reel.tsx`), then **Klub van mosta** (`Community.tsx`): a calm band in the surface tone, read top to bottom (title, one sentence, the Vrbas cleanup turnout as the one blue number, the two kinds of work in plain text), with two photos drifting at different speeds.
4. **Kako je počelo** (`Story.tsx`, `story` in `site.ts`): the story told one sentence at a time. The section's screen holds still (sticky) while it is scrolled through, and the scroll plays it like captions: the title, then each sentence of 1936, 1953 and 2021 in turn. A sentence arrives word by word, holds to be read, dissolves upward with a touch of blur, and the next one comes; the chapter's year sits above and changes with the chapter. `STEP` sets the scroll per sentence. Screen readers get the whole story as plain text. Under reduced motion the sentences only fade. Then a wide shot of Gradski most.
5. **Lasta** (`#lasta`): the technique in four steps.
6. **Skakači** (`#skakaci`): bento with Igor, Nenad, the club stat on the torn-paper pattern, the Arsenić family and Igor Đurović.
7. **Rezultati** (`#rezultati`): 2026 podium, earlier winners, results away from Banja Luka.
8. **Quote**: only shown when the animated hero is on (otherwise the quote lives in the hero poster).
9. **Video** (`#video`): three YouTube videos from Gradski most. The player only loads on click.
10. **Prijava** (`#prijava`): join form with loading, success and error states, plus social links.

The navbar and footer links follow the same order (`nav` in `site.ts`): Pobjednici, Kamp, Lasta, Skakači, Rezultati, then Novosti.

### Airsoft „Arhangel Mihailo“ (`#airsoft`)

The sister club (`Airsoft.tsx`, copy in `airsoft` in `site.ts`, images in `src/assets/airsoft/`). Everything in it comes from the club's Instagram, [@airsoftklub.arhangelmihailo](https://www.instagram.com/airsoftklub.arhangelmihailo/): the bio, the game formats and the posters. The images are Instagram's web-size copies (logo 150 px, photos up to 640 px); swap in the originals when the club sends them.

- While the section crosses the middle of the screen it sets `<html data-airsoft>`. That fades the whole palette from the club's blues to olive and black over 0.7 s (the base colours are registered with `@property` in `globals.css`, so they animate), and the navbar crossfades its name to "Airsoft / Arhangel Mihailo" and its crest to the airsoft emblem. Leaving the section changes everything back.
- The camo behind it is `src/assets/camo.svg`, a seamless woodland pattern drawn for the site; it drifts slower than the page.

### Chapter breaks (interludes)

After the hero and after the winners page there is a screen in the soft surface tone (light or dark with the theme) that holds still while it is scrolled through (`Interlude.tsx`, photos and positions in `Interludes.tsx`, words in `interludes` in `site.ts`). One line of words sits in the middle and never moves; eight stills from the club's jump clips (`src/assets/interlude/`) fall past it.

- They fall faster the further you scroll, like a body falling, and the close ones are bigger and faster than the far ones. The words stay on top of all of them.
- They follow the scroll through a spring, so a flick carries them on a little and they settle; the faster they fall, the more they lean.
- Each interlude arrives over the page before it with rounded top corners, and the winners page arrives over the first interlude the same way.
- Under reduced motion the photos stand still around the words.

## Hidden game: Skok laste (`/skok`)

A one-button timing game, not linked anywhere. It opens from the diver in the hero: click him on a computer, or press and hold him for about half a second on a phone (a normal tap or scroll does nothing). The trigger is `src/components/skok/SkokTrigger.tsx`.

- `src/components/skok/config.ts`: every number that sets the difficulty (gravity, slow-motion factor, start height, height per level, timing window and how fast it shrinks, the time the arms need to close, points, camera zoom, colours).
- `src/components/skok/Game.tsx`: the game loop (fixed 120 Hz step, canvas), input, screens.
- `src/components/skok/diver.ts`: the diver is the man from the logo, posed through the same skinned rig the original hero animation uses (`src/components/lasta/lasta-data.json`): his stance, crouch and launch come from that animation, the swallow is the exact logo pose, and the entry, tumble, slap and float poses are the logo pose with some joints turned further.
- The best result is kept in the visitor's own browser (localStorage). Nothing is sent anywhere; there is no leaderboard.

## News: Novosti (`/novosti`) and the admin (`/studio`)

News is written in **Sanity**, a hosted content service with its own editor (the Studio). The Studio is part of this site, at `/studio`. Only people invited to the club's Sanity project can sign in there; everyone else sees the sign-in screen and nothing more.

- A post ("Novost") has a title, a web address made from the title, a date, a cover picture, a short description for the list, an optional longer text, and any number of pictures, uploaded videos and YouTube links. The fields are in `src/sanity/schemaTypes/novost.ts`.
- `/novosti` lists the posts, newest first; `/novosti/<adresa>` shows one post with its pictures and videos. A published post appears on the site within about a minute.
- Until a project ID is set, `/novosti` shows "Uskoro prve novosti" and `/studio` says it is not connected.
- Long videos are better on YouTube (paste the link): uploaded files count against the Sanity plan's storage and traffic.

Connecting the project (once):

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage) and create a project (dataset `production`, public).
2. Put its project ID in `src/sanity/env.ts` (or set `NEXT_PUBLIC_SANITY_PROJECT_ID` on the host).
3. In the project's **API → CORS origins**, add `http://localhost:3100` and the live domain, each with **Allow credentials** ticked.
4. In **Members**, invite whoever should post news.

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
