import { useEffect, useState } from "react";

function getScoreColor(score: number) {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

function getStrokeColor(score: number) {
  if (score >= 70) return "hsl(160, 84%, 39%)";
  if (score >= 40) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
}

interface DemandScoreRingProps {
  score: number;
  verdict: string;
}

export function DemandScoreRing({ score, verdict }: DemandScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [dashOffset, setDashOffset] = useState(565.5);

  const circumference = 2 * Math.PI * 90; // r=90

  useEffect(() => {
    // Animate number
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(Math.round(eased * score));
      setDashOffset(circumference - (eased * score / 100) * circumference);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center" id="demand-score-section">
      <div className="relative w-56 h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(240, 24%, 15%)" strokeWidth="8" />
          <circle
            cx="100" cy="100" r="90" fill="none"
            stroke={getStrokeColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: "none" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-mono font-bold text-6xl gradient-text`}>
            {animatedScore}
          </span>
        </div>
      </div>
      <p className="text-muted-foreground text-sm mt-3 font-medium uppercase tracking-wider">
        Demand Score
      </p>
      <p className="text-foreground/80 text-base mt-2 text-center max-w-md">{verdict}</p>
    </div>
  );
}
