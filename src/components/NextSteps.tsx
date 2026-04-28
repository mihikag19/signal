import { motion } from "framer-motion";
import type { NextStep } from "@/types";

interface Props {
  steps: NextStep[];
}

export function NextStepsSection({ steps }: Props) {
  return (
    <div className="space-y-2.5">
      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3 }}
          className="surface-card p-4"
        >
          <div className="flex items-start gap-3">
            <span className="font-mono text-xs text-muted-foreground/50 mt-0.5 w-5 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
