// supabase/functions/save-report/index.ts
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { report } = await req.json();
    if (!report) throw new Error("Missing report");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const query = report.ideaDescription || report.ideaTitle || "";
    const targetAudience =
      report.targetPersonas?.[0]?.role ||
      report.buildRecommendations?.targetAudience ||
      null;

    const { data, error } = await supabase
      .from("validation_history")
      .insert({
        query,
        target_audience: targetAudience,
        description: report.ideaDescription || null,
        report,
        data_coverage: report.dataCoverage || null,
        overall_score: report.overallScore ?? null,
        attention_score: report.attentionScore?.overall ?? null,
        vc_score: report.investorSignal?.score != null ? report.investorSignal.score / 10 : null,
        founder_score: report.founderSignal?.score != null ? report.founderSignal.score / 10 : null,
        verdict: report.rawVerdict || null,
        sources_used: report.dataCoverage?.successfulSources ?? null,
      })
      .select("id")
      .single();

    if (error) throw new Error(`Insert failed: ${error.message}`);

    return new Response(
      JSON.stringify({ id: data.id, shareUrl: `/report/${data.id}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("save-report error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
