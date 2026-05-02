import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AsyncState } from "../components/AsyncState";
import { FinancialTable } from "../components/FinancialTable";
import { PriceBadge } from "../components/PriceBadge";
import { PriceChart } from "../components/PriceChart";
import { StatCard } from "../components/StatCard";
import { api } from "../lib/api";
import { CHART_RANGES } from "../lib/constants";

type ChartRange = (typeof CHART_RANGES)[number];
import { loadSettings, loadWatchlist, saveWatchlist } from "../lib/storage";
import type { DividendsResponse, FinancialsResponse, HistoryResponse, NewsResponse, Quote } from "../types/finance";
import { formatCompactNumber, formatCurrency, formatDate, toTitleCase } from "../lib/utils";

export function StockDetailPage() {
  const { ticker = "" } = useParams();
  const settings = useMemo(() => loadSettings(), []);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [history, setHistory] = useState<HistoryResponse | null>(null);
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [dividends, setDividends] = useState<DividendsResponse | null>(null);
  const [financials, setFinancials] = useState<FinancialsResponse | null>(null);
  const [selectedRange, setSelectedRange] = useState<ChartRange>(CHART_RANGES[2]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const normalizedTicker = ticker.toUpperCase();
  const watchlist = useMemo(() => loadWatchlist(), []);
  const isWatched = watchlist.includes(normalizedTicker);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);

      try {
        const [quoteData, historyData, newsData, dividendData, financialData] = await Promise.all([
          api.quote(normalizedTicker),
          api.history(normalizedTicker, selectedRange.period, selectedRange.interval),
          api.news(normalizedTicker),
          api.dividends(normalizedTicker),
          api.financials(normalizedTicker)
        ]);
        setQuote(quoteData);
        setHistory(historyData);
        setNews(newsData);
        setDividends(dividendData);
        setFinancials(financialData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load ticker data");
      } finally {
        setLoading(false);
      }
    })();
  }, [normalizedTicker, selectedRange]);

  function toggleWatchlist() {
    const current = loadWatchlist();
    const next = current.includes(normalizedTicker)
      ? current.filter((item) => item !== normalizedTicker)
      : [...current, normalizedTicker];
    saveWatchlist(next);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <AsyncState loading={loading} error={error}>
        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="glass-card p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="stat-label">{quote?.exchange ?? "Market"}</div>
                <h1 className="mt-2 text-3xl font-semibold text-white">
                  {quote?.name ?? normalizedTicker} <span className="text-slate-400">{normalizedTicker}</span>
                </h1>
                <div className="mt-4">
                  <PriceBadge
                    price={quote?.price}
                    change={quote?.change}
                    changePercent={quote?.changePercent}
                    currency={settings.currency}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={toggleWatchlist}
                  className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-white hover:bg-white/5"
                >
                  {isWatched ? "Remove from watchlist" : "Add to watchlist"}
                </button>
                {quote?.website ? (
                  <a
                    href={quote.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-emerald-400"
                  >
                    Company site
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {CHART_RANGES.map((range) => (
                <button
                  key={range.label}
                  onClick={() => setSelectedRange(range)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    selectedRange.label === range.label
                      ? "bg-emerald-500 text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <PriceChart points={history?.points ?? []} currency={settings.currency} />
            </div>
          </div>

          <div className="space-y-4">
            <StatCard label="Market cap" value={formatCompactNumber(quote?.marketCap)} />
            <StatCard label="P/E ratio" value={quote?.trailingPE?.toFixed(2) ?? "—"} />
            <StatCard label="Dividend yield" value={quote?.dividendYield ? `${quote.dividendYield.toFixed(2)}%` : "—"} />
            <StatCard
              label="52-week range"
              value={`${formatCurrency(quote?.fiftyTwoWeekLow, settings.currency)} – ${formatCurrency(quote?.fiftyTwoWeekHigh, settings.currency)}`}
            />
            <StatCard label="Volume" value={formatCompactNumber(quote?.volume)} />
            <StatCard label="Previous close" value={formatCurrency(quote?.previousClose, settings.currency)} />
            <StatCard label="Open" value={formatCurrency(quote?.open, settings.currency)} />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="text-lg font-semibold text-white">Analyst-style summary</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <p>
                  {quote?.analystSummary
                    ? `Consensus signal: ${toTitleCase(quote.analystSummary)}`
                    : "No structured analyst recommendation is available for this symbol."}
                </p>
                <p>
                  {quote?.targetMeanPrice
                    ? `Average target price: ${formatCurrency(quote.targetMeanPrice, settings.currency)} based on ${quote.analystCount ?? "available"} analyst opinions.`
                    : "Target pricing is not available from the current provider for this symbol."}
                </p>
                <p>{quote?.businessSummary ?? "Business summary unavailable."}</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="text-lg font-semibold text-white">Dividend view</div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <StatCard label="Dividend amount" value={formatCurrency(dividends?.dividendRate, settings.currency)} />
                <StatCard label="Yield" value={dividends?.dividendYield ? `${dividends.dividendYield.toFixed(2)}%` : "—"} />
                <StatCard label="Ex-dividend date" value={formatDate(dividends?.exDividendDate)} />
                <StatCard label="Payout frequency" value={dividends?.frequency ?? "—"} />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">Latest news</div>
              <Link to="/search" className="text-sm text-emerald-300 hover:text-emerald-200">
                Search more
              </Link>
            </div>
            <div className="mt-4 space-y-4">
              {news?.items.length ? (
                news.items.map((item) => (
                  <a
                    key={`${item.title}-${item.publishedAt}`}
                    href={item.link ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.publisher}</div>
                    <div className="mt-2 font-medium text-white">{item.title}</div>
                    <div className="mt-2 text-sm text-slate-400">{formatDate(item.publishedAt)}</div>
                    {item.summary ? <div className="mt-2 text-sm text-slate-300">{item.summary}</div> : null}
                  </a>
                ))
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  {news?.error ?? "No recent news available for this ticker."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <FinancialTable title="Income statement" rows={financials?.incomeStatement ?? []} />
          <FinancialTable title="Balance sheet" rows={financials?.balanceSheet ?? []} />
          <FinancialTable title="Cash flow" rows={financials?.cashFlow ?? []} />
        </div>
      </AsyncState>
    </div>
  );
}
