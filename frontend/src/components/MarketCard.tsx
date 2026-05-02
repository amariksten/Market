import { Link } from "react-router-dom";
import type { MarketItem } from "../types/finance";
import { formatCurrency, formatPercent, getChangeTone } from "../lib/utils";

type MarketCardProps = {
  item: MarketItem;
  currency: string;
};

export function MarketCard({ item, currency }: MarketCardProps) {
  return (
    <Link to={`/stock/${item.symbol}`} className="glass-card block p-4 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">{item.symbol}</div>
          <div className="mt-1 text-sm text-slate-400">{item.name}</div>
        </div>
        <div className={`text-right text-sm font-medium ${getChangeTone(item.change)}`}>
          {formatPercent(item.changePercent)}
        </div>
      </div>
      <div className="mt-4 text-xl font-semibold text-white">{formatCurrency(item.price, currency)}</div>
    </Link>
  );
}
