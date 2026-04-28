// supabase/functions/analyze/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { idea, redditPosts, hnStories, hnComments, classMode } = await req.json();
    if (!idea) throw new Error("Missing idea");

    // Build context from scraped data — 20 posts, 800 char body, inline topComments
    const redditContext = (redditPosts || [])
      .slice(0, 20)
      .map((p: any, i: number) => {
        let entry = `[R${i}] r/${p.subreddit} | ↑${p.score} | ${p.numComments} comments\nTitle: ${p.title}\n${p.body?.slice(0, 800) || "(no body)"}`;
        // Include up to 3 top comments per post, 200 chars each
        if (p.topComments?.length) {
          const commentLines = p.topComments
            .slice(0, 3)
            .map((c: any, j: number) => `  [Comment ${j}] ↑${c.score} by ${c.author}: ${c.body?.slice(0, 200)}`)
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

    const classModeSchema = classMode ? `
  "teachingNotes": {
    "momTestLesson": "what this idea's results teach about the Mom Test framework",
    "commonMistake": "what assumption founders typically make that this data corrects",
    "discussionQuestion": "one question an instructor could pose to a class about this result"
  },` : "";

    const prompt = `You are Signal's demand validation engine. A user wants to validate this startup idea:

"${idea}"

Below is REAL data scraped from Reddit and Hacker News. Analyze it to determine if genuine demand exists.

=== REDDIT POSTS ===
${redditContext || "(no Reddit data found)"}

=== HACKER NEWS STORIES ===
${hnStoriesContext || "(no HN stories found)"}

=== HACKER NEWS COMMENTS ===
${hnCommentsContext || "(no HN comments found)"}

PAY SIGNAL PHRASES — weight these heavily when scoring willingnessToPay:
"I would pay", "I'd pay", "take my money", "been looking for this", "I need this",
"why doesn't X exist", "I use [workaround] because", "costs me X hours", "we pay $X for"

RED FLAG PHRASES — flag these and lower scores accordingly:
"sounds cool", "interesting idea", "could be useful", "maybe someday",
"not sure I'd use it", "too many of these already"

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
  "quotes": [
    {
      "text": "exact quote from the data above showing pain or demand (max 200 chars)",
      "source": "reddit or hackernews",
      "subreddit": "subreddit name if reddit",
      "score": 45,
      "url": "url if available"
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
  "verdict": "BUILD or MAYBE or SKIP",
  "recommendation": "2-3 sentence strategic recommendation based on the evidence",
  "nextSteps": ["actionable step 1", "actionable step 2", "actionable step 3"],
  "redFlags": ["specific reason grounded in the data this idea might fail"],
  "reasoning": {
    "demandScore": "2 sentences explaining exactly what drove this number",
    "founderScore": "what specifically supports or undermines buildability",
    "investorScore": "what the data says about market size and timing"
  },
  "marketMaturity": "EMERGING | GROWING | SATURATED | UNKNOWN"${classModeSchema ? "," + classModeSchema : ""}
}

RULES:
- Only use REAL quotes from the data above. Never fabricate quotes.
- If data is sparse, lower scores honestly. Don't inflate.
- Pick the 4-6 most compelling quotes that show genuine pain or willingness to pay.
- Pain categories should reflect what you actually see in the data.
- overallDemandScore is 0-100. Most ideas should score 30-65. Only exceptional evidence gets 70+.
- Be rigorous. Founders need honest signal, not false confidence.
- redFlags must be specific reasons grounded in the scraped data, not generic warnings.
- reasoning fields must reference specific data points you analyzed.
- marketMaturity must be exactly one of: EMERGING, GROWING, SATURATED, or UNKNOWN.`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
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
