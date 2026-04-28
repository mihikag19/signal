// supabase/functions/scrape-google-trends/index.ts
import { corsHeaders } from "../_shared/cors.ts";

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Referer": "https://trends.google.com/",
};

function stripPrefix(text: string): string {
  return text.replace(/^\)\]\}',?\n/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { query } = await req.json();
    if (!query) throw new Error("Missing query");

    // Step 1: get widget tokens from explore
    const exploreReq = JSON.stringify({
      comparisonItem: [{ keyword: query, geo: "", time: "today 12-m" }],
      category: 0,
      property: "",
    });

    const exploreRes = await fetch(
      `https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=${encodeURIComponent(exploreReq)}`,
      { headers: BROWSER_HEADERS }
    );
    if (!exploreRes.ok) throw new Error(`Google Trends explore failed: ${exploreRes.status}`);

    const exploreData = JSON.parse(stripPrefix(await exploreRes.text()));
    const widgets: any[] = exploreData.widgets || [];

    const timeWidget = widgets.find((w: any) => w.id === "TIMESERIES");
    const rqWidget = widgets.find((w: any) => w.id === "RELATED_QUERIES");
    const rtWidget = widgets.find((w: any) => w.id === "RELATED_TOPICS");

    if (!timeWidget) throw new Error("No TIMESERIES widget");

    // Step 2: interest over time
    const timeRes = await fetch(
      `https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(timeWidget.request))}&token=${encodeURIComponent(timeWidget.token)}`,
      { headers: BROWSER_HEADERS }
    );
    const timeData = JSON.parse(stripPrefix(await timeRes.text()));
    const points: any[] = timeData?.default?.timelineData ?? [];
    const interestOverTime = points.map((p: any) => ({
      date: p.formattedTime || p.formattedAxisTime,
      value: p.value?.[0] ?? 0,
    }));

    // Step 3: related queries
    let relatedQueries: any[] = [];
    let breakoutQueries: any[] = [];
    if (rqWidget) {
      try {
        const rqRes = await fetch(
          `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(rqWidget.request))}&token=${encodeURIComponent(rqWidget.token)}`,
          { headers: BROWSER_HEADERS }
        );
        const rqData = JSON.parse(stripPrefix(await rqRes.text()));
        const top = rqData?.default?.rankedList?.[0]?.rankedKeyword ?? [];
        const rising = rqData?.default?.rankedList?.[1]?.rankedKeyword ?? [];
        relatedQueries = top.slice(0, 10).map((k: any) => ({ query: k.query, value: k.value }));
        breakoutQueries = rising
          .filter((k: any) => k.value === "Breakout" || (typeof k.value === "number" && k.value >= 5000))
          .slice(0, 5)
          .map((k: any) => ({ query: k.query, growth: k.value }));
      } catch { /* best-effort */ }
    }

    // Step 4: related topics
    let relatedTopics: string[] = [];
    if (rtWidget) {
      try {
        const rtRes = await fetch(
          `https://trends.google.com/trends/api/widgetdata/relatedsearches?hl=en-US&tz=0&req=${encodeURIComponent(JSON.stringify(rtWidget.request))}&token=${encodeURIComponent(rtWidget.token)}`,
          { headers: BROWSER_HEADERS }
        );
        const rtData = JSON.parse(stripPrefix(await rtRes.text()));
        const topTopics = rtData?.default?.rankedList?.[0]?.rankedKeyword ?? [];
        relatedTopics = topTopics.slice(0, 10).map((t: any) => t.topic?.title || t.query).filter(Boolean);
      } catch { /* best-effort */ }
    }

    const values = interestOverTime.map((p: any) => p.value);
    const currentValue = values.at(-1) ?? 0;
    const oldValue = values[0] ?? 0;
    const trendDirection =
      currentValue > oldValue * 1.2 ? "rising" : currentValue < oldValue * 0.8 ? "declining" : "stable";

    return new Response(
      JSON.stringify({
        interestOverTime,
        relatedQueries,
        relatedTopics,
        breakoutQueries,
        meta: {
          query,
          trendDirection,
          currentInterest: currentValue,
          peakInterest: values.length > 0 ? Math.max(...values) : 0,
          dataPoints: interestOverTime.length,
        },
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
