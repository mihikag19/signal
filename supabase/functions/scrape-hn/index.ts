// supabase/functions/scrape-hn/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Search HN stories
    const storiesRes = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30`
    );
    const storiesData = await storiesRes.json();

    const stories = (storiesData.hits || []).map((h: any) => ({
      id: h.objectID,
      title: h.title || "",
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      points: h.points || 0,
      numComments: h.num_comments || 0,
      author: h.author || "unknown",
      createdAt: h.created_at,
    }));

    // Search HN comments (where the real pain points live)
    const commentsRes = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=50`
    );
    const commentsData = await commentsRes.json();

    const comments = (commentsData.hits || []).map((h: any) => ({
      id: h.objectID,
      text: (h.comment_text || "").replace(/<[^>]*>/g, "").slice(0, 1500),
      points: h.points || 0,
      author: h.author || "unknown",
      storyId: h.story_id,
      storyTitle: h.story_title || "",
      createdAt: h.created_at,
    }));

    return new Response(
      JSON.stringify({
        stories,
        comments,
        meta: { query, totalStories: stories.length, totalComments: comments.length },
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