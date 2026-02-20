import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SignalLogo } from "@/components/SignalLogo";
import { useCompareStore } from "@/lib/compareStore";
import { ArrowLeft, Trash2 } from "lucide-react";

function getScoreClass(score: number) {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

function statusEmoji(status: string) {
  if (status === "pass") return "✅";
  if (status === "warning") return "⚠️";
  return "❌";
}

const Compare = () => {
  const { ideas, removeIdea } = useCompareStore();

  if (ideas.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <Link to="/"><SignalLogo size="sm" /></Link>
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-2xl font-bold text-foreground mb-2">No ideas to compare yet</p>
          <p className="text-muted-foreground mb-6">Validate 2+ ideas to compare them here.</p>
          <Link to="/" className="gradient-button">Go validate →</Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; getValue: (r: typeof ideas[0]) => string; highlight?: boolean }[] = [
    { label: "Overall Score", getValue: (r) => `${r.overallScore}/100`, highlight: true },
    { label: "Founder Signal", getValue: (r) => `${r.founderSignal.score}/100` },
    { label: "Investor Signal", getValue: (r) => `${r.investorSignal.score}/100` },
    { label: "Mom Test Score", getValue: (r) => `${r.momTest.score}/${r.momTest.maxScore}` },
    { label: "Total Signals", getValue: (r) => String(r.quantMetrics.totalSignals) },
    { label: "Pay Signals", getValue: (r) => String(r.quantMetrics.paySignals) },
    { label: "Competition", getValue: (r) => r.competitors.density },
    { label: "Buildability", getValue: (r) => `${r.quadrants.internalQuant.score}/100` },
    { label: "Checklist Score", getValue: (r) => `${r.checklistVerdict.greenCount}/${r.checklistVerdict.total}` },
    { label: "Verdict", getValue: (r) => r.checklistVerdict.recommendation },
  ];

  // Find best score per row
  function bestIndex(getValue: (r: typeof ideas[0]) => string): number {
    let best = -1;
    let bestNum = -Infinity;
    ideas.forEach((idea, i) => {
      const val = getValue(idea);
      const num = parseFloat(val);
      if (!isNaN(num) && num > bestNum) {
        bestNum = num;
        best = i;
      }
    });
    return best;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Link to="/"><SignalLogo size="sm" /></Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back home
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground mb-2">Compare Ideas</h1>
          <p className="text-muted-foreground mb-8">Side by side — which one deserves your time and money?</p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs uppercase tracking-widest text-muted-foreground p-3 min-w-[140px]">Metric</th>
                {ideas.map((idea, i) => (
                  <th key={idea.ideaTitle} className="p-3 min-w-[200px]">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-4 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-foreground pr-2">{idea.ideaTitle}</p>
                        <button onClick={() => removeIdea(idea.ideaTitle)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const best = bestIndex(row.getValue);
                return (
                  <tr key={row.label} className="border-t border-border/50">
                    <td className="text-sm text-muted-foreground p-3 font-medium">{row.label}</td>
                    {ideas.map((idea, i) => {
                      const val = row.getValue(idea);
                      return (
                        <td key={idea.ideaTitle} className={`p-3 text-center font-mono text-sm ${i === best ? "text-success font-bold" : "text-foreground"}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Winner callout */}
        {ideas.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card gradient-border-left p-5 mt-8"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Recommendation</p>
            <p className="text-foreground">
              <strong className="text-primary">{ideas.reduce((a, b) => a.overallScore > b.overallScore ? a : b).ideaTitle}</strong>
              {" "}scores highest overall. {ideas.reduce((a, b) => a.overallScore > b.overallScore ? a : b).checklistVerdict.detail}
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Compare;
