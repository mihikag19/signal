export interface QuoteData {
  text: string;
  platform: string;
  upvotes: number;
  date: string;
  momTestTags: string[];
}

export interface PainCategory {
  label: string;
  pct: number;
}

export interface QuadrantMetric {
  label: string;
  status: "pass" | "partial" | "fail";
  detail: string;
}

export interface Quadrant {
  label: string;
  score: number;
  primary?: boolean;
  metrics: QuadrantMetric[];
}

export interface MomTestRule {
  rule: string;
  status: "pass" | "partial" | "fail";
  evidence: string;
}

export interface ChecklistItem {
  label: string;
  detail: string;
  status: "pass" | "warning" | "fail";
}

export interface NextStep {
  emoji: string;
  title: string;
  detail: string;
}

export interface SourceBreakdown {
  source: string;
  pct: number;
}

// Intelligence engine types
export interface AttentionScore {
  overall: number;
  velocity: number;
  density: number;
  novelty: number;
}

export interface CompetitorInfo {
  name?: string;
  description?: string;
  estimatedTraction?: string;
  biggestWeakness?: string;
}

export interface RevenueModel {
  suggestedModel?: string;
  priceSensitivity?: string;
  estimatedPriceRange?: string;
  proofQuotes?: string[];
}

export interface TargetPersona {
  role?: string;
  primaryPainPoint?: string;
  activePlatforms?: string[];
  representativeQuote?: string;
}

export interface BuildRecommendation {
  topFeatures?: string[];
  targetAudience?: string;
  bestChannels?: string[];
  biggestRisk?: string;
}

export interface SentimentAnalysis {
  positive?: number;
  negative?: number;
  neutral?: number;
  trendDirection?: string;
}

export interface ConfidenceScore {
  score?: number;
  reasoning?: string;
}

export interface DataCoverageSource {
  name: string;
  itemCount: number;
  status: "success" | "failed" | "timeout";
}

export interface DataCoverageReport {
  sources: DataCoverageSource[];
  totalItems: number;
  totalSources: number;
  successfulSources: number;
}

export interface ValidationReport {
  ideaTitle: string;
  ideaDescription: string;
  overallScore: number;
  founderSignal: { score: number; summary: string };
  investorSignal: { score: number; summary: string };
  verdict: string;
  platforms: string[];
  quadrants: {
    internalQual: Quadrant;
    externalQual: Quadrant;
    internalQuant: Quadrant;
    externalQuant: Quadrant;
  };
  momTest: {
    score: number;
    maxScore: number;
    rules: MomTestRule[];
    verdict: string;
  };
  quantMetrics: {
    totalSignals: number;
    avgEngagement: number;
    avgComments: number;
    paySignals: number;
    growthVelocity: string;
    sourceBreakdown: SourceBreakdown[];
    engagementDistribution: { above100: number; above50: number; above10: number };
  };
  quotes: QuoteData[];
  painCategories: PainCategory[];
  competitors: {
    direct: number;
    indirect: number;
    dominantPlayer: boolean;
    density: "Low" | "Medium" | "High";
    interpretation: string;
    names: string[];
  };
  checklist: ChecklistItem[];
  checklistVerdict: {
    greenCount: number;
    total: number;
    recommendation: string;
    detail: string;
  };
  nextSteps: NextStep[];
  recommendation: string;
  // Extended intelligence fields (optional — absent from mock data)
  attentionScore?: AttentionScore;
  competitorMap?: CompetitorInfo[];
  revenueModel?: RevenueModel;
  targetPersonas?: TargetPersona[];
  buildRecommendations?: BuildRecommendation;
  sentimentAnalysis?: SentimentAnalysis;
  confidenceScore?: ConfidenceScore;
  dataCoverage?: DataCoverageReport;
}

// ── Edge function response types ─────────────────────────────────────────────

export interface RedditPost {
  id?: string;
  title?: string;
  body?: string;
  author?: string;
  score?: number;
  numComments?: number;
  subreddit?: string;
  permalink?: string;
  url?: string;
  createdAt?: string;
  topComments?: Array<{ body?: string; score?: number; author?: string }>;
}

export interface RedditResponse {
  posts?: RedditPost[];
  meta?: { query?: string; subredditsSearched?: number; totalPosts?: number; growthVelocity?: number };
  error?: string;
}

export interface HNResponse {
  stories?: Array<{ id?: string; title?: string; url?: string; points?: number; numComments?: number; author?: string; createdAt?: string }>;
  comments?: Array<{ id?: string; text?: string; points?: number; author?: string; storyId?: string; storyTitle?: string; createdAt?: string; isAskHN?: boolean; isShowHN?: boolean }>;
  meta?: { query?: string; totalStories?: number; totalComments?: number };
  error?: string;
}

export interface PHPost {
  id?: string; name?: string; tagline?: string; description?: string;
  votes?: number; comments?: number; url?: string; createdAt?: string; topics?: string[];
}
export interface PHResponse { posts?: PHPost[]; meta?: { query?: string; totalPosts?: number }; error?: string }

export interface DevToArticle {
  id?: string; title?: string; description?: string; tags?: string[];
  reactions?: number; comments?: number; url?: string; author?: string; createdAt?: string;
}
export interface DevToResponse { articles?: DevToArticle[]; meta?: { query?: string; totalArticles?: number }; error?: string }

export interface IHPost { title?: string; url?: string; description?: string; author?: string; publishedAt?: string }
export interface IHResponse { posts?: IHPost[]; meta?: { query?: string; totalPosts?: number }; error?: string }

export interface GitHubRepo {
  id?: string; name?: string; description?: string; stars?: number; forks?: number;
  openIssues?: number; url?: string; createdAt?: string; language?: string;
}
export interface GitHubIssue {
  id?: string; title?: string; body?: string; comments?: number; reactions?: number;
  url?: string; createdAt?: string; state?: string;
}
export interface GitHubResponse {
  repos?: GitHubRepo[]; issues?: GitHubIssue[];
  meta?: { query?: string; totalRepos?: number; totalIssues?: number }; error?: string;
}

export interface SOQuestion {
  id?: string; title?: string; body?: string; score?: number; answers?: number;
  views?: number; tags?: string[]; url?: string; createdAt?: string;
}
export interface SOResponse { questions?: SOQuestion[]; meta?: { query?: string; totalQuestions?: number }; error?: string }

// Wave 2 response types

export interface GoogleTrendsResponse {
  interestOverTime?: Array<{ date?: string; value?: number }>;
  relatedQueries?: Array<{ query?: string; value?: number | string }>;
  relatedTopics?: string[];
  breakoutQueries?: Array<{ query?: string; growth?: number | string }>;
  meta?: { query?: string; trendDirection?: string; currentInterest?: number; peakInterest?: number; dataPoints?: number };
  error?: string;
}

export interface GoogleAutocompleteResponse {
  suggestions?: string[];
  peopleAlsoAsk?: string[];
  meta?: { query?: string; totalSuggestions?: number };
  error?: string;
}

export interface WikipediaViewsResponse {
  articles?: Array<{
    title?: string; snippet?: string;
    monthlyViews?: Array<{ month?: string; views?: number }>;
    totalViews?: number; trendDirection?: string;
  }>;
  meta?: { query?: string; totalArticles?: number };
  error?: string;
}

export interface G2ReviewsResponse {
  products?: Array<{ name?: string; slug?: string; rating?: number; reviewCount?: number; url?: string }>;
  complaints?: string[];
  meta?: { query?: string; totalProducts?: number };
  error?: string;
}

export interface ChromeWebStoreResponse {
  extensions?: Array<{ name?: string; id?: string; rating?: number; userCount?: string; url?: string }>;
  meta?: { query?: string; totalExtensions?: number };
  error?: string;
}

export interface TrustpilotResponse {
  companies?: Array<{ name?: string; domain?: string; trustScore?: number; reviewCount?: number; url?: string }>;
  meta?: { query?: string; totalCompanies?: number };
  error?: string;
}

export interface AppStoreResponse {
  apps?: Array<{ id?: string; name?: string; description?: string; rating?: number; ratingCount?: number; price?: number; genre?: string; developer?: string; url?: string }>;
  negativeReviews?: Array<{ appName?: string; rating?: number; title?: string; body?: string }>;
  meta?: { query?: string; totalApps?: number };
  error?: string;
}

export interface YouTubeResponse {
  videos?: Array<{ id?: string; title?: string; channel?: string; views?: number; likes?: number; comments?: number; description?: string; published?: string; url?: string }>;
  meta?: { query?: string; totalVideos?: number; source?: string };
  error?: string;
}

export interface MediumResponse {
  articles?: Array<{ id?: string; title?: string; author?: string; claps?: number; responses?: number; readingTime?: number; url?: string; preview?: string }>;
  meta?: { query?: string; totalArticles?: number };
  error?: string;
}

export interface SubstackResponse {
  posts?: Array<{ id?: string; title?: string; newsletter?: string; author?: string; likes?: number; preview?: string; url?: string; publishedAt?: string }>;
  meta?: { query?: string; totalPosts?: number };
  error?: string;
}

export interface LobstersResponse {
  stories?: Array<{ id?: string; title?: string; url?: string; score?: number; comments?: number; tags?: string[]; author?: string; submittedAt?: string; commentsUrl?: string }>;
  meta?: { query?: string; totalStories?: number };
  error?: string;
}

export interface LemmyResponse {
  posts?: Array<{ id?: string; title?: string; body?: string; score?: number; comments?: number; community?: string; author?: string; url?: string; publishedAt?: string }>;
  meta?: { query?: string; totalPosts?: number };
  error?: string;
}

export interface CrunchbaseResponse {
  companies?: Array<{ name?: string; permalink?: string; description?: string; categories?: string[]; url?: string }>;
  meta?: { query?: string; totalCompanies?: number };
  error?: string;
}

export interface WellfoundResponse {
  companies?: Array<{ name?: string; slug?: string; description?: string; tags?: string[]; teamSize?: string; url?: string }>;
  meta?: { query?: string; totalCompanies?: number };
  error?: string;
}

export interface YCCompaniesResponse {
  companies?: Array<{ name?: string; slug?: string; description?: string; batch?: string; status?: string; industries?: string[]; teamSize?: number; website?: string; url?: string }>;
  meta?: { query?: string; totalCompanies?: number };
  error?: string;
}

export interface NpmStatsResponse {
  packages?: Array<{ name?: string; description?: string; version?: string; weeklyDownloads?: number; downloadTrend?: Array<{ month?: string; downloads?: number }>; githubUrl?: string; keywords?: string[]; url?: string }>;
  meta?: { query?: string; totalPackages?: number };
  error?: string;
}

export interface PypiStatsResponse {
  packages?: Array<{ name?: string; description?: string; lastMonthDownloads?: number; lastWeekDownloads?: number; url?: string }>;
  meta?: { query?: string; totalPackages?: number };
  error?: string;
}

export interface GitHubStarsResponse {
  repos?: Array<{ name?: string; currentStars?: number; currentForks?: number; openIssues?: number; createdAt?: string; pushedAt?: string; starGrowthRate?: string; description?: string; language?: string; url?: string }>;
  meta?: { query?: string; totalRepos?: number };
  error?: string;
}

export interface ClaudeAnalysis {
  overallDemandScore?: number;
  founderScore?: {
    overall?: number; painIntensity?: number; buildFeasibility?: number;
    urgency?: number; willingnessToPay?: number;
  };
  investorScore?: {
    overall?: number; marketSize?: string; timing?: string;
    defensibility?: string; exitPotential?: string;
  };
  quotes?: Array<{ text?: string; source?: string; subreddit?: string; score?: number; url?: string }>;
  painCategories?: Array<{ category?: string; label?: string; percentage?: number; pct?: number }>;
  competitors?: Array<{ name?: string; weakness?: string }>;
  verdict?: string;
  recommendation?: string;
  nextSteps?: string[];
  redFlags?: string[];
  reasoning?: { demandScore?: string; founderScore?: string; investorScore?: string };
  marketMaturity?: string;
  // Extended intelligence fields
  attentionScore?: AttentionScore;
  competitorMap?: CompetitorInfo[];
  revenueModel?: RevenueModel;
  targetPersonas?: TargetPersona[];
  buildRecommendations?: BuildRecommendation;
  sentimentAnalysis?: SentimentAnalysis;
  confidenceScore?: ConfidenceScore;
}
