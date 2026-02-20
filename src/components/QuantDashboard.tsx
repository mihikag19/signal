import { motion } from "framer-motion";
import { BarChart3, Flame, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import type { ValidationReport } from "@/lib/mockData";

const statIcons = [BarChart3, Flame, MessageSquare, DollarSign, TrendingUp];

interface Props {
  metrics: ValidationReport["quantMetrics"];
}

export function QuantDashboard({ metrics }: Props) {
  const stats = [
    { label: "Total Signals", value: String(metrics.totalSignals), icon: BarChart3 },
    { label: "Avg Engagement", value: `${metrics.avgEngagement} upvotes`, icon: Flame },
    { label: "Discussion Depth", value: `${metrics.avgComments} avg comments`, icon: MessageSquare },
    { label: "Pay Signals", value: `${metrics.paySignals} mentions`, icon: DollarSign },
    { label: "Growth Velocity", value: `${metrics.growthVelocity} / month`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className="glass-card p-4 text-center"
            >
              <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
              <p className="font-mono text-xl font-bold text-foreground">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Source breakdown */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Signal Sources</p>
        <div className="space-y-2">
          {metrics.sourceBreakdown.map((s) => (
            <div key={s.source} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-28 shrink-0">{s.source}</span>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full gradient-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${s.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="font-mono text-xs text-muted-foreground w-8 text-right">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement distribution */}
      <div className="glass-card p-5">
        <p className="text-sm font-semibold text-foreground mb-3">Engagement Distribution</p>
        <p className="text-xs text-muted-foreground mb-3">Signal is distributed — not a single outlier</p>
        <div className="flex gap-4">
          {[
            { label: "100+ upvotes", count: metrics.engagementDistribution.above100 },
            { label: "50+ upvotes", count: metrics.engagementDistribution.above50 },
            { label: "10+ upvotes", count: metrics.engagementDistribution.above10 },
          ].map((tier) => (
            <div key={tier.label} className="flex-1 text-center">
              <p className="font-mono text-lg font-bold text-foreground">{tier.count}</p>
              <p className="text-[11px] text-muted-foreground">posts with {tier.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
