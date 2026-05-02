import { Link } from "react-router-dom";
import type { SearchItem } from "../types/finance";
import { formatCurrency, formatPercent, getChangeTone } from "../lib/utils";

type QuoteTableProps = {
  items: SearchItem[];
  currency: string;
};

export function QuoteTable({ items, currency }: QuoteTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Change</th>
              <th className="px-4 py-3 font-medium">Exchange</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.symbol} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3">
                  <Link to={`/stock/${item.symbol}`} className="font-medium text-emerald-300 hover:text-emerald-200">
                    {item.symbol}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-200">{item.name}</td>
                <td className="px-4 py-3 text-slate-200">{formatCurrency(item.price, currency)}</td>
                <td className={`px-4 py-3 font-medium ${getChangeTone(item.change)}`}>
                  {item.change === null || item.change === undefined
                    ? "—"
                    : `${formatCurrency(item.change, currency)} · ${formatPercent(item.changePercent)}`}
                </td>
                <td className="px-4 py-3 text-slate-400">{item.exchange ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
