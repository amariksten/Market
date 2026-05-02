import { FormEvent, useEffect, useMemo, useState } from "react";
import { AsyncState } from "../components/AsyncState";
import { StatCard } from "../components/StatCard";
import { api } from "../lib/api";
import { loadPortfolio, loadSettings, savePortfolio } from "../lib/storage";
import type { Holding, Quote } from "../types/finance";
import { formatCurrency, formatPercent, getChangeTone } from "../lib/utils";

type HoldingWithQuote = Holding & {
  quote?: Quote;
};

export function PortfolioPage() {
  const settings = useMemo(() => loadSettings(), []);
  const [holdings, setHoldings] = useState<Holding[]>(loadPortfolio());
  const [rows, setRows] = useState<HoldingWithQuote[]>([]);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("10");
  const [averageBuyPrice, setAverageBuyPrice] = useState("100");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    savePortfolio(holdings);
  }, [holdings]);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const enriched = await Promise.all(
          holdings.map(async (holding) => {
            try {
              const quote = await api.quote(holding.ticker);
              return { ...holding, quote };
            } catch {
              return { ...holding };
            }
          })
        );
        setRows(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load portfolio data");
      } finally {
        setLoading(false);
      }
    })();
  }, [holdings]);

  function addHolding(event: FormEvent) {
    event.preventDefault();
    const symbol = ticker.trim().toUpperCase();
    const parsedShares = Number(shares);
    const parsedAverage = Number(averageBuyPrice);

    if (!symbol || parsedShares <= 0 || parsedAverage <= 0) {
      return;
    }

    setHoldings((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        ticker: symbol,
        shares: parsedShares,
        averageBuyPrice: parsedAverage
      }
    ]);

    setTicker("");
    setShares("10");
    setAverageBuyPrice("100");
  }

  function removeHolding(id: string) {
    setHoldings((current) => current.filter((item) => item.id !== id));
  }

  const totals = rows.reduce(
    (accumulator, row) => {
      const currentPrice = row.quote?.price ?? 0;
      const currentValue = currentPrice * row.shares;
      const costBasis = row.averageBuyPrice * row.shares;
      const profitLoss = currentValue - costBasis;
      accumulator.value += currentValue;
      accumulator.cost += costBasis;
      accumulator.profit += profitLoss;
      return accumulator;
    },
    { value: 0, cost: 0, profit: 0 }
  );

  const totalProfitPercent = totals.cost > 0 ? (totals.profit / totals.cost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="stat-label">Portfolio</p>
        <h1 className="page-title mt-2">Track holdings with current value and profit/loss.</h1>

        <form onSubmit={addHolding} className="mt-6 grid gap-3 lg:grid-cols-4">
          <input
            value={ticker}
            onChange={(event) => setTicker(event.target.value)}
            placeholder="Ticker"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
          <input
            value={shares}
            onChange={(event) => setShares(event.target.value)}
            placeholder="Shares"
            type="number"
            min="0"
            step="0.0001"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
          <input
            value={averageBuyPrice}
            onChange={(event) => setAverageBuyPrice(event.target.value)}
            placeholder="Average buy price"
            type="number"
            min="0"
            step="0.0001"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
          >
            Add holding
          </button>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total value" value={formatCurrency(totals.value, settings.currency)} />
        <StatCard
          label="Profit / loss"
          value={formatCurrency(totals.profit, settings.currency)}
          hint={formatPercent(totalProfitPercent)}
          tone={totals.profit >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Cost basis" value={formatCurrency(totals.cost, settings.currency)} />
      </div>

      <AsyncState loading={loading} error={error} empty={!rows.length} emptyMessage="No holdings added yet.">
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticker</th>
                  <th className="px-4 py-3 font-medium">Shares</th>
                  <th className="px-4 py-3 font-medium">Avg Buy</th>
                  <th className="px-4 py-3 font-medium">Current</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">P/L</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const currentPrice = row.quote?.price ?? 0;
                  const currentValue = currentPrice * row.shares;
                  const costBasis = row.averageBuyPrice * row.shares;
                  const profitLoss = currentValue - costBasis;
                  const profitLossPercent = costBasis > 0 ? (profitLoss / costBasis) * 100 : 0;

                  return (
                    <tr key={row.id} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-white">{row.ticker}</td>
                      <td className="px-4 py-3">{row.shares}</td>
                      <td className="px-4 py-3">{formatCurrency(row.averageBuyPrice, settings.currency)}</td>
                      <td className="px-4 py-3">{formatCurrency(currentPrice, settings.currency)}</td>
                      <td className="px-4 py-3">{formatCurrency(currentValue, settings.currency)}</td>
                      <td className={`px-4 py-3 font-medium ${getChangeTone(profitLoss)}`}>
                        {formatCurrency(profitLoss, settings.currency)} · {formatPercent(profitLossPercent)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => removeHolding(row.id)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </AsyncState>
    </div>
  );
}
