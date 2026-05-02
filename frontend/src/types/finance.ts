export type Quote = {
  found: boolean;
  symbol: string;
  name: string;
  exchange?: string | null;
  quoteType?: string | null;
  currency?: string | null;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  open?: number | null;
  previousClose?: number | null;
  dayLow?: number | null;
  dayHigh?: number | null;
  fiftyTwoWeekLow?: number | null;
  fiftyTwoWeekHigh?: number | null;
  volume?: number | null;
  averageVolume?: number | null;
  marketCap?: number | null;
  trailingPE?: number | null;
  forwardPE?: number | null;
  dividendYield?: number | null;
  beta?: number | null;
  sector?: string | null;
  industry?: string | null;
  website?: string | null;
  businessSummary?: string | null;
  analystSummary?: string | null;
  analystCount?: number | null;
  targetMeanPrice?: number | null;
  updatedAt?: string;
  error?: string | null;
};

export type SearchItem = {
  symbol: string;
  name: string;
  exchange?: string | null;
  quoteType?: string | null;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
};

export type SearchResponse = {
  query: string;
  items: SearchItem[];
  updatedAt: string;
  error?: string | null;
};

export type HistoryPoint = {
  date: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export type HistoryResponse = {
  symbol: string;
  period: string;
  interval: string;
  points: HistoryPoint[];
  updatedAt: string;
  error?: string | null;
};

export type NewsItem = {
  title: string;
  publisher: string;
  link?: string | null;
  publishedAt?: string | null;
  summary?: string | null;
  thumbnail?: string | null;
};

export type NewsResponse = {
  symbol: string;
  items: NewsItem[];
  updatedAt: string;
  error?: string | null;
};

export type DividendPoint = {
  date?: string | null;
  value?: number | null;
};

export type DividendsResponse = {
  symbol: string;
  dividendRate?: number | null;
  dividendYield?: number | null;
  exDividendDate?: string | null;
  payoutRatio?: number | null;
  frequency?: string | null;
  history: DividendPoint[];
  updatedAt: string;
  error?: string | null;
};

export type FinancialRow = {
  period: string;
  [key: string]: string | number | null;
};

export type FinancialsResponse = {
  symbol: string;
  incomeStatement: FinancialRow[];
  balanceSheet: FinancialRow[];
  cashFlow: FinancialRow[];
  updatedAt: string;
  error?: string | null;
};

export type MarketItem = {
  symbol: string;
  name: string;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string | null;
};

export type MarketOverview = {
  indexes: MarketItem[];
  popular: MarketItem[];
  crypto: MarketItem[];
  updatedAt: string;
  error?: string | null;
};

export type AppSettings = {
  currency: string;
  refreshInterval: number;
};

export type Holding = {
  id: string;
  ticker: string;
  shares: number;
  averageBuyPrice: number;
};

export type WatchlistState = string[];
