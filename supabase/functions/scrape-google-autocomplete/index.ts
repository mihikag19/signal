// supabase/functions/scrape-google-autocomplete/index.ts
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Fetch autocomplete for multiple variants to get richer signal
    const variants = [query, `${query} app`, `${query} tool`, `${query} software`, `best ${query}`];
    const allSuggestions = new Set<string>();

    await Promise.all(
      variants.map(async (variant) => {
        try {
          const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(variant)}&hl=en`;
          const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Signal/1.0)" },
          });
          if (res.ok) {
            const data = await res.json();
            (data[1] as string[] ?? []).forEach((s) => allSuggestions.add(s));
          }
        } catch { /* skip */ }
      })
    );

    // People Also Ask via Google SERP (best-effort — often blocked from datacenter IPs)
    const paaQuestions: string[] = [];
    try {
      const res = await fetch(
        `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en&num=10`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
        }
      );
      if (res.ok) {
        const html = await res.text();
        // PAA questions have data-q attribute
        for (const m of html.matchAll(/data-q="([^"]+)"/g)) {
          const q = m[1].replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
          if (q.length > 5 && q.length < 200) paaQuestions.push(q);
          if (paaQuestions.length >= 10) break;
        }
      }
    } catch { /* PAA is best-effort */ }

    const suggestions = [...allSuggestions].slice(0, 30);

    return new Response(
      JSON.stringify({
        suggestions,
        peopleAlsoAsk: paaQuestions,
        meta: { query, totalSuggestions: suggestions.length },
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
