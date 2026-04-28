// supabase/functions/scrape-chrome-webstore/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch(
      `https://chromewebstore.google.com/search/${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!res.ok) throw new Error(`Chrome Web Store failed: ${res.status}`);

    const html = await res.text();
    const extensions: any[] = [];

    // Try to extract extension metadata from embedded JSON or aria labels
    for (const m of html.matchAll(/aria-label="([^"]{3,100})"[^>]*data-item-id="([^"]+)"/g)) {
      extensions.push({ name: m[1], id: m[2], url: `https://chromewebstore.google.com/detail/${m[2]}` });
      if (extensions.length >= 8) break;
    }

    // Fallback: h3 headings in the page
    if (extensions.length === 0) {
      for (const m of html.matchAll(/<h3[^>]*>\s*([^<]{3,80})\s*<\/h3>/g)) {
        const name = m[1].trim();
        if (name.length > 2) extensions.push({ name });
        if (extensions.length >= 8) break;
      }
    }

    const ratingMatches = [...html.matchAll(/(\d+\.?\d*)\s*out\s*of\s*5/gi)];
    const userMatches = [...html.matchAll(/([\d,.]+[KkMm]?)\s*users?/gi)];

    extensions.forEach((ext, i) => {
      if (ratingMatches[i]) ext.rating = parseFloat(ratingMatches[i][1]);
      if (userMatches[i]) ext.userCount = userMatches[i][1];
    });

    return new Response(
      JSON.stringify({ extensions, meta: { query, totalExtensions: extensions.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
