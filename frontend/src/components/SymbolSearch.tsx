import { Search } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

type SymbolSearchProps = {
  initialValue?: string;
};

export function SymbolSearch({ initialValue = "" }: SymbolSearchProps) {
  const [value, setValue] = useState(initialValue);
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const ticker = value.trim().toUpperCase();
    if (!ticker) {
      return;
    }
    navigate(`/stock/${ticker}`);
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card flex items-center gap-3 p-3">
      <Search className="text-slate-400" size={18} />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search AAPL, TSLA, NVDA, BTC-USD…"
        className="w-full bg-transparent text-sm text-white placeholder:text-slate-500"
      />
      <button
        type="submit"
        className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
      >
        Go
      </button>
    </form>
  );
}
