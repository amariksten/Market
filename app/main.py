from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.services.finance import (
    cache,
    get_dividends,
    get_financials,
    get_history,
    get_market_overview,
    get_news,
    get_quote,
    search_tickers,
)

app = FastAPI(
    title="Northstar Markets API",
    version="1.0.0",
    description="Normalized finance API powered by FastAPI and yfinance.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/search")
def search(q: str = Query(..., min_length=1, max_length=30)) -> dict:
    return search_tickers(q)


@app.get("/api/quote/{ticker}")
def quote(ticker: str) -> dict:
    data = get_quote(ticker)
    if not data.get("found"):
        raise HTTPException(status_code=404, detail=data.get("error") or "Ticker not found")
    return data


@app.get("/api/history/{ticker}")
def history(
    ticker: str,
    period: str = Query("1mo"),
    interval: str = Query("1d"),
) -> dict:
    valid_periods = {"1d", "5d", "1mo", "6mo", "ytd", "1y", "5y", "max"}
    valid_intervals = {"5m", "15m", "30m", "1h", "1d", "1wk", "1mo"}

    if period not in valid_periods:
        raise HTTPException(status_code=400, detail="Unsupported period")
    if interval not in valid_intervals:
        raise HTTPException(status_code=400, detail="Unsupported interval")

    return get_history(ticker, period, interval)


@app.get("/api/news/{ticker}")
def news(ticker: str) -> dict:
    return get_news(ticker)


@app.get("/api/dividends/{ticker}")
def dividends(ticker: str) -> dict:
    return get_dividends(ticker)


@app.get("/api/financials/{ticker}")
def financials(ticker: str) -> dict:
    return get_financials(ticker)


@app.get("/api/market-overview")
def market_overview() -> dict:
    return get_market_overview()


@app.post("/api/cache/clear")
def clear_cache() -> dict[str, str]:
    cache.clear()
    return {"status": "cleared"}
