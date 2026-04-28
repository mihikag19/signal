import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SignalLogo } from "@/components/SignalLogo";
import { ScoreHero } from "@/components/ScoreHero";
import { ValidationQuadrantGrid } from "@/components/ValidationQuadrant";
import { MomTestAnalysis } from "@/components/MomTestAnalysis";
import { QuantDashboard } from "@/components/QuantDashboard";
import { QuoteCard } from "@/components/QuoteCard";
import { PainBreakdown } from "@/components/PainBreakdown";
import { CompetitiveLandscape } from "@/components/CompetitiveLandscape";
import { ShouldYouBuild } from "@/components/ShouldYouBuild";
import { NextStepsSection } from "@/components/NextSteps";
import { ExportButtons } from "@/components/ExportButtons";
import { validateIdea } from "@/lib/signalApi";
import { getValidationReport } from "@/lib/mockData";
import type { ValidationReport } from "@/types";
import { useCompareStore } from "@/lib/compareStore";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="section-label">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

const LOADING_STEPS = [
  "Scanning Reddit communities",
  "Searching Hacker News",
  "Extracting demand signals",
  "Running AI analysis",
  "Scoring validation metrics",
  "Building your report",
];

function LoadingScreen({ idea }: { idea: string }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < LOADING_STEPS.length - 1 ? s + 1 : s));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center space-y-8 px-6">
        <Loader2 className="w-6 h-6 text-foreground/40 animate-spin mx-auto" />
        <div>
          <h2 className="text-lg font-medium text-foreground mb-2">Validating your idea</h2>
          <p className="text-sm text-muted-foreground">"{idea}"</p>
        </div>
        <div className="space-y-2.5 text-left">
          {LOADING_STEPS.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-sm transition-opacity duration-500 ${
                i <= step ? "opacity-100" : "opacity-20"
              }`}
            >
              {i < step ? (
                <span className="w-3.5 h-3.5 rounded-full bg-foreground/10 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
                </span>
              ) : i === step ? (
                <Loader2 className="w-3.5 h-3.5 text-foreground/50 animate-spin" />
              ) : (
                <span className="w-3.5 h-3.5" />
              )}
              <span className={i <= step ? "text-foreground" : "text-muted-foreground"}>
                {label}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground/60">Usually takes 20–40 seconds</p>
      </div>
    </div>
  );
}

const Validate = () => {
  const [searchParams] = useSearchParams();
  const ideaText = searchParams.get("idea") || "";
  const { addIdea, hasIdea } = useCompareStore();

  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);
      try {
        const result = await validateIdea(ideaText);
        if (!cancelled) setReport(result);
      } catch (e) {
        console.error("Validation failed, falling back to mock:", e);
        if (!cancelled) {
          setReport(getValidationReport(ideaText));
          setError("Live scraping unavailable — showing demo data. " + String(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (ideaText) run();
    return () => {
      cancelled = true;
    };
  }, [ideaText]);

  if (loading) return <LoadingScreen idea={ideaText} />;
  if (!report)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground">
        No report available.
      </div>
    );

  const isInCompare = hasIdea(report.ideaTitle);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <SignalLogo size="sm" />
          {error && (
            <span className="text-xs text-warning bg-warning/10 px-2.5 py-1 rounded-full">
              Demo mode
            </span>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        {/* Back link */}
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> New validation
        </Link>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            {report.ideaTitle}
          </h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {report.ideaDescription}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {report.platforms.map((p) => (
              <span
                key={p}
                className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Score */}
        <section>
          <SectionDivider label="Validation Score" />
          <div id="proof-stack-export" className="mt-6">
            <ScoreHero report={report} />
          </div>
        </section>

        {/* Quadrant */}
        <section>
          <SectionDivider label="Validation Quadrant" />
          <div className="mt-6">
            <ValidationQuadrantGrid quadrants={report.quadrants} />
          </div>
        </section>

        {/* Mom Test */}
        <section>
          <SectionDivider label="Mom Test Analysis" />
          <div className="mt-6">
            <MomTestAnalysis momTest={report.momTest} />
          </div>
        </section>

        {/* Quant */}
        <section>
          <SectionDivider label="Quantitative Signals" />
          <div className="mt-6">
            <QuantDashboard metrics={report.quantMetrics} />
          </div>
        </section>

        {/* Quotes */}
        <section>
          <SectionDivider label="What People Are Saying" />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.quotes.map((quote, i) => (
              <QuoteCard key={i} quote={quote} index={i} />
            ))}
          </div>
        </section>

        {/* Pain Categories */}
        <section>
          <SectionDivider label="Pain Categories" />
          <div className="mt-6 surface-card p-5">
            <PainBreakdown categories={report.painCategories} />
          </div>
        </section>

        {/* Competition */}
        <section>
          <SectionDivider label="Competitive Landscape" />
          <div className="mt-6">
            <CompetitiveLandscape competitors={report.competitors} />
          </div>
        </section>

        {/* Should You Build */}
        <section>
          <SectionDivider label="Should You Build This?" />
          <div className="mt-6">
            <ShouldYouBuild checklist={report.checklist} verdict={report.checklistVerdict} />
          </div>
        </section>

        {/* Next Steps */}
        <section>
          <SectionDivider label="Recommended Next Steps" />
          <div className="mt-6">
            <NextStepsSection steps={report.nextSteps} />
          </div>
        </section>

        {/* Export */}
        <section className="pb-16">
          <SectionDivider label="Export" />
          <div className="mt-6">
            <ExportButtons
              report={report}
              onAddToCompare={() => addIdea(report)}
              isInCompare={isInCompare}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Validate;
