import { useParams, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SignalLogo } from "@/components/SignalLogo";
import { DemandScoreRing } from "@/components/DemandScoreRing";
import { QuoteCard } from "@/components/QuoteCard";
import { PainBreakdown } from "@/components/PainBreakdown";
import { CompetitiveLandscape } from "@/components/CompetitiveLandscape";
import { Recommendation } from "@/components/Recommendation";
import { ExportButtons } from "@/components/ExportButtons";
import { findTopicBySlug, getValidationReport } from "@/lib/mockData";

const Validate = () => {
  const { topic: topicSlug } = useParams<{ topic: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const slug = topicSlug || "";
  const topic = findTopicBySlug(slug);
  const report = getValidationReport(slug);
  const topicName = topic?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <SignalLogo size="sm" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-12">
        {/* Back link */}
        <Link
          to={`/discover?q=${encodeURIComponent(query)}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </Link>

        {/* Section 1: Header */}
        <section className="animate-fade-in-up">
          <h1 className="text-3xl font-bold text-foreground">{topicName}</h1>
          {topic && (
            <p className="text-base text-muted-foreground mt-2">{topic.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {report.platforms.map((p) => (
              <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {p}
              </span>
            ))}
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
              {report.signals} signals
            </span>
          </div>
        </section>

        {/* Export area for image capture */}
        <div id="proof-stack-export">
          {/* Section 2: Demand Score */}
          <section className="flex justify-center py-8">
            <DemandScoreRing score={report.demandScore} verdict={report.verdict} />
          </section>

          {/* Section 4: Real Quotes */}
          <section className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-foreground">What real people are saying</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.quotes.map((quote, i) => (
                <QuoteCard key={i} quote={quote} index={i} />
              ))}
            </div>
          </section>
        </div>

        {/* Section 3: Pain Breakdown */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Pain Categories</h2>
          <div className="glass-card p-6">
            <PainBreakdown categories={report.painCategories} />
          </div>
        </section>

        {/* Section 5: Competitive Landscape */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Competitive Landscape</h2>
          <CompetitiveLandscape competitors={report.competitors} />
        </section>

        {/* Section 6: Strategic Recommendation */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Strategic Recommendation</h2>
          <Recommendation text={report.recommendation} />
        </section>

        {/* Section 7: Export Actions */}
        <section className="space-y-4 pb-12">
          <h2 className="text-xl font-semibold text-foreground">Export</h2>
          <ExportButtons topicName={topicName} topicSlug={slug} report={report} />
        </section>
      </main>
    </div>
  );
};

export default Validate;
