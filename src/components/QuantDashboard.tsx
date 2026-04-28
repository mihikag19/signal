import { motion } from "framer-motion";
import type { ValidationReport } from "@/types";

interface Props {
  metrics: ValidationReport["quantMetrics"];
}

export function QuantDashboard({ metrics }: Props) {
  const stats = [
    { label: "Total Signals", value: String(metrics.totalSignals) },
    { label: "Avg Engagement", value: `${metrics.avgEngagement}` },
    { label: "Avg Comments", value: `${metrics.avgComments}` },
    { label: "Pay Signals", value: `${metrics.paySignals}` },
    { label: "Growth", value: `${metrics.growthVelocity}/mo` },
  ];

  return (
    <div className="space-y-5">
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className="surface-card p-3.5 text-center"
          >
            <p className="font-mono text-xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Source breakdown */}
      <div className="surface-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Signal Sources</p>
        <div className="space-y-2.5">
          {metrics.sourceBreakdown.map((s) => (
            <div key={s.source} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 shrink-0">{s.source}</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-foreground/20 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                />
              </div>
              <span className="font-mono text-xs text-muted-foreground w-8 text-right">
                {s.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement distribution */}
      <div className="surface-card p-4">
        <p className="text-sm font-medium text-foreground mb-1">Engagement Distribution</p>
        <p className="text-xs text-muted-foreground mb-3">
          Signal is distributed — not a single outlier
        </p>
        <div className="flex gap-4">
          {[
            { label: "100+ upvotes", count: metrics.engagementDistribution.above100 },
            { label: "50+ upvotes", count: metrics.engagementDistribution.above50 },
            { label: "10+ upvotes", count: metrics.engagementDistribution.above10 },
          ].map((tier) => (
            <div key={tier.label} className="flex-1 text-center">
              <p className="font-mono text-lg font-semibold text-foreground">{tier.count}</p>
              <p className="text-[10px] text-muted-foreground">{tier.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
