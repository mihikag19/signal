import { motion } from "framer-motion";
import type { Quadrant } from "@/lib/mockData";
import { CheckCircle, AlertCircle, XCircle, Star } from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function StatusIcon({ status }: { status: "pass" | "partial" | "fail" }) {
  if (status === "pass") return <CheckCircle className="w-4 h-4 text-success shrink-0" />;
  if (status === "partial") return <AlertCircle className="w-4 h-4 text-warning shrink-0" />;
  return <XCircle className="w-4 h-4 text-destructive shrink-0" />;
}

const positions = ["internalQual", "externalQual", "internalQuant", "externalQuant"] as const;
const labels = ["INTERNAL QUALITATIVE", "EXTERNAL QUALITATIVE", "INTERNAL QUANTITATIVE", "EXTERNAL QUANTITATIVE"];

interface Props {
  quadrants: Record<string, Quadrant>;
}

export function ValidationQuadrantGrid({ quadrants }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {positions.map((key, i) => {
        const q = quadrants[key];
        if (!q) return null;
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            whileHover={{ scale: 1.02 }}
            className={`glass-card p-5 transition-all duration-300 ${
              q.primary
                ? "border-primary/30 shadow-lg shadow-primary/5"
                : "opacity-80"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{labels[i]}</p>
                <p className="text-sm font-semibold text-foreground">"{q.label}"</p>
              </div>
              <span className={`font-mono text-2xl font-bold ${getScoreColor(q.score)}`}>{q.score}</span>
            </div>
            {q.primary && (
              <div className="flex items-center gap-1 mb-3">
                <Star className="w-3 h-3 text-primary" />
                <span className="text-[10px] uppercase tracking-wider text-primary">Primary data source</span>
              </div>
            )}
            <div className="space-y-2">
              {q.metrics.map((m) => (
                <div key={m.label} className="flex items-start gap-2">
                  <StatusIcon status={m.status} />
                  <div>
                    <span className="text-sm text-foreground">{m.label}</span>
                    <p className="text-xs text-muted-foreground">{m.detail}</p>
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
