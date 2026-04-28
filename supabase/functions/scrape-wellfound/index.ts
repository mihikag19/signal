// supabase/functions/scrape-wellfound/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const res = await fetch(
      `https://wellfound.com/search/company?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );
    if (!res.ok) throw new Error(`Wellfound failed: ${res.status}`);

    const html = await res.text();
    const companies: any[] = [];

    // Look for Next.js page data
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const results =
          nextData?.props?.pageProps?.searchResults?.results ||
          nextData?.props?.pageProps?.companies ||
          [];
        for (const c of results.slice(0, 10)) {
          companies.push({
            name: c.name || c.company_name,
            description: (c.pitch || c.description || "").slice(0, 300),
            tags: c.tags || c.markets || [],
            teamSize: c.company_size,
            url: `https://wellfound.com/company/${c.slug || c.company_slug}`,
          });
        }
      } catch { /* parse error */ }
    }

    // Fallback: links
    if (companies.length === 0) {
      for (const m of html.matchAll(/href="\/company\/([^"]+)"[^>]*>\s*([^<]{3,80})\s*</g)) {
        companies.push({ slug: m[1], name: m[2].trim() });
        if (companies.length >= 10) break;
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
