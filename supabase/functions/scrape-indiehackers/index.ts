// supabase/functions/scrape-indiehackers/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch("https://www.indiehackers.com/feed.xml", {
      headers: { "User-Agent": "Signal/1.0" },
    });

    if (!res.ok) throw new Error(`IH RSS failed: ${res.status}`);
    const xml = await res.text();

    const keywords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((k: string) => k.length > 3);

    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title =
        item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
        item.match(/<title>(.*?)<\/title>/)?.[1] ||
        "";
      const link =
        item.match(/<link>(.*?)<\/link>/)?.[1] || "";
      const description =
        item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
        item.match(/<description>(.*?)<\/description>/)?.[1] ||
        "";
      const pubDate =
        item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "";
      const author =
        item.match(/<author>(.*?)<\/author>/)?.[1] || "";

      const combined = (title + " " + description).toLowerCase();
      if (keywords.length === 0 || keywords.some((kw: string) => combined.includes(kw))) {
        items.push({
          title: title.slice(0, 200),
          url: link,
          description: description.replace(/<[^>]*>/g, "").slice(0, 500),
          author,
          publishedAt: pubDate,
        });
      }

      if (items.length >= 20) break;
    }

    return new Response(
      JSON.stringify({ posts: items, meta: { query, totalPosts: items.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
