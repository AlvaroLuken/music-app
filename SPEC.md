# Music App Product Brief

## 1. Pain point analysis + solution decisions

| Pain point | Decision in this app |
|---|---|
| Ads cover lyrics, tuner gauges, and controls. | Zero ad slots in layout; performance budget assumes no third-party ad scripts. |
| Forced signup before simple actions. | Chords and tuner work anonymously; auth is only for optional sync later. |
| Paywalls lock transpose, auto-scroll, tuner, or diagrams. | Core play-along and tuning tools are free in MVP. |
| Popups interrupt playing. | No modal onboarding; microphone permission is the only browser prompt. |
| Slow search-to-song path. | One search box, instant local results, first result selectable in one click. |
| Inconsistent chord formatting. | Bracketed chart parser normalizes display and chord tokens. |
| Broken or hidden auto-scroll. | Persistent play-mode controls with adjustable speed. |
| Mobile lyric readability is poor. | High-contrast dark-first typography, adjustable font size, large tap targets. |
| Tuner pages are cluttered and visually noisy. | Dedicated tuner tab with one dominant gauge and string presets. |
| Bass tuning often fails due poor frequency handling. | Bass preset restricts expected range and shows reference frequencies. |
| Chord diagrams are hard to access. | Tap/hover chord token for inline diagram; no page jump. |
| Too many social/gamified features. | No feed, rankings, comments, badges, or engagement traps. |
| Offline access is gated or absent. | Browser-local favorite/cache flow for seed songs; sync can come later. |
| Legal gray-area scraping is ignored. | MVP uses public-domain/original seed charts; licensed source required before broad catalog. |

## Magic moments

1. Search, open a song, transpose/capo, and start auto-scroll without an account.
2. Tap any chord while playing and get the shape immediately in context.
3. Open tuner, tap microphone, see note/cents/gauge within a fraction of a second.
4. Switch guitar/bass presets and tune from the same clean UI.
5. Save a favorite/offline chart locally and reopen it without friction.

## 2. Product/UX spec

### Core flows

- Search → song view → play mode: open app → type title/artist/key → select song → adjust transpose/capo/font → optionally enable simplify, metronome, auto-scroll.
- Open tuner → tune instrument: tap Tuner nav → choose Guitar/Bass/Chromatic → tap Use microphone → play one string → follow note, cents, needle, and tune-up/down copy.

### Information architecture

- Single app shell with two primary tabs: Chords and Tuner.
- Chords screen: search/results sidebar, current song header, play controls, chart.
- Tuner screen: dedicated full-page tuner so microphone state and gauge are not cramped.
- No marketing pages, social screens, forced auth, settings maze, or profile in MVP.

### Visual design principles

- Dark-first, off-black not pure black.
- One accent color: warm amber for chords, active states, and tuner needle.
- Chords use monospaced readable rhythm; lyrics stay uncluttered.
- Controls stay near the playing surface and fit mobile thumbs.

### Chord features in MVP

- Instant seed search.
- Song view with chord/lyric chart.
- Auto-scroll with adjustable speed.
- Transpose and capo shape adjustment.
- Chord diagrams on hover/focus/tap for seeded shapes.
- Simplify chords.
- Font size control.
- Lightweight visual metronome.
- Section chips for loop-section groundwork.
- Local favorites/offline cache markers.

### Tuner features in MVP

- Web Audio API microphone input through AudioContext and AnalyserNode.
- Autocorrelation pitch detection.
- Chromatic, guitar, and bass presets with frequency ranges.
- Note, octave/string label, frequency, signed cents, tune-up/down copy.
- Visual needle/gauge.
- Clean mobile-first permission/error states.

### Anti-features

No ads, popups, forced signup, social feeds, gamification, premium locks, autoplay audio, or dark-pattern notifications.

## 3. Technical architecture

- Stack: Next.js 16 App Router, TypeScript strict, Tailwind CSS v4, React 19. This follows Al's pipeline intent; create-next-app generated Next 16 rather than 15.
- State: local React state for UI controls; localStorage for favorites/offline MVP. No global state library.
- Backend/API: not required for seed MVP. Future endpoints: `/api/search`, `/api/songs/:id`, `/api/favorites` backed by Supabase.
- Database future schema:
  - `songs(id, title, artist, canonical_key, bpm, source, license_status, created_at)`
  - `song_versions(id, song_id, chart, key, capo, contributor_id, status)`
  - `chords(id, name, instrument, voicing, frets, fingers)`
  - `profiles(id, display_name)`
  - `favorites(user_id, song_id, created_at)` with RLS `auth.uid() = user_id`.
- Auth: optional Supabase Auth/Google later; never required for viewing chords or tuner. Use anonymous local favorites first, sync after sign-in.
- Chord data strategy: do not scrape Ultimate Guitar/Cifra Club/Chordify/Songsterr without rights. Use public-domain charts, licensed APIs/partners, user-contributed charts with moderation/takedown, and original practice charts.
- Tuner implementation: client-only component uses `getUserMedia`, `AudioContext`, `AnalyserNode`, 4096-sample buffer, autocorrelation pitch detection, note conversion from A4=440, guitar/bass range filtering.
- Performance budgets: initial JS under 180KB gzipped target after optimization, first usable chord under 1s on broadband, search response under 50ms for local seed catalog, tuner update under 60ms per animation frame, pitch stable within ±5 cents on clean input.

## 6. Next iterations ranked by user impact

1. Licensed chord data integration and normalized chart ingestion.
2. Robust section looping with draggable loop bounds and scroll anchors.
3. Better pitch detection using YIN plus smoothing/noise gate calibration.
4. PWA install/offline cache for saved charts and tuner shell.
5. Optional account sync with Supabase favorites and user-submitted charts.
