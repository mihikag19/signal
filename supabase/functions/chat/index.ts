// supabase/functions/chat/index.ts
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { reportId, message, history = [] } = await req.json();
    if (!reportId || !message) throw new Error("Missing reportId or message");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: row, error } = await supabase
      .from("validation_history")
      .select("report, query, overall_score, verdict, sources_used")
      .eq("id", reportId)
      .single();

    if (error || !row) throw new Error("Report not found");

    // Compress report to key fields for context efficiency
    const r = row.report as any;
    const ctx = {
      query: row.query,
      overallScore: row.overall_score,
      verdict: row.verdict,
      sourcesUsed: row.sources_used,
      founderSignal: r?.founderSignal,
      investorSignal: r?.investorSignal,
      attentionScore: r?.attentionScore,
      quotes: r?.quotes,
      competitors: r?.competitors,
      competitorMap: r?.competitorMap,
      revenueModel: r?.revenueModel,
      targetPersonas: r?.targetPersonas,
      buildRecommendations: r?.buildRecommendations,
      sentimentAnalysis: r?.sentimentAnalysis,
      confidenceScore: r?.confidenceScore,
      painCategories: r?.painCategories,
      nextSteps: r?.nextSteps,
      recommendation: r?.recommendation,
    };

    const systemPrompt = `You are Signal's AI analyst. You have access to a complete market validation report for the idea: "${row.query}".

This report is based on real data scraped from ${row.sources_used || "multiple"} platforms. The overall demand score is ${row.overall_score}/100 with a verdict of ${row.verdict || "MAYBE"}.

Full report data:
${JSON.stringify(ctx, null, 2)}

Answer the user's questions using ONLY the data in this report. Be specific — cite platform names, quote real users, reference scores. If the data doesn't contain an answer, say so clearly. Keep responses concise and actionable.`;

    const messages = [
      ...history.map((m: any) => ({ role: m.role as string, content: m.content as string })),
      { role: "user" as const, content: message },
    ];

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        stream: true,
        system: systemPrompt,
        messages,
      }),
    });

    if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const emit = (obj: object) =>
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

        try {
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let fullText = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const event = JSON.parse(jsonStr);
                if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
                  const text = event.delta.text as string;
                  fullText += text;
                  emit({ type: "chunk", text });
                } else if (event.type === "message_stop") {
                  emit({ type: "complete", text: fullText });
                }
              } catch { /* skip malformed events */ }
            }
          }
          // Ensure complete fires even if message_stop was missed
          if (fullText) emit({ type: "complete", text: fullText });
        } catch (e) {
          emit({ type: "error", message: String(e) });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
