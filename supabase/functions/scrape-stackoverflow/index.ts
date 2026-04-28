// supabase/functions/scrape-stackoverflow/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    const url = `https://api.stackexchange.com/2.3/search/advanced?q=${encodeURIComponent(query)}&filter=withbody&site=stackoverflow&sort=votes&pagesize=20&order=desc`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Signal/1.0" },
    });

    if (!res.ok) throw new Error(`SO API failed: ${res.status}`);
    const data = await res.json();

    const questions = (data.items ?? []).map((q: any) => ({
      id: String(q.question_id),
      title: q.title,
      body: (q.body || "").replace(/<[^>]*>/g, "").slice(0, 500),
      score: q.score,
      answers: q.answer_count,
      views: q.view_count,
      tags: q.tags || [],
      url: q.link,
      createdAt: new Date(q.creation_date * 1000).toISOString(),
    }));

    return new Response(
      JSON.stringify({ questions, meta: { query, totalQuestions: questions.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
