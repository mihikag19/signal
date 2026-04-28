// supabase/functions/scrape-lemmy/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const INSTANCE = "https://lemmy.world";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const url = `${INSTANCE}/api/v3/search?q=${encodeURIComponent(query)}&type_=Posts&limit=20&sort=TopAll`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Signal/1.0", "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`Lemmy failed: ${res.status}`);

    const data = await res.json();
    const posts = (data.posts ?? []).map((item: any) => ({
      id: String(item.post?.id),
      title: item.post?.name,
      body: (item.post?.body || "").slice(0, 400),
      score: item.counts?.score ?? 0,
      comments: item.counts?.comments ?? 0,
      community: item.community?.name,
      author: item.creator?.name,
      url: item.post?.url || item.post?.ap_id,
      publishedAt: item.post?.published,
    }));

    return new Response(
      JSON.stringify({ posts, meta: { query, totalPosts: posts.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
