// supabase/functions/scrape-lobsters/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Lobste.rs HTML search (the JSON search endpoint was deprecated)
    const url = `https://lobste.rs/search?q=${encodeURIComponent(query)}&what=stories&order=relevance`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Signal/1.0",
        "Accept": "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`Lobste.rs failed: ${res.status}`);

    const html = await res.text();
    const stories: any[] = [];

    // Each story is in a <div class="story_liner"> block
    const storyBlocks = [...html.matchAll(/<li[^>]*class="[^"]*story[^"]*"[^>]*>([\s\S]*?)<\/li>/g)];
    for (const block of storyBlocks.slice(0, 20)) {
      const inner = block[1];
      const title = inner.match(/class="u-url"[^>]*>([^<]+)<\/a>/)?.[1]?.trim();
      const url = inner.match(/class="u-url"[^>]*href="([^"]+)"/)?.[1] ||
                  inner.match(/href="(https?:[^"]+)"[^>]*class="u-url"/)?.[1];
      const score = parseInt(inner.match(/class="score"[^>]*>([^<]+)</)?.[1] ?? "0");
      const comments = parseInt(inner.match(/(\d+)\s*comment/)?.[1] ?? "0");
      const tags = [...inner.matchAll(/class="tag"[^>]*>([^<]+)</g)].map((m) => m[1]);
      const author = inner.match(/\/~([a-zA-Z0-9_]+)/)?.[1];
      if (title) {
        stories.push({ title, url, score, comments, tags, author });
      }
    }

    return new Response(
      JSON.stringify({ stories, meta: { query, totalStories: stories.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
