import { FormEvent, useMemo, useState } from "react";
import { AsyncState } from "../components/AsyncState";
import { QuoteTable } from "../components/QuoteTable";
import { SymbolSearch } from "../components/SymbolSearch";
import { api } from "../lib/api";
import { loadSettings } from "../lib/storage";
import type { SearchResponse } from "../types/finance";

export function SearchPage() {
  const settings = useMemo(() => loadSettings(), []);
  const [query, setQuery] = useState("AAPL");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.search(query);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="stat-label">Search</p>
        <h1 className="page-title mt-2">Look up symbols across equities, ETFs, REITs, and crypto.</h1>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 md:flex-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value.toUpperCase())}
            placeholder="Search AAPL, O, ARCC, BTC-USD..."
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 md:flex-1"
          />
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          >
            Search
          </button>
        </form>

        <div className="mt-4">
          <SymbolSearch initialValue={query} />
        </div>
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!!result && !result.items.length}
        emptyMessage="No matching tickers found."
      >
        {result ? <QuoteTable items={result.items} currency={settings.currency} /> : null}
      </AsyncState>
    </div>
  );
}
