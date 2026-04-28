// supabase/functions/list-reports/index.ts
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { limit = 20, offset = 0 } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error, count } = await supabase
      .from("validation_history")
      .select(
        "id, query, overall_score, attention_score, vc_score, founder_score, verdict, sources_used, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + Math.min(limit, 100) - 1);

    if (error) throw new Error(error.message);

    const reports = (data || []).map((row: any) => ({
      id: row.id,
      query: row.query,
      overallScore: row.overall_score,
      attentionScore: row.attention_score,
      vcScore: row.vc_score,
      founderScore: row.founder_score,
      verdict: row.verdict,
      sourcesUsed: row.sources_used,
      createdAt: row.created_at,
    }));

    return new Response(
      JSON.stringify({ reports, total: count ?? 0, limit, offset }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("list-reports error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
