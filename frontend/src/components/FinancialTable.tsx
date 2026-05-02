import type { FinancialRow } from "../types/finance";
import { formatCompactNumber, toTitleCase } from "../lib/utils";

type FinancialTableProps = {
  title: string;
  rows: FinancialRow[];
};

export function FinancialTable({ title, rows }: FinancialTableProps) {
  if (!rows.length) {
    return (
      <div className="glass-card p-4">
        <div className="text-sm font-medium text-white">{title}</div>
        <div className="mt-3 text-sm text-slate-400">No structured financial statement data available.</div>
      </div>
    );
  }

  const keys = Object.keys(rows[0]).filter((key) => key !== "period").slice(0, 8);

  return (
    <div className="glass-card overflow-hidden">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-medium text-white">{title}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-xs text-slate-300">
          <thead className="border-b border-white/10 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Period</th>
              {keys.map((key) => (
                <th key={key} className="px-4 py-3 font-medium">
                  {toTitleCase(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 4).map((row) => (
              <tr key={row.period} className="border-b border-white/5 last:border-b-0">
                <td className="px-4 py-3 font-medium text-white">{row.period}</td>
                {keys.map((key) => (
                  <td key={key} className="px-4 py-3">
                    {typeof row[key] === "number" ? formatCompactNumber(row[key] as number) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
