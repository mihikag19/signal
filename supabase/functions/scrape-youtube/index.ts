// supabase/functions/scrape-youtube/index.ts
import { corsHeaders } from "../_shared/cors.ts";

// Invidious instances as fallback (open YouTube frontends with public API)
const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.privacyredirect.com",
  "https://yt.cdaut.de",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");

    if (apiKey) {
      // Official YouTube Data API v3
      const searchRes = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&order=relevance&key=${apiKey}`
      );
      if (!searchRes.ok) throw new Error(`YouTube API failed: ${searchRes.status}`);
      const searchData = await searchRes.json();

      const ids = (searchData.items ?? []).map((i: any) => i.id.videoId).join(",");
      const detailsRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids}&key=${apiKey}`
      );
      const detailsData = detailsRes.ok ? await detailsRes.json() : { items: [] };

      const videos = (detailsData.items ?? []).map((v: any) => ({
        id: v.id,
        title: v.snippet.title,
        channel: v.snippet.channelTitle,
        views: parseInt(v.statistics?.viewCount || "0"),
        likes: parseInt(v.statistics?.likeCount || "0"),
        comments: parseInt(v.statistics?.commentCount || "0"),
        description: (v.snippet.description || "").slice(0, 300),
        published: v.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${v.id}`,
      }));

      return new Response(
        JSON.stringify({ videos, meta: { query, totalVideos: videos.length } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: Invidious API (no key required)
    for (const instance of INVIDIOUS_INSTANCES) {
      try {
        const res = await fetch(
          `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&sort_by=relevance`,
          { headers: { "User-Agent": "Signal/1.0" } }
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (!Array.isArray(data)) continue;

        const videos = data.slice(0, 10).map((v: any) => ({
          id: v.videoId,
          title: v.title,
          channel: v.author,
          views: v.viewCount ?? 0,
          description: (v.description || "").slice(0, 300),
          published: v.published ? new Date(v.published * 1000).toISOString() : null,
          url: `https://www.youtube.com/watch?v=${v.videoId}`,
        }));

        return new Response(
          JSON.stringify({ videos, meta: { query, totalVideos: videos.length, source: "invidious" } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch { /* try next instance */ }
    }

    throw new Error("No YOUTUBE_API_KEY and all Invidious instances failed");
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
