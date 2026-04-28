// supabase/functions/scrape-devto/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const url = `https://dev.to/api/articles?q=${encodeURIComponent(query)}&per_page=30`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Signal/1.0" },
    });

    if (!res.ok) throw new Error(`dev.to API failed: ${res.status}`);
    const data = await res.json();

    const articles = (Array.isArray(data) ? data : []).map((a: any) => ({
      id: String(a.id),
      title: a.title,
      description: (a.description || "").slice(0, 400),
      tags: a.tag_list || [],
      reactions: a.positive_reactions_count || 0,
      comments: a.comments_count || 0,
      url: a.url,
      author: a.user?.username,
      createdAt: a.published_at,
    }));

    return new Response(
      JSON.stringify({ articles, meta: { query, totalArticles: articles.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
