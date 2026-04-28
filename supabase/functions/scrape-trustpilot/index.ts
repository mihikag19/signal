// supabase/functions/scrape-trustpilot/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch(
      `https://www.trustpilot.com/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!res.ok) throw new Error(`Trustpilot failed: ${res.status}`);

    const html = await res.text();
    const companies: any[] = [];

    // Trustpilot embeds structured JSON in script tags
    for (const m of html.matchAll(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/g)) {
      try {
        const d = JSON.parse(m[1]);
        const bu = d?.businessUnit || d;
        if (bu?.displayName) {
          companies.push({
            name: bu.displayName,
            trustScore: bu.trustScore,
            reviewCount: bu.numberOfReviews?.total,
            url: `https://www.trustpilot.com/review/${bu.identifyingName || ""}`,
          });
          if (companies.length >= 8) break;
        }
      } catch { /* skip */ }
    }

    // Fallback: parse review links
    if (companies.length === 0) {
      for (const m of html.matchAll(/href="\/review\/([^"]+)"[^>]*>\s*([^<]{3,80})\s*</g)) {
        companies.push({ domain: m[1], name: m[2].trim() });
        if (companies.length >= 8) break;
      }
    }

    return new Response(
      JSON.stringify({ companies, meta: { query, totalCompanies: companies.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
