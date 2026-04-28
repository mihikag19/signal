import { motion } from "framer-motion";
import type { ValidationReport } from "@/types";

function StatusDot({ status }: { status: "pass" | "partial" | "fail" }) {
  const colors = {
    pass: "bg-success",
    partial: "bg-warning",
    fail: "bg-destructive",
  };
  return <span className={`w-1.5 h-1.5 rounded-full ${colors[status]} shrink-0 mt-1.5`} />;
}

interface Props {
  momTest: ValidationReport["momTest"];
}

export function MomTestAnalysis({ momTest }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Applied Rob Fitzpatrick's Mom Test framework to real online conversations.
        These are people expressing pain unprompted — not responding to a pitch.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-foreground">
          Mom Test Score: {momTest.score}/{momTest.maxScore} rules passed
        </span>
      </div>

      <div className="space-y-1.5">
        {momTest.rules.map((rule, i) => (
          <motion.div
            key={rule.rule}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="flex items-start gap-2.5 py-2.5 px-3 rounded-md bg-secondary/50"
          >
            <StatusDot status={rule.status} />
            <div>
              <p className="text-sm font-medium text-foreground">{rule.rule}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{rule.evidence}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="surface-card border-l-2 border-foreground/20 p-4 mt-4">
        <p className="section-label mb-1">Verdict</p>
        <p className="text-sm text-foreground/80 leading-relaxed">{momTest.verdict}</p>
      </div>
    </div>
  );
}
