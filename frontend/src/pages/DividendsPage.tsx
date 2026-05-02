import { useEffect, useMemo, useState } from "react";
import { AsyncState } from "../components/AsyncState";
import { StatCard } from "../components/StatCard";
import { api } from "../lib/api";
import { loadPortfolio, loadSettings } from "../lib/storage";
import type { DividendsResponse, Holding } from "../types/finance";
import { formatCurrency, formatDate, formatPercent } from "../lib/utils";

type DividendHolding = Holding & {
  dividend?: DividendsResponse;
};

export function DividendsPage() {
  const settings = useMemo(() => loadSettings(), []);
  const portfolio = useMemo(() => loadPortfolio(), []);
  const [rows, setRows] = useState<DividendHolding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const enriched = await Promise.all(
          portfolio.map(async (holding) => {
            try {
              const dividend = await api.dividends(holding.ticker);
              return { ...holding, dividend };
            } catch {
              return { ...holding };
            }
          })
        );
        setRows(enriched);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dividend data");
      } finally {
        setLoading(false);
      }
    })();
  }, [portfolio]);

  const annualIncome = rows.reduce((sum, row) => {
    const rate = row.dividend?.dividendRate ?? 0;
    return sum + rate * row.shares;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="stat-label">Dividends</p>
        <h1 className="page-title mt-2">Estimate dividend income across your saved holdings.</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          Income estimates are based on the latest annual dividend rate returned by the market data provider and your
          local portfolio positions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Annual estimated income" value={formatCurrency(annualIncome, settings.currency)} />
        <StatCard label="Monthly average income" value={formatCurrency(annualIncome / 12, settings.currency)} />
        <StatCard label="Holdings with dividends" value={`${rows.filter((row) => row.dividend?.dividendRate).length}`} />
      </div>

      <AsyncState
        loading={loading}
        error={error}
        empty={!rows.length}
        emptyMessage="Add portfolio holdings first to estimate dividend income."
      >
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-white/10 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Ticker</th>
                  <th className="px-4 py-3 font-medium">Shares</th>
                  <th className="px-4 py-3 font-medium">Dividend</th>
                  <th className="px-4 py-3 font-medium">Yield</th>
                  <th className="px-4 py-3 font-medium">Ex-dividend</th>
                  <th className="px-4 py-3 font-medium">Frequency</th>
                  <th className="px-4 py-3 font-medium">Annual income</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const annualIncomePerHolding = (row.dividend?.dividendRate ?? 0) * row.shares;
                  return (
                    <tr key={row.id} className="border-b border-white/5 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-white">{row.ticker}</td>
                      <td className="px-4 py-3">{row.shares}</td>
                      <td className="px-4 py-3">{formatCurrency(row.dividend?.dividendRate, settings.currency)}</td>
                      <td className="px-4 py-3">{formatPercent(row.dividend?.dividendYield)}</td>
                      <td className="px-4 py-3">{formatDate(row.dividend?.exDividendDate)}</td>
                      <td className="px-4 py-3">{row.dividend?.frequency ?? "—"}</td>
                      <td className="px-4 py-3">{formatCurrency(annualIncomePerHolding, settings.currency)}</td>
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
