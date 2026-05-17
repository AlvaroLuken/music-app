# Music App

Fast, ad-free chord viewer and guitar/bass tuner.

## Features

- Seed song search and chord/lyric viewer.
- Play mode controls: transpose, capo, simplify, font size, metronome, auto-scroll.
- Tap/hover chord diagrams for seeded chord shapes.
- Local favorites/offline markers.
- Web Audio guitar/bass/chromatic tuner with microphone pitch detection.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Verify

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## Notes

The MVP intentionally ships with public-domain/original seed charts. Broad commercial-song coverage needs licensed data, a compliant user-contribution model, or another rights-cleared source before production.
