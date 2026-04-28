import { motion } from "framer-motion";
import type { ChecklistItem, ValidationReport } from "@/types";

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pass: "bg-success",
    warning: "bg-warning",
    fail: "bg-destructive",
  };
  return <span className={`w-2 h-2 rounded-full ${colors[status] || "bg-muted"} shrink-0 mt-1`} />;
}

interface Props {
  checklist: ChecklistItem[];
  verdict: ValidationReport["checklistVerdict"];
}

export function ShouldYouBuild({ checklist, verdict }: Props) {
  return (
    <div className="space-y-2">
      {checklist.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25 }}
          className="flex items-start gap-2.5 py-2.5 px-3 rounded-md bg-secondary/40"
        >
          <StatusDot status={item.status} />
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
          </div>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: checklist.length * 0.06 + 0.1, duration: 0.3 }}
        className="surface-card border-l-2 border-foreground/20 p-4 mt-4"
      >
        <p className="section-label mb-1">
          Verdict — {verdict.greenCount}/{verdict.total} signals green
        </p>
        <p className="text-base font-medium text-foreground">{verdict.recommendation}</p>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{verdict.detail}</p>
      </motion.div>
    </div>
  );
}
