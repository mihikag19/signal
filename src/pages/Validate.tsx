import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
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
import { getValidationReport } from "@/lib/mockData";
import { useCompareStore } from "@/lib/compareStore";

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono">{number}</span>
      <span className="text-xl font-semibold gradient-text">{label}</span>
    </div>
  );
}

const Validate = () => {
  const [searchParams] = useSearchParams();
  const ideaText = searchParams.get("idea") || "";
  const report = getValidationReport(ideaText);
  const { addIdea, hasIdea } = useCompareStore();
  const isInCompare = hasIdea(report.ideaTitle);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[120px]" />
      </div>

      <header className="relative border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/"><SignalLogo size="sm" /></Link>
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-6 py-8 space-y-14">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> New validation
        </Link>

        {/* Section 0: Hero Header */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-foreground">{report.ideaTitle}</h1>
          <p className="text-base text-muted-foreground mt-2">{report.ideaDescription}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {report.platforms.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{p}</span>
            ))}
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> Validated just now
            </span>
          </div>
        </motion.section>

        {/* Section 1: Overall Score */}
        <section>
          <SectionLabel number="01" label="Validation Score" />
          <div id="proof-stack-export">
            <div className="flex justify-center py-8">
              <ScoreHero report={report} />
            </div>
          </div>
        </section>

        {/* Section 2: Quadrant Grid */}
        <section>
          <SectionLabel number="02" label="Validation Quadrant" />
          <ValidationQuadrantGrid quadrants={report.quadrants} />
        </section>

        {/* Section 3: Mom Test */}
        <section>
          <SectionLabel number="03" label="Mom Test Analysis" />
          <MomTestAnalysis momTest={report.momTest} />
        </section>

        {/* Section 4: Quantitative Dashboard */}
        <section>
          <SectionLabel number="04" label="Quantitative Signals" />
          <QuantDashboard metrics={report.quantMetrics} />
        </section>

        {/* Section 5: Quotes */}
        <section>
          <SectionLabel number="05" label="What Real People Are Saying" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.quotes.map((quote, i) => (
              <QuoteCard key={i} quote={quote} index={i} />
            ))}
          </div>
        </section>

        {/* Section 5b: Pain Categories */}
        <section>
          <SectionLabel number="05b" label="Pain Categories" />
          <div className="glass-card p-6">
            <PainBreakdown categories={report.painCategories} />
          </div>
        </section>

        {/* Section 6: Competitive Landscape */}
        <section>
          <SectionLabel number="06" label="Competitive Landscape" />
          <CompetitiveLandscape competitors={report.competitors} />
        </section>

        {/* Section 7: Should You Build This? */}
        <section>
          <SectionLabel number="07" label="Should You Build This?" />
          <ShouldYouBuild checklist={report.checklist} verdict={report.checklistVerdict} />
        </section>

        {/* Section 8: Next Steps */}
        <section>
          <SectionLabel number="08" label="Recommended Next Steps" />
          <NextStepsSection steps={report.nextSteps} />
        </section>

        {/* Section 9: Export */}
        <section className="pb-12">
          <SectionLabel number="09" label="Export & Compare" />
          <ExportButtons
            report={report}
            onAddToCompare={() => addIdea(report)}
            isInCompare={isInCompare}
          />
        </section>
      </main>
    </div>
  );
};

export default Validate;
