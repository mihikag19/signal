import { motion } from "framer-motion";
import type { NextStep } from "@/lib/mockData";

interface Props {
  steps: NextStep[];
}

export function NextStepsSection({ steps }: Props) {
  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
          className="glass-card p-5"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{step.emoji}</span>
            <div>
              <p className="text-base font-semibold text-foreground">{step.title}</p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.detail}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
