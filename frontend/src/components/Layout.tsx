import { Menu, Search as SearchIcon, Star } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { NAV_ITEMS } from "../lib/constants";

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 px-6 py-8 lg:block">
          <div className="glass-card p-5">
            <Link to="/" className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-300">
                <Star size={20} />
              </div>
              <div>
                <div className="font-semibold text-white">Northstar Markets</div>
                <div className="subtle-text">Independent market dashboard</div>
              </div>
            </Link>
          </div>

          <nav className="mt-6 space-y-2">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="glass-card mt-6 p-4">
            <p className="stat-label">Local-first</p>
            <p className="mt-2 text-sm text-slate-300">
              Watchlists, portfolio entries, and preferences are stored in your browser for the first version.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-semibold text-white">
              <Star size={18} className="text-emerald-300" />
              Northstar Markets
            </Link>
            <details className="relative">
              <summary className="glass-card list-none cursor-pointer p-3">
                <Menu size={18} />
              </summary>
              <div className="glass-card absolute right-0 top-14 z-10 min-w-56 p-3">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `block rounded-xl px-3 py-2 text-sm ${isActive ? "bg-emerald-500/15 text-emerald-300" : "text-slate-300"}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </details>
          </div>

          <div className="glass-card mb-6 flex items-center gap-3 px-4 py-3">
            <SearchIcon size={18} className="text-slate-400" />
            <span className="text-sm text-slate-300">
              Search any supported symbol from the sidebar or open a direct route like /stock/AAPL.
            </span>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
