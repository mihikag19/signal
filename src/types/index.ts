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
}
