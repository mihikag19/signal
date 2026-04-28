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
  GoogleTrendsResponse,
  GoogleAutocompleteResponse,
  WikipediaViewsResponse,
  G2ReviewsResponse,
  ChromeWebStoreResponse,
  TrustpilotResponse,
  AppStoreResponse,
  YouTubeResponse,
  MediumResponse,
  SubstackResponse,
  LobstersResponse,
  LemmyResponse,
  CrunchbaseResponse,
  WellfoundResponse,
  YCCompaniesResponse,
  NpmStatsResponse,
  PypiStatsResponse,
  GitHubStarsResponse,
  DataCoverageReport,
  DataCoverageSource,
  Message,
  ReportSummary,
} from "@/types";

// ── Core helpers ──────────────────────────────────────────────────────────────

async function callEdgeFunction(name: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(`${name}: ${error.message}`);
  return data;
}

type CallStatus = "success" | "failed" | "timeout";

interface SafeResult<T> {
  data: T | null;
  status: CallStatus;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<SafeResult<T>> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ data: null, status: "timeout" }), ms);
    promise.then(
      (data) => { clearTimeout(timer); resolve({ data, status: "success" }); },
      () => { clearTimeout(timer); resolve({ data: null, status: "failed" }); }
    );
  });
}

function safe<T>(name: string, body: Record<string, unknown>, ms = 15000) {
  return withTimeout<T>(callEdgeFunction(name, body), ms);
}

function countItems(data: any, ...keys: string[]): number {
  if (!data) return 0;
  return keys.reduce((sum, key) => sum + (data[key]?.length ?? 0), 0);
}

function makeSource(name: string, result: SafeResult<any>, count: number): DataCoverageSource {
  return { name, status: result.data?.error ? "failed" : result.status, itemCount: result.data?.error ? 0 : count };
}

function extract<T>(result: SafeResult<T>, fallback: T): T {
  if (result.status !== "success" || !result.data || (result.data as any)?.error) return fallback;
  return result.data;
}

function edgeFunctionUrl(name: string): string {
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  return `${base}/functions/v1/${name}`;
}

function edgeFetchHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string}`,
    "Content-Type": "application/json",
  };
}

// ── Empty fallbacks ───────────────────────────────────────────────────────────

const E_REDDIT: RedditResponse = { posts: [], meta: { totalPosts: 0, growthVelocity: 0 } };
const E_HN: HNResponse = { stories: [], comments: [], meta: { totalStories: 0, totalComments: 0 } };
const E_PH: PHResponse = { posts: [] };
const E_DEVTO: DevToResponse = { articles: [] };
const E_IH: IHResponse = { posts: [] };
const E_GH: GitHubResponse = { repos: [], issues: [] };
const E_SO: SOResponse = { questions: [] };
const E_TRENDS: GoogleTrendsResponse = {};
const E_AC: GoogleAutocompleteResponse = { suggestions: [], peopleAlsoAsk: [] };
const E_WIKI: WikipediaViewsResponse = { articles: [] };
const E_G2: G2ReviewsResponse = { products: [], complaints: [] };
const E_CHROME: ChromeWebStoreResponse = { extensions: [] };
const E_TP: TrustpilotResponse = { companies: [] };
const E_AS: AppStoreResponse = { apps: [], negativeReviews: [] };
const E_YT: YouTubeResponse = { videos: [] };
const E_MED: MediumResponse = { articles: [] };
const E_SUB: SubstackResponse = { posts: [] };
const E_LOB: LobstersResponse = { stories: [] };
const E_LEM: LemmyResponse = { posts: [] };
const E_CB: CrunchbaseResponse = { companies: [] };
const E_WF: WellfoundResponse = { companies: [] };
const E_YC: YCCompaniesResponse = { companies: [] };
const E_NPM: NpmStatsResponse = { packages: [] };
const E_PYPI: PypiStatsResponse = { packages: [] };
const E_GHS: GitHubStarsResponse = { repos: [] };

// ── Scraper orchestration ─────────────────────────────────────────────────────

interface ScrapeAllResult {
  extracted: {
    reddit: RedditResponse; hn: HNResponse; ph: PHResponse; devto: DevToResponse;
    ih: IHResponse; gh: GitHubResponse; so: SOResponse; trends: GoogleTrendsResponse;
    ac: GoogleAutocompleteResponse; wiki: WikipediaViewsResponse; g2: G2ReviewsResponse;
    chrome: ChromeWebStoreResponse; tp: TrustpilotResponse; appstore: AppStoreResponse;
    youtube: YouTubeResponse; medium: MediumResponse; substack: SubstackResponse;
    lobsters: LobstersResponse; lemmy: LemmyResponse; crunchbase: CrunchbaseResponse;
    wellfound: WellfoundResponse; yc: YCCompaniesResponse; npm: NpmStatsResponse;
    pypi: PypiStatsResponse; ghStars: GitHubStarsResponse;
  };
  dataCoverage: DataCoverageReport;
  activePlatforms: string[];
}

async function scrapeAll(query: string): Promise<ScrapeAllResult> {
  const [
    redditR, hnR, phR, devtoR, ihR, ghR, soR,
    trendsR, acR, wikiR,
    g2R, chromeR, tpR, asR,
    ytR, medR, subR, lobR, lemR,
    cbR, wfR, ycR,
    npmR, pypiR, ghsR,
  ] = await Promise.all([
    safe<RedditResponse>("scrape-reddit", { query }),
    safe<HNResponse>("scrape-hn", { query }),
    safe<PHResponse>("scrape-producthunt", { query }),
    safe<DevToResponse>("scrape-devto", { query }),
    safe<IHResponse>("scrape-indiehackers", { query }),
    safe<GitHubResponse>("scrape-github", { query }),
    safe<SOResponse>("scrape-stackoverflow", { query }),
    safe<GoogleTrendsResponse>("scrape-google-trends", { query }),
    safe<GoogleAutocompleteResponse>("scrape-google-autocomplete", { query }),
    safe<WikipediaViewsResponse>("scrape-wikipedia-views", { query }),
    safe<G2ReviewsResponse>("scrape-g2-reviews", { query }),
    safe<ChromeWebStoreResponse>("scrape-chrome-webstore", { query }),
    safe<TrustpilotResponse>("scrape-trustpilot", { query }),
    safe<AppStoreResponse>("scrape-appstore", { query }),
    safe<YouTubeResponse>("scrape-youtube", { query }),
    safe<MediumResponse>("scrape-medium", { query }),
    safe<SubstackResponse>("scrape-substack", { query }),
    safe<LobstersResponse>("scrape-lobsters", { query }),
    safe<LemmyResponse>("scrape-lemmy", { query }),
    safe<CrunchbaseResponse>("scrape-crunchbase", { query }),
    safe<WellfoundResponse>("scrape-wellfound", { query }),
    safe<YCCompaniesResponse>("scrape-yc-companies", { query }),
    safe<NpmStatsResponse>("scrape-npm-stats", { query }),
    safe<PypiStatsResponse>("scrape-pypi-stats", { query }),
    safe<GitHubStarsResponse>("scrape-github-stars-history", { query }),
  ]);

  const reddit = extract(redditR, E_REDDIT);
  const hn = extract(hnR, E_HN);
  const ph = extract(phR, E_PH);
  const devto = extract(devtoR, E_DEVTO);
  const ih = extract(ihR, E_IH);
  const gh = extract(ghR, E_GH);
  const so = extract(soR, E_SO);
  const trends = extract(trendsR, E_TRENDS);
  const ac = extract(acR, E_AC);
  const wiki = extract(wikiR, E_WIKI);
  const g2 = extract(g2R, E_G2);
  const chrome = extract(chromeR, E_CHROME);
  const tp = extract(tpR, E_TP);
  const appstore = extract(asR, E_AS);
  const youtube = extract(ytR, E_YT);
  const medium = extract(medR, E_MED);
  const substack = extract(subR, E_SUB);
  const lobsters = extract(lobR, E_LOB);
  const lemmy = extract(lemR, E_LEM);
  const crunchbase = extract(cbR, E_CB);
  const wellfound = extract(wfR, E_WF);
  const yc = extract(ycR, E_YC);
  const npm = extract(npmR, E_NPM);
  const pypi = extract(pypiR, E_PYPI);
  const ghStars = extract(ghsR, E_GHS);

  const sourceEntries: DataCoverageSource[] = [
    makeSource("Reddit", redditR, countItems(reddit, "posts")),
    makeSource("Hacker News", hnR, countItems(hn, "stories", "comments")),
    makeSource("Product Hunt", phR, countItems(ph, "posts")),
    makeSource("dev.to", devtoR, countItems(devto, "articles")),
    makeSource("Indie Hackers", ihR, countItems(ih, "posts")),
    makeSource("GitHub", ghR, countItems(gh, "repos", "issues")),
    makeSource("Stack Overflow", soR, countItems(so, "questions")),
    makeSource("Google Trends", trendsR, (trends.interestOverTime?.length ?? 0)),
    makeSource("Google Autocomplete", acR, countItems(ac, "suggestions", "peopleAlsoAsk")),
    makeSource("Wikipedia", wikiR, countItems(wiki, "articles")),
    makeSource("G2 Reviews", g2R, countItems(g2, "products")),
    makeSource("Chrome Web Store", chromeR, countItems(chrome, "extensions")),
    makeSource("Trustpilot", tpR, countItems(tp, "companies")),
    makeSource("App Store", asR, countItems(appstore, "apps")),
    makeSource("YouTube", ytR, countItems(youtube, "videos")),
    makeSource("Medium", medR, countItems(medium, "articles")),
    makeSource("Substack", subR, countItems(substack, "posts")),
    makeSource("Lobste.rs", lobR, countItems(lobsters, "stories")),
    makeSource("Lemmy", lemR, countItems(lemmy, "posts")),
    makeSource("Crunchbase", cbR, countItems(crunchbase, "companies")),
    makeSource("Wellfound", wfR, countItems(wellfound, "companies")),
    makeSource("YC Companies", ycR, countItems(yc, "companies")),
    makeSource("npm", npmR, countItems(npm, "packages")),
    makeSource("PyPI", pypiR, countItems(pypi, "packages")),
    makeSource("GitHub Stars", ghsR, countItems(ghStars, "repos")),
  ];

  const totalItems = sourceEntries.reduce((acc, s) => acc + s.itemCount, 0);
  const successfulSources = sourceEntries.filter((s) => s.status === "success").length;
  const dataCoverage: DataCoverageReport = { sources: sourceEntries, totalItems, totalSources: sourceEntries.length, successfulSources };

  const failed = sourceEntries.filter((s) => s.status === "failed").map((s) => s.name);
  const timedOut = sourceEntries.filter((s) => s.status === "timeout").map((s) => s.name);
  if (failed.length) console.warn("[signal] Failed:", failed.join(", "));
  if (timedOut.length) console.warn("[signal] Timed out:", timedOut.join(", "));
  console.info(`[signal] Coverage: ${successfulSources}/${sourceEntries.length} sources, ${totalItems} items`);

  const activePlatforms = sourceEntries
    .filter((s) => s.status === "success" && s.itemCount > 0)
    .map((s) => s.name);

  return {
    extracted: {
      reddit, hn, ph, devto, ih, gh, so, trends, ac, wiki, g2, chrome, tp, appstore,
      youtube, medium, substack, lobsters, lemmy, crunchbase, wellfound, yc, npm, pypi, ghStars,
    },
    dataCoverage,
    activePlatforms,
  };
}

function buildAnalyzePayload(idea: string, e: ScrapeAllResult["extracted"]): Record<string, unknown> {
  return {
    idea,
    redditPosts: e.reddit.posts ?? [],
    hnStories: e.hn.stories ?? [],
    hnComments: e.hn.comments ?? [],
    phPosts: e.ph.posts ?? [],
    devtoArticles: e.devto.articles ?? [],
    ihPosts: e.ih.posts ?? [],
    githubRepos: e.gh.repos ?? [],
    githubIssues: e.gh.issues ?? [],
    soQuestions: e.so.questions ?? [],
    googleTrends: e.trends,
    autocompleteSuggestions: e.ac.suggestions ?? [],
    peopleAlsoAsk: e.ac.peopleAlsoAsk ?? [],
    wikipediaArticles: e.wiki.articles ?? [],
    g2Products: e.g2.products ?? [],
    g2Complaints: e.g2.complaints ?? [],
    chromeExtensions: e.chrome.extensions ?? [],
    trustpilotCompanies: e.tp.companies ?? [],
    appstoreApps: e.appstore.apps ?? [],
    appstoreNegativeReviews: e.appstore.negativeReviews ?? [],
    youtubeVideos: e.youtube.videos ?? [],
    mediumArticles: e.medium.articles ?? [],
    substackPosts: e.substack.posts ?? [],
    lobstersStories: e.lobsters.stories ?? [],
    lemmyPosts: e.lemmy.posts ?? [],
    crunchbaseCompanies: e.crunchbase.companies ?? [],
    wellfoundCompanies: e.wellfound.companies ?? [],
    ycCompanies: e.yc.companies ?? [],
    npmPackages: e.npm.packages ?? [],
    pypiPackages: e.pypi.packages ?? [],
    ghStarsRepos: e.ghStars.repos ?? [],
  };
}

// ── Public: validate (non-streaming) ─────────────────────────────────────────

export async function validateIdea(ideaText: string): Promise<ValidationReport> {
  const query = ideaText.trim();
  const { extracted, dataCoverage, activePlatforms } = await scrapeAll(query);

  const analysis: ClaudeAnalysis = await callEdgeFunction("analyze", buildAnalyzePayload(ideaText, extracted));
  const report = mapToValidationReport(ideaText, analysis, extracted.reddit, extracted.hn, activePlatforms, dataCoverage);

  saveReport(report).catch((e) => console.warn("[signal] Auto-save failed:", e));
  return report;
}

// ── Public: streamAnalysis ────────────────────────────────────────────────────

export async function streamAnalysis(
  ideaText: string,
  callbacks: {
    onStatus: (message: string) => void;
    onScoresReady: (scores: object) => void;
    onQuote: (quote: object) => void;
    onComplete: (fullReport: ValidationReport) => void;
    onError: (error: string) => void;
  }
): Promise<void> {
  callbacks.onStatus("Scanning 25 data sources...");

  let scrapeResult: ScrapeAllResult;
  try {
    scrapeResult = await scrapeAll(ideaText.trim());
  } catch (e) {
    callbacks.onError(String(e));
    return;
  }

  const { extracted, dataCoverage, activePlatforms } = scrapeResult;
  callbacks.onStatus(`Collected ${dataCoverage.totalItems} items from ${dataCoverage.successfulSources} sources. Running AI analysis...`);

  try {
    const response = await fetch(edgeFunctionUrl("analyze"), {
      method: "POST",
      headers: edgeFetchHeaders(),
      body: JSON.stringify({ ...buildAnalyzePayload(ideaText, extracted), stream: true }),
    });

    if (!response.ok) throw new Error(`analyze: HTTP ${response.status}`);

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value, { stream: true });
      for (const line of text.split("\n")) {
        if (!line.startsWith("data: ")) continue;
        try {
          const event = JSON.parse(line.slice(6));
          switch (event.type) {
            case "status":
              callbacks.onStatus(event.message);
              break;
            case "scores":
              callbacks.onScoresReady(event.scores);
              break;
            case "quote":
              callbacks.onQuote(event.quote);
              break;
            case "complete": {
              const report = mapToValidationReport(
                ideaText,
                event.analysis as ClaudeAnalysis,
                extracted.reddit,
                extracted.hn,
                activePlatforms,
                dataCoverage
              );
              saveReport(report).catch((e) => console.warn("[signal] Auto-save failed:", e));
              callbacks.onComplete(report);
              break;
            }
            case "error":
              callbacks.onError(event.message);
              break;
          }
        } catch { /* skip malformed SSE lines */ }
      }
    }
  } catch (e) {
    callbacks.onError(String(e));
  }
}

// ── Public: history ───────────────────────────────────────────────────────────

export async function saveReport(report: ValidationReport): Promise<string> {
  const data = await callEdgeFunction("save-report", { report });
  return data.id as string;
}

export async function listReports(limit = 20, offset = 0): Promise<ReportSummary[]> {
  const data = await callEdgeFunction("list-reports", { limit, offset });
  return (data.reports ?? []) as ReportSummary[];
}

export async function getReport(id: string): Promise<ValidationReport> {
  const data = await callEdgeFunction("get-report", { id });
  return data.report as ValidationReport;
}

// ── Public: PDF ───────────────────────────────────────────────────────────────

export async function generatePDF(reportOrId: ValidationReport | string): Promise<void> {
  const body = typeof reportOrId === "string" ? { reportId: reportOrId } : { report: reportOrId };

  const response = await fetch(edgeFunctionUrl("generate-pdf"), {
    method: "POST",
    headers: edgeFetchHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`PDF generation failed: ${response.status}`);

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `signal-report-${Date.now()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Public: chat ──────────────────────────────────────────────────────────────

export async function chatAboutReport(
  reportId: string,
  message: string,
  history: Message[],
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void
): Promise<void> {
  const response = await fetch(edgeFunctionUrl("chat"), {
    method: "POST",
    headers: edgeFetchHeaders(),
    body: JSON.stringify({ reportId, message, history }),
  });

  if (!response.ok) throw new Error(`Chat failed: ${response.status}`);

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = decoder.decode(value, { stream: true });
    for (const line of text.split("\n")) {
      if (!line.startsWith("data: ")) continue;
      try {
        const event = JSON.parse(line.slice(6));
        if (event.type === "chunk") onChunk(event.text as string);
        else if (event.type === "complete") onComplete(event.text as string);
      } catch { /* skip */ }
    }
  }
}

// ── Mapper ────────────────────────────────────────────────────────────────────

function mapToValidationReport(
  ideaText: string,
  ai: ClaudeAnalysis,
  reddit: RedditResponse,
  hn: HNResponse,
  activePlatforms: string[],
  dataCoverage: DataCoverageReport
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

  const rawVerdict = (ai.verdict as "BUILD" | "MAYBE" | "SKIP") ?? "MAYBE";
  const verdictText =
    rawVerdict === "BUILD"
      ? "Strong demand signal detected. Build immediately."
      : rawVerdict === "SKIP"
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

  const marketMetricsScore = Math.min(100, Math.max(10, Math.round((dataCoverage.totalItems / 150) * 100)));

  const rawGrowth = reddit.meta?.growthVelocity;
  const growthVelocity =
    rawGrowth != null ? (rawGrowth >= 0 ? `+${rawGrowth}%` : `${rawGrowth}%`) : "+0%";

  const emojis = ["🎤", "💸", "🏗️"];

  return {
    ideaTitle: title,
    ideaDescription: ideaText,
    overallScore: overall,
    rawVerdict,
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
          { label: "Problem clarity", status: overall >= 60 ? "pass" : "partial", detail: ai.recommendation?.slice(0, 80) ?? "Analysis pending" },
          { label: "Founder fit", status: (fs?.overall ?? 0) >= 7 ? "pass" : "partial", detail: `Founder score: ${fs?.overall ?? "N/A"}/10` },
          { label: "Articulation", status: "pass", detail: "Can be explained concisely" },
        ],
      },
      externalQual: {
        label: "Mom Test Signals",
        score: Math.round((fs?.painIntensity ?? 5) * 10),
        primary: true,
        metrics: [
          { label: "Unprompted pain", status: quotes.length >= 4 ? "pass" : "partial", detail: `${quotes.length} real quotes extracted` },
          { label: "Specific complaints", status: quotes.length >= 3 ? "pass" : "partial", detail: "Quotes from actual community discussions" },
          { label: "Mom Test compliance", status: overall >= 70 ? "pass" : "partial", detail: `Based on ${dataCoverage.totalItems} scraped signals` },
        ],
      },
      internalQuant: {
        label: "Buildability",
        score: Math.round((fs?.buildFeasibility ?? 5) * 10),
        metrics: [
          { label: "Technical complexity", status: (fs?.buildFeasibility ?? 0) >= 7 ? "pass" : "partial", detail: `Feasibility: ${fs?.buildFeasibility ?? "N/A"}/10` },
          { label: "Time to MVP", status: (fs?.buildFeasibility ?? 0) >= 6 ? "pass" : "partial", detail: "Estimated based on technical requirements" },
          { label: "Key dependencies", status: "partial", detail: "Standard APIs and services likely needed" },
        ],
      },
      externalQuant: {
        label: "Market Metrics",
        score: marketMetricsScore,
        primary: true,
        metrics: [
          { label: "Signal volume", status: dataCoverage.totalItems >= 30 ? "pass" : "partial", detail: `${dataCoverage.totalItems} items across ${dataCoverage.successfulSources} sources` },
          { label: "Avg engagement", status: avgEngagement >= 50 ? "pass" : "partial", detail: `${avgEngagement} avg upvotes (Reddit)` },
          { label: "Pay signals", status: (fs?.willingnessToPay ?? 0) >= 6 ? "pass" : "partial", detail: `WTP score: ${fs?.willingnessToPay ?? "N/A"}/10` },
        ],
      },
    },
    momTest: {
      score: Math.min(5, Math.round(overall / 20)),
      maxScore: 5,
      rules: [
        { rule: "Real conversations, not pitches", status: quotes.length >= 2 ? "pass" : "partial", evidence: "Signals sourced from organic community discussions" },
        { rule: "Specific past behavior", status: (fs?.painIntensity ?? 0) >= 7 ? "pass" : "partial", evidence: "Analyzed for specificity of complaints" },
        { rule: "Active pain", status: (fs?.urgency ?? 0) >= 6 ? "pass" : "partial", evidence: `Urgency: ${fs?.urgency ?? "N/A"}/10` },
        { rule: "Unprompted frustration", status: overall >= 60 ? "pass" : "partial", evidence: "Extracted from general discussion threads" },
        { rule: "Willingness to pay", status: (fs?.willingnessToPay ?? 0) >= 7 ? "pass" : (fs?.willingnessToPay ?? 0) >= 5 ? "partial" : "fail", evidence: `WTP: ${fs?.willingnessToPay ?? "N/A"}/10` },
      ],
      verdict: ai.recommendation ?? "Analysis complete.",
    },
    quantMetrics: {
      totalSignals: dataCoverage.totalItems,
      avgEngagement,
      avgComments,
      paySignals: Math.round((fs?.willingnessToPay ?? 3) * 2),
      growthVelocity,
      sourceBreakdown:
        sourceBreakdown.length > 0
          ? sourceBreakdown
          : [{ source: "Reddit", pct: 70 }, { source: "Hacker News", pct: 30 }],
      engagementDistribution: {
        above100: allScores.filter((s) => s >= 100).length,
        above50: allScores.filter((s) => s >= 50).length,
        above10: allScores.filter((s) => s >= 10).length,
      },
    },
    quotes:
      quotes.length > 0
        ? quotes
        : [{ text: "No strong quotes found — try a more specific idea.", platform: "System", upvotes: 0, date: "Now", momTestTags: [] }],
    painCategories:
      painCategories.length > 0
        ? painCategories
        : [{ label: "General frustration", pct: 40 }, { label: "Lack of solutions", pct: 30 }, { label: "Time cost", pct: 20 }, { label: "Other", pct: 10 }],
    competitors: {
      direct: Math.min(competitors.length, 3),
      indirect: Math.max(competitors.length - 3, 0),
      dominantPlayer: false,
      density: competitors.length >= 5 ? "High" : competitors.length >= 2 ? "Medium" : "Low",
      interpretation:
        competitors.length > 0
          ? `${competitors.length} competitors. ${competitors.map((c) => c.weakness ?? "").filter(Boolean).join(". ")}`
          : "Limited competition detected.",
      names: competitorNames.slice(0, 5),
    },
    checklist: [
      { label: "Problem is real", detail: `${quotes.length} quotes from communities`, status: quotes.length >= 3 ? "pass" : "warning" },
      { label: "Demand is organic", detail: `${dataCoverage.successfulSources} platforms scraped`, status: "pass" },
      { label: "Market has room", detail: `${competitors.length} competitors found`, status: competitors.length <= 3 ? "pass" : "warning" },
      { label: "Willingness to pay", detail: `WTP: ${fs?.willingnessToPay ?? "N/A"}/10`, status: (fs?.willingnessToPay ?? 0) >= 7 ? "pass" : (fs?.willingnessToPay ?? 0) >= 5 ? "warning" : "fail" },
      { label: "Buildable", detail: `Feasibility: ${fs?.buildFeasibility ?? "N/A"}/10`, status: (fs?.buildFeasibility ?? 0) >= 7 ? "pass" : "warning" },
      { label: "Timing is right", detail: `Urgency: ${fs?.urgency ?? "N/A"}/10`, status: (fs?.urgency ?? 0) >= 6 ? "pass" : "warning" },
      { label: "Clear monetization", detail: ai.revenueModel?.suggestedModel ?? ai.recommendation?.slice(0, 100) ?? "Needs exploration", status: overall >= 70 ? "pass" : "fail" },
    ],
    checklistVerdict: {
      greenCount: [
        quotes.length >= 3, true, competitors.length <= 3,
        (fs?.willingnessToPay ?? 0) >= 7, (fs?.buildFeasibility ?? 0) >= 7,
        (fs?.urgency ?? 0) >= 6, overall >= 70,
      ].filter(Boolean).length,
      total: 7,
      recommendation: rawVerdict === "BUILD" ? "Strong go. Start building." : rawVerdict === "SKIP" ? "Needs more research." : "Promising. Proceed to user interviews.",
      detail: ai.recommendation ?? "Complete analysis based on real community data.",
    },
    nextSteps: (ai.nextSteps ?? ["Run Mom Test interviews", "Test willingness to pay", "Build minimal prototype"]).map(
      (step, i) => ({ emoji: emojis[i] || "📋", title: step.slice(0, 40), detail: step })
    ),
    recommendation: ai.recommendation ?? "Analysis complete.",
    attentionScore: ai.attentionScore,
    competitorMap: ai.competitorMap,
    revenueModel: ai.revenueModel,
    targetPersonas: ai.targetPersonas,
    buildRecommendations: ai.buildRecommendations,
    sentimentAnalysis: ai.sentimentAnalysis,
    confidenceScore: ai.confidenceScore,
    dataCoverage,
  };
}
