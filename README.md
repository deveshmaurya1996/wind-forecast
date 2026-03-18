# UK Wind Power Forecast Monitoring — Challenge Submission

This repository contains:

1. **Forecast monitoring app** — A Next.js web app to compare UK national wind power actual generation vs forecasted generation.
2. **Analysis** — Jupyter notebooks for forecast error analysis and wind reliability (recommended MW for planning).

---

## Repository structure

```
Forecast/
├── README.md                          # This file
├── wind-forecast-monitoring-app/      # Next.js application
│   ├── app/
│   │   ├── api/
│   │   │   ├── actual/route.ts        # GET actuals (FUELHH WIND)
│   │   │   ├── forecast/route.ts      # GET forecasts (WINDFOR)
│   │   │   └── chart/route.ts        # GET merged chart data (horizon logic)
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Main UI: date range, horizon slider, chart
│   │   └── globals.css
│   ├── lib/
│   │   ├── bmrs.ts                    # Elexon BMRS API client (FUELHH, WINDFOR)
│   │   ├── chart.ts                   # Build chart series (latest forecast per target)
│   │   └── types.ts
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── README.md                      # App-specific run instructions
└── analysis/
    ├── forecast_error_analysis.ipynb  # Error stats, horizon, time-of-day
    └── wind_reliability_analysis.ipynb # Reliable MW recommendation from actuals
```

---

## How to run this project

### 1. Forecast monitoring app (Next.js)

**Prerequisites:** Node.js 18+ and npm.

From the repo root:

```bash
cd wind-forecast-monitoring-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Use the date range and **Load chart** to view actual vs forecast.

**Production build:**

```bash
npm run build
npm start
```

The app uses Next.js API routes to proxy the Elexon BMRS API. Data is filtered to January 2025 onwards; forecast horizon is 0–48 hours; the chart shows the latest forecast published at least _N_ hours before each target time (N = “Forecast horizon” slider, default 4h).

---

### 2. Analysis notebooks (Python)

**Prerequisites:** Python 3.10+ (e.g. `py` or `python3` on PATH).

From the repo root:

```bash
# One-time: create virtual environment and install dependencies
py -m venv .venv
.\.venv\Scripts\activate.bat   # cmd
# On macOS/Linux: source .venv/bin/activate
pip install -r analysis/requirements.txt

# Start Jupyter
jupyter notebook
```

In the browser, open `analysis/forecast_error_analysis.ipynb` and `analysis/wind_reliability_analysis.ipynb`, then use **Kernel → Restart & Run All** in each.

**Run notebooks from the command line (no browser):**

```bash
.\.venv\Scripts\jupyter.exe nbconvert --to notebook --execute analysis/forecast_error_analysis.ipynb --output forecast_error_analysis_executed.ipynb
.\.venv\Scripts\jupyter.exe nbconvert --to notebook --execute analysis/wind_reliability_analysis.ipynb --output wind_reliability_analysis_executed.ipynb
```

| Part      | Where to run from               | Command / URL                             |
| --------- | ------------------------------- | ----------------------------------------- |
| Web app   | `wind-forecast-monitoring-app/` | `npm run dev` → http://localhost:3000     |
| Notebooks | repo root (`Forecast/`)         | Activate `.venv`, then `jupyter notebook` |

---

## Deployed app

- **Link**: [Add your Vercel/Heroku URL here after deployment]

Deploy by connecting this repo to [Vercel](https://vercel.com) (recommended for Next.js) or Heroku. Set `BMRS_API_BASE` in the environment if the Elexon API base URL differs (default: `https://data.elexon.co.uk/bmrs/api/v1`).

---

## Analysis notebooks

- **`analysis/forecast_error_analysis.ipynb`**  
  Loads actuals (FUELHH WIND) and forecasts (WINDFOR), builds matched pairs using the same “latest forecast ≥ 4h before target” rule and 0–48h horizon. Computes mean/median/P99 error, error vs forecast horizon, and error by time of day.

- **`analysis/wind_reliability_analysis.ipynb`**  
  Uses historical actual wind generation to compute percentiles and a duration curve, then recommends a **reliable MW** value (e.g. P10 so that 90% of the time wind is at least that much), with assumptions and trade-offs documented.

Dependencies are listed in `analysis/requirements.txt` (pandas, numpy, matplotlib, requests, jupyter). Use the venv steps above to install them.

---

## Data sources

- **Actual generation**: Elexon BMRS dataset **FUELHH** (half-hourly generation by fuel type), filtered for `fuelType` = `WIND`.  
  Ref: [BMRS API documentation](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream).

- **Forecasts**: Elexon BMRS dataset **WINDFOR** (wind generation forecast).  
  Ref: [BMRS API documentation](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream).

APIs are public; no API key required for the stream endpoints used here.

---

## AI tools

AI tools were used to assist with implementation (e.g. boilerplate, API client structure, notebook layout). The analysis design, assumptions, and conclusions in the notebooks are human-authored; AI was used only for low-level help (e.g. library usage, syntax) as per the instructions.
