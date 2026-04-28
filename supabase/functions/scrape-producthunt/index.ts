// supabase/functions/scrape-producthunt/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const PH_API_URL = "https://api.producthunt.com/v2/api/graphql";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const apiKey = Deno.env.get("PRODUCTHUNT_API_KEY");
    if (!apiKey) throw new Error("Missing PRODUCTHUNT_API_KEY");

    const safeQuery = query.replace(/"/g, '\\"').slice(0, 200);
    const gql = `
      query {
        posts(first: 20, search: "${safeQuery}") {
          edges {
            node {
              id
              name
              tagline
              description
              votesCount
              commentsCount
              createdAt
              url
              topics {
                edges { node { name } }
              }
            }
          }
        }
      }
    `;

    const res = await fetch(PH_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Signal/1.0",
      },
      body: JSON.stringify({ query: gql }),
    });

    if (!res.ok) throw new Error(`PH API failed: ${res.status}`);
    const data = await res.json();

    const posts = (data?.data?.posts?.edges ?? []).map((edge: any) => {
      const n = edge.node;
      return {
        id: n.id,
        name: n.name,
        tagline: n.tagline,
        description: (n.description || "").slice(0, 500),
        votes: n.votesCount,
        comments: n.commentsCount,
        url: n.url,
        createdAt: n.createdAt,
        topics: (n.topics?.edges ?? []).map((t: any) => t.node?.name).filter(Boolean),
      };
    });

    return new Response(
      JSON.stringify({ posts, meta: { query, totalPosts: posts.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
