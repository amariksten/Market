export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export const DEFAULT_WATCHLIST = ["AAPL", "MSFT", "NVDA", "TSLA", "O", "ARCC", "SPY", "BTC-USD"];

export const DEFAULT_SETTINGS = {
  currency: "USD",
  refreshInterval: 60
};

export const CHART_RANGES = [
  { label: "1D", period: "1d", interval: "5m" },
  { label: "5D", period: "5d", interval: "15m" },
  { label: "1M", period: "1mo", interval: "1d" },
  { label: "6M", period: "6mo", interval: "1d" },
  { label: "YTD", period: "ytd", interval: "1d" },
  { label: "1Y", period: "1y", interval: "1d" },
  { label: "5Y", period: "5y", interval: "1wk" },
  { label: "MAX", period: "max", interval: "1mo" }
] as const;

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/" },
  { label: "Search", path: "/search" },
  { label: "Watchlist", path: "/watchlist" },
  { label: "Portfolio", path: "/portfolio" },
  { label: "Dividends", path: "/dividends" },
  { label: "Settings", path: "/settings" }
];
