import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardPage } from "./pages/DashboardPage";
import { DividendsPage } from "./pages/DividendsPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { SearchPage } from "./pages/SearchPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StockDetailPage } from "./pages/StockDetailPage";
import { WatchlistPage } from "./pages/WatchlistPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/dividends" element={<DividendsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/stock/:ticker" element={<StockDetailPage />} />
      </Routes>
    </Layout>
  );
}
