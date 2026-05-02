import type { AppSettings, Holding, WatchlistState } from "../types/finance";
import { DEFAULT_SETTINGS, DEFAULT_WATCHLIST } from "./constants";

const WATCHLIST_KEY = "northstar.watchlist";
const PORTFOLIO_KEY = "northstar.portfolio";
const SETTINGS_KEY = "northstar.settings";

export function loadWatchlist(): WatchlistState {
  const raw = localStorage.getItem(WATCHLIST_KEY);
  if (!raw) {
    return DEFAULT_WATCHLIST;
  }
  try {
    const parsed = JSON.parse(raw) as string[];
    return parsed.length ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

export function saveWatchlist(value: WatchlistState): void {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(value));
}

export function loadPortfolio(): Holding[] {
  const raw = localStorage.getItem(PORTFOLIO_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Holding[];
  } catch {
    return [];
  }
}

export function savePortfolio(value: Holding[]): void {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(value));
}

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(value: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
}

export function clearLocalData(): void {
  localStorage.removeItem(WATCHLIST_KEY);
  localStorage.removeItem(PORTFOLIO_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
