import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ValidationReport } from "@/types";

function getStrokeColor(score: number) {
  if (score >= 70) return "hsl(160 60% 40%)";
  if (score >= 40) return "hsl(38 80% 50%)";
  return "hsl(0 72% 51%)";
}

function getScoreClass(score: number) {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

function SignalBadge({ label, score, summary }: { label: string; score: number; summary: string }) {
  return (
    <div className="surface-card px-4 py-3 flex-1 min-w-[180px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className={`font-mono text-lg font-semibold ${getScoreClass(score)}`}>{score}</span>
      </div>
      <p className="text-xs text-muted-foreground/70 leading-relaxed">{summary}</p>
    </div>
  );
}

interface Props {
  report: ValidationReport;
}

export function ScoreHero({ report }: Props) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(565.5);
  const circumference = 2 * Math.PI * 90;

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * report.overallScore));
      setDashOffset(circumference - (eased * report.overallScore / 100) * circumference);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [report.overallScore, circumference]);

  return (
    <div className="flex flex-col items-center" id="demand-score-section">
      <div className="relative w-44 h-44">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(0 0% 93%)" strokeWidth="6" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={getStrokeColor(report.overallScore)}
            strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-semibold text-5xl ${getScoreClass(report.overallScore)}`}>
            {animatedScore}
          </span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs mt-3 uppercase tracking-[0.15em]">
        Validation Score
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
        <SignalBadge label="Founder Signal" score={report.founderSignal.score} summary={report.founderSignal.summary} />
        <SignalBadge label="Investor Signal" score={report.investorSignal.score} summary={report.investorSignal.summary} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
        className="text-foreground/70 text-sm mt-5 text-center max-w-md leading-relaxed"
      >
        {report.verdict}
      </motion.p>
    </div>
  );
}
