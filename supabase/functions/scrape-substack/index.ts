// supabase/functions/scrape-substack/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Try Substack's internal search API first
    const apiRes = await fetch(
      `https://substack.com/api/v1/post/search?q=${encodeURIComponent(query)}&type=newsletter_post&page_size=20&page=0`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      }
    );

    let posts: any[] = [];

    if (apiRes.ok) {
      const data = await apiRes.json();
      const items: any[] = data?.results || data?.posts || (Array.isArray(data) ? data : []);
      posts = items.slice(0, 15).map((p: any) => ({
        id: p.id || p.slug,
        title: p.title,
        newsletter: p.publication?.name || p.publicationName || "",
        author: p.publishedBylines?.[0]?.name || p.author?.name || "Unknown",
        likes: p.reactions?.["❤️"] || p.likeCount || 0,
        preview: (p.subtitle || p.description || "").slice(0, 300),
        url: p.canonical_url || p.url,
        publishedAt: p.post_date || p.publishedAt,
      }));
    }

    // Fallback: scrape search HTML
    if (posts.length === 0) {
      const htmlRes = await fetch(
        `https://substack.com/search/${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
          },
        }
      );
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        for (const m of html.matchAll(/<h3[^>]*>\s*([^<]{10,200})\s*<\/h3>/g)) {
          posts.push({ title: m[1].trim() });
          if (posts.length >= 10) break;
        }
      }
    }

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
