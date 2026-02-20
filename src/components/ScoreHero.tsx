import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ValidationReport } from "@/lib/mockData";

function getStrokeColor(score: number) {
  if (score >= 70) return "url(#scoreGradientGreen)";
  if (score >= 40) return "url(#scoreGradientAmber)";
  return "url(#scoreGradientRed)";
}

function getScoreClass(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function MiniSignalBadge({ emoji, label, score, summary }: { emoji: string; label: string; score: number; summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.4 }}
      className="glass-card px-4 py-3 flex-1 min-w-[200px]"
    >
      <div className="flex items-center gap-2 mb-1">
        <span>{emoji}</span>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`font-mono text-lg font-bold ml-auto ${getScoreClass(score)}`}>{score}</span>
      </div>
      <p className="text-xs text-muted-foreground">{summary}</p>
    </motion.div>
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
    const duration = 1500;
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
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="scoreGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(160, 84%, 39%)" />
              <stop offset="100%" stopColor="hsl(160, 84%, 50%)" />
            </linearGradient>
            <linearGradient id="scoreGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(38, 92%, 50%)" />
              <stop offset="100%" stopColor="hsl(38, 92%, 60%)" />
            </linearGradient>
            <linearGradient id="scoreGradientRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(0, 84%, 60%)" />
              <stop offset="100%" stopColor="hsl(0, 84%, 70%)" />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(240, 24%, 15%)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={getStrokeColor(report.overallScore)}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-6xl gradient-text">{animatedScore}</span>
        </div>
      </div>

      <p className="text-muted-foreground text-sm mt-3 font-medium uppercase tracking-wider">Validation Score</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-lg">
        <MiniSignalBadge emoji="🏗️" label="Founder Signal" score={report.founderSignal.score} summary={report.founderSignal.summary} />
        <MiniSignalBadge emoji="💰" label="Investor Signal" score={report.investorSignal.score} summary={report.investorSignal.summary} />
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="text-foreground/80 text-base mt-4 text-center max-w-md"
      >
        {report.verdict}
      </motion.p>
    </div>
  );
}
