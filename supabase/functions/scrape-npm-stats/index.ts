// supabase/functions/scrape-npm-stats/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const searchRes = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`,
      { headers: { "User-Agent": "Signal/1.0" } }
    );
    if (!searchRes.ok) throw new Error(`npm search failed: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const pkgList: any[] = searchData.objects ?? [];

    const now = new Date();
    const end = now.toISOString().slice(0, 10);
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
    const start = startDate.toISOString().slice(0, 10);

    const packages = await Promise.all(
      pkgList.slice(0, 5).map(async (obj: any) => {
        const name = obj.package?.name;
        if (!name) return null;
        try {
          const dlRes = await fetch(
            `https://api.npmjs.org/downloads/range/${start}:${end}/${encodeURIComponent(name)}`,
            { headers: { "User-Agent": "Signal/1.0" } }
          );
          let weeklyDownloads = 0;
          let downloadTrend: any[] = [];
          if (dlRes.ok) {
            const dlData = await dlRes.json();
            const days: any[] = dlData.downloads ?? [];
            weeklyDownloads = days.slice(-7).reduce((acc: number, d: any) => acc + (d.downloads || 0), 0);
            // Aggregate to monthly
            const monthly: Record<string, number> = {};
            for (const d of days) {
              const month = d.day.slice(0, 7);
              monthly[month] = (monthly[month] || 0) + d.downloads;
            }
            downloadTrend = Object.entries(monthly)
              .slice(-12)
              .map(([month, downloads]) => ({ month, downloads }));
          }
          return {
            name,
            description: (obj.package?.description || "").slice(0, 200),
            version: obj.package?.version,
            weeklyDownloads,
            downloadTrend,
            githubUrl: obj.package?.links?.repository,
            keywords: (obj.package?.keywords ?? []).slice(0, 5),
            url: `https://www.npmjs.com/package/${name}`,
          };
        } catch {
          return { name, description: obj.package?.description, url: `https://www.npmjs.com/package/${name}` };
        }
      })
    );

    const filtered = packages.filter(Boolean);

    return new Response(
      JSON.stringify({ packages: filtered, meta: { query, totalPackages: filtered.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
