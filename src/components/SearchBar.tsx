import { Search } from "lucide-react";
import { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter a market to discover, or an idea to validate..."
        className="w-full bg-white/5 text-foreground placeholder:text-muted-foreground 
          rounded-xl px-5 py-4 pr-28 text-base outline-none
          border border-transparent focus:ring-2 focus:ring-primary transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 gradient-button flex items-center gap-2 text-sm"
      >
        <Search className="w-4 h-4" />
        Scan
      </button>
    </form>
  );
}

export function TrendingChips({ onSelect }: { onSelect: (query: string) => void }) {
  const chips = [
    "AI in healthcare",
    "Creator economy tools",
    "Climate tech",
    "This tool (meta)",
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-6">
      <span className="text-muted-foreground text-sm mr-1 self-center">Trending:</span>
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="px-4 py-1.5 rounded-full text-sm border border-secondary 
            bg-secondary/50 text-secondary-foreground hover:border-primary/50 
            hover:bg-primary/10 transition-all duration-200 cursor-pointer"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
