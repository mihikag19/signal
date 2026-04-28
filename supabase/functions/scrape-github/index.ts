// supabase/functions/scrape-github/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const token = Deno.env.get("GITHUB_TOKEN");
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github+json",
      "User-Agent": "Signal/1.0",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const q = encodeURIComponent(query);
    const [reposRes, issuesRes] = await Promise.all([
      fetch(`https://api.github.com/search/repositories?q=${q}&sort=stars&per_page=15`, { headers }),
      fetch(`https://api.github.com/search/issues?q=${q}+is:issue&sort=reactions&per_page=15`, { headers }),
    ]);

    const reposJson = reposRes.ok ? await reposRes.json() : { items: [] };
    const issuesJson = issuesRes.ok ? await issuesRes.json() : { items: [] };

    const repos = (reposJson.items ?? []).slice(0, 15).map((r: any) => ({
      id: String(r.id),
      name: r.full_name,
      description: (r.description || "").slice(0, 300),
      stars: r.stargazers_count,
      forks: r.forks_count,
      openIssues: r.open_issues_count,
      url: r.html_url,
      createdAt: r.created_at,
      language: r.language,
    }));

    const issues = (issuesJson.items ?? []).slice(0, 15).map((i: any) => ({
      id: String(i.id),
      title: i.title,
      body: (i.body || "").slice(0, 400),
      comments: i.comments,
      reactions: i.reactions?.["+1"] ?? 0,
      url: i.html_url,
      createdAt: i.created_at,
      state: i.state,
    }));

    return new Response(
      JSON.stringify({
        repos,
        issues,
        meta: { query, totalRepos: repos.length, totalIssues: issues.length },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
