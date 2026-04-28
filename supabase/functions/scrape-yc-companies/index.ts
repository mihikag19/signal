// supabase/functions/scrape-yc-companies/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // YC public API — no auth required
    const res = await fetch(
      `https://api.ycombinator.com/v0.1/companies?q=${encodeURIComponent(query)}`,
      { headers: { "User-Agent": "Signal/1.0", "Accept": "application/json" } }
    );

    if (!res.ok) throw new Error(`YC API failed: ${res.status}`);
    const data = await res.json();
    const items: any[] = data?.companies ?? [];

    const companies = items.slice(0, 15).map((h: any) => ({
      name: h.name,
      slug: h.slug,
      description: h.oneLiner || h.one_liner,
      batch: h.batch,
      status: h.status,
      industries: h.industries || [],
      teamSize: h.teamSize || h.team_size,
      website: h.website,
      url: `https://www.ycombinator.com/companies/${h.slug}`,
    }));

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
