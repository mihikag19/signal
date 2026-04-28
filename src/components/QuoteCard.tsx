import { motion } from "framer-motion";
import type { QuoteData } from "@/types";

const strongTags = ["Paying for alternatives", "Active searching", "Specific experience"];

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
}

export function QuoteCard({ quote, index }: QuoteCardProps) {
  const isStrong = quote.momTestTags.some((t) => strongTags.includes(t)) && quote.upvotes > 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="surface-card p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-foreground/10 text-3xl font-serif leading-none select-none">"</span>
        {isStrong && (
          <span className="text-[10px] uppercase tracking-wider text-foreground/40 font-medium">
            Strong signal
          </span>
        )}
      </div>
      <p className="text-foreground/80 text-sm leading-relaxed">{quote.text}</p>

      <div className="flex items-center gap-2.5 mt-3 text-xs text-muted-foreground">
        <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">
          {quote.platform}
        </span>
        <span>{quote.upvotes.toLocaleString()} upvotes</span>
        <span>{quote.date}</span>
      </div>

      {quote.momTestTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {quote.momTestTags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                tag === "Hypothetical only"
                  ? "border-warning/30 text-warning"
                  : "border-border text-muted-foreground"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
