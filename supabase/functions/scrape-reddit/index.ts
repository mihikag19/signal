// supabase/functions/scrape-reddit/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SUBREDDITS = [
  "startups", "SaaS", "Entrepreneur", "indiehackers",
  "smallbusiness", "microsaas", "nocode", "webdev",
  "ProductManagement", "SideProject"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, subreddits } = await req.json();
    if (!query) throw new Error("Missing query");

    const subs = subreddits || DEFAULT_SUBREDDITS;
    const allPosts: any[] = [];
    const seen = new Set<string>();

    // Search each subreddit
    for (const sub of subs) {
      try {
        const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&limit=25&sort=relevance&t=year`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Signal/1.0 (market research tool)" },
        });

        if (!res.ok) continue;
        const data = await res.json();

        for (const child of data?.data?.children ?? []) {
          const p = child.data;
          if (seen.has(p.id)) continue;
          seen.add(p.id);

          if (p.score < 2 && p.num_comments < 2) continue;

          allPosts.push({
            id: p.id,
            title: p.title,
            body: (p.selftext || "").slice(0, 2000),
            author: p.author,
            score: p.score,
            numComments: p.num_comments,
            subreddit: p.subreddit,
            url: `https://reddit.com${p.permalink}`,
            createdAt: new Date(p.created_utc * 1000).toISOString(),
          });
        }
      } catch (e) {
        console.error(`r/${sub} failed:`, e);
      }
      // Rate limit: 1.5s between requests
      await new Promise((r) => setTimeout(r, 1500));
    }

    // Also search global Reddit
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25&sort=relevance&t=year`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Signal/1.0 (market research tool)" },
      });
      if (res.ok) {
        const data = await res.json();
        for (const child of data?.data?.children ?? []) {
          const p = child.data;
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          if (p.score < 2 && p.num_comments < 2) continue;
          allPosts.push({
            id: p.id,
            title: p.title,
            body: (p.selftext || "").slice(0, 2000),
            author: p.author,
            score: p.score,
            numComments: p.num_comments,
            subreddit: p.subreddit,
            url: `https://reddit.com${p.permalink}`,
            createdAt: new Date(p.created_utc * 1000).toISOString(),
          });
        }
      }
    } catch (e) {
      console.error("Global search failed:", e);
    }

    // Sort by score descending
    allPosts.sort((a, b) => b.score - a.score);

    return new Response(
      JSON.stringify({
        posts: allPosts,
        meta: { query, subredditsSearched: subs.length + 1, totalPosts: allPosts.length },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});