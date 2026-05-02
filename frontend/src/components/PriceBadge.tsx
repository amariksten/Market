import { formatCurrency, formatPercent, getChangeTone } from "../lib/utils";

type PriceBadgeProps = {
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  currency?: string;
};

export function PriceBadge({ price, change, changePercent, currency = "USD" }: PriceBadgeProps) {
  const tone = getChangeTone(change);
  return (
    <div className="space-y-1">
      <div className="text-2xl font-semibold text-white">{formatCurrency(price, currency)}</div>
      <div className={`text-sm font-medium ${tone}`}>
        {change === null || change === undefined ? "—" : `${formatCurrency(change, currency)} · ${formatPercent(changePercent)}`}
      </div>
    </div>
  );
}
