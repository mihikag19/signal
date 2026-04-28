// supabase/functions/analyze/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

function compact(arr: any[], limit: number): any[] {
  return (arr || []).slice(0, limit);
}

// Try to extract score fields from a partial JSON buffer
function tryExtractScores(buf: string): object | null {
  const overall = buf.match(/"overallDemandScore"\s*:\s*(\d+)/)?.[1];
  if (!overall) return null;
  const scores: Record<string, unknown> = { overallDemandScore: parseInt(overall) };

  const founderBlock = buf.match(/"founderScore"\s*:\s*\{([^}]+)\}/);
  if (founderBlock) {
    try { scores.founderScore = JSON.parse("{" + founderBlock[1] + "}"); } catch { /* partial */ }
  }
  const attnBlock = buf.match(/"attentionScore"\s*:\s*\{([^}]+)\}/);
  if (attnBlock) {
    try { scores.attentionScore = JSON.parse("{" + attnBlock[1] + "}"); } catch { /* partial */ }
  }
  const investorBlock = buf.match(/"investorScore"\s*:\s*\{([^}]+)\}/);
  if (investorBlock) {
    try { scores.investorScore = JSON.parse("{" + investorBlock[1] + "}"); } catch { /* partial */ }
  }
  return scores;
}

// Extract complete quote objects that haven't been emitted yet
function tryExtractQuotes(buf: string, alreadyEmitted: number): any[] {
  const section = buf.match(/"quotes"\s*:\s*\[([\s\S]*?)(?:(?<=\})\s*\])/)?.[1]
    ?? buf.match(/"quotes"\s*:\s*\[([\s\S]*?)$/)?.[1];
  if (!section) return [];

  const matches = [...section.matchAll(/\{[^{}]*"text"\s*:\s*"(?:[^"\\]|\\.)*"[^{}]*\}/g)];
  const result: any[] = [];
  for (let i = alreadyEmitted; i < matches.length; i++) {
    try { result.push(JSON.parse(matches[i][0])); } catch { /* skip */ }
  }
  return result;
}

function buildContextAndPrompt(body: any): { prompt: string; itemCount: number } {
  const {
    idea,
    redditPosts, hnStories, hnComments, phPosts, devtoArticles, ihPosts,
    githubRepos, githubIssues, soQuestions,
    googleTrends, autocompleteSuggestions, peopleAlsoAsk,
    wikipediaArticles, g2Products, g2Complaints,
    chromeExtensions, trustpilotCompanies,
    appstoreApps, appstoreNegativeReviews,
    youtubeVideos, mediumArticles, substackPosts,
    lobstersStories, lemmyPosts,
    crunchbaseCompanies, wellfoundCompanies, ycCompanies,
    npmPackages, pypiPackages, ghStarsRepos,
    classMode,
  } = body;

  const redditCtx = compact(redditPosts, 20).map((p: any, i: number) => {
    let e = `[R${i}] r/${p.subreddit} ↑${p.score} | ${p.numComments} comments\n${p.title}\n${(p.body || "").slice(0, 600)}`;
    if (p.topComments?.length) {
      e += "\n" + p.topComments.slice(0, 3).map((c: any, j: number) =>
        `  [C${j}] ↑${c.score} ${c.author}: ${(c.body || "").slice(0, 150)}`
      ).join("\n");
    }
    return e;
  }).join("\n---\n");

  const hnStoriesCtx = compact(hnStories, 20).map((s: any, i: number) =>
    `[HN-S${i}] ${s.title} | ${s.points} pts | ${s.numComments} comments`
  ).join("\n");

  const hnCommentsCtx = compact(hnComments, 30).map((c: any, i: number) =>
    `[HN-C${i}] "${(c.text || "").slice(0, 250)}" — ${c.author} (re: ${c.storyTitle})`
  ).join("\n---\n");

  const phCtx = compact(phPosts, 8).map((p: any, i: number) =>
    `[PH${i}] ${p.name} — "${p.tagline}" | ↑${p.votes} | ${p.comments} comments`
  ).join("\n");

  const devtoCtx = compact(devtoArticles, 8).map((a: any, i: number) =>
    `[DT${i}] "${a.title}" ♥${a.reactions} | ${(a.description || "").slice(0, 150)}`
  ).join("\n");

  const ihCtx = compact(ihPosts, 8).map((p: any, i: number) =>
    `[IH${i}] "${p.title}" — ${(p.description || "").slice(0, 150)}`
  ).join("\n");

  const ghCtx = [
    ...compact(githubRepos, 6).map((r: any, i: number) =>
      `[GH-R${i}] ${r.name} ⭐${r.stars} | ${r.openIssues} issues | ${(r.description || "").slice(0, 150)}`
    ),
    ...compact(githubIssues, 6).map((iss: any, i: number) =>
      `[GH-I${i}] "${iss.title}" | ${iss.comments} comments | +${iss.reactions} 👍\n${(iss.body || "").slice(0, 150)}`
    ),
  ].join("\n");

  const soCtx = compact(soQuestions, 8).map((q: any, i: number) =>
    `[SO${i}] "${q.title}" ↑${q.score} | ${q.answers} answers | ${q.views} views`
  ).join("\n");

  let trendsCtx = "";
  if (googleTrends && !googleTrends.error) {
    const m = googleTrends.meta || {};
    const rq = (googleTrends.relatedQueries || []).slice(0, 5).map((q: any) => q.query).join(", ");
    const bq = (googleTrends.breakoutQueries || []).slice(0, 3).map((q: any) => q.query).join(", ");
    trendsCtx = `Trend direction: ${m.trendDirection || "unknown"} | current: ${m.currentInterest}/100 | peak: ${m.peakInterest}/100
Related searches: ${rq || "none"}${bq ? `\nBREAKOUT queries: ${bq}` : ""}`;
  }

  const autocompleteCtx = autocompleteSuggestions?.length
    ? `Autocomplete: ${(autocompleteSuggestions as string[]).slice(0, 20).join(" | ")}\n` +
      (peopleAlsoAsk?.length ? `People Also Ask: ${(peopleAlsoAsk as string[]).slice(0, 6).join(" | ")}` : "")
    : "";

  const wikiCtx = compact(wikipediaArticles, 3).map((a: any) =>
    `"${a.title}" — ${a.trendDirection} (${(a.totalViews || 0).toLocaleString()} views/yr)`
  ).join(" | ");

  const reviewCtx = [
    g2Products?.length ? `G2 products: ${compact(g2Products, 5).map((p: any) => `${p.name}${p.rating ? ` (${p.rating}★)` : ""}`).join(", ")}` : "",
    g2Complaints?.length ? `G2 complaints: "${compact(g2Complaints, 3).join('" | "')}"` : "",
    trustpilotCompanies?.length ? `Trustpilot: ${compact(trustpilotCompanies, 5).map((c: any) => `${c.name}${c.trustScore ? ` ${c.trustScore}/5` : ""}`).join(", ")}` : "",
    appstoreApps?.length ? `App Store: ${compact(appstoreApps, 5).map((a: any) => `${a.name}${a.rating ? ` (${a.rating.toFixed(1)}★, ${a.ratingCount} ratings)` : ""}`).join(", ")}` : "",
    appstoreNegativeReviews?.length ? `App Store complaints: "${compact(appstoreNegativeReviews, 3).map((r: any) => r.body?.slice(0, 100)).join('" | "')}"` : "",
    chromeExtensions?.length ? `Chrome extensions: ${compact(chromeExtensions, 5).map((e: any) => e.name).join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const youtubeCtx = compact(youtubeVideos, 6).map((v: any, i: number) =>
    `[YT${i}] "${v.title}" ${v.channel ? `— ${v.channel}` : ""} | ${(v.views || 0).toLocaleString()} views`
  ).join("\n");

  const contentCtx = [
    compact(mediumArticles, 5).map((a: any) => `[Medium] "${a.title}" ${a.claps ? `♥${a.claps}` : ""}`).join("\n"),
    compact(substackPosts, 5).map((p: any) => `[Substack] "${p.title}" ${p.newsletter ? `— ${p.newsletter}` : ""}`).join("\n"),
    compact(lobstersStories, 5).map((s: any) => `[Lobste.rs] "${s.title}" ↑${s.score}`).join("\n"),
    compact(lemmyPosts, 5).map((p: any) => `[Lemmy] "${p.title}" ↑${p.score}`).join("\n"),
  ].filter((s) => s.trim()).join("\n");

  const startupCtx = [
    crunchbaseCompanies?.length ? `Crunchbase orgs: ${compact(crunchbaseCompanies, 6).map((c: any) => c.name).join(", ")}` : "",
    wellfoundCompanies?.length ? `Wellfound startups: ${compact(wellfoundCompanies, 6).map((c: any) => c.name).join(", ")}` : "",
    ycCompanies?.length ? `YC companies: ${compact(ycCompanies, 8).map((c: any) => `${c.name}${c.batch ? ` (${c.batch})` : ""}`).join(", ")}` : "",
  ].filter(Boolean).join("\n");

  const devEcosystemCtx = [
    compact(npmPackages, 5).map((p: any) =>
      `[npm] ${p.name}: ${p.weeklyDownloads ? `${p.weeklyDownloads.toLocaleString()}/wk` : "unknown downloads"} — ${(p.description || "").slice(0, 80)}`
    ).join("\n"),
    compact(pypiPackages, 5).map((p: any) =>
      `[PyPI] ${p.name}: ${p.lastMonthDownloads ? `${p.lastMonthDownloads.toLocaleString()}/mo` : "unknown"}`
    ).join("\n"),
    compact(ghStarsRepos, 5).map((r: any) =>
      `[GitHub Stars] ${r.name}: ⭐${r.currentStars} | ${r.starGrowthRate || "unknown velocity"}`
    ).join("\n"),
  ].filter((s) => s.trim()).join("\n");

  const classModeBlock = classMode ? `  "teachingNotes": {
    "momTestLesson": "string",
    "commonMistake": "string",
    "discussionQuestion": "string"
  },` : "";

  const itemCount =
    compact(redditPosts, 999).length + compact(hnStories, 999).length +
    compact(hnComments, 999).length + compact(youtubeVideos, 999).length;

  const prompt = `You are Signal's demand validation engine. A user wants to validate this startup idea:

"${idea}"

Below is REAL data from ${itemCount} signals across multiple platforms. Analyze it to determine if genuine demand exists.

=== REDDIT ===
${redditCtx || "(no data)"}

=== HACKER NEWS STORIES ===
${hnStoriesCtx || "(no data)"}

=== HACKER NEWS COMMENTS ===
${hnCommentsCtx || "(no data)"}

=== PRODUCT HUNT ===
${phCtx || "(no data)"}

=== DEV.TO ===
${devtoCtx || "(no data)"}

=== INDIE HACKERS ===
${ihCtx || "(no data)"}

=== GITHUB REPOS & ISSUES ===
${ghCtx || "(no data)"}

=== STACK OVERFLOW ===
${soCtx || "(no data)"}

=== GOOGLE TRENDS ===
${trendsCtx || "(no data)"}

=== GOOGLE AUTOCOMPLETE & PEOPLE ALSO ASK ===
${autocompleteCtx || "(no data)"}

=== WIKIPEDIA PAGEVIEWS ===
${wikiCtx || "(no data)"}

=== REVIEW PLATFORMS (G2 / TRUSTPILOT / APP STORE / CHROME) ===
${reviewCtx || "(no data)"}

=== YOUTUBE ===
${youtubeCtx || "(no data)"}

=== CONTENT PLATFORMS (MEDIUM / SUBSTACK / LOBSTE.RS / LEMMY) ===
${contentCtx || "(no data)"}

=== STARTUP ECOSYSTEM (CRUNCHBASE / WELLFOUND / YC) ===
${startupCtx || "(no data)"}

=== DEVELOPER ECOSYSTEM (NPM / PYPI / GITHUB STARS) ===
${devEcosystemCtx || "(no data)"}

WEIGHTING GUIDE:
- Google Trends with rising direction = strong velocity signal (boost velocity score)
- Review platform data (G2, App Store, Trustpilot) = strongest competitor weakness signal and WTP evidence
- Crunchbase/Wellfound/YC companies = market is validated but may be crowded
- npm/PyPI downloads trending up = real developer adoption, not just discussion
- YouTube view counts > 100k = mainstream awareness (can help or hurt — crowded market)
- Google Autocomplete suggests = what real consumers search for (add to personas)
- YC companies = strongest market validation signal (YC only backs validated markets)

PAY SIGNAL PHRASES:
"I would pay", "I'd pay", "take my money", "been looking for this", "I need this",
"why doesn't X exist", "I use [workaround] because", "costs me X hours", "we pay $X for"

RED FLAG PHRASES:
"sounds cool", "interesting idea", "could be useful", "maybe someday",
"not sure I'd use it", "too many of these already"

ATTENTION SCORE:
- velocity (0-10, 40%): rising Google Trends + recent posts = high; old data only = low
- density (0-10, 30%): concentrated in 1-2 communities = high; scattered = low
- novelty (0-10, 30%): fresh topic (<1yr) = high; recurring for 3+ years = low
- overall = velocity*0.4 + density*0.3 + novelty*0.3

Respond with ONLY valid JSON (no markdown, no backticks):
{
  "overallDemandScore": 72,
  "founderScore": {
    "overall": 7.5, "painIntensity": 8.0, "buildFeasibility": 7.0,
    "urgency": 7.5, "willingnessToPay": 6.5
  },
  "investorScore": {
    "overall": 6.8,
    "marketSize": "TAM estimate with reasoning",
    "timing": "why now",
    "defensibility": "potential moats",
    "exitPotential": "exit thesis"
  },
  "attentionScore": {
    "overall": 7.2, "velocity": 8.0, "density": 7.5, "novelty": 5.8
  },
  "quotes": [
    { "text": "exact quote ≤200 chars", "source": "reddit|hackernews|producthunt|devto|stackoverflow|youtube|appstore|medium|lobsters", "subreddit": "name or null", "score": 45, "url": null }
  ],
  "painCategories": [
    { "category": "Time/Efficiency", "percentage": 40 },
    { "category": "Cost", "percentage": 25 },
    { "category": "Missing Tool", "percentage": 20 },
    { "category": "Quality/Trust", "percentage": 15 }
  ],
  "competitors": [
    { "name": "Name", "weakness": "what they don't do well" }
  ],
  "competitorMap": [
    { "name": "Name", "description": "one sentence", "estimatedTraction": "early|growing|mature", "biggestWeakness": "string" }
  ],
  "revenueModel": {
    "suggestedModel": "SaaS|marketplace|usage-based|freemium|one-time",
    "priceSensitivity": "low|medium|high",
    "estimatedPriceRange": "$X-$Y/month",
    "proofQuotes": ["quote showing price signal from data"]
  },
  "targetPersonas": [
    { "role": "job title or type", "primaryPainPoint": "string", "activePlatforms": ["reddit"], "representativeQuote": "exact quote from data" }
  ],
  "buildRecommendations": {
    "topFeatures": ["feature 1", "feature 2", "feature 3"],
    "targetAudience": "narrow first customer",
    "bestChannels": ["channel 1", "channel 2"],
    "biggestRisk": "single biggest execution risk"
  },
  "sentimentAnalysis": {
    "positive": 45, "negative": 30, "neutral": 25, "trendDirection": "rising|falling|stable"
  },
  "confidenceScore": {
    "score": 72,
    "reasoning": "brief: how much data, how consistent, any conflicting signals"
  },
  "verdict": "BUILD|MAYBE|SKIP",
  "recommendation": "2-3 sentence strategic recommendation",
  "nextSteps": ["step 1", "step 2", "step 3"],
  "redFlags": ["specific data-grounded reason"],
  "reasoning": {
    "demandScore": "2 sentences on what drove this number",
    "founderScore": "what supports/undermines buildability",
    "investorScore": "market size and timing evidence"
  },
  "marketMaturity": "EMERGING|GROWING|SATURATED|UNKNOWN"${classModeBlock ? ",\n" + classModeBlock : ""}
}

RULES:
- Only use REAL quotes from the data. Never fabricate.
- Sparse data → lower scores honestly. Don't inflate.
- 4-6 most compelling quotes showing pain or WTP.
- painCategories percentages must sum to 100.
- sentimentAnalysis percentages must sum to 100.
- overallDemandScore 0-100: most ideas 30-65, only exceptional evidence gets 70+.
- YC companies in the space → validated market but raises competitorMap density.
- Review platform complaints → use verbatim as quotes if strong enough.
- Google Trends rising → boosts velocity and urgency scores.`;

  return { prompt, itemCount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    if (!body.idea) throw new Error("Missing idea");

    const { prompt, itemCount } = buildContextAndPrompt(body);

    // ── Streaming mode ────────────────────────────────────────────────────
    if (body.stream === true) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const emit = (obj: object) =>
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

          try {
            emit({ type: "status", message: `Analyzing ${itemCount} data points across active sources...` });

            const res = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
              },
              body: JSON.stringify({
                model: "claude-sonnet-4-20250514",
                max_tokens: 8000,
                stream: true,
                messages: [{ role: "user", content: prompt }],
              }),
            });

            if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);

            emit({ type: "status", message: "Generating insights..." });

            const reader = res.body!.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let scoresEmitted = false;
            let quotesEmitted = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split("\n")) {
                if (!line.startsWith("data: ")) continue;
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const event = JSON.parse(jsonStr);
                  if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                    const text = event.delta.text as string;
                    buffer += text;
                    emit({ type: "partial", text });

                    if (!scoresEmitted && buffer.length > 300) {
                      const scores = tryExtractScores(buffer);
                      if (scores) {
                        emit({ type: "scores", scores });
                        scoresEmitted = true;
                      }
                    }

                    const newQuotes = tryExtractQuotes(buffer, quotesEmitted);
                    for (const q of newQuotes) {
                      emit({ type: "quote", quote: q });
                      quotesEmitted++;
                    }
                  }
                } catch { /* skip malformed events */ }
              }
            }

            // Parse and emit complete
            try {
              const analysis = JSON.parse(buffer.replace(/```json|```/g, "").trim());
              emit({ type: "complete", analysis });
            } catch {
              emit({ type: "error", message: "Failed to parse Claude response" });
            }
          } catch (e) {
            emit({ type: "error", message: String(e) });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        },
      });
    }

    // ── Non-streaming fallback ────────────────────────────────────────────
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";

    let analysis;
    try {
      analysis = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      console.error("Parse error. Raw:", text.slice(0, 500));
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
