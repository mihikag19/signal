// supabase/functions/scrape-reddit/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const DEFAULT_SUBREDDITS = [
  "startups", "SaaS", "Entrepreneur", "indiehackers",
  "smallbusiness", "microsaas", "nocode", "webdev",
  "ProductManagement", "SideProject"
];

const USER_AGENT = "Signal/1.0 by signal-app";

async function getRedditToken(): Promise<string> {
  const clientId = Deno.env.get("REDDIT_CLIENT_ID");
  const clientSecret = Deno.env.get("REDDIT_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Missing REDDIT_CLIENT_ID or REDDIT_CLIENT_SECRET");

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": USER_AGENT,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reddit OAuth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.access_token) throw new Error(`Reddit OAuth returned no token: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function fetchSubreddit(
  sub: string,
  query: string,
  seen: Set<string>,
  token: string
): Promise<any[]> {
  const url = `https://oauth.reddit.com/r/${sub}/search?q=${encodeURIComponent(query)}&restrict_sr=1&limit=25&sort=relevance&t=year`;
  const res = await fetch(url, {
    headers: { "Authorization": `Bearer ${token}`, "User-Agent": USER_AGENT },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const posts: any[] = [];
  for (const child of data?.data?.children ?? []) {
    const p = child.data;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (p.score < 2 && p.num_comments < 2) continue;
    posts.push({
      id: p.id,
      title: p.title,
      body: (p.selftext || "").slice(0, 2000),
      author: p.author,
      score: p.score,
      numComments: p.num_comments,
      subreddit: p.subreddit,
      permalink: p.permalink,
      url: `https://reddit.com${p.permalink}`,
      createdAt: new Date(p.created_utc * 1000).toISOString(),
    });
  }
  return posts;
}

async function fetchTopComments(
  post: any,
  token: string
): Promise<{ body: string; score: number; author: string }[]> {
  try {
    const url = `https://oauth.reddit.com${post.permalink}?limit=10&sort=top`;
    const res = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}`, "User-Agent": USER_AGENT },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const comments = data?.[1]?.data?.children ?? [];
    return comments
      .filter((c: any) => c.kind === "t1" && c.data?.body)
      .slice(0, 10)
      .map((c: any) => ({
        body: c.data.body.slice(0, 500),
        score: c.data.score || 0,
        author: c.data.author || "unknown",
      }));
  } catch {
    return [];
  }
}

function calculateGrowthVelocity(posts: any[]): number {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

  let recentCount = 0; // last 30 days
  let priorCount = 0;  // 30-90 days ago (60-day window)

  for (const post of posts) {
    const ts = new Date(post.createdAt).getTime();
    if (ts >= thirtyDaysAgo) {
      recentCount++;
    } else if (ts >= ninetyDaysAgo) {
      priorCount++;
    }
  }

  // Normalize prior count to 30-day equivalent (it covers 60 days)
  const priorNormalized = priorCount / 2;
  if (priorNormalized === 0) return recentCount > 0 ? 100 : 0;
  return Math.round(((recentCount - priorNormalized) / priorNormalized) * 100);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, subreddits } = await req.json();
    if (!query) throw new Error("Missing query");

    const subs = subreddits || DEFAULT_SUBREDDITS;
    const token = await getRedditToken();
    const allPosts: any[] = [];
    const seen = new Set<string>();

    // Batch subreddit requests 3 at a time
    for (let i = 0; i < subs.length; i += 3) {
      const batch = subs.slice(i, i + 3);
      const results = await Promise.all(
        batch.map((sub: string) => fetchSubreddit(sub, query, seen, token).catch(() => []))
      );
      for (const posts of results) {
        allPosts.push(...posts);
      }
      // 1.5s delay between batches
      if (i + 3 < subs.length) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // Also search global Reddit
    try {
      const url = `https://oauth.reddit.com/search?q=${encodeURIComponent(query)}&limit=25&sort=relevance&t=year`;
      const res = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}`, "User-Agent": USER_AGENT },
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
            permalink: p.permalink,
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

    // Fetch top comments for the 5 highest-scoring posts
    const top5 = allPosts.slice(0, 5);
    const commentResults = await Promise.all(top5.map((post) => fetchTopComments(post, token)));
    for (let i = 0; i < top5.length; i++) {
      top5[i].topComments = commentResults[i];
    }

    const growthVelocity = calculateGrowthVelocity(allPosts);

    return new Response(
      JSON.stringify({
        posts: allPosts,
        meta: {
          query,
          subredditsSearched: subs.length + 1,
          totalPosts: allPosts.length,
          growthVelocity,
        },
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
