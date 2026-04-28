// supabase/functions/scrape-medium/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch(
      `https://medium.com/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!res.ok) throw new Error(`Medium failed: ${res.status}`);

    const html = await res.text();
    const articles: any[] = [];

    // Medium embeds article state in window.__APOLLO_STATE__
    const stateMatch = html.match(/window\.__APOLLO_STATE__\s*=\s*(\{[\s\S]*?});\s*<\/script>/);
    if (stateMatch) {
      try {
        const state = JSON.parse(stateMatch[1]);
        for (const [key, val] of Object.entries(state)) {
          if (key.startsWith("Post:") && (val as any).title) {
            const p = val as any;
            articles.push({
              id: p.id,
              title: p.title,
              claps: p.clapCount || 0,
              responses: p.postResponses?.count || 0,
              readingTime: p.readingTime,
              url: p.mediumUrl || `https://medium.com/p/${p.id}`,
              preview: (p.previewContent?.bodyModel?.paragraphs?.[0]?.text || "").slice(0, 200),
            });
          }
        }
      } catch { /* parse error */ }
    }

    // Fallback: extract h2/h3 headings
    if (articles.length === 0) {
      for (const m of html.matchAll(/<h[23][^>]*>\s*([^<]{10,200})\s*<\/h[23]>/g)) {
        articles.push({ title: m[1].trim() });
        if (articles.length >= 10) break;
      }
    }

    return new Response(
      JSON.stringify({ articles: articles.slice(0, 10), meta: { query, totalArticles: articles.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
