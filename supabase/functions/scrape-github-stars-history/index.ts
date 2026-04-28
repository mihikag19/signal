// supabase/functions/scrape-github-stars-history/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query, repos } = await req.json();
    if (!query && (!repos || repos.length === 0)) throw new Error("Missing query or repos");

    const token = Deno.env.get("GITHUB_TOKEN");
    const baseHeaders: Record<string, string> = {
      "Accept": "application/vnd.github+json",
      "User-Agent": "Signal/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

    let repoList: string[] = repos || [];
    if (repoList.length === 0) {
      const searchRes = await fetch(
        `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=5`,
        { headers: baseHeaders }
      );
      if (searchRes.ok) {
        const d = await searchRes.json();
        repoList = (d.items ?? []).slice(0, 5).map((r: any) => r.full_name);
      }
    }

    const results = await Promise.all(
      repoList.slice(0, 5).map(async (repoName: string) => {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${repoName}`, { headers: baseHeaders });
          if (!repoRes.ok) return null;
          const repo = await repoRes.json();

          // Sample recent stargazers to estimate velocity
          let starGrowthRate = "unknown";
          try {
            const starsRes = await fetch(
              `https://api.github.com/repos/${repoName}/stargazers?per_page=100`,
              { headers: { ...baseHeaders, "Accept": "application/vnd.github.star+json" } }
            );
            if (starsRes.ok) {
              const stargazers: any[] = await starsRes.json();
              if (stargazers.length >= 5) {
                const oldest = new Date(stargazers[0]?.starred_at);
                const newest = new Date(stargazers.at(-1)?.starred_at);
                const days = (newest.getTime() - oldest.getTime()) / 86_400_000;
                if (days > 0) {
                  starGrowthRate = `${(stargazers.length / days).toFixed(1)} stars/day`;
                }
              }
            }
          } catch { /* velocity is best-effort */ }

          return {
            name: repoName,
            currentStars: repo.stargazers_count,
            currentForks: repo.forks_count,
            openIssues: repo.open_issues_count,
            createdAt: repo.created_at,
            pushedAt: repo.pushed_at,
            starGrowthRate,
            description: (repo.description || "").slice(0, 200),
            language: repo.language,
            url: `https://github.com/${repoName}`,
          };
        } catch {
          return null;
        }
      })
    );

    const filtered = results.filter(Boolean);

    return new Response(
      JSON.stringify({ repos: filtered, meta: { query, totalRepos: filtered.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
