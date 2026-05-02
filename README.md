# Northstar Markets

Northstar Markets is a Yahoo Finance-style local web app built with an original design and powered by a FastAPI backend plus a React + Vite + TypeScript frontend.

It includes:

- search
- stock detail pages
- chart ranges
- market overview
- watchlist
- local portfolio tracker
- dividends view and income estimator
- news
- financial statements
- settings
- safe fallback handling for missing yfinance fields

## Tech stack

- Frontend: React + Vite + TypeScript
- Styling: Tailwind CSS v4 via the Vite plugin
- Charts: Recharts
- Backend: FastAPI
- Data provider: yfinance
- Local storage: watchlist, portfolio, settings

## Project structure

```text
northstar-markets/
├─ app/
│  ├─ __init__.py
│  ├─ main.py
│  └─ services/
│     ├─ cache.py
│     └─ finance.py
├─ frontend/
│  ├─ index.html
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ tsconfig.app.json
│  ├─ tsconfig.node.json
│  ├─ vite.config.ts
│  └─ src/
│     ├─ App.tsx
│     ├─ index.css
│     ├─ main.tsx
│     ├─ components/
│     │  ├─ AsyncState.tsx
│     │  ├─ FinancialTable.tsx
│     │  ├─ Layout.tsx
│     │  ├─ MarketCard.tsx
│     │  ├─ PriceBadge.tsx
│     │  ├─ PriceChart.tsx
│     │  ├─ QuoteTable.tsx
│     │  ├─ StatCard.tsx
│     │  └─ SymbolSearch.tsx
│     ├─ hooks/
│     │  ├─ useInterval.ts
│     │  └─ useLocalStorageState.ts
│     ├─ lib/
│     │  ├─ api.ts
│     │  ├─ constants.ts
│     │  ├─ storage.ts
│     │  └─ utils.ts
│     ├─ pages/
│     │  ├─ DashboardPage.tsx
│     │  ├─ DividendsPage.tsx
│     │  ├─ PortfolioPage.tsx
│     │  ├─ SearchPage.tsx
│     │  ├─ SettingsPage.tsx
│     │  ├─ StockDetailPage.tsx
│     │  └─ WatchlistPage.tsx
│     └─ types/
│        └─ finance.ts
├─ requirements.txt
└─ README.md
```

## Requirements

- Python 3.11+ recommended
- Node.js 20+ recommended
- npm

## Setup

### 1) Backend install

From the project root:

```powershell
pip install -r requirements.txt
```

### 2) Frontend install

```powershell
cd frontend
npm install
```

## Run locally on Windows PowerShell

### Terminal 1: backend

From the project root:

```powershell
uvicorn app.main:app --reload
```

Backend base URL:

```text
http://127.0.0.1:8000
```

Swagger docs:

```text
http://127.0.0.1:8000/docs
```

### Terminal 2: frontend

```powershell
cd frontend
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

## Works after these commands

From the project root:

```powershell
pip install -r requirements.txt
cd frontend
npm install
npm run dev
```

In a second terminal from the project root:

```powershell
uvicorn app.main:app --reload
```

## Vercel deployment (frontend + API in one project)

This repository now includes a `vercel.json` that uses a root build command for `frontend` and deploys `api/index.py` as a Vercel Python function.

### Required setup in Vercel

- Import this repository as a Vercel project.
- Build command is defined in `vercel.json` (`cd frontend && npm install && npm run build`).
- Output directory is `frontend/dist`.
- API runs from `api/index.py` via Vercel Python runtime.

### API base URL

- Production default is now relative (`/api`), so frontend and backend work on the same domain automatically.
- For local development, copy `frontend/.env.example` to `frontend/.env` so Vite points to `http://127.0.0.1:8000/api`.

## API endpoints

- `GET /api/search?q=`
- `GET /api/quote/{ticker}`
- `GET /api/history/{ticker}?period=&interval=`
- `GET /api/news/{ticker}`
- `GET /api/dividends/{ticker}`
- `GET /api/financials/{ticker}`
- `GET /api/market-overview`

## Notes about yfinance

This app uses `yfinance` as the free fallback provider. The yfinance project describes itself as a Pythonic way to fetch market data from Yahoo Finance, and notes that it is not affiliated with Yahoo and is intended for personal use. citeturn678771view2

Because free market data can have missing or inconsistent fields, the backend normalizes responses and uses try/except heavily so one bad field does not break the UI.

## Notes about setup choices

Tailwind CSS currently recommends using the `@tailwindcss/vite` plugin for Vite projects and importing Tailwind with `@import "tailwindcss";` in the CSS entry file. citeturn678771view0

FastAPI’s official tutorial documents local development with a standard app file and a development server command, and the framework provides automatic docs at `/docs`. citeturn678771view1turn922721search10

## Replacing yfinance later

To swap in a paid provider later:

1. Keep the frontend unchanged.
2. Replace the implementation inside `app/services/finance.py`.
3. Preserve the JSON response shapes used by the frontend.

That lets you move to Finnhub, Polygon, Twelve Data, or Alpha Vantage without rewriting the UI.

## Stability notes

- Invalid tickers return a clear message.
- Missing fields render as `—`.
- News failures show a friendly fallback message.
- Watchlist, portfolio, and settings are stored in `localStorage`.
- The backend caches requests briefly to reduce repeated yfinance calls.

## Suggested next improvements

- Replace `window.location.reload()` in the stock detail watchlist toggle with shared app state or React context.
- Add backend provider adapters with a common interface for yfinance and future paid APIs.
- Add tests for the service normalization layer.
