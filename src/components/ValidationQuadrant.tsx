import { motion } from "framer-motion";
import type { Quadrant } from "@/types";

function getScoreColor(score: number) {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

function StatusDot({ status }: { status: "pass" | "partial" | "fail" }) {
  const colors = {
    pass: "bg-success",
    partial: "bg-warning",
    fail: "bg-destructive",
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[status]} shrink-0 mt-1.5`} />;
}

const positions = ["internalQual", "externalQual", "internalQuant", "externalQuant"] as const;
const labels = ["Internal Qualitative", "External Qualitative", "Internal Quantitative", "External Quantitative"];

interface Props {
  quadrants: Record<string, Quadrant>;
}

export function ValidationQuadrantGrid({ quadrants }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {positions.map((key, i) => {
        const q = quadrants[key];
        if (!q) return null;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className={`surface-card p-4 ${q.primary ? "border-foreground/20" : ""}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60">
                  {labels[i]}
                </p>
                <p className="text-sm font-medium text-foreground mt-0.5">{q.label}</p>
              </div>
              <span className={`font-mono text-xl font-semibold ${getScoreColor(q.score)}`}>
                {q.score}
              </span>
            </div>
            {q.primary && (
              <p className="text-[10px] uppercase tracking-[0.1em] text-foreground/40 mb-2.5">
                Primary data source
              </p>
            )}
            <div className="space-y-2">
              {q.metrics.map((m) => (
                <div key={m.label} className="flex items-start gap-2">
                  <StatusDot status={m.status} />
                  <div>
                    <span className="text-sm text-foreground">{m.label}</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
