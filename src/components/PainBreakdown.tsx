import { useEffect, useState } from "react";
import type { PainCategory } from "@/lib/mockData";

export function PainBreakdown({ categories }: { categories: PainCategory[] }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-primary/70",
    "bg-accent/60",
    "bg-primary/50",
  ];

  return (
    <div className="space-y-4">
      {categories.map((cat, i) => (
        <div key={cat.label} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/80">{cat.label}</span>
            <span className="font-mono text-muted-foreground">{cat.pct}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${colors[i % colors.length]} transition-all duration-1000 ease-out`}
              style={{ width: animate ? `${cat.pct}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
