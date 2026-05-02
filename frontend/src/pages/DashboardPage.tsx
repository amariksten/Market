import { useEffect, useMemo, useState } from "react";
import { AsyncState } from "../components/AsyncState";
import { MarketCard } from "../components/MarketCard";
import { SymbolSearch } from "../components/SymbolSearch";
import { api } from "../lib/api";
import { loadSettings, loadWatchlist } from "../lib/storage";
import type { MarketOverview, SearchItem } from "../types/finance";
import { QuoteTable } from "../components/QuoteTable";

export function DashboardPage() {
  const [market, setMarket] = useState<MarketOverview | null>(null);
  const [watchlistQuotes, setWatchlistQuotes] = useState<SearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const settings = useMemo(() => loadSettings(), []);
  const watchlist = useMemo(() => loadWatchlist().slice(0, 4), []);

  useEffect(() => {
    void (async () => {
      try {
        const [overview, quotes] = await Promise.all([
          api.marketOverview(),
          Promise.all(
            watchlist.map(async (ticker) => {
              const quote = await api.quote(ticker);
              return {
                symbol: quote.symbol,
                name: quote.name,
                exchange: quote.exchange,
                price: quote.price,
                change: quote.change,
                changePercent: quote.changePercent
              };
            })
          )
        ]);
        setMarket(overview);
        setWatchlistQuotes(quotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      }
    })();
  }, [watchlist]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-card p-6">
          <p className="stat-label">Dashboard</p>
          <h1 className="page-title mt-2">A cleaner way to monitor markets.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
            Track equities, ETFs, REITs, and crypto from one independent workspace with live-friendly pricing,
            watchlists, dividends, and personal holdings.
          </p>
          <div className="mt-6">
            <SymbolSearch />
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="stat-label">Quick access</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {watchlist.map((ticker) => (
              <a
                href={`/stock/${ticker}`}
                key={ticker}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                {ticker}
              </a>
            ))}
          </div>
        </div>
      </div>

      <AsyncState loading={!market && !error} error={error}>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Major indexes</h2>
            <span className="text-xs text-slate-500">Near-live data via yfinance</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {market?.indexes.map((item) => (
              <MarketCard key={item.symbol} item={item} currency={settings.currency} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Popular stocks</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {market?.popular.map((item) => (
              <MarketCard key={item.symbol} item={item} currency={settings.currency} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Crypto snapshot</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {market?.crypto.map((item) => (
              <MarketCard key={item.symbol} item={item} currency={settings.currency} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Top watchlist cards</h2>
          </div>
          <QuoteTable items={watchlistQuotes} currency={settings.currency} />
        </section>
      </AsyncState>
    </div>
  );
}
