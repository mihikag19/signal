import { useEffect, useState } from "react";
import type { PainCategory } from "@/types";

export function PainBreakdown({ categories }: { categories: PainCategory[] }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const opacities = ["bg-foreground/30", "bg-foreground/24", "bg-foreground/18", "bg-foreground/14", "bg-foreground/10"];

  return (
    <div className="space-y-3.5">
      {categories.map((cat, i) => (
        <div key={cat.label} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-foreground/70">{cat.label}</span>
            <span className="font-mono text-muted-foreground text-xs">{cat.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full ${opacities[i % opacities.length]} transition-all duration-700 ease-out`}
              style={{ width: animate ? `${cat.pct}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
