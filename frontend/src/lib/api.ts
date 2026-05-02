import { API_BASE_URL } from "./constants";
import type {
  DividendsResponse,
  FinancialsResponse,
  HistoryResponse,
  MarketOverview,
  NewsResponse,
  Quote,
  SearchResponse
} from "../types/finance";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    let detail = "Request failed";
    try {
      const data = (await response.json()) as { detail?: string };
      detail = data.detail ?? detail;
    } catch {
      // Keep the generic error.
    }
    throw new Error(detail);
  }
  return (await response.json()) as T;
}

export const api = {
  search: (query: string) => request<SearchResponse>(`/search?q=${encodeURIComponent(query)}`),
  quote: (ticker: string) => request<Quote>(`/quote/${encodeURIComponent(ticker)}`),
  history: (ticker: string, period: string, interval: string) =>
    request<HistoryResponse>(`/history/${encodeURIComponent(ticker)}?period=${period}&interval=${interval}`),
  news: (ticker: string) => request<NewsResponse>(`/news/${encodeURIComponent(ticker)}`),
  dividends: (ticker: string) => request<DividendsResponse>(`/dividends/${encodeURIComponent(ticker)}`),
  financials: (ticker: string) => request<FinancialsResponse>(`/financials/${encodeURIComponent(ticker)}`),
  marketOverview: () => request<MarketOverview>("/market-overview")
};
