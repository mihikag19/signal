// supabase/functions/scrape-pypi-stats/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // PyPI search page is JavaScript-rendered and blocked from datacenter IPs.
    // Derive candidate package names from query keywords instead.
    const keywords = query.toLowerCase().replace(/[^a-z0-9 ]/g, "").split(/\s+/).filter((k: string) => k.length > 2);
    // Build candidate package names: exact query (dashed) + individual keywords
    const dashedQuery = keywords.join("-");
    const underscoredQuery = keywords.join("_");
    const names = [...new Set([dashedQuery, underscoredQuery, ...keywords])].slice(0, 6);

    const packages = await Promise.all(
      names.slice(0, 5).map(async (name: string) => {
        try {
          // First verify the package exists
          const pkgRes = await fetch(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, {
            headers: { "User-Agent": "Signal/1.0" },
          });
          if (!pkgRes.ok) return null;
          const pkgData = await pkgRes.json();
          const description = (pkgData.info?.summary || "").slice(0, 200);

          const statsRes = await fetch(
            `https://pypistats.org/api/packages/${name.toLowerCase()}/recent`,
            { headers: { "User-Agent": "Signal/1.0" } }
          );
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            const data = statsData.data || {};
            return {
              name,
              description,
              lastMonthDownloads: data.last_month ?? 0,
              lastWeekDownloads: data.last_week ?? 0,
              url: `https://pypi.org/project/${name}`,
            };
          }
          return { name, description, url: `https://pypi.org/project/${name}` };
        } catch { /* best-effort */ }
        return null;
      })
    );

    return new Response(
      JSON.stringify({ packages, meta: { query, totalPackages: packages.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
