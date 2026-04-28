// supabase/functions/scrape-g2-reviews/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch(
      `https://www.g2.com/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
        },
      }
    );
    if (!res.ok) throw new Error(`G2 failed: ${res.status}`);

    const html = await res.text();

    // Extract product slugs + names from G2 review links
    const products: any[] = [];
    const seen = new Set<string>();
    for (const m of html.matchAll(/href="\/products\/([^/"]+)\/reviews"[^>]*>([^<]{2,80})<\/a>/g)) {
      const slug = m[1];
      const name = m[2].trim();
      if (!seen.has(slug)) {
        seen.add(slug);
        products.push({ name, slug, url: `https://www.g2.com/products/${slug}/reviews` });
      }
      if (products.length >= 8) break;
    }

    // Extract star ratings
    const ratings = [...html.matchAll(/(\d+\.?\d*)\s*out\s*of\s*5\s*stars?/gi)].map(
      (m) => parseFloat(m[1])
    );
    const reviewCounts = [...html.matchAll(/([\d,]+)\s*reviews?/gi)].map(
      (m) => parseInt(m[1].replace(/,/g, ""))
    );

    products.forEach((p, i) => {
      if (ratings[i] != null) p.rating = ratings[i];
      if (reviewCounts[i] != null) p.reviewCount = reviewCounts[i];
    });

    // Extract review snippets
    const complaints = [...html.matchAll(/<p[^>]*class="[^"]*review[^"]*"[^>]*>([^<]{30,300})<\/p>/g)]
      .map((m) => m[1].trim())
      .slice(0, 5);

    return new Response(
      JSON.stringify({ products, complaints, meta: { query, totalProducts: products.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
