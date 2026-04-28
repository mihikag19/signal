// supabase/functions/scrape-appstore/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const searchRes = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=10&country=us`,
      { headers: { "User-Agent": "Signal/1.0" } }
    );
    if (!searchRes.ok) throw new Error(`iTunes API failed: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const apps = (searchData.results ?? []).slice(0, 10).map((app: any) => ({
      id: String(app.trackId),
      name: app.trackName,
      description: (app.description || "").slice(0, 400),
      rating: app.averageUserRating,
      ratingCount: app.userRatingCount,
      price: app.price,
      genre: app.primaryGenreName,
      developer: app.artistName,
      url: app.trackViewUrl,
    }));

    // Fetch recent negative reviews for top app
    const negativeReviews: any[] = [];
    if (apps.length > 0) {
      try {
        const reviewsRes = await fetch(
          `https://itunes.apple.com/rss/customerreviews/id=${apps[0].id}/sortBy=mostRecent/json`,
          { headers: { "User-Agent": "Signal/1.0" } }
        );
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          for (const review of reviewsData?.feed?.entry ?? []) {
            const rating = parseInt(review["im:rating"]?.label ?? "5");
            if (rating <= 2) {
              negativeReviews.push({
                appName: apps[0].name,
                rating,
                title: review.title?.label,
                body: (review.content?.label || "").slice(0, 300),
              });
              if (negativeReviews.length >= 5) break;
            }
          }
        }
      } catch { /* best-effort */ }
    }

    return new Response(
      JSON.stringify({ apps, negativeReviews, meta: { query, totalApps: apps.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
