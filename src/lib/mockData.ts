export interface DiscoveryTopic {
  name: string;
  slug: string;
  description: string;
  score: number;
  signals: number;
  platforms: string[];
  trend: "rising" | "stable" | "declining";
  topQuote: string;
}

export interface QuoteData {
  text: string;
  platform: string;
  upvotes: number;
  date: string;
}

export interface PainCategory {
  label: string;
  pct: number;
}

export interface ValidationReport {
  demandScore: number;
  signals: number;
  platforms: string[];
  verdict: string;
  quotes: QuoteData[];
  painCategories: PainCategory[];
  competitors: {
    direct: number;
    indirect: number;
    dominantPlayer: boolean;
    dominantPlayerName?: string;
    notes: string;
  };
  recommendation: string;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const aiHealthcareTopics: DiscoveryTopic[] = [
  { name: "AI Patient Intake Automation", slug: slugify("AI Patient Intake Automation"), description: "Automating the patient check-in and intake process using AI forms and NLP", score: 91, signals: 67, platforms: ["r/healthIT", "r/startups", "r/SaaS"], trend: "rising", topQuote: "We spend 45 minutes per patient on intake paperwork. Someone please automate this." },
  { name: "AI Medical Scribes", slug: slugify("AI Medical Scribes"), description: "Real-time clinical documentation using AI to transcribe and summarize doctor-patient conversations", score: 84, signals: 53, platforms: ["r/medicine", "r/startups", "r/Entrepreneur"], trend: "rising", topQuote: "I spend more time typing notes than talking to patients. This is broken." },
  { name: "AI Prior Authorization", slug: slugify("AI Prior Authorization"), description: "Automating insurance prior-auth workflows that currently take days of back-and-forth", score: 77, signals: 41, platforms: ["r/healthIT", "r/medicine"], trend: "rising", topQuote: "Prior auth is the single biggest pain point in my practice." },
  { name: "AI Mental Health Screening", slug: slugify("AI Mental Health Screening"), description: "Using AI to pre-screen patients for depression, anxiety, and other conditions before appointments", score: 68, signals: 29, platforms: ["r/psychotherapy", "r/startups"], trend: "stable", topQuote: "Early screening could save lives but clinics don't have the bandwidth." },
  { name: "AI Medical Billing Optimization", slug: slugify("AI Medical Billing Optimization"), description: "Reducing claim denials and optimizing medical billing codes with AI assistance", score: 62, signals: 24, platforms: ["r/healthIT", "r/smallbusiness"], trend: "stable", topQuote: "We lose $200k/year to billing errors. There has to be a better way." },
];

const creatorEconomyTopics: DiscoveryTopic[] = [
  { name: "AI Content Repurposing", slug: slugify("AI Content Repurposing"), description: "Auto-converting long-form content into clips, threads, newsletters, and social posts", score: 88, signals: 72, platforms: ["r/content_marketing", "r/Entrepreneur", "r/SaaS"], trend: "rising", topQuote: "I create one YouTube video and then spend 6 hours repurposing it manually." },
  { name: "Creator CRM & Audience Intel", slug: slugify("Creator CRM & Audience Intel"), description: "Tools to help creators understand, segment, and communicate with their audience", score: 76, signals: 38, platforms: ["r/startups", "r/SaaS"], trend: "rising", topQuote: "I have 500k followers but no idea who they actually are." },
  { name: "AI Sponsorship Matchmaking", slug: slugify("AI Sponsorship Matchmaking"), description: "Connecting creators with relevant brand deals using AI-powered matching", score: 71, signals: 31, platforms: ["r/NewTubers", "r/Entrepreneur"], trend: "stable", topQuote: "Finding brand deals that actually fit my niche is a full-time job." },
  { name: "Creator Financial Tools", slug: slugify("Creator Financial Tools"), description: "Tax, invoicing, and financial planning tools built specifically for content creators", score: 64, signals: 22, platforms: ["r/freelance", "r/Entrepreneur"], trend: "stable", topQuote: "As a creator, tax season is a nightmare. Nothing is built for us." },
  { name: "Community-Powered Course Platforms", slug: slugify("Community-Powered Course Platforms"), description: "Platforms where creators can build courses with built-in community and peer learning", score: 58, signals: 19, platforms: ["r/startups", "r/online_education"], trend: "declining", topQuote: "I want to sell a course but Teachable and Kajabi feel so outdated." },
];

const climateTechTopics: DiscoveryTopic[] = [
  { name: "Carbon Accounting for SMBs", slug: slugify("Carbon Accounting for SMBs"), description: "Simplified carbon footprint tracking for small and mid-size businesses", score: 82, signals: 44, platforms: ["r/sustainability", "r/smallbusiness", "r/startups"], trend: "rising", topQuote: "We want to measure our carbon footprint but every tool is built for Fortune 500." },
  { name: "AI-Powered Energy Audits", slug: slugify("AI-Powered Energy Audits"), description: "Using computer vision and AI to assess building energy efficiency remotely", score: 75, signals: 33, platforms: ["r/energy", "r/startups"], trend: "rising", topQuote: "Getting an energy audit costs $5k and takes weeks. There must be a faster way." },
  { name: "Supply Chain Emissions Tracking", slug: slugify("Supply Chain Emissions Tracking"), description: "Tracking Scope 3 emissions across complex supply chains with automation", score: 69, signals: 27, platforms: ["r/supplychain", "r/sustainability"], trend: "stable", topQuote: "Scope 3 reporting is coming and nobody is ready." },
  { name: "Green Building Materials Marketplace", slug: slugify("Green Building Materials Marketplace"), description: "Marketplace connecting builders with verified sustainable construction materials", score: 61, signals: 18, platforms: ["r/architecture", "r/sustainability"], trend: "stable", topQuote: "I want to build green but finding certified materials is incredibly fragmented." },
  { name: "Personal Carbon Offset Subscriptions", slug: slugify("Personal Carbon Offset Subscriptions"), description: "Consumer subscriptions that automatically offset lifestyle carbon emissions", score: 45, signals: 12, platforms: ["r/sustainability", "r/Frugal"], trend: "declining", topQuote: "I'd pay $20/month if I actually trusted the offsets were real." },
];

const metaTopics: DiscoveryTopic[] = [
  { name: "AI Idea Validation Tools", slug: slugify("AI Idea Validation Tools"), description: "Tools that automatically validate startup ideas using real market data and community signals", score: 93, signals: 89, platforms: ["r/startups", "r/SaaS", "r/Entrepreneur", "r/indiehackers"], trend: "rising", topQuote: "I wish there was a tool that could scan Reddit and Twitter to tell me if people actually want what I'm building." },
  { name: "VC Deal Flow Intelligence", slug: slugify("VC Deal Flow Intelligence"), description: "AI-powered market intelligence tools for investors to source and screen opportunities", score: 81, signals: 42, platforms: ["r/venturecapital", "r/startups"], trend: "rising", topQuote: "I review 50 decks a week. 90% have zero real validation. I need a signal filter." },
  { name: "Pre-MVP Demand Testing", slug: slugify("Pre-MVP Demand Testing"), description: "Frameworks and tools for testing demand before writing a single line of code", score: 78, signals: 36, platforms: ["r/startups", "r/Entrepreneur", "r/SaaS"], trend: "rising", topQuote: "I spent 6 months building something nobody wanted. Never again." },
  { name: "Pitch Deck Automation", slug: slugify("Pitch Deck Automation"), description: "AI tools that auto-generate or enhance pitch deck content with real market data", score: 65, signals: 21, platforms: ["r/startups", "r/Entrepreneur"], trend: "stable", topQuote: "Every pitch deck has the same made-up TAM slide. Give me real data." },
  { name: "Trend Prediction Dashboards", slug: slugify("Trend Prediction Dashboards"), description: "Real-time dashboards showing emerging market trends across social platforms", score: 59, signals: 15, platforms: ["r/dataisbeautiful", "r/startups"], trend: "stable", topQuote: "By the time something trends on TechCrunch, it's too late to build for it." },
];

export const discoveryDatasets: Record<string, DiscoveryTopic[]> = {
  "ai in healthcare": aiHealthcareTopics,
  "creator economy tools": creatorEconomyTopics,
  "climate tech": climateTechTopics,
  "this tool (meta)": metaTopics,
};

// Validation reports
const validationReports: Record<string, ValidationReport> = {
  "ai-idea-validation-tools": {
    demandScore: 93,
    signals: 89,
    platforms: ["Reddit", "Indie Hackers", "X/Twitter", "Hacker News"],
    verdict: "Exceptional signal — high organic demand with clear willingness to pay",
    quotes: [
      { text: "I wish there was a tool that could scan Reddit and Twitter to tell me if people actually want what I'm building before I waste 6 months.", platform: "r/startups", upvotes: 1147, date: "2 weeks ago" },
      { text: "The hardest slide in my pitch deck is always validation. I end up saying 'we talked to 10 people' which I know sounds weak.", platform: "r/Entrepreneur", upvotes: 892, date: "3 weeks ago" },
      { text: "I'm a VC and I'd pay good money for a tool that scrapes community forums and tells me if a founder's market is real or imagined.", platform: "r/venturecapital", upvotes: 634, date: "1 week ago" },
      { text: "Every accelerator application asks for evidence of demand. I always BS it. What if there was a tool that just... found the evidence for me?", platform: "r/startups", upvotes: 521, date: "1 month ago" },
      { text: "Built 3 failed startups. Each time I was solving a problem nobody actually had. The validation step is where 90% of founders fail and nobody talks about it.", platform: "Indie Hackers", upvotes: 438, date: "2 weeks ago" },
      { text: "We need a demand intelligence layer for the startup ecosystem. Something that programmatically proves or disproves whether real humans care about a problem.", platform: "Hacker News", upvotes: 327, date: "3 weeks ago" },
    ],
    painCategories: [
      { label: "Manual validation is too slow", pct: 34 },
      { label: "Validation evidence is weak/anecdotal", pct: 28 },
      { label: "No tool aggregates community demand signals", pct: 22 },
      { label: "Investors can't verify founder claims", pct: 16 },
    ],
    competitors: {
      direct: 2,
      indirect: 5,
      dominantPlayer: false,
      notes: "No clear market leader. Existing tools (Exploding Topics, SparkToro) focus on SEO trends, not demand validation from community signals.",
    },
    recommendation: "This market is significantly underserved with strong, unprompted demand across multiple platforms. The pain is acute for both founders and investors. There is no dominant player solving this specific problem — the gap between 'trend tracking' and 'demand validation' is wide open. Recommend building immediately with a focus on the investor persona as the monetization path and founders as the growth/viral loop.",
  },
  "ai-patient-intake-automation": {
    demandScore: 91,
    signals: 67,
    platforms: ["Reddit", "Health IT Forums", "Medical Twitter"],
    verdict: "Very strong signal — acute pain point with clear ROI for clinics",
    quotes: [
      { text: "We spend 45 minutes per patient on intake paperwork. Someone please automate this.", platform: "r/healthIT", upvotes: 823, date: "1 week ago" },
      { text: "Our front desk is drowning in paper forms. We tried going digital but the tools are terrible.", platform: "r/medicine", upvotes: 567, date: "2 weeks ago" },
      { text: "I'd pay $500/month per provider if someone could cut our intake time in half.", platform: "r/startups", upvotes: 412, date: "3 weeks ago" },
      { text: "The intake process hasn't changed in 30 years. It's insane that patients still fill out clipboards.", platform: "r/healthIT", upvotes: 389, date: "1 month ago" },
    ],
    painCategories: [
      { label: "Time-consuming manual paperwork", pct: 38 },
      { label: "Data entry errors and duplication", pct: 26 },
      { label: "Poor patient experience", pct: 21 },
      { label: "Staff burnout from admin tasks", pct: 15 },
    ],
    competitors: {
      direct: 4,
      indirect: 8,
      dominantPlayer: false,
      notes: "Fragmented market with legacy EHR add-ons. No AI-native solution has captured significant share yet.",
    },
    recommendation: "Healthcare intake automation represents a large, underserved market with clear willingness to pay. The key differentiator would be AI-native NLP processing rather than simple digitization. Target small-to-mid practice groups (5-50 providers) as the initial beachhead — they feel the pain most acutely and can make purchasing decisions quickly.",
  },
  "ai-content-repurposing": {
    demandScore: 88,
    signals: 72,
    platforms: ["Reddit", "Creator Twitter", "YouTube Communities"],
    verdict: "Strong signal — massive creator pain point with growing TAM",
    quotes: [
      { text: "I create one YouTube video and then spend 6 hours repurposing it manually. This is unsustainable.", platform: "r/content_marketing", upvotes: 956, date: "1 week ago" },
      { text: "Every creator I know wants to be on 5 platforms but only has time for 1. The repurposing gap is huge.", platform: "r/Entrepreneur", upvotes: 723, date: "2 weeks ago" },
      { text: "I tried 3 different repurposing tools and they all produce garbage. The AI isn't there yet for quality output.", platform: "r/SaaS", upvotes: 534, date: "3 weeks ago" },
      { text: "My VA charges $2k/month just to repurpose my content. If AI could do 80% of that work, I'd switch instantly.", platform: "r/Entrepreneur", upvotes: 445, date: "1 month ago" },
    ],
    painCategories: [
      { label: "Time cost of manual repurposing", pct: 36 },
      { label: "Quality of AI-generated derivatives", pct: 28 },
      { label: "Platform-specific formatting needs", pct: 20 },
      { label: "Consistency across channels", pct: 16 },
    ],
    competitors: {
      direct: 6,
      indirect: 12,
      dominantPlayer: false,
      notes: "Crowded but no winner. Opus Clip leads in video clips but nobody owns the full cross-platform repurposing workflow.",
    },
    recommendation: "The creator economy is exploding and repurposing is the #1 operational bottleneck. While competition exists, quality remains the key differentiator — most tools produce low-quality output. Focus on one content type first (long-form video → everything else) and nail the quality before expanding. The willingness to pay is proven — creators already spend $1-3k/month on VAs doing this manually.",
  },
};

export function getDiscoveryTopics(query: string): DiscoveryTopic[] {
  const normalized = query.toLowerCase().trim();
  if (discoveryDatasets[normalized]) {
    return discoveryDatasets[normalized];
  }
  // Generate plausible topics for unknown queries
  return generateGenericTopics(query);
}

function generateGenericTopics(query: string): DiscoveryTopic[] {
  const baseTopics = [
    { suffix: "Automation Platform", scoreRange: [72, 88] },
    { suffix: "Analytics Dashboard", scoreRange: [65, 80] },
    { suffix: "Marketplace", scoreRange: [58, 75] },
    { suffix: "SaaS Tool", scoreRange: [55, 70] },
    { suffix: "Community Platform", scoreRange: [48, 65] },
  ];

  return baseTopics.map((t, i) => {
    const score = Math.floor(Math.random() * (t.scoreRange[1] - t.scoreRange[0]) + t.scoreRange[0]);
    const name = `${query} ${t.suffix}`;
    return {
      name,
      slug: slugify(name),
      description: `AI-powered ${t.suffix.toLowerCase()} for the ${query} space`,
      score,
      signals: Math.floor(score * 0.7 + Math.random() * 20),
      platforms: ["r/startups", "r/SaaS", "r/Entrepreneur"].slice(0, 2 + Math.floor(Math.random() * 2)),
      trend: (i < 2 ? "rising" : i < 4 ? "stable" : "declining") as "rising" | "stable" | "declining",
      topQuote: `There's a real need for better ${t.suffix.toLowerCase()} solutions in ${query}.`,
    };
  });
}

export function getValidationReport(topicSlug: string): ValidationReport {
  if (validationReports[topicSlug]) {
    return validationReports[topicSlug];
  }
  return generateGenericReport(topicSlug);
}

function generateGenericReport(topicSlug: string): ValidationReport {
  const name = topicSlug.replace(/-/g, " ");
  const score = Math.floor(Math.random() * 30 + 55);
  return {
    demandScore: score,
    signals: Math.floor(score * 0.6 + Math.random() * 15),
    platforms: ["Reddit", "Hacker News", "Twitter"],
    verdict: score >= 75 ? "Strong signal — notable organic demand detected" : score >= 60 ? "Moderate signal — emerging interest with validation needed" : "Early signal — niche interest detected, further research recommended",
    quotes: [
      { text: `This is a real problem that needs solving in the ${name} space.`, platform: "r/startups", upvotes: Math.floor(Math.random() * 500 + 100), date: "2 weeks ago" },
      { text: `I've been looking for something like this for months. The current solutions are terrible.`, platform: "r/SaaS", upvotes: Math.floor(Math.random() * 400 + 80), date: "3 weeks ago" },
      { text: `Would definitely pay for a good ${name} tool. Currently doing everything manually.`, platform: "r/Entrepreneur", upvotes: Math.floor(Math.random() * 300 + 60), date: "1 month ago" },
      { text: `The market for ${name} is growing fast. First mover advantage is still available.`, platform: "r/startups", upvotes: Math.floor(Math.random() * 250 + 50), date: "1 month ago" },
    ],
    painCategories: [
      { label: "Manual processes too slow", pct: 32 },
      { label: "Existing tools inadequate", pct: 27 },
      { label: "High cost of current solutions", pct: 23 },
      { label: "Poor user experience", pct: 18 },
    ],
    competitors: {
      direct: Math.floor(Math.random() * 4 + 1),
      indirect: Math.floor(Math.random() * 8 + 3),
      dominantPlayer: false,
      notes: "Market is still forming with no clear dominant player.",
    },
    recommendation: `The ${name} space shows promising demand signals. While competition exists, there's room for a well-executed solution that focuses on user experience and automation. Consider starting with a narrow use case and expanding from there.`,
  };
}

// Find a topic by slug across all datasets
export function findTopicBySlug(slug: string): DiscoveryTopic | undefined {
  for (const topics of Object.values(discoveryDatasets)) {
    const found = topics.find(t => t.slug === slug);
    if (found) return found;
  }
  return undefined;
}
