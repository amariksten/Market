import { useState } from "react";
import { clearLocalData, loadSettings, saveSettings } from "../lib/storage";

export function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings());
  const [message, setMessage] = useState<string | null>(null);

  function updateSettings<Key extends keyof typeof settings>(key: Key, value: (typeof settings)[Key]) {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
    setMessage("Settings saved.");
  }

  function handleClear() {
    clearLocalData();
    setMessage("Local watchlist, portfolio, and settings cleared. Refresh the page to reload defaults.");
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <p className="stat-label">Settings</p>
        <h1 className="page-title mt-2">Customize display preferences and reset local data.</h1>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Currency display</span>
            <select
              value={settings.currency}
              onChange={(event) => updateSettings("currency", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Refresh interval (seconds)</span>
            <select
              value={settings.refreshInterval}
              onChange={(event) => updateSettings("refreshInterval", Number(event.target.value))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={120}>120</option>
              <option value={300}>300</option>
            </select>
          </label>
        </div>

        <div className="mt-8">
          <button
            onClick={handleClear}
            className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-5 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/20"
          >
            Clear local data
          </button>
        </div>

        {message ? <div className="mt-4 text-sm text-slate-300">{message}</div> : null}
      </div>

      <div className="glass-card p-6">
        <p className="stat-label">Future provider swap</p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          The frontend only talks to the FastAPI endpoints. To move from yfinance to Finnhub, Polygon, Twelve Data, or
          Alpha Vantage later, replace the implementation inside the backend service layer and keep the response shape
          stable.
        </p>
      </div>
    </div>
  );
}
