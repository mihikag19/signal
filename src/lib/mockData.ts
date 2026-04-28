import type { ValidationReport } from "@/types";

// ============= MOCK REPORTS =============

const signalMetaReport: ValidationReport = {
  ideaTitle: "AI Idea Validation Tool (Signal)",
  ideaDescription: "An AI tool that scans online communities to find real demand signals for startup ideas, helping founders validate before they build and giving VCs proof of market demand.",
  overallScore: 93,
  founderSignal: { score: 91, summary: "Highly buildable with clear founder pain. You can dogfood this product." },
  investorSignal: { score: 76, summary: "Niche market initially but strong expansion path into VC tooling." },
  verdict: "Strong demand signal with exceptional founder-market fit. Build immediately.",
  platforms: ["Reddit", "Indie Hackers", "X/Twitter", "Hacker News"],
  quadrants: {
    internalQual: {
      label: "Gut Check",
      score: 88,
      metrics: [
        { label: "Problem clarity", status: "pass", detail: "The problem is immediately understandable to any founder" },
        { label: "Founder fit", status: "pass", detail: "Building this tool IS the validation — strong meta-alignment" },
        { label: "Articulation", status: "pass", detail: "Can be explained in one sentence" },
      ],
    },
    externalQual: {
      label: "Mom Test Signals",
      score: 89,
      primary: true,
      metrics: [
        { label: "Unprompted pain", status: "pass", detail: "89 organic signals across 4 platforms" },
        { label: "Specific complaints", status: "pass", detail: "Users describe exact workflows and frustrations" },
        { label: "Mom Test compliance", status: "partial", detail: "4/5 rules passed" },
      ],
    },
    internalQuant: {
      label: "Buildability",
      score: 92,
      metrics: [
        { label: "Technical complexity", status: "pass", detail: "Low — API integrations + LLM prompting" },
        { label: "Time to MVP", status: "pass", detail: "1-2 weeks for a working prototype" },
        { label: "Key dependencies", status: "pass", detail: "Reddit API, LLM API — both accessible" },
      ],
    },
    externalQuant: {
      label: "Market Metrics",
      score: 85,
      primary: true,
      metrics: [
        { label: "Signal volume", status: "pass", detail: "89 relevant posts/comments found" },
        { label: "Avg engagement", status: "pass", detail: "634 average upvotes per signal" },
        { label: "Pay signals", status: "partial", detail: "12 mentions of paying/budget — moderate" },
      ],
    },
  },
  momTest: {
    score: 4,
    maxScore: 5,
    rules: [
      { rule: "Real conversations, not pitches", status: "pass", evidence: "All signals from organic threads — zero product launches or ads in the dataset" },
      { rule: "Specific past behavior", status: "pass", evidence: "Users describe building 3 failed startups, spending 6 months on unvalidated ideas, manually scouring Reddit" },
      { rule: "Active pain", status: "pass", evidence: "Multiple users actively asking for solutions or describing current workarounds" },
      { rule: "Unprompted frustration", status: "pass", evidence: "Frustration expressed in general startup advice threads, not in response to any product" },
      { rule: "Willingness to pay", status: "partial", evidence: "One VC explicitly said 'I'd pay good money.' Others imply value but no explicit price points." },
    ],
    verdict: "This idea passes 4 of 5 Mom Test rules based on organic community data. The pain is real, specific, and expressed by people actively seeking solutions — not just being polite. The primary gap is explicit willingness-to-pay data, which is typical for pre-product validation and can be tested with a landing page.",
  },
  quantMetrics: {
    totalSignals: 89,
    avgEngagement: 634,
    avgComments: 23,
    paySignals: 12,
    growthVelocity: "+47%",
    sourceBreakdown: [
      { source: "r/startups", pct: 34 },
      { source: "r/SaaS", pct: 22 },
      { source: "r/Entrepreneur", pct: 18 },
      { source: "r/venturecapital", pct: 15 },
      { source: "Other", pct: 11 },
    ],
    engagementDistribution: { above100: 14, above50: 23, above10: 52 },
  },
  quotes: [
    { text: "I wish there was a tool that could scan Reddit and Twitter to tell me if people actually want what I'm building before I waste 6 months.", platform: "r/startups", upvotes: 1147, date: "2 weeks ago", momTestTags: ["Unprompted pain", "Specific experience", "Active searching"] },
    { text: "The hardest slide in my pitch deck is always validation. I end up saying 'we talked to 10 people' which I know sounds weak.", platform: "r/Entrepreneur", upvotes: 892, date: "3 weeks ago", momTestTags: ["Unprompted pain", "Specific experience", "Repeated frustration"] },
    { text: "I'm a VC and I'd pay good money for a tool that scrapes community forums and tells me if a founder's market is real or imagined.", platform: "r/venturecapital", upvotes: 634, date: "1 week ago", momTestTags: ["Paying for alternatives", "Active searching", "Specific experience"] },
    { text: "Every accelerator application asks for evidence of demand. I always BS it. What if there was a tool that just found the evidence for me?", platform: "r/startups", upvotes: 521, date: "1 month ago", momTestTags: ["Unprompted pain", "Active searching"] },
    { text: "Built 3 failed startups. Each time I was solving a problem nobody actually had. The validation step is where 90% of founders fail.", platform: "Indie Hackers", upvotes: 438, date: "2 weeks ago", momTestTags: ["Specific experience", "Repeated frustration", "Unprompted pain"] },
    { text: "We need a demand intelligence layer for the startup ecosystem. Something that programmatically proves whether real humans care about a problem.", platform: "Hacker News", upvotes: 327, date: "3 weeks ago", momTestTags: ["Active searching", "Specific experience"] },
  ],
  painCategories: [
    { label: "Manual validation is too slow", pct: 34 },
    { label: "Validation evidence is weak/anecdotal", pct: 28 },
    { label: "No tool aggregates community demand signals", pct: 22 },
    { label: "Investors can't verify founder claims", pct: 16 },
  ],
  competitors: {
    direct: 2, indirect: 5, dominantPlayer: false, density: "Low",
    interpretation: "Competition here is validation, not a threat. Existing tools (Exploding Topics, SparkToro) focus on SEO trends, not demand validation from community signals. The gap is wide open.",
    names: ["Exploding Topics", "SparkToro"],
  },
  checklist: [
    { label: "Problem is real", detail: "People are expressing genuine, specific pain about validation", status: "pass" },
    { label: "Demand is organic", detail: "Signals are unprompted — not responses to marketing or ads", status: "pass" },
    { label: "Market has room", detail: "No dominant player owns community-based demand validation", status: "pass" },
    { label: "Willingness to pay", detail: "Some signals but needs dedicated pricing validation", status: "warning" },
    { label: "Buildable", detail: "Low technical complexity — API integrations + LLM prompting", status: "pass" },
    { label: "Timing is right", detail: "Signal volume increasing 47% month over month", status: "pass" },
    { label: "Clear monetization", detail: "Revenue model needs exploration — SaaS vs. usage-based unclear", status: "fail" },
  ],
  checklistVerdict: {
    greenCount: 5, total: 7, recommendation: "Proceed to user interviews",
    detail: "Strong signal across 5 of 7 validation criteria. The core demand is proven — the gaps are in monetization strategy, which is best validated through direct conversations, not data scraping.",
  },
  nextSteps: [
    { emoji: "🎤", title: "Run 5 Mom Test interviews", detail: "Focus on founders in r/startups who expressed frustration with validation. Key question: 'Tell me about the last time you tried to validate an idea — what did you actually do?' Don't pitch Signal. Just listen." },
    { emoji: "💸", title: "Test willingness to pay", detail: "Create a landing page with a $9/mo price point. Run $50 in Reddit ads targeting r/Entrepreneur and r/SaaS. Measure click-through and email signups as demand proxies." },
    { emoji: "🏗️", title: "Build a 1-week MVP", detail: "Focus on the core loop: idea input → Reddit scan → quote extraction → demand score. Skip the comparison feature and competitive analysis for v1. Validate the core value prop first." },
  ],
  recommendation: "This market is significantly underserved with strong, unprompted demand. No dominant player. High buildability. The primary risk is monetization clarity — address this through Mom Test interviews with 5 founders in the next 2 weeks before investing in a full build.",
};

const patientIntakeReport: ValidationReport = {
  ideaTitle: "AI Patient Intake Automation",
  ideaDescription: "An AI-powered system that automates the patient check-in and intake process using intelligent forms, NLP, and EHR integration to eliminate paperwork and reduce wait times.",
  overallScore: 84,
  founderSignal: { score: 68, summary: "Needs healthcare domain expertise, HIPAA compliance, and EHR integrations — steep learning curve for non-healthcare founders." },
  investorSignal: { score: 91, summary: "Massive TAM ($50B+ healthcare admin market), regulatory moat once compliant, strong unit economics." },
  verdict: "High investor interest with significant technical and regulatory barriers for founders.",
  platforms: ["Reddit", "Health IT Forums", "Medical Twitter"],
  quadrants: {
    internalQual: {
      label: "Gut Check", score: 65,
      metrics: [
        { label: "Problem clarity", status: "pass", detail: "Pain is immediately obvious — paperwork is universally hated" },
        { label: "Founder fit", status: "partial", detail: "Requires healthcare domain expertise or strong advisor network" },
        { label: "Articulation", status: "pass", detail: "Easy to explain, hard to execute" },
      ],
    },
    externalQual: {
      label: "Mom Test Signals", score: 87, primary: true,
      metrics: [
        { label: "Unprompted pain", status: "pass", detail: "67 organic signals — clinicians complaining unprompted" },
        { label: "Specific complaints", status: "pass", detail: "Exact time costs cited: '45 min per patient'" },
        { label: "Mom Test compliance", status: "pass", detail: "5/5 rules passed — strong real-world evidence" },
      ],
    },
    internalQuant: {
      label: "Buildability", score: 58,
      metrics: [
        { label: "Technical complexity", status: "partial", detail: "High — HIPAA, HL7/FHIR, EHR integrations" },
        { label: "Time to MVP", status: "fail", detail: "3-6 months minimum due to compliance requirements" },
        { label: "Key dependencies", status: "partial", detail: "EHR vendor partnerships, security audits" },
      ],
    },
    externalQuant: {
      label: "Market Metrics", score: 82, primary: true,
      metrics: [
        { label: "Signal volume", status: "pass", detail: "67 relevant posts/comments found" },
        { label: "Avg engagement", status: "pass", detail: "548 average upvotes per signal" },
        { label: "Pay signals", status: "pass", detail: "18 mentions — explicit price points cited ($500/mo/provider)" },
      ],
    },
  },
  momTest: {
    score: 5, maxScore: 5,
    rules: [
      { rule: "Real conversations, not pitches", status: "pass", evidence: "Signals from healthcare worker forums and practice management discussions" },
      { rule: "Specific past behavior", status: "pass", evidence: "Clinicians cite exact time spent ('45 min per patient'), specific workarounds" },
      { rule: "Active pain", status: "pass", evidence: "Staff actively searching for solutions, trying multiple tools" },
      { rule: "Unprompted frustration", status: "pass", evidence: "Complaints arise in general healthcare threads, not product discussions" },
      { rule: "Willingness to pay", status: "pass", evidence: "Multiple explicit price points: '$500/mo per provider', '$200k/year lost to errors'" },
    ],
    verdict: "This idea passes all 5 Mom Test rules perfectly. Healthcare workers are expressing intense, specific pain with clear willingness to pay. The pain has been consistent for years, suggesting a durable market opportunity.",
  },
  quantMetrics: {
    totalSignals: 67, avgEngagement: 548, avgComments: 31, paySignals: 18, growthVelocity: "+28%",
    sourceBreakdown: [
      { source: "r/healthIT", pct: 38 },
      { source: "r/medicine", pct: 25 },
      { source: "r/startups", pct: 18 },
      { source: "r/smallbusiness", pct: 12 },
      { source: "Other", pct: 7 },
    ],
    engagementDistribution: { above100: 11, above50: 19, above10: 37 },
  },
  quotes: [
    { text: "We spend 45 minutes per patient on intake paperwork. Someone please automate this.", platform: "r/healthIT", upvotes: 823, date: "1 week ago", momTestTags: ["Unprompted pain", "Specific experience"] },
    { text: "Our front desk is drowning in paper forms. We tried going digital but the tools are terrible.", platform: "r/medicine", upvotes: 567, date: "2 weeks ago", momTestTags: ["Active searching", "Repeated frustration"] },
    { text: "I'd pay $500/month per provider if someone could cut our intake time in half.", platform: "r/startups", upvotes: 412, date: "3 weeks ago", momTestTags: ["Paying for alternatives", "Specific experience"] },
    { text: "The intake process hasn't changed in 30 years. It's insane that patients still fill out clipboards.", platform: "r/healthIT", upvotes: 389, date: "1 month ago", momTestTags: ["Unprompted pain", "Repeated frustration"] },
  ],
  painCategories: [
    { label: "Time-consuming manual paperwork", pct: 38 },
    { label: "Data entry errors and duplication", pct: 26 },
    { label: "Poor patient experience", pct: 21 },
    { label: "Staff burnout from admin tasks", pct: 15 },
  ],
  competitors: {
    direct: 4, indirect: 8, dominantPlayer: false, density: "Medium",
    interpretation: "Some competitors exist but no AI-native solution has captured significant share. Legacy EHR add-ons dominate but are universally hated — competition validates the market.",
    names: ["Phreesia", "Intake.me"],
  },
  checklist: [
    { label: "Problem is real", detail: "Clinicians cite exact time and money lost to manual intake", status: "pass" },
    { label: "Demand is organic", detail: "Frustration expressed in healthcare forums, not product threads", status: "pass" },
    { label: "Market has room", detail: "No AI-native dominant player — legacy tools are hated", status: "pass" },
    { label: "Willingness to pay", detail: "Explicit price points: $500/mo/provider cited multiple times", status: "pass" },
    { label: "Buildable", detail: "High complexity — HIPAA, EHR integrations, 3-6 month timeline", status: "warning" },
    { label: "Timing is right", detail: "Post-COVID digitization push accelerating adoption", status: "pass" },
    { label: "Clear monetization", detail: "Per-provider SaaS pricing model is proven in healthcare", status: "pass" },
  ],
  checklistVerdict: {
    greenCount: 6, total: 7, recommendation: "Strong go. Build an MVP this week.",
    detail: "Exceptional validation across 6 of 7 criteria. The only caution is buildability — this requires healthcare expertise and compliance work. If you have the domain knowledge, proceed aggressively.",
  },
  nextSteps: [
    { emoji: "🏥", title: "Find a healthcare co-founder", detail: "The #1 risk is domain expertise. Recruit a co-founder with clinical or health IT background. Check LinkedIn for ex-Epic or ex-Cerner employees who are startup-curious." },
    { emoji: "🎤", title: "Interview 5 practice managers", detail: "Focus on small practices (5-20 providers). Key question: 'Walk me through what happens when a new patient arrives.' Don't mention your product." },
    { emoji: "📋", title: "Map the compliance landscape", detail: "Before writing code, understand HIPAA BAA requirements, state regulations, and the HL7/FHIR integration path. This determines your architecture." },
  ],
  recommendation: "Healthcare intake automation represents a massive, proven market with clear willingness to pay. The primary barrier is execution complexity — HIPAA compliance, EHR integrations, and the long sales cycle. If you have healthcare domain expertise, this is a strong build. If not, find a co-founder who does before investing.",
};

const creatorRepurposingReport: ValidationReport = {
  ideaTitle: "Creator Content Repurposing Tool",
  ideaDescription: "An AI tool that automatically converts long-form content (YouTube videos, podcasts, blog posts) into optimized clips, social posts, threads, and newsletters for every platform.",
  overallScore: 78,
  founderSignal: { score: 85, summary: "Straightforward to build with existing AI APIs. Clear product-market fit for solo founders." },
  investorSignal: { score: 62, summary: "Crowded market with low switching costs. Defensibility concerns — easy to replicate." },
  verdict: "Easy to build, hard to defend. Strong founder opportunity but investor skepticism likely.",
  platforms: ["Reddit", "Creator Twitter", "YouTube Communities"],
  quadrants: {
    internalQual: {
      label: "Gut Check", score: 82,
      metrics: [
        { label: "Problem clarity", status: "pass", detail: "Every creator understands this pain immediately" },
        { label: "Founder fit", status: "pass", detail: "Can be built by any technical founder" },
        { label: "Articulation", status: "pass", detail: "One-sentence pitch: 'Create once, publish everywhere'" },
      ],
    },
    externalQual: {
      label: "Mom Test Signals", score: 76, primary: true,
      metrics: [
        { label: "Unprompted pain", status: "pass", detail: "72 organic signals about repurposing frustration" },
        { label: "Specific complaints", status: "pass", detail: "'6 hours repurposing one video' — exact time cited" },
        { label: "Mom Test compliance", status: "partial", detail: "3/5 rules passed — quality concerns muddy the signal" },
      ],
    },
    internalQuant: {
      label: "Buildability", score: 88,
      metrics: [
        { label: "Technical complexity", status: "pass", detail: "Low — GPT API + video processing APIs" },
        { label: "Time to MVP", status: "pass", detail: "2-3 weeks for a working prototype" },
        { label: "Key dependencies", status: "pass", detail: "OpenAI API, FFmpeg — well-documented" },
      ],
    },
    externalQuant: {
      label: "Market Metrics", score: 68, primary: true,
      metrics: [
        { label: "Signal volume", status: "pass", detail: "72 relevant posts/comments found" },
        { label: "Avg engagement", status: "partial", detail: "415 average upvotes — moderate" },
        { label: "Pay signals", status: "partial", detail: "8 mentions — some pay VAs $2k/mo but hesitant on tools" },
      ],
    },
  },
  momTest: {
    score: 3, maxScore: 5,
    rules: [
      { rule: "Real conversations, not pitches", status: "pass", evidence: "Signals from creator communities discussing workflow pain, not product threads" },
      { rule: "Specific past behavior", status: "pass", evidence: "Creators describe exact time spent ('6 hours per video') and current manual processes" },
      { rule: "Active pain", status: "pass", evidence: "Creators actively trying and switching between tools — high churn indicates unmet need" },
      { rule: "Unprompted frustration", status: "partial", evidence: "Some frustration is prompted by competitor product announcements" },
      { rule: "Willingness to pay", status: "fail", evidence: "Creators mention paying VAs but show reluctance to pay for tools — price sensitivity" },
    ],
    verdict: "The pain is real but willingness to pay for tools (vs. human VAs) is unclear. Creators often expect free or very cheap tools. The high churn across existing solutions suggests quality, not price, is the key differentiator.",
  },
  quantMetrics: {
    totalSignals: 72, avgEngagement: 415, avgComments: 18, paySignals: 8, growthVelocity: "+22%",
    sourceBreakdown: [
      { source: "r/content_marketing", pct: 32 },
      { source: "r/Entrepreneur", pct: 26 },
      { source: "r/SaaS", pct: 20 },
      { source: "r/NewTubers", pct: 14 },
      { source: "Other", pct: 8 },
    ],
    engagementDistribution: { above100: 8, above50: 16, above10: 48 },
  },
  quotes: [
    { text: "I create one YouTube video and then spend 6 hours repurposing it manually. This is unsustainable.", platform: "r/content_marketing", upvotes: 956, date: "1 week ago", momTestTags: ["Unprompted pain", "Specific experience"] },
    { text: "Every creator I know wants to be on 5 platforms but only has time for 1. The repurposing gap is huge.", platform: "r/Entrepreneur", upvotes: 723, date: "2 weeks ago", momTestTags: ["Unprompted pain", "Active searching"] },
    { text: "I tried 3 different repurposing tools and they all produce garbage. The AI isn't there yet for quality output.", platform: "r/SaaS", upvotes: 534, date: "3 weeks ago", momTestTags: ["Repeated frustration", "Active searching"] },
    { text: "My VA charges $2k/month just to repurpose my content. If AI could do 80% of that work, I'd switch instantly.", platform: "r/Entrepreneur", upvotes: 445, date: "1 month ago", momTestTags: ["Paying for alternatives", "Specific experience"] },
  ],
  painCategories: [
    { label: "Time cost of manual repurposing", pct: 36 },
    { label: "Quality of AI-generated derivatives", pct: 28 },
    { label: "Platform-specific formatting needs", pct: 20 },
    { label: "Consistency across channels", pct: 16 },
  ],
  competitors: {
    direct: 6, indirect: 12, dominantPlayer: false, density: "High",
    interpretation: "Crowded market with many competitors but no quality leader. High churn suggests opportunity for a quality-first entrant, but switching costs are very low.",
    names: ["Opus Clip", "Repurpose.io", "Castmagic"],
  },
  checklist: [
    { label: "Problem is real", detail: "Creators spending 6+ hours per piece on manual repurposing", status: "pass" },
    { label: "Demand is organic", detail: "Most signals are organic but some are prompted by competitor launches", status: "warning" },
    { label: "Market has room", detail: "Many competitors but no quality leader — high churn indicates opportunity", status: "warning" },
    { label: "Willingness to pay", detail: "Creators pay VAs but show reluctance toward tool pricing", status: "fail" },
    { label: "Buildable", detail: "Low complexity — GPT API + media processing, 2-3 week MVP", status: "pass" },
    { label: "Timing is right", detail: "Creator economy growing but AI hype may be peaking", status: "pass" },
    { label: "Clear monetization", detail: "Freemium with usage-based pricing is the proven model", status: "pass" },
  ],
  checklistVerdict: {
    greenCount: 4, total: 7, recommendation: "Promising. Proceed to user interviews",
    detail: "The demand is real but the market is crowded and willingness to pay for tools (vs. humans) needs validation. Win on quality or find a defensible niche.",
  },
  nextSteps: [
    { emoji: "🎯", title: "Pick one content type to nail", detail: "Don't try to be 'all content to all platforms.' Start with YouTube → Twitter threads, or podcast → newsletter. Own one conversion perfectly." },
    { emoji: "🎤", title: "Interview 5 creators with VAs", detail: "These are your ideal customers — they already pay for repurposing. Key question: 'What does your VA do that no tool has been able to replicate?'" },
    { emoji: "💰", title: "Pre-sell before building", detail: "Create a Gumroad or Stripe checkout for a $19/mo plan. Run Twitter ads to creators. If you can't get 20 signups, the idea needs refinement." },
  ],
  recommendation: "The creator content repurposing space has real demand but is increasingly competitive. Your advantage must be quality — not features, not price. If you can produce output that's 80% as good as a human VA, you win. But if your output is similar to Opus Clip or Repurpose.io, you'll struggle. Consider niching down to one specific creator type or content format.",
};

// ============= LOOKUP & GENERATION =============

const reportKeys: Record<string, ValidationReport> = {
  "signal": signalMetaReport,
  "this tool": signalMetaReport,
  "this tool — signal (meta)": signalMetaReport,
  "this tool — signal": signalMetaReport,
  "ai idea validation": signalMetaReport,
  "ai patient intake": patientIntakeReport,
  "ai patient intake automation": patientIntakeReport,
  "creator content repurposing": creatorRepurposingReport,
  "creator content repurposing tool": creatorRepurposingReport,
};

export function getValidationReport(ideaText: string): ValidationReport {
  const normalized = ideaText.toLowerCase().trim();
  for (const [key, report] of Object.entries(reportKeys)) {
    if (normalized.includes(key)) return report;
  }
  return generateGenericReport(ideaText);
}

function generateGenericReport(ideaText: string): ValidationReport {
  const title = ideaText.length > 60 ? ideaText.slice(0, 57) + "..." : ideaText;
  const score = Math.floor(Math.random() * 30 + 55);
  const founderScore = Math.floor(Math.random() * 25 + 55);
  const investorScore = Math.floor(Math.random() * 25 + 55);
  const signals = Math.floor(score * 0.5 + Math.random() * 20 + 10);

  return {
    ideaTitle: title,
    ideaDescription: ideaText,
    overallScore: score,
    founderSignal: { score: founderScore, summary: founderScore >= 75 ? "Buildable with standard tech stack. Clear product-market fit path." : "Moderate complexity. Requires domain expertise or key partnerships." },
    investorSignal: { score: investorScore, summary: investorScore >= 75 ? "Strong market signals with clear monetization path." : "Market potential exists but defensibility and monetization need exploration." },
    verdict: score >= 75 ? "Strong signal — notable organic demand detected. Worth pursuing." : score >= 60 ? "Moderate signal — emerging interest but validation gaps remain." : "Early signal — niche interest detected, more research needed.",
    platforms: ["Reddit", "Hacker News", "Twitter"],
    quadrants: {
      internalQual: { label: "Gut Check", score: Math.floor(Math.random() * 25 + 55), metrics: [
        { label: "Problem clarity", status: "pass", detail: "The problem can be articulated clearly" },
        { label: "Founder fit", status: "partial", detail: "Depends on founder's domain expertise" },
        { label: "Articulation", status: "pass", detail: "Explainable in a few sentences" },
      ]},
      externalQual: { label: "Mom Test Signals", score: Math.floor(Math.random() * 25 + 55), primary: true, metrics: [
        { label: "Unprompted pain", status: "partial", detail: `${signals} organic signals found` },
        { label: "Specific complaints", status: "partial", detail: "Some specific complaints but mostly general frustration" },
        { label: "Mom Test compliance", status: "partial", detail: "3/5 rules passed" },
      ]},
      internalQuant: { label: "Buildability", score: Math.floor(Math.random() * 25 + 60), metrics: [
        { label: "Technical complexity", status: "partial", detail: "Moderate — standard web/mobile stack" },
        { label: "Time to MVP", status: "pass", detail: "3-6 weeks for a working prototype" },
        { label: "Key dependencies", status: "pass", detail: "Standard APIs and services" },
      ]},
      externalQuant: { label: "Market Metrics", score: Math.floor(Math.random() * 25 + 50), primary: true, metrics: [
        { label: "Signal volume", status: "partial", detail: `${signals} relevant posts/comments found` },
        { label: "Avg engagement", status: "partial", detail: `${Math.floor(Math.random() * 300 + 100)} average upvotes` },
        { label: "Pay signals", status: "partial", detail: `${Math.floor(Math.random() * 8 + 2)} mentions of paying/budget` },
      ]},
    },
    momTest: {
      score: 3, maxScore: 5,
      rules: [
        { rule: "Real conversations, not pitches", status: "pass", evidence: "Most signals come from organic discussion threads" },
        { rule: "Specific past behavior", status: "partial", evidence: "Some users describe specific experiences but many are vague" },
        { rule: "Active pain", status: "pass", evidence: "Users actively looking for solutions in relevant communities" },
        { rule: "Unprompted frustration", status: "partial", evidence: "Mixed — some organic, some prompted by related discussions" },
        { rule: "Willingness to pay", status: "fail", evidence: "Limited explicit mentions of budget or pricing expectations" },
      ],
      verdict: "This idea shows moderate Mom Test compliance. The pain exists but the depth and specificity of complaints needs further investigation through direct interviews.",
    },
    quantMetrics: {
      totalSignals: signals, avgEngagement: Math.floor(Math.random() * 300 + 100), avgComments: Math.floor(Math.random() * 20 + 5), paySignals: Math.floor(Math.random() * 8 + 2), growthVelocity: `+${Math.floor(Math.random() * 30 + 10)}%`,
      sourceBreakdown: [
        { source: "r/startups", pct: 30 },
        { source: "r/SaaS", pct: 25 },
        { source: "r/Entrepreneur", pct: 20 },
        { source: "r/smallbusiness", pct: 15 },
        { source: "Other", pct: 10 },
      ],
      engagementDistribution: { above100: Math.floor(Math.random() * 8 + 3), above50: Math.floor(Math.random() * 12 + 5), above10: Math.floor(Math.random() * 25 + 15) },
    },
    quotes: [
      { text: `This is a real problem that needs solving. Current solutions are terrible.`, platform: "r/startups", upvotes: Math.floor(Math.random() * 500 + 100), date: "2 weeks ago", momTestTags: ["Unprompted pain", "Active searching"] },
      { text: `I've been looking for something like this for months. Would definitely pay for a good solution.`, platform: "r/SaaS", upvotes: Math.floor(Math.random() * 400 + 80), date: "3 weeks ago", momTestTags: ["Active searching", "Paying for alternatives"] },
      { text: `Currently doing everything manually. It takes hours and the results are inconsistent.`, platform: "r/Entrepreneur", upvotes: Math.floor(Math.random() * 300 + 60), date: "1 month ago", momTestTags: ["Specific experience", "Repeated frustration"] },
      { text: `The market is growing fast. First mover advantage is still available here.`, platform: "r/startups", upvotes: Math.floor(Math.random() * 250 + 50), date: "1 month ago", momTestTags: ["Unprompted pain"] },
    ],
    painCategories: [
      { label: "Manual processes too slow", pct: 32 },
      { label: "Existing tools inadequate", pct: 27 },
      { label: "High cost of current solutions", pct: 23 },
      { label: "Poor user experience", pct: 18 },
    ],
    competitors: {
      direct: Math.floor(Math.random() * 4 + 1), indirect: Math.floor(Math.random() * 8 + 3), dominantPlayer: false, density: "Medium",
      interpretation: "Market is still forming with some early players but no clear winner. Competition validates the market opportunity.",
      names: [],
    },
    checklist: [
      { label: "Problem is real", detail: "Users expressing genuine pain in online communities", status: "pass" },
      { label: "Demand is organic", detail: "Most signals are from organic discussions", status: "pass" },
      { label: "Market has room", detail: "No dominant player identified yet", status: "pass" },
      { label: "Willingness to pay", detail: "Limited explicit pricing signals — needs validation", status: "warning" },
      { label: "Buildable", detail: "Moderate complexity with standard technology", status: "pass" },
      { label: "Timing is right", detail: "Growing interest but not yet mainstream", status: "warning" },
      { label: "Clear monetization", detail: "Revenue model unclear — explore SaaS, usage-based, or marketplace", status: "fail" },
    ],
    checklistVerdict: {
      greenCount: 4, total: 7, recommendation: "Promising. Proceed to user interviews",
      detail: "Moderate signal strength. The core demand appears real but willingness to pay and monetization clarity need further validation through direct customer conversations.",
    },
    nextSteps: [
      { emoji: "🎤", title: "Run 5 Mom Test interviews", detail: "Find users who expressed this pain online. Ask about their current workflow and what they've tried. Don't pitch your idea." },
      { emoji: "💸", title: "Test willingness to pay", detail: "Create a simple landing page with pricing and measure conversion. Run small ad campaigns targeting relevant communities." },
      { emoji: "🏗️", title: "Build a minimal prototype", detail: "Focus on the single most painful step in the user's current workflow. Solve that one thing exceptionally well before expanding scope." },
    ],
    recommendation: `This space shows promising early signals. The demand appears real but needs deeper validation — particularly around willingness to pay and competitive differentiation. Consider starting with a narrow use case and expanding from there.`,
  };
}

// Pre-loaded ideas for compare page
export const preloadedCompareIdeas: ValidationReport[] = [signalMetaReport, patientIntakeReport];
