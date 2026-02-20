import { motion } from "framer-motion";
import { BookOpen, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import type { ValidationReport } from "@/lib/mockData";

function RuleIcon({ status }: { status: "pass" | "partial" | "fail" }) {
  if (status === "pass") return <CheckCircle className="w-5 h-5 text-success shrink-0" />;
  if (status === "partial") return <AlertCircle className="w-5 h-5 text-warning shrink-0" />;
  return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
}

function statusBg(status: "pass" | "partial" | "fail") {
  if (status === "pass") return "bg-success/5";
  if (status === "partial") return "bg-warning/5";
  return "bg-destructive/5";
}

interface Props {
  momTest: ValidationReport["momTest"];
}

export function MomTestAnalysis({ momTest }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        We applied Rob Fitzpatrick's Mom Test framework to real online conversations. These aren't people responding to a pitch — they're expressing pain unprompted.
      </p>

      <div className="flex items-center gap-3 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <span className="text-foreground font-semibold">Mom Test Score: {momTest.score}/{momTest.maxScore} rules passed</span>
      </div>

      <div className="space-y-2">
        {momTest.rules.map((rule, i) => (
          <motion.div
            key={rule.rule}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={`flex items-start gap-3 p-3 rounded-lg ${statusBg(rule.status)}`}
          >
            <RuleIcon status={rule.status} />
            <div>
              <p className="text-sm font-medium text-foreground">{rule.rule}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{rule.evidence}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card gradient-border-left p-4 mt-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Mom Test Verdict</p>
        <p className="text-sm text-foreground/90">{momTest.verdict}</p>
      </div>
    </div>
  );
}
