# UK Wind Forecast Monitoring App

Next.js app for comparing **actual** vs **forecasted** UK national wind power generation.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Time range**: Start and end date/time (calendar widgets).
- **Forecast horizon**: Slider (0–48 h). For each target time, the chart shows the *latest* forecast that was published at least this many hours before the target.
- **Chart**: Blue = actual generation (FUELHH, WIND); green = forecast (WINDFOR). Data from Jan 2025; forecast horizon filter 0–48 h. Missing forecasts are omitted.

## API routes

- `GET /api/actual?from=&to=` — Actual wind generation (FUELHH, WIND).
- `GET /api/forecast?from=&to=` — Wind forecasts (WINDFOR).
- `GET /api/chart?start=&end=&horizon=` — Merged series for the chart (horizon in hours).

## Environment

- `BMRS_API_BASE` (optional): Elexon API base URL. Default: `https://data.elexon.co.uk/bmrs/api/v1`.

## Build & deploy

```bash
npm run build
npm start
```

Deploy to Vercel (or Heroku) by connecting the repo; no extra config required if the default API base is correct.
