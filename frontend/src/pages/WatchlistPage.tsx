import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AsyncState } from "../components/AsyncState";
import { api } from "../lib/api";
import { loadSettings, loadWatchlist, saveWatchlist } from "../lib/storage";
import type { SearchItem } from "../types/finance";
import { formatCurrency, formatPercent, getChangeTone } from "../lib/utils";

export function WatchlistPage() {
  const settings = useMemo(() => loadSettings(), []);
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist());
  const [items, setItems] = useState<SearchItem[]>([]);
  const [newTicker, setNewTicker] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const quotes = await Promise.all(
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
        );
        setItems(quotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load watchlist");
      } finally {
        setLoading(false);
      }
    })();
  }, [watchlist]);

  function addTicker(event: FormEvent) {
    event.preventDefault();
    const ticker = newTicker.trim().toUpperCase();
    if (!ticker || watchlist.includes(ticker)) {
      return;
    }
    setWatchlist((current) => [...current, ticker]);
    setNewTicker("");
  }

  function removeTicker(ticker: string) {
    setWatchlist((current) => current.filter((item) => item !== ticker));
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="stat-label">Watchlist</p>
        <h1 className="page-title mt-2">Your saved symbols, refreshed from the backend on demand.</h1>

        <form onSubmit={addTicker} className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={newTicker}
            onChange={(event) => setNewTicker(event.target.value)}
            placeholder="Add ticker"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:flex-1"
          />
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          >
            Add
          </button>
        </form>
      </div>

      <AsyncState loading={loading} error={error} empty={!items.length} emptyMessage="Your watchlist is empty.">
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <div key={item.symbol} className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link to={`/stock/${item.symbol}`} className="text-lg font-semibold text-white hover:text-emerald-300">
                    {item.symbol}
                  </Link>
                  <div className="mt-1 text-sm text-slate-400">{item.name}</div>
                </div>
                <button
                  onClick={() => removeTicker(item.symbol)}
                  className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                >
                  Remove
                </button>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <div className="text-2xl font-semibold text-white">
                  {formatCurrency(item.price, settings.currency)}
                </div>
                <div className={`text-sm font-medium ${getChangeTone(item.change)}`}>
                  {formatCurrency(item.change, settings.currency)} · {formatPercent(item.changePercent)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </AsyncState>
    </div>
  );
}
