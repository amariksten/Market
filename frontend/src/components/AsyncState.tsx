type AsyncStateProps = {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  children: React.ReactNode;
};

export function AsyncState({
  loading,
  error,
  empty,
  emptyMessage = "No data available.",
  children
}: AsyncStateProps) {
  if (loading) {
    return <div className="glass-card p-6 text-sm text-slate-300">Loading market data…</div>;
  }

  if (error) {
    return <div className="glass-card border border-rose-500/30 p-6 text-sm text-rose-200">{error}</div>;
  }

  if (empty) {
    return <div className="glass-card p-6 text-sm text-slate-300">{emptyMessage}</div>;
  }

  return <>{children}</>;
}
