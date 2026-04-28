// supabase/functions/analyze/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const {
      idea,
      redditPosts,
      hnStories,
      hnComments,
      phPosts,
      devtoArticles,
      ihPosts,
      githubRepos,
      githubIssues,
      soQuestions,
      classMode,
    } = await req.json();
    if (!idea) throw new Error("Missing idea");

    // Reddit context — top 20 posts with inline comments
    const redditContext = (redditPosts || [])
      .slice(0, 20)
      .map((p: any, i: number) => {
        let entry = `[R${i}] r/${p.subreddit} | ↑${p.score} | ${p.numComments} comments\nTitle: ${p.title}\n${p.body?.slice(0, 800) || "(no body)"}`;
        if (p.topComments?.length) {
          const commentLines = p.topComments
            .slice(0, 3)
            .map((c: any, j: number) => `  [C${j}] ↑${c.score} ${c.author}: ${c.body?.slice(0, 200)}`)
            .join("\n");
          entry += `\nTop Comments:\n${commentLines}`;
        }
        return entry;
      })
      .join("\n---\n");

    const hnStoriesContext = (hnStories || [])
      .slice(0, 20)
      .map((s: any, i: number) =>
        `[HN-S${i}] ${s.title} | ${s.points} pts | ${s.numComments} comments`
      )
      .join("\n");

    const hnCommentsContext = (hnComments || [])
      .slice(0, 30)
      .map((c: any, i: number) =>
        `[HN-C${i}] "${c.text?.slice(0, 300)}" — ${c.author} (re: ${c.storyTitle})`
      )
      .join("\n---\n");

    const phContext = (phPosts || [])
      .slice(0, 10)
      .map((p: any, i: number) =>
        `[PH${i}] ${p.name} — "${p.tagline}" | ↑${p.votes} | ${p.comments} comments`
      )
      .join("\n");

    const devtoContext = (devtoArticles || [])
      .slice(0, 10)
      .map((a: any, i: number) =>
        `[DT${i}] "${a.title}" | ♥${a.reactions} | ${a.comments} comments\n${(a.description || "").slice(0, 200)}`
      )
      .join("\n---\n");

    const ihContext = (ihPosts || [])
      .slice(0, 10)
      .map((p: any, i: number) =>
        `[IH${i}] "${p.title}"\n${(p.description || "").slice(0, 200)}`
      )
      .join("\n---\n");

    const githubContext = [
      ...(githubRepos || []).slice(0, 8).map((r: any, i: number) =>
        `[GH-R${i}] ${r.name} | ⭐${r.stars} | ${r.openIssues} open issues\n${(r.description || "").slice(0, 200)}`
      ),
      ...(githubIssues || []).slice(0, 8).map((iss: any, i: number) =>
        `[GH-I${i}] "${iss.title}" | ${iss.comments} comments | +${iss.reactions} 👍\n${(iss.body || "").slice(0, 200)}`
      ),
    ].join("\n---\n");

    const soContext = (soQuestions || [])
      .slice(0, 10)
      .map((q: any, i: number) =>
        `[SO${i}] "${q.title}" | ↑${q.score} | ${q.answers} answers | ${q.views} views\n${(q.body || "").slice(0, 200)}`
      )
      .join("\n---\n");

    const classModeSchema = classMode
      ? `  "teachingNotes": {
    "momTestLesson": "what this idea's results teach about the Mom Test framework",
    "commonMistake": "what assumption founders typically make that this data corrects",
    "discussionQuestion": "one question an instructor could pose to a class about this result"
  },`
      : "";

    const prompt = `You are Signal's demand validation engine. A user wants to validate this startup idea:

"${idea}"

Below is REAL data scraped from multiple communities. Analyze it to determine if genuine demand exists.

=== REDDIT POSTS ===
${redditContext || "(no Reddit data found)"}

=== HACKER NEWS STORIES ===
${hnStoriesContext || "(no HN stories found)"}

=== HACKER NEWS COMMENTS ===
${hnCommentsContext || "(no HN comments found)"}

=== PRODUCT HUNT ===
${phContext || "(no Product Hunt data found)"}

=== DEV.TO ARTICLES ===
${devtoContext || "(no dev.to data found)"}

=== INDIE HACKERS ===
${ihContext || "(no Indie Hackers data found)"}

=== GITHUB REPOS & ISSUES ===
${githubContext || "(no GitHub data found)"}

=== STACK OVERFLOW ===
${soContext || "(no Stack Overflow data found)"}

PAY SIGNAL PHRASES — weight these heavily when scoring willingnessToPay:
"I would pay", "I'd pay", "take my money", "been looking for this", "I need this",
"why doesn't X exist", "I use [workaround] because", "costs me X hours", "we pay $X for"

RED FLAG PHRASES — flag these and lower scores accordingly:
"sounds cool", "interesting idea", "could be useful", "maybe someday",
"not sure I'd use it", "too many of these already"

ATTENTION SCORE GUIDANCE:
- velocity (0-10, 40% weight): Are posts recent (last 30 days)? Rising = 8-10. Stable = 5-7. Declining = 1-4.
- density (0-10, 30% weight): Concentrated in 1-2 communities = 8-10. Scattered across 10+ = 1-4.
- novelty (0-10, 30% weight): Fresh topic (< 1 year old) = 8-10. Recurring problem for 3+ years = 1-4.
- overall = velocity*0.4 + density*0.3 + novelty*0.3

Analyze this data and respond with ONLY valid JSON (no markdown, no backticks, no explanation):
{
  "overallDemandScore": 72,
  "founderScore": {
    "overall": 7.5,
    "painIntensity": 8.0,
    "buildFeasibility": 7.0,
    "urgency": 7.5,
    "willingnessToPay": 6.5
  },
  "investorScore": {
    "overall": 6.8,
    "marketSize": "TAM estimate with brief reasoning",
    "timing": "Why this market is timely now",
    "defensibility": "Potential moats",
    "exitPotential": "Brief exit thesis"
  },
  "attentionScore": {
    "overall": 7.2,
    "velocity": 8.0,
    "density": 7.5,
    "novelty": 5.8
  },
  "quotes": [
    {
      "text": "exact quote from the data above showing pain or demand (max 200 chars)",
      "source": "reddit or hackernews or producthunt or devto or indiehackers or github or stackoverflow",
      "subreddit": "subreddit name if reddit, else null",
      "score": 45,
      "url": "url if available, else null"
    }
  ],
  "painCategories": [
    { "category": "Time/Efficiency", "percentage": 40 },
    { "category": "Cost", "percentage": 25 },
    { "category": "Missing Tool", "percentage": 20 },
    { "category": "Quality/Trust", "percentage": 15 }
  ],
  "competitors": [
    { "name": "Competitor Name", "weakness": "What it doesn't do well" }
  ],
  "competitorMap": [
    {
      "name": "Competitor Name",
      "description": "one sentence about what they do",
      "estimatedTraction": "early | growing | mature",
      "biggestWeakness": "what they fail at based on the data"
    }
  ],
  "revenueModel": {
    "suggestedModel": "SaaS subscription | marketplace | usage-based | freemium | one-time",
    "priceSensitivity": "low | medium | high",
    "estimatedPriceRange": "$X-$Y/month or flat fee",
    "proofQuotes": ["quote from data showing price sensitivity or WTP"]
  },
  "targetPersonas": [
    {
      "role": "job title or user type",
      "primaryPainPoint": "what they struggle with most",
      "activePlatforms": ["reddit", "hackernews"],
      "representativeQuote": "exact quote from data that typifies this persona"
    }
  ],
  "buildRecommendations": {
    "topFeatures": ["feature 1 based on data", "feature 2", "feature 3"],
    "targetAudience": "narrow description of ideal first customer",
    "bestChannels": ["channel based on where demand was found", "channel 2"],
    "biggestRisk": "single biggest execution risk grounded in the data"
  },
  "sentimentAnalysis": {
    "positive": 45,
    "negative": 30,
    "neutral": 25,
    "trendDirection": "rising | falling | stable"
  },
  "confidenceScore": {
    "score": 72,
    "reasoning": "brief reason — is there enough data? conflicting signals? strong consensus?"
  },
  "verdict": "BUILD or MAYBE or SKIP",
  "recommendation": "2-3 sentence strategic recommendation based on the evidence",
  "nextSteps": ["actionable step 1", "actionable step 2", "actionable step 3"],
  "redFlags": ["specific reason grounded in the data this idea might fail"],
  "reasoning": {
    "demandScore": "2 sentences explaining exactly what drove this number",
    "founderScore": "what specifically supports or undermines buildability",
    "investorScore": "what the data says about market size and timing"
  },
  "marketMaturity": "EMERGING | GROWING | SATURATED | UNKNOWN"${classModeSchema ? ",\n" + classModeSchema : ""}
}

RULES:
- Only use REAL quotes from the data above. Never fabricate quotes.
- If data is sparse, lower scores honestly. Don't inflate.
- Pick the 4-6 most compelling quotes showing genuine pain or WTP.
- Pain categories should reflect what you actually see in the data, percentages must sum to 100.
- overallDemandScore is 0-100. Most ideas score 30-65. Only exceptional evidence gets 70+.
- Be rigorous. Founders need honest signal, not false confidence.
- redFlags must be specific reasons grounded in the scraped data, not generic warnings.
- reasoning fields must reference specific data points you analyzed.
- marketMaturity must be exactly one of: EMERGING, GROWING, SATURATED, or UNKNOWN.
- competitorMap should overlap with competitors but add more detail. Include 3-5 entries max.
- targetPersonas: identify 1-3 distinct personas visible in the data. If only one, just return one.
- sentimentAnalysis percentages must sum to 100.
- confidenceScore.score is 0-100: low if data is thin, high if many consistent signals.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";

    let analysis;
    try {
      analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      console.error("Parse error. Raw response:", text);
      throw new Error("Failed to parse Claude response");
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Analyze error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
