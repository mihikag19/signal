import { ArrowUp, Star } from "lucide-react";
import { motion } from "framer-motion";
import type { QuoteData } from "@/lib/mockData";

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
}

const strongTags = ["Paying for alternatives", "Active searching", "Specific experience"];

export function QuoteCard({ quote, index }: QuoteCardProps) {
  const isStrong = quote.momTestTags.some((t) => strongTags.includes(t)) && quote.upvotes > 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.12 + 0.3, duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className="glass-card p-5 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <span className="text-primary/30 text-5xl font-serif leading-none select-none">"</span>
        {isStrong && (
          <div className="flex items-center gap-1 text-warning">
            <Star className="w-3 h-3" />
            <span className="text-[10px] uppercase tracking-wider">Strong signal</span>
          </div>
        )}
      </div>
      <p className="text-foreground/90 italic text-base mt-1 leading-relaxed">{quote.text}</p>

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

      {quote.momTestTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {quote.momTestTags.map((tag) => (
            <span
              key={tag}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${
                tag === "Hypothetical only"
                  ? "border-warning/30 text-warning bg-warning/5"
                  : "border-primary/20 text-primary/70 bg-primary/5"
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
