type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  tone?: "neutral" | "positive" | "negative";
};

export function StatCard({ label, value, hint, tone = "neutral" }: StatCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "negative"
        ? "text-rose-400"
        : "text-white";

  return (
    <div className="glass-card p-4">
      <div className="stat-label">{label}</div>
      <div className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-400">{hint}</div> : null}
    </div>
  );
}
