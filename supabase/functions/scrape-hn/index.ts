// supabase/functions/scrape-hn/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const oneYearAgo = Math.floor((Date.now() - 365 * 24 * 60 * 60 * 1000) / 1000);

    // Search HN stories
    const storiesRes = await fetch(
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=30&numericFilters=created_at_i>${oneYearAgo}`
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
      `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=comment&hitsPerPage=50&numericFilters=created_at_i>${oneYearAgo}`
    );
    const commentsData = await commentsRes.json();

    // Build a storyMap from stories for enrichment
    const storyMap = new Map<string, { points: number; title: string }>();
    for (const s of stories) {
      storyMap.set(s.id, { points: s.points, title: s.title });
    }

    const comments = (commentsData.hits || [])
      // Filter out comments shorter than 100 characters
      .filter((h: any) => {
        const text = (h.comment_text || "").replace(/<[^>]*>/g, "");
        return text.length >= 100;
      })
      .map((h: any) => {
        const storyInfo = storyMap.get(String(h.story_id));
        const storyTitle = h.story_title || storyInfo?.title || "";
        return {
          id: h.objectID,
          text: (h.comment_text || "").replace(/<[^>]*>/g, "").slice(0, 1500),
          points: h.points || 0,
          author: h.author || "unknown",
          storyId: h.story_id,
          storyTitle,
          createdAt: h.created_at,
          parentStoryPoints: storyInfo?.points ?? 0,
          isAskHN: storyTitle.startsWith("Ask HN"),
          isShowHN: storyTitle.startsWith("Show HN"),
        };
      });

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
