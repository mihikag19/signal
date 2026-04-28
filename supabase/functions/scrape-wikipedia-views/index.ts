// supabase/functions/scrape-wikipedia-views/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Search Wikipedia
    const searchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3&origin=*`,
      { headers: { "User-Agent": "Signal/1.0 (contact@signal.app)" } }
    );
    if (!searchRes.ok) throw new Error(`Wikipedia search failed: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const articles: any[] = searchData?.query?.search ?? [];
    if (articles.length === 0) {
      return new Response(
        JSON.stringify({ articles: [], meta: { query, totalArticles: 0 } }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build date range for last 12 months
    const now = new Date();
    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startMonth = new Date(endMonth);
    startMonth.setFullYear(startMonth.getFullYear() - 1);
    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01`;

    const results = await Promise.all(
      articles.slice(0, 3).map(async (article: any) => {
        const encodedTitle = encodeURIComponent(article.title.replace(/ /g, "_"));
        try {
          const viewsRes = await fetch(
            `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodedTitle}/monthly/${fmt(startMonth)}/${fmt(endMonth)}`,
            { headers: { "User-Agent": "Signal/1.0" } }
          );
          if (!viewsRes.ok) {
            return { title: article.title, monthlyViews: [], totalViews: 0, trendDirection: "unknown" };
          }
          const viewsData = await viewsRes.json();
          const items: any[] = viewsData.items ?? [];
          const monthlyViews = items.map((item: any) => ({
            month: item.timestamp?.slice(0, 7),
            views: item.views ?? 0,
          }));
          const totalViews = monthlyViews.reduce((acc, m) => acc + m.views, 0);
          const recentAvg = monthlyViews.slice(-3).reduce((acc, m) => acc + m.views, 0) / 3;
          const earlierAvg = monthlyViews.slice(0, 3).reduce((acc, m) => acc + m.views, 0) / 3;
          const trendDirection =
            recentAvg > earlierAvg * 1.15 ? "growing" : recentAvg < earlierAvg * 0.85 ? "declining" : "stable";
          return {
            title: article.title,
            snippet: article.snippet?.replace(/<[^>]*>/g, "").slice(0, 200),
            monthlyViews,
            totalViews,
            trendDirection,
          };
        } catch {
          return { title: article.title, monthlyViews: [], totalViews: 0, trendDirection: "unknown" };
        }
      })
    );

    return new Response(
      JSON.stringify({ articles: results, meta: { query, totalArticles: results.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
