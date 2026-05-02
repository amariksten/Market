from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import math
import pandas as pd
import yfinance as yf
from dateutil.parser import parse as parse_date

from .cache import SimpleTTLCache


cache = SimpleTTLCache(maxsize=1024, ttl=60)

MAJOR_INDEXES = {
    "^GSPC": {"symbol": "^GSPC", "name": "S&P 500"},
    "^IXIC": {"symbol": "^IXIC", "name": "Nasdaq Composite"},
    "^DJI": {"symbol": "^DJI", "name": "Dow Jones Industrial Average"},
}

POPULAR_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "SPY", "BTC-USD", "ETH-USD"]


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _safe_float(value: Any) -> float | None:
    try:
        if value is None:
            return None
        result = float(value)
        if math.isnan(result) or math.isinf(result):
            return None
        return result
    except Exception:
        return None


def _safe_int(value: Any) -> int | None:
    try:
        if value is None:
            return None
        return int(value)
    except Exception:
        return None


def _safe_str(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _safe_date(value: Any) -> str | None:
    if value is None:
        return None
    try:
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value, tz=timezone.utc).date().isoformat()
        if isinstance(value, pd.Timestamp):
            return value.date().isoformat()
        return parse_date(str(value)).date().isoformat()
    except Exception:
        return None


def _normalize_change(price: float | None, previous_close: float | None) -> tuple[float | None, float | None]:
    if price is None or previous_close in (None, 0):
        return None, None
    change = price - previous_close
    pct = (change / previous_close) * 100
    return round(change, 4), round(pct, 4)


def _extract_price(info: dict[str, Any], fast_info: Any) -> float | None:
    candidates = [
        info.get("currentPrice"),
        info.get("regularMarketPrice"),
        getattr(fast_info, "lastPrice", None),
        getattr(fast_info, "last_price", None),
        info.get("navPrice"),
    ]
    for candidate in candidates:
        value = _safe_float(candidate)
        if value is not None:
            return value
    return None


def _extract_previous_close(info: dict[str, Any], fast_info: Any) -> float | None:
    candidates = [
        info.get("previousClose"),
        info.get("regularMarketPreviousClose"),
        getattr(fast_info, "previousClose", None),
        getattr(fast_info, "previous_close", None),
    ]
    for candidate in candidates:
        value = _safe_float(candidate)
        if value is not None:
            return value
    return None


def _extract_market_cap(info: dict[str, Any], fast_info: Any) -> int | None:
    candidates = [
        info.get("marketCap"),
        getattr(fast_info, "marketCap", None),
        getattr(fast_info, "market_cap", None),
    ]
    for candidate in candidates:
        value = _safe_int(candidate)
        if value is not None:
            return value
    return None


def _history_to_points(history: pd.DataFrame) -> list[dict[str, Any]]:
    if history is None or history.empty:
        return []

    points: list[dict[str, Any]] = []
    for idx, row in history.iterrows():
        if isinstance(idx, pd.Timestamp):
            date_value = idx.to_pydatetime().astimezone(timezone.utc).isoformat()
        else:
            date_value = str(idx)
        points.append(
            {
                "date": date_value,
                "open": _safe_float(row.get("Open")),
                "high": _safe_float(row.get("High")),
                "low": _safe_float(row.get("Low")),
                "close": _safe_float(row.get("Close")),
                "volume": _safe_int(row.get("Volume")),
            }
        )
    return points


def _series_to_records(series: pd.Series) -> list[dict[str, Any]]:
    if series is None or series.empty:
        return []
    output: list[dict[str, Any]] = []
    for idx, value in series.items():
        output.append({"date": _safe_date(idx), "value": _safe_float(value)})
    return output


def _df_to_rows(df: pd.DataFrame | None) -> list[dict[str, Any]]:
    if df is None or df.empty:
        return []
    rows: list[dict[str, Any]] = []
    for column in df.columns:
        row = {"period": _safe_date(column) or str(column)}
        for idx, value in df[column].items():
            row[str(idx)] = _safe_float(value) if value is not None else None
        rows.append(row)
    return rows


def _get_ticker(ticker: str) -> yf.Ticker:
    return yf.Ticker(ticker.upper())


def search_tickers(query: str) -> dict[str, Any]:
    normalized_q = query.strip()
    cache_key = ("search", normalized_q.lower())
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    if not normalized_q:
        return {"query": normalized_q, "items": [], "error": None, "updatedAt": _now_iso()}

    items: list[dict[str, Any]] = []

    try:
        search = yf.Search(query=normalized_q, max_results=8)
        quotes = getattr(search, "quotes", []) or []
        for quote in quotes:
            symbol = _safe_str(quote.get("symbol"))
            if not symbol:
                continue
            price = _safe_float(quote.get("regularMarketPrice"))
            previous_close = _safe_float(quote.get("regularMarketPreviousClose"))
            change, change_percent = _normalize_change(price, previous_close)
            items.append(
                {
                    "symbol": symbol,
                    "name": _safe_str(quote.get("shortname") or quote.get("longname") or quote.get("displayName")) or symbol,
                    "exchange": _safe_str(quote.get("exchange") or quote.get("fullExchangeName")),
                    "quoteType": _safe_str(quote.get("quoteType")),
                    "price": price,
                    "change": change,
                    "changePercent": change_percent,
                }
            )
    except Exception:
        items = []

    # Fallback for exact ticker lookups.
    if not items and normalized_q:
        try:
            quote = get_quote(normalized_q)
            if quote["found"]:
                items.append(
                    {
                        "symbol": quote["symbol"],
                        "name": quote["name"],
                        "exchange": quote["exchange"],
                        "quoteType": quote["quoteType"],
                        "price": quote["price"],
                        "change": quote["change"],
                        "changePercent": quote["changePercent"],
                    }
                )
        except Exception:
            pass

    return cache.set(cache_key, {"query": normalized_q, "items": items, "error": None, "updatedAt": _now_iso()})


def get_quote(ticker: str) -> dict[str, Any]:
    symbol = ticker.upper().strip()
    cache_key = ("quote", symbol)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        yf_ticker = _get_ticker(symbol)
        info = yf_ticker.info or {}
        fast_info = yf_ticker.fast_info
        history = yf_ticker.history(period="5d", interval="1d", auto_adjust=False)
    except Exception as exc:
        return {
            "found": False,
            "symbol": symbol,
            "error": f"Failed to load quote data: {exc}",
            "updatedAt": _now_iso(),
        }

    name = _safe_str(info.get("longName") or info.get("shortName") or info.get("displayName")) or symbol
    price = _extract_price(info, fast_info)
    previous_close = _extract_previous_close(info, fast_info)
    open_price = _safe_float(info.get("open") or info.get("regularMarketOpen"))
    day_low = _safe_float(info.get("dayLow") or info.get("regularMarketDayLow"))
    day_high = _safe_float(info.get("dayHigh") or info.get("regularMarketDayHigh"))
    year_low = _safe_float(info.get("fiftyTwoWeekLow"))
    year_high = _safe_float(info.get("fiftyTwoWeekHigh"))
    volume = _safe_int(info.get("volume") or info.get("regularMarketVolume"))
    avg_volume = _safe_int(info.get("averageVolume"))
    market_cap = _extract_market_cap(info, fast_info)
    trailing_pe = _safe_float(info.get("trailingPE"))
    forward_pe = _safe_float(info.get("forwardPE"))
    dividend_yield = _safe_float(info.get("dividendYield"))
    if dividend_yield is not None and dividend_yield < 1:
        dividend_yield *= 100
    beta = _safe_float(info.get("beta"))
    quote_type = _safe_str(info.get("quoteType")) or "UNKNOWN"
    currency = _safe_str(info.get("currency")) or "USD"
    exchange = _safe_str(info.get("exchange"))
    sector = _safe_str(info.get("sector"))
    industry = _safe_str(info.get("industry"))
    website = _safe_str(info.get("website"))
    business_summary = _safe_str(info.get("longBusinessSummary"))
    analyst_summary = _safe_str(info.get("recommendationKey"))
    analyst_count = _safe_int(info.get("numberOfAnalystOpinions"))
    target_mean_price = _safe_float(info.get("targetMeanPrice"))

    if price is None and history is not None and not history.empty:
        latest_close = history["Close"].dropna()
        if not latest_close.empty:
            price = _safe_float(latest_close.iloc[-1])

    change, change_percent = _normalize_change(price, previous_close)
    found = price is not None or bool(info)

    result = {
        "found": found,
        "symbol": symbol,
        "name": name,
        "exchange": exchange,
        "quoteType": quote_type,
        "currency": currency,
        "price": price,
        "change": change,
        "changePercent": change_percent,
        "open": open_price,
        "previousClose": previous_close,
        "dayLow": day_low,
        "dayHigh": day_high,
        "fiftyTwoWeekLow": year_low,
        "fiftyTwoWeekHigh": year_high,
        "volume": volume,
        "averageVolume": avg_volume,
        "marketCap": market_cap,
        "trailingPE": trailing_pe,
        "forwardPE": forward_pe,
        "dividendYield": dividend_yield,
        "beta": beta,
        "sector": sector,
        "industry": industry,
        "website": website,
        "businessSummary": business_summary,
        "analystSummary": analyst_summary,
        "analystCount": analyst_count,
        "targetMeanPrice": target_mean_price,
        "updatedAt": _now_iso(),
        "error": None if found else "Ticker not found",
    }
    return cache.set(cache_key, result)


def get_history(ticker: str, period: str, interval: str) -> dict[str, Any]:
    symbol = ticker.upper().strip()
    cache_key = ("history", symbol, period, interval)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        history = _get_ticker(symbol).history(period=period, interval=interval, auto_adjust=False, prepost=False)
        points = _history_to_points(history)
        return cache.set(
            cache_key,
            {
                "symbol": symbol,
                "period": period,
                "interval": interval,
                "points": points,
                "updatedAt": _now_iso(),
                "error": None if points else "No chart data available",
            },
        )
    except Exception as exc:
        return {
            "symbol": symbol,
            "period": period,
            "interval": interval,
            "points": [],
            "updatedAt": _now_iso(),
            "error": f"Failed to load chart data: {exc}",
        }


def get_news(ticker: str) -> dict[str, Any]:
    symbol = ticker.upper().strip()
    cache_key = ("news", symbol)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    items: list[dict[str, Any]] = []
    error: str | None = None
    try:
        news = _get_ticker(symbol).news or []
        for item in news[:12]:
            content = item.get("content") or {}
            canonical_url = item.get("canonicalUrl") or {}
            title = _safe_str(content.get("title") or item.get("title"))
            if not title:
                continue
            items.append(
                {
                    "title": title,
                    "publisher": _safe_str(content.get("provider").get("displayName") if isinstance(content.get("provider"), dict) else item.get("publisher")) or "Unknown source",
                    "link": _safe_str(canonical_url.get("url") or item.get("link") or item.get("url")),
                    "publishedAt": _safe_date(content.get("pubDate") or item.get("providerPublishTime") or item.get("published")),
                    "summary": _safe_str(content.get("summary") or item.get("summary")),
                    "thumbnail": _safe_str(
                        (((content.get("thumbnail") or {}).get("resolutions") or [{}])[0]).get("url")
                        if isinstance(content.get("thumbnail"), dict)
                        else None
                    ),
                }
            )
    except Exception as exc:
        error = f"Failed to load news: {exc}"

    if not items and error is None:
        error = "No recent news available for this ticker."

    return cache.set(cache_key, {"symbol": symbol, "items": items, "updatedAt": _now_iso(), "error": error})


def get_dividends(ticker: str) -> dict[str, Any]:
    symbol = ticker.upper().strip()
    cache_key = ("dividends", symbol)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        yf_ticker = _get_ticker(symbol)
        info = yf_ticker.info or {}
        dividends = _series_to_records(yf_ticker.dividends)
        dividend_rate = _safe_float(info.get("dividendRate"))
        dividend_yield = _safe_float(info.get("dividendYield"))
        if dividend_yield is not None and dividend_yield < 1:
            dividend_yield *= 100
        ex_dividend_date = _safe_date(info.get("exDividendDate"))
        payout_ratio = _safe_float(info.get("payoutRatio"))
        frequency = _safe_str(info.get("dividendRate") and infer_dividend_frequency(dividends))
        return cache.set(
            cache_key,
            {
                "symbol": symbol,
                "dividendRate": dividend_rate,
                "dividendYield": dividend_yield,
                "exDividendDate": ex_dividend_date,
                "payoutRatio": payout_ratio,
                "frequency": frequency,
                "history": dividends[-20:],
                "updatedAt": _now_iso(),
                "error": None,
            },
        )
    except Exception as exc:
        return {
            "symbol": symbol,
            "dividendRate": None,
            "dividendYield": None,
            "exDividendDate": None,
            "payoutRatio": None,
            "frequency": None,
            "history": [],
            "updatedAt": _now_iso(),
            "error": f"Failed to load dividend data: {exc}",
        }


def infer_dividend_frequency(history: list[dict[str, Any]]) -> str | None:
    if len(history) < 2:
        return None
    dates = [parse_date(item["date"]).date() for item in history[-4:] if item.get("date")]
    if len(dates) < 2:
        return None
    deltas = [(dates[i] - dates[i - 1]).days for i in range(1, len(dates))]
    avg_delta = sum(abs(delta) for delta in deltas) / len(deltas)
    if avg_delta <= 40:
        return "Monthly"
    if avg_delta <= 120:
        return "Quarterly"
    if avg_delta <= 220:
        return "Semi-Annual"
    return "Annual"


def get_financials(ticker: str) -> dict[str, Any]:
    symbol = ticker.upper().strip()
    cache_key = ("financials", symbol)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        yf_ticker = _get_ticker(symbol)
        return cache.set(
            cache_key,
            {
                "symbol": symbol,
                "incomeStatement": _df_to_rows(getattr(yf_ticker, "financials", None)),
                "balanceSheet": _df_to_rows(getattr(yf_ticker, "balance_sheet", None)),
                "cashFlow": _df_to_rows(getattr(yf_ticker, "cashflow", None)),
                "updatedAt": _now_iso(),
                "error": None,
            },
        )
    except Exception as exc:
        return {
            "symbol": symbol,
            "incomeStatement": [],
            "balanceSheet": [],
            "cashFlow": [],
            "updatedAt": _now_iso(),
            "error": f"Failed to load financials: {exc}",
        }


def get_market_overview() -> dict[str, Any]:
    cache_key = ("market_overview",)
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    index_quotes = []
    for symbol, metadata in MAJOR_INDEXES.items():
        quote = get_quote(symbol)
        index_quotes.append(
            {
                "symbol": symbol,
                "name": metadata["name"],
                "price": quote.get("price"),
                "change": quote.get("change"),
                "changePercent": quote.get("changePercent"),
                "currency": quote.get("currency"),
            }
        )

    popular_quotes = []
    for symbol in POPULAR_SYMBOLS:
        quote = get_quote(symbol)
        if quote.get("found"):
            popular_quotes.append(
                {
                    "symbol": quote["symbol"],
                    "name": quote["name"],
                    "price": quote["price"],
                    "change": quote["change"],
                    "changePercent": quote["changePercent"],
                    "currency": quote["currency"],
                }
            )

    crypto = [item for item in popular_quotes if item["symbol"] in {"BTC-USD", "ETH-USD"}]
    equities = [item for item in popular_quotes if item["symbol"] not in {"BTC-USD", "ETH-USD"}]

    return cache.set(
        cache_key,
        {
            "indexes": index_quotes,
            "popular": equities,
            "crypto": crypto,
            "updatedAt": _now_iso(),
            "error": None,
        },
    )
