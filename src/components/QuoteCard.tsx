import { ArrowUp } from "lucide-react";
import type { QuoteData } from "@/lib/mockData";

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
}

export function QuoteCard({ quote, index }: QuoteCardProps) {
  return (
    <div
      className="glass-card p-5 opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100 + 300}ms`, animationFillMode: "forwards" }}
    >
      <span className="text-primary/30 text-5xl font-serif leading-none select-none">"</span>
      <p className="text-foreground/90 italic text-base mt-1 leading-relaxed">
        {quote.text}
      </p>
      <div className="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
          {quote.platform}
        </span>
        <span className="flex items-center gap-1">
          <ArrowUp className="w-3 h-3" />
          {quote.upvotes.toLocaleString()}
        </span>
        <span>{quote.date}</span>
      </div>
    </div>
  );
}
