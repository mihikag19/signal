import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import type { ChecklistItem, ValidationReport } from "@/lib/mockData";

function ItemIcon({ status }: { status: string }) {
  if (status === "pass") return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
  if (status === "warning") return <AlertTriangle className="w-5 h-5 text-warning shrink-0" />;
  return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
}

function itemBg(status: string) {
  if (status === "pass") return "bg-success/5 border-success/10";
  if (status === "warning") return "bg-warning/5 border-warning/10";
  return "bg-destructive/5 border-destructive/10";
}

interface Props {
  checklist: ChecklistItem[];
  verdict: ValidationReport["checklistVerdict"];
}

export function ShouldYouBuild({ checklist, verdict }: Props) {
  return (
    <div className="space-y-3">
      {checklist.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className={`flex items-start gap-3 p-3 rounded-lg border ${itemBg(item.status)}`}
        >
          <ItemIcon status={item.status} />
          <div>
            <p className="text-sm font-semibold text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: checklist.length * 0.1 + 0.1, duration: 0.4 }}
        className="glass-card gradient-border-left p-5 mt-4"
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Verdict — {verdict.greenCount}/{verdict.total} signals green</p>
        <p className="text-lg font-bold text-foreground">{verdict.recommendation}</p>
        <p className="text-sm text-muted-foreground mt-1">{verdict.detail}</p>
      </motion.div>
    </div>
  );
}
