// supabase/functions/scrape-crunchbase/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Crunchbase autocomplete endpoint — publicly accessible without login
    const res = await fetch(
      `https://www.crunchbase.com/v4/data/autocompletes?query=${encodeURIComponent(query)}&collection_ids=organizations&limit=10`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
          "Referer": "https://www.crunchbase.com/",
          "x-cb-client": "universal_search",
        },
      }
    );

    if (!res.ok) throw new Error(`Crunchbase failed: ${res.status}`);

    const data = await res.json();
    const entities: any[] = data?.entities || [];

    const companies = entities
      .slice(0, 10)
      .map((e: any) => ({
        name: e.identifier?.value || e.name,
        permalink: e.identifier?.permalink,
        description: (e.short_description || "").slice(0, 300),
        categories: e.facet_ids || [],
        url: e.identifier?.permalink
          ? `https://www.crunchbase.com/organization/${e.identifier.permalink}`
          : null,
      }))
      .filter((c: any) => c.name);

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
