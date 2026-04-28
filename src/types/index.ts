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
  // Extended intelligence fields (optional — not present in mock data)
  attentionScore?: AttentionScore;
  competitorMap?: CompetitorInfo[];
  revenueModel?: RevenueModel;
  targetPersonas?: TargetPersona[];
  buildRecommendations?: BuildRecommendation;
  sentimentAnalysis?: SentimentAnalysis;
  confidenceScore?: ConfidenceScore;
}

// Edge function response types

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
  topComments?: Array<{
    body?: string;
    score?: number;
    author?: string;
  }>;
}

export interface RedditResponse {
  posts?: RedditPost[];
  meta?: {
    query?: string;
    subredditsSearched?: number;
    totalPosts?: number;
    growthVelocity?: number;
  };
  error?: string;
}

export interface HNResponse {
  stories?: Array<{
    id?: string;
    title?: string;
    url?: string;
    points?: number;
    numComments?: number;
    author?: string;
    createdAt?: string;
  }>;
  comments?: Array<{
    id?: string;
    text?: string;
    points?: number;
    author?: string;
    storyId?: string;
    storyTitle?: string;
    createdAt?: string;
    isAskHN?: boolean;
    isShowHN?: boolean;
  }>;
  meta?: {
    query?: string;
    totalStories?: number;
    totalComments?: number;
  };
  error?: string;
}

export interface PHPost {
  id?: string;
  name?: string;
  tagline?: string;
  description?: string;
  votes?: number;
  comments?: number;
  url?: string;
  createdAt?: string;
  topics?: string[];
}

export interface PHResponse {
  posts?: PHPost[];
  meta?: { query?: string; totalPosts?: number };
  error?: string;
}

export interface DevToArticle {
  id?: string;
  title?: string;
  description?: string;
  tags?: string[];
  reactions?: number;
  comments?: number;
  url?: string;
  author?: string;
  createdAt?: string;
}

export interface DevToResponse {
  articles?: DevToArticle[];
  meta?: { query?: string; totalArticles?: number };
  error?: string;
}

export interface IHPost {
  title?: string;
  url?: string;
  description?: string;
  author?: string;
  publishedAt?: string;
}

export interface IHResponse {
  posts?: IHPost[];
  meta?: { query?: string; totalPosts?: number };
  error?: string;
}

export interface GitHubRepo {
  id?: string;
  name?: string;
  description?: string;
  stars?: number;
  forks?: number;
  openIssues?: number;
  url?: string;
  createdAt?: string;
  language?: string;
}

export interface GitHubIssue {
  id?: string;
  title?: string;
  body?: string;
  comments?: number;
  reactions?: number;
  url?: string;
  createdAt?: string;
  state?: string;
}

export interface GitHubResponse {
  repos?: GitHubRepo[];
  issues?: GitHubIssue[];
  meta?: { query?: string; totalRepos?: number; totalIssues?: number };
  error?: string;
}

export interface SOQuestion {
  id?: string;
  title?: string;
  body?: string;
  score?: number;
  answers?: number;
  views?: number;
  tags?: string[];
  url?: string;
  createdAt?: string;
}

export interface SOResponse {
  questions?: SOQuestion[];
  meta?: { query?: string; totalQuestions?: number };
  error?: string;
}

export interface ClaudeAnalysis {
  overallDemandScore?: number;
  founderScore?: {
    overall?: number;
    painIntensity?: number;
    buildFeasibility?: number;
    urgency?: number;
    willingnessToPay?: number;
  };
  investorScore?: {
    overall?: number;
    marketSize?: string;
    timing?: string;
    defensibility?: string;
    exitPotential?: string;
  };
  quotes?: Array<{
    text?: string;
    source?: string;
    subreddit?: string;
    score?: number;
    url?: string;
  }>;
  painCategories?: Array<{
    category?: string;
    label?: string;
    percentage?: number;
    pct?: number;
  }>;
  competitors?: Array<{
    name?: string;
    weakness?: string;
  }>;
  verdict?: string;
  recommendation?: string;
  nextSteps?: string[];
  redFlags?: string[];
  reasoning?: {
    demandScore?: string;
    founderScore?: string;
    investorScore?: string;
  };
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
