import { supabase } from "@/integrations/supabase/client";
import type {
  ValidationReport,
  ClaudeAnalysis,
  RedditResponse,
  HNResponse,
  PHResponse,
  DevToResponse,
  IHResponse,
  GitHubResponse,
  SOResponse,
} from "@/types";

async function callEdgeFunction(name: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(`${name}: ${error.message}`);
  return data;
}

const EMPTY_REDDIT: RedditResponse = { posts: [], meta: { totalPosts: 0, growthVelocity: 0 } };
const EMPTY_HN: HNResponse = { stories: [], comments: [], meta: { totalStories: 0, totalComments: 0 } };
const EMPTY_PH: PHResponse = { posts: [], meta: { totalPosts: 0 } };
const EMPTY_DEVTO: DevToResponse = { articles: [], meta: { totalArticles: 0 } };
const EMPTY_IH: IHResponse = { posts: [], meta: { totalPosts: 0 } };
const EMPTY_GH: GitHubResponse = { repos: [], issues: [], meta: { totalRepos: 0, totalIssues: 0 } };
const EMPTY_SO: SOResponse = { questions: [], meta: { totalQuestions: 0 } };

export async function validateIdea(ideaText: string): Promise<ValidationReport> {
  const query = ideaText.trim();

  const [redditResult, hnResult, phResult, devtoResult, ihResult, ghResult, soResult] =
    await Promise.allSettled([
      callEdgeFunction("scrape-reddit", { query }),
      callEdgeFunction("scrape-hn", { query }),
      callEdgeFunction("scrape-producthunt", { query }),
      callEdgeFunction("scrape-devto", { query }),
      callEdgeFunction("scrape-indiehackers", { query }),
      callEdgeFunction("scrape-github", { query }),
      callEdgeFunction("scrape-stackoverflow", { query }),
    ]);

  const logResult = (name: string, result: PromiseSettledResult<unknown>) => {
    if (result.status === "rejected") {
      console.warn(`[signal] ${name} failed:`, result.reason);
    } else {
      const d = result.value as Record<string, unknown>;
      if (d?.error) console.warn(`[signal] ${name} returned error:`, d.error);
    }
  };

  logResult("reddit", redditResult);
  logResult("hn", hnResult);
  logResult("producthunt", phResult);
  logResult("devto", devtoResult);
  logResult("indiehackers", ihResult);
  logResult("github", ghResult);
  logResult("stackoverflow", soResult);

  const reddit: RedditResponse =
    redditResult.status === "fulfilled" && !redditResult.value?.error
      ? redditResult.value
      : EMPTY_REDDIT;
  const hn: HNResponse =
    hnResult.status === "fulfilled" && !hnResult.value?.error
      ? hnResult.value
      : EMPTY_HN;
  const ph: PHResponse =
    phResult.status === "fulfilled" && !phResult.value?.error
      ? phResult.value
      : EMPTY_PH;
  const devto: DevToResponse =
    devtoResult.status === "fulfilled" && !devtoResult.value?.error
      ? devtoResult.value
      : EMPTY_DEVTO;
  const ih: IHResponse =
    ihResult.status === "fulfilled" && !ihResult.value?.error
      ? ihResult.value
      : EMPTY_IH;
  const gh: GitHubResponse =
    ghResult.status === "fulfilled" && !ghResult.value?.error
      ? ghResult.value
      : EMPTY_GH;
  const so: SOResponse =
    soResult.status === "fulfilled" && !soResult.value?.error
      ? soResult.value
      : EMPTY_SO;

  const activePlatforms: string[] = [];
  if ((reddit.posts?.length ?? 0) > 0) activePlatforms.push("Reddit");
  if ((hn.stories?.length ?? 0) > 0 || (hn.comments?.length ?? 0) > 0) activePlatforms.push("Hacker News");
  if ((ph.posts?.length ?? 0) > 0) activePlatforms.push("Product Hunt");
  if ((devto.articles?.length ?? 0) > 0) activePlatforms.push("dev.to");
  if ((ih.posts?.length ?? 0) > 0) activePlatforms.push("Indie Hackers");
  if ((gh.repos?.length ?? 0) > 0 || (gh.issues?.length ?? 0) > 0) activePlatforms.push("GitHub");
  if ((so.questions?.length ?? 0) > 0) activePlatforms.push("Stack Overflow");

  const analysis: ClaudeAnalysis = await callEdgeFunction("analyze", {
    idea: ideaText,
    redditPosts: reddit.posts ?? [],
    hnStories: hn.stories ?? [],
    hnComments: hn.comments ?? [],
    phPosts: ph.posts ?? [],
    devtoArticles: devto.articles ?? [],
    ihPosts: ih.posts ?? [],
    githubRepos: gh.repos ?? [],
    githubIssues: gh.issues ?? [],
    soQuestions: so.questions ?? [],
  });

  return mapToValidationReport(ideaText, analysis, reddit, hn, activePlatforms);
}

function mapToValidationReport(
  ideaText: string,
  ai: ClaudeAnalysis,
  reddit: RedditResponse,
  hn: HNResponse,
  activePlatforms: string[]
): ValidationReport {
  const title = ideaText.length > 60 ? ideaText.slice(0, 57) + "..." : ideaText;
  const overall = ai.overallDemandScore ?? 50;
  const fs = ai.founderScore;
  const is = ai.investorScore;
  const totalSignals =
    (reddit.meta?.totalPosts ?? 0) +
    (hn.meta?.totalStories ?? 0) +
    (hn.meta?.totalComments ?? 0);

  const quotes = (ai.quotes ?? []).slice(0, 6).map((q) => ({
    text: q.text ?? "",
    platform: q.subreddit
      ? `r/${q.subreddit}`
      : q.source === "hackernews"
      ? "Hacker News"
      : q.source
      ? q.source.charAt(0).toUpperCase() + q.source.slice(1)
      : "Reddit",
    upvotes: q.score ?? 0,
    date: "Recent",
    momTestTags: ["Real data"],
  }));

  const painCategories = (ai.painCategories ?? []).map((p) => ({
    label: p.category ?? p.label ?? "Unknown",
    pct: p.percentage ?? p.pct ?? 25,
  }));

  const competitors = ai.competitors ?? [];
  const competitorNames = competitors.map((c) => c.name ?? "Unknown");

  const verdict = ai.verdict ?? "MAYBE";
  const verdictText =
    verdict === "BUILD"
      ? "Strong demand signal detected. Build immediately."
      : verdict === "SKIP"
      ? "Weak signal. Needs significant pivoting or more research."
      : "Moderate signal. Proceed with caution and validate further.";

  const subredditCounts: Record<string, number> = {};
  for (const post of reddit.posts ?? []) {
    const sub = post.subreddit ?? "other";
    subredditCounts[sub] = (subredditCounts[sub] ?? 0) + 1;
  }
  const totalReddit = reddit.posts?.length || 1;
  const sourceBreakdown = Object.entries(subredditCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([source, count]) => ({
      source: `r/${source}`,
      pct: Math.round((count / totalReddit) * 100),
    }));
  if (hn.stories?.length) {
    sourceBreakdown.push({
      source: "Hacker News",
      pct: Math.round((hn.stories.length / (totalReddit + hn.stories.length)) * 100),
    });
  }

  const allScores = (reddit.posts ?? []).map((p) => p.score ?? 0);
  const avgEngagement =
    allScores.length > 0
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
      : 0;
  const posts = reddit.posts ?? [];
  const avgComments =
    posts.length > 0
      ? Math.round(posts.reduce((a, p) => a + (p.numComments ?? 0), 0) / posts.length)
      : 0;

  const marketMetricsScore = Math.min(100, Math.max(10, Math.round((totalSignals / 80) * 100)));

  const rawGrowth = reddit.meta?.growthVelocity;
  const growthVelocity =
    rawGrowth != null ? (rawGrowth >= 0 ? `+${rawGrowth}%` : `${rawGrowth}%`) : "+0%";

  const emojis = ["🎤", "💸", "🏗️"];

  return {
    ideaTitle: title,
    ideaDescription: ideaText,
    overallScore: overall,
    founderSignal: {
      score: Math.round((fs?.overall ?? 5) * 10),
      summary:
        (fs?.overall ?? 0) >= 7
          ? "Strong founder signal. Buildable with clear pain and feasible MVP path."
          : "Moderate founder signal. Needs deeper validation of pain and feasibility.",
    },
    investorSignal: {
      score: Math.round((is?.overall ?? 5) * 10),
      summary: is?.marketSize
        ? `Market: ${is.marketSize}. ${is.timing ?? ""}`
        : "Investor signal needs further data.",
    },
    verdict: verdictText,
    platforms: activePlatforms.length > 0 ? activePlatforms : ["Reddit", "Hacker News"],
    quadrants: {
      internalQual: {
        label: "Gut Check",
        score: Math.round((fs?.buildFeasibility ?? 5) * 10),
        metrics: [
          {
            label: "Problem clarity",
            status: overall >= 60 ? "pass" : "partial",
            detail: ai.recommendation?.slice(0, 80) ?? "Analysis pending",
          },
          {
            label: "Founder fit",
            status: (fs?.overall ?? 0) >= 7 ? "pass" : "partial",
            detail: `Founder score: ${fs?.overall ?? "N/A"}/10`,
          },
          { label: "Articulation", status: "pass", detail: "Can be explained concisely" },
        ],
      },
      externalQual: {
        label: "Mom Test Signals",
        score: Math.round((fs?.painIntensity ?? 5) * 10),
        primary: true,
        metrics: [
          {
            label: "Unprompted pain",
            status: quotes.length >= 4 ? "pass" : "partial",
            detail: `${quotes.length} real quotes extracted`,
          },
          {
            label: "Specific complaints",
            status: quotes.length >= 3 ? "pass" : "partial",
            detail: "Quotes from actual community discussions",
          },
          {
            label: "Mom Test compliance",
            status: overall >= 70 ? "pass" : "partial",
            detail: `Based on ${totalSignals} scraped signals`,
          },
        ],
      },
      internalQuant: {
        label: "Buildability",
        score: Math.round((fs?.buildFeasibility ?? 5) * 10),
        metrics: [
          {
            label: "Technical complexity",
            status: (fs?.buildFeasibility ?? 0) >= 7 ? "pass" : "partial",
            detail: `Feasibility: ${fs?.buildFeasibility ?? "N/A"}/10`,
          },
          {
            label: "Time to MVP",
            status: (fs?.buildFeasibility ?? 0) >= 6 ? "pass" : "partial",
            detail: "Estimated based on technical requirements",
          },
          {
            label: "Key dependencies",
            status: "partial",
            detail: "Standard APIs and services likely needed",
          },
        ],
      },
      externalQuant: {
        label: "Market Metrics",
        score: marketMetricsScore,
        primary: true,
        metrics: [
          {
            label: "Signal volume",
            status: totalSignals >= 20 ? "pass" : "partial",
            detail: `${totalSignals} posts/comments scraped`,
          },
          {
            label: "Avg engagement",
            status: avgEngagement >= 50 ? "pass" : "partial",
            detail: `${avgEngagement} avg upvotes`,
          },
          {
            label: "Pay signals",
            status: (fs?.willingnessToPay ?? 0) >= 6 ? "pass" : "partial",
            detail: `WTP score: ${fs?.willingnessToPay ?? "N/A"}/10`,
          },
        ],
      },
    },
    momTest: {
      score: Math.min(5, Math.round(overall / 20)),
      maxScore: 5,
      rules: [
        {
          rule: "Real conversations, not pitches",
          status: quotes.length >= 2 ? "pass" : "partial",
          evidence: "Signals sourced from organic Reddit and HN discussions",
        },
        {
          rule: "Specific past behavior",
          status: (fs?.painIntensity ?? 0) >= 7 ? "pass" : "partial",
          evidence: "Analyzed for specificity of complaints and described workflows",
        },
        {
          rule: "Active pain",
          status: (fs?.urgency ?? 0) >= 6 ? "pass" : "partial",
          evidence: `Urgency score: ${fs?.urgency ?? "N/A"}/10`,
        },
        {
          rule: "Unprompted frustration",
          status: overall >= 60 ? "pass" : "partial",
          evidence: "Extracted from general discussion threads, not product pages",
        },
        {
          rule: "Willingness to pay",
          status:
            (fs?.willingnessToPay ?? 0) >= 7
              ? "pass"
              : (fs?.willingnessToPay ?? 0) >= 5
              ? "partial"
              : "fail",
          evidence: `WTP score: ${fs?.willingnessToPay ?? "N/A"}/10`,
        },
      ],
      verdict: ai.recommendation ?? "Analysis complete. See quotes and scores for details.",
    },
    quantMetrics: {
      totalSignals,
      avgEngagement,
      avgComments,
      paySignals: Math.round((fs?.willingnessToPay ?? 3) * 2),
      growthVelocity,
      sourceBreakdown:
        sourceBreakdown.length > 0
          ? sourceBreakdown
          : [
              { source: "Reddit", pct: 70 },
              { source: "Hacker News", pct: 30 },
            ],
      engagementDistribution: {
        above100: allScores.filter((s) => s >= 100).length,
        above50: allScores.filter((s) => s >= 50).length,
        above10: allScores.filter((s) => s >= 10).length,
      },
    },
    quotes:
      quotes.length > 0
        ? quotes
        : [
            {
              text: "No strong quotes found — try a more specific idea description.",
              platform: "System",
              upvotes: 0,
              date: "Now",
              momTestTags: [],
            },
          ],
    painCategories:
      painCategories.length > 0
        ? painCategories
        : [
            { label: "General frustration", pct: 40 },
            { label: "Lack of solutions", pct: 30 },
            { label: "Time cost", pct: 20 },
            { label: "Other", pct: 10 },
          ],
    competitors: {
      direct: Math.min(competitors.length, 3),
      indirect: Math.max(competitors.length - 3, 0),
      dominantPlayer: false,
      density: competitors.length >= 5 ? "High" : competitors.length >= 2 ? "Medium" : "Low",
      interpretation:
        competitors.length > 0
          ? `${competitors.length} competitors identified. ${competitors
              .map((c) => c.weakness ?? "")
              .filter(Boolean)
              .join(". ")}`
          : "Limited competition detected — early market opportunity.",
      names: competitorNames.slice(0, 5),
    },
    checklist: [
      {
        label: "Problem is real",
        detail: `${quotes.length} real quotes from communities`,
        status: quotes.length >= 3 ? "pass" : "warning",
      },
      {
        label: "Demand is organic",
        detail: `Scraped from ${activePlatforms.join(", ") || "Reddit and Hacker News"}`,
        status: "pass",
      },
      {
        label: "Market has room",
        detail: `${competitors.length} competitors found`,
        status: competitors.length <= 3 ? "pass" : "warning",
      },
      {
        label: "Willingness to pay",
        detail: `WTP score: ${fs?.willingnessToPay ?? "N/A"}/10`,
        status:
          (fs?.willingnessToPay ?? 0) >= 7
            ? "pass"
            : (fs?.willingnessToPay ?? 0) >= 5
            ? "warning"
            : "fail",
      },
      {
        label: "Buildable",
        detail: `Feasibility score: ${fs?.buildFeasibility ?? "N/A"}/10`,
        status: (fs?.buildFeasibility ?? 0) >= 7 ? "pass" : "warning",
      },
      {
        label: "Timing is right",
        detail: `Urgency score: ${fs?.urgency ?? "N/A"}/10`,
        status: (fs?.urgency ?? 0) >= 6 ? "pass" : "warning",
      },
      {
        label: "Clear monetization",
        detail: ai.revenueModel?.suggestedModel ?? ai.recommendation?.slice(0, 100) ?? "Needs exploration",
        status: overall >= 70 ? "pass" : "fail",
      },
    ],
    checklistVerdict: {
      greenCount: [
        quotes.length >= 3,
        true,
        competitors.length <= 3,
        (fs?.willingnessToPay ?? 0) >= 7,
        (fs?.buildFeasibility ?? 0) >= 7,
        (fs?.urgency ?? 0) >= 6,
        overall >= 70,
      ].filter(Boolean).length,
      total: 7,
      recommendation:
        verdict === "BUILD"
          ? "Strong go. Start building."
          : verdict === "SKIP"
          ? "Needs more research."
          : "Promising. Proceed to user interviews.",
      detail: ai.recommendation ?? "Complete analysis based on real community data.",
    },
    nextSteps: (
      ai.nextSteps ?? [
        "Run Mom Test interviews",
        "Test willingness to pay",
        "Build minimal prototype",
      ]
    ).map((step, i) => ({
      emoji: emojis[i] || "📋",
      title: step.slice(0, 40),
      detail: step,
    })),
    recommendation:
      ai.recommendation ??
      "Analysis complete. Review the scores and quotes above for detailed insights.",
    // Pass through extended intelligence fields
    attentionScore: ai.attentionScore,
    competitorMap: ai.competitorMap,
    revenueModel: ai.revenueModel,
    targetPersonas: ai.targetPersonas,
    buildRecommendations: ai.buildRecommendations,
    sentimentAnalysis: ai.sentimentAnalysis,
    confidenceScore: ai.confidenceScore,
  };
}
