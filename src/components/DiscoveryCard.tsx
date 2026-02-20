import { ArrowUp, ArrowRight, ArrowDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { DiscoveryTopic } from "@/lib/mockData";

function getScoreColor(score: number) {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

function getScoreRingColor(score: number) {
  if (score >= 70) return "stroke-success";
  if (score >= 40) return "stroke-warning";
  return "stroke-destructive";
}

function TrendBadge({ trend }: { trend: string }) {
  const config = {
    rising: { icon: ArrowUp, label: "Rising", className: "text-success" },
    stable: { icon: ArrowRight, label: "Stable", className: "text-warning" },
    declining: { icon: ArrowDown, label: "Declining", className: "text-destructive" },
  }[trend] ?? { icon: ArrowRight, label: "Stable", className: "text-warning" };

  const Icon = config.icon;
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

interface DiscoveryCardProps {
  topic: DiscoveryTopic;
  index: number;
  query: string;
}

export function DiscoveryCard({ topic, index, query }: DiscoveryCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/validate/${topic.slug}?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="glass-card-hover p-5 cursor-pointer opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{topic.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {topic.platforms.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
              >
                {p}
              </span>
            ))}
            <span className="text-xs text-muted-foreground">{topic.signals} signals</span>
          </div>
        </div>

        {/* Right - Score */}
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" className="stroke-secondary" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none"
                className={getScoreRingColor(topic.score)}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${(topic.score / 100) * 175.9} 175.9`}
              />
            </svg>
            <span className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-lg ${getScoreColor(topic.score)}`}>
              {topic.score}
            </span>
          </div>
          <TrendBadge trend={topic.trend} />
        </div>

        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 hidden sm:block" />
      </div>
    </div>
  );
}
