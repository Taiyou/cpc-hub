# Content fetch automation

Two scripts pull external content into `src/data/` for the Astro build:

- `fetch-youtube.mjs` queries the YouTube Data API v3 for the keywords
  `Collective Predictive Coding`, `記号創発`, and `CPC仮説`, dedupes by video
  ID, sorts by `publishedAt` descending, keeps the top 10, and writes to
  `src/data/videos.json`.
- `fetch-note.mjs` fetches the note.com RSS feed of
  `https://note.com/symbol_emerg/rss`, extracts title / link / thumbnail /
  excerpt / publish date for each item, sorts by date descending, keeps the
  top 10, and writes to `src/data/notes.json`.

## One-time setup

1. Add your API key to `.env`:
   ```
   YOUTUBE_API_KEY=<your_key>
   ```
2. Restrict the key in Google Cloud Console: API → YouTube Data API v3 only.

## Manual run

```sh
pnpm fetch:youtube       # refresh src/data/videos.json
pnpm fetch:note          # refresh src/data/notes.json
pnpm fetch:all           # both fetches
pnpm update:content      # both fetches + rebuild dist/
```

## Hourly automation (macOS, launchd)

Verify the path to `pnpm`:

```sh
which pnpm
```

If it's not `/usr/local/bin/pnpm`, edit `ProgramArguments` in
`scripts/com.cpchub.fetch-youtube.plist` accordingly. Then:

```sh
cp scripts/com.cpchub.fetch-youtube.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.cpchub.fetch-youtube.plist
```

`StartInterval=3600` runs the job every hour. Logs are written to
`scripts/fetch-youtube.log`. To stop:

```sh
launchctl unload ~/Library/LaunchAgents/com.cpchub.fetch-youtube.plist
```

## Quota notes

- **YouTube**: 3 keywords × 100 units (search.list) × 24 runs/day = 7,200
  units/day, within the default 10,000 units/day quota.
- **note**: RSS is unauthenticated and uncapped, but please be respectful
  (hourly is fine).
