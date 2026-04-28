import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SignalLogo } from "@/components/SignalLogo";
import { useCompareStore } from "@/lib/compareStore";
import { ArrowLeft, X } from "lucide-react";

function getScoreClass(score: number) {
  if (score >= 70) return "score-green";
  if (score >= 40) return "score-amber";
  return "score-red";
}

const Compare = () => {
  const { ideas, removeIdea } = useCompareStore();

  if (ideas.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <SignalLogo size="sm" />
          </div>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <p className="text-xl font-medium text-foreground mb-2">No ideas to compare yet</p>
          <p className="text-muted-foreground text-sm mb-6">
            Validate 2+ ideas, then add them to compare.
          </p>
          <Link to="/app" className="btn-primary text-sm">
            Validate an idea
          </Link>
        </div>
      </div>
    );
  }

  const rows: {
    label: string;
    getValue: (r: (typeof ideas)[0]) => string;
  }[] = [
    { label: "Overall Score", getValue: (r) => `${r.overallScore}/100` },
    { label: "Founder Signal", getValue: (r) => `${r.founderSignal.score}/100` },
    { label: "Investor Signal", getValue: (r) => `${r.investorSignal.score}/100` },
    { label: "Mom Test", getValue: (r) => `${r.momTest.score}/${r.momTest.maxScore}` },
    { label: "Total Signals", getValue: (r) => String(r.quantMetrics.totalSignals) },
    { label: "Pay Signals", getValue: (r) => String(r.quantMetrics.paySignals) },
    { label: "Competition", getValue: (r) => r.competitors.density },
    { label: "Buildability", getValue: (r) => `${r.quadrants.internalQuant.score}/100` },
    {
      label: "Checklist",
      getValue: (r) => `${r.checklistVerdict.greenCount}/${r.checklistVerdict.total}`,
    },
    { label: "Verdict", getValue: (r) => r.checklistVerdict.recommendation },
  ];

  function bestIndex(getValue: (r: (typeof ideas)[0]) => string): number {
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
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <SignalLogo size="sm" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-1">
            Compare Ideas
          </h1>
          <p className="text-sm text-muted-foreground mb-8">
            Side-by-side validation comparison.
          </p>
        </motion.div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs uppercase tracking-[0.12em] text-muted-foreground/60 p-3 min-w-[120px]">
                  Metric
                </th>
                {ideas.map((idea, i) => (
                  <th key={idea.ideaTitle} className="p-3 min-w-[180px]">
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="surface-card p-3 text-left"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-foreground pr-2">
                          {idea.ideaTitle}
                        </p>
                        <button
                          onClick={() => removeIdea(idea.ideaTitle)}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
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
                    <td className="text-sm text-muted-foreground p-3">{row.label}</td>
                    {ideas.map((idea, i) => {
                      const val = row.getValue(idea);
                      return (
                        <td
                          key={idea.ideaTitle}
                          className={`p-3 text-center font-mono text-sm ${
                            i === best ? "font-semibold text-foreground" : "text-muted-foreground"
                          }`}
                        >
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

        {ideas.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="surface-card border-l-2 border-foreground/20 p-4 mt-8"
          >
            <p className="section-label mb-1">Recommendation</p>
            <p className="text-sm text-foreground">
              <span className="font-medium">
                {
                  ideas.reduce((a, b) =>
                    a.overallScore > b.overallScore ? a : b
                  ).ideaTitle
                }
              </span>{" "}
              scores highest overall.{" "}
              {
                ideas.reduce((a, b) =>
                  a.overallScore > b.overallScore ? a : b
                ).checklistVerdict.detail
              }
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Compare;
