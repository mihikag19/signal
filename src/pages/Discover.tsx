import { useSearchParams } from "react-router-dom";
import { SignalLogo } from "@/components/SignalLogo";
import { DiscoveryCard } from "@/components/DiscoveryCard";
import { getDiscoveryTopics } from "@/lib/mockData";

const Discover = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const topics = getDiscoveryTopics(query);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <SignalLogo size="sm" />
          <span className="text-muted-foreground text-sm">
            Results for: <span className="text-foreground font-medium">{query}</span>
          </span>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            {topics.length} opportunities discovered
          </h2>
          <span className="text-sm text-muted-foreground">Ranked by Attention Value</span>
        </div>

        <div className="space-y-4">
          {topics.map((topic, i) => (
            <DiscoveryCard key={topic.slug} topic={topic} index={i} query={query} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Discover;
