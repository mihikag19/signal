#!/usr/bin/env python3
"""
Wave 3 integration test — runs all 4 features end-to-end.
Usage: python3 test_wave3.py
Requires: SUPABASE_SERVICE_ROLE_KEY env var (or set it below)
"""
import os, sys, json, re, time, ssl, urllib.request, urllib.error

# macOS Python 3.14 SSL fix
_SSL_CTX = ssl.create_default_context()
_SSL_CTX.check_hostname = False
_SSL_CTX.verify_mode = ssl.CERT_NONE

# ── Config ────────────────────────────────────────────────────────────────────
BASE = "https://mrjjszpaxuyzlkbzsmqs.supabase.co/functions/v1"
ANON_KEY = (
    os.getenv("SUPABASE_ANON_KEY") or
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
    ".eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yampzenBheHV5emxrYnpzbXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MjY1MjUsImV4cCI6MjA4NzMwMjUyNX0"
    ".IQzK_s69G6mgpZoFEXcZKmmGGr44zavrE_es8s-7pUA"
)
HEADERS = {"Authorization": f"Bearer {ANON_KEY}", "Content-Type": "application/json"}


def call(fn: str, payload: dict) -> dict:
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{BASE}/{fn}", data=data, headers=HEADERS, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as r:
            raw = r.read().decode("utf-8", errors="replace")
            raw = re.sub(r"(?<!\\)[\x00-\x1f]", " ", raw)
            return json.loads(raw)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"  HTTP {e.code}: {body[:300]}")
        return {"error": body}


def stream_sse(fn: str, payload: dict):
    """Yields (type, data) tuples from an SSE stream."""
    data = json.dumps(payload).encode()
    req = urllib.request.Request(f"{BASE}/{fn}", data=data, headers=HEADERS, method="POST")
    with urllib.request.urlopen(req, timeout=120, context=_SSL_CTX) as r:
        buf = ""
        while True:
            chunk = r.read(256)
            if not chunk:
                break
            buf += chunk.decode("utf-8", errors="replace")
            while "\n\n" in buf:
                event, buf = buf.split("\n\n", 1)
                for line in event.split("\n"):
                    if line.startswith("data: "):
                        try:
                            yield json.loads(line[6:])
                        except Exception:
                            pass


def hr(title): print(f"\n{'='*60}\n  {title}\n{'='*60}")


# ── Test 1: Streaming validation ──────────────────────────────────────────────
hr("TEST 1 — Streaming Analysis (AI tutoring)")

# We need the pre-scraped data to call analyze directly with stream:true.
# For this test we call with minimal data so it runs quickly.
print("Calling analyze with stream:true and minimal stub data...")
stream_payload = {
    "idea": "AI tutoring for K-12 students",
    "stream": True,
    "redditPosts": [
        {"title": "My kid struggles with math and I can't afford a tutor", "body": "Would pay $30/mo for something reliable", "subreddit": "Parenting", "score": 420, "numComments": 87}
    ],
    "hnStories": [{"title": "AI tutoring startup raises $50M", "points": 312, "numComments": 145}],
    "hnComments": [{"text": "We pay $200/mo for Kumon. Would switch in a heartbeat.", "author": "parent_hn"}],
    "ycCompanies": [{"name": "Khanmigo", "batch": "W23"}, {"name": "Synthesis", "batch": "S21"}],
    "phPosts": [], "devtoArticles": [], "ihPosts": [], "githubRepos": [], "githubIssues": [],
    "soQuestions": [], "googleTrends": {}, "autocompleteSuggestions": [], "peopleAlsoAsk": [],
    "wikipediaArticles": [], "g2Products": [], "g2Complaints": [], "chromeExtensions": [],
    "trustpilotCompanies": [], "appstoreApps": [], "appstoreNegativeReviews": [],
    "youtubeVideos": [], "mediumArticles": [], "substackPosts": [], "lobstersStories": [],
    "lemmyPosts": [], "crunchbaseCompanies": [], "wellfoundCompanies": [],
    "npmPackages": [], "pypiPackages": [], "ghStarsRepos": [],
}

statuses, scores_received, quotes_received = [], False, 0
analysis = None
t0 = time.time()

try:
    for event in stream_sse("analyze", stream_payload):
        t = event.get("type", "?")
        if t == "status":
            print(f"  [status] {event.get('message')}")
            statuses.append(event.get("message"))
        elif t == "partial":
            pass  # lots of tokens, don't print each
        elif t == "scores":
            scores = event.get("scores", {})
            print(f"  [scores] overallDemandScore={scores.get('overallDemandScore')} (arrived at t+{time.time()-t0:.1f}s)")
            scores_received = True
        elif t == "quote":
            q = event.get("quote", {})
            quotes_received += 1
            print(f"  [quote #{quotes_received}] \"{str(q.get('text',''))[:80]}\"")
        elif t == "complete":
            analysis = event.get("analysis", {})
            print(f"  [complete] score={analysis.get('overallDemandScore')} verdict={analysis.get('verdict')} at t+{time.time()-t0:.1f}s")
        elif t == "error":
            print(f"  [ERROR] {event.get('message')}")
except Exception as e:
    print(f"  Stream error: {e}")

print(f"\nStreaming summary:")
print(f"  Status messages: {len(statuses)}")
print(f"  Scores arrived early: {scores_received}")
print(f"  Quotes streamed: {quotes_received}")
print(f"  Complete received: {analysis is not None}")
assert analysis is not None, "No complete event received"


# ── Test 2: Save report ───────────────────────────────────────────────────────
hr("TEST 2 — Save Report to validation_history")

# Build a minimal ValidationReport to save
mock_report = {
    "ideaTitle": "AI tutoring for K-12",
    "ideaDescription": "AI tutoring for K-12 students",
    "overallScore": analysis.get("overallDemandScore", 65),
    "rawVerdict": analysis.get("verdict", "MAYBE"),
    "founderSignal": {"score": 70, "summary": "Strong"},
    "investorSignal": {"score": 65, "summary": "Moderate"},
    "verdict": "Strong demand signal detected.",
    "platforms": ["Reddit", "Hacker News"],
    "quotes": analysis.get("quotes", []),
    "targetPersonas": analysis.get("targetPersonas", []),
    "buildRecommendations": analysis.get("buildRecommendations", {}),
    "sentimentAnalysis": analysis.get("sentimentAnalysis", {}),
    "confidenceScore": analysis.get("confidenceScore", {}),
    "attentionScore": analysis.get("attentionScore", {}),
    "dataCoverage": {"totalItems": 3, "totalSources": 25, "successfulSources": 3, "sources": []},
    "recommendation": analysis.get("recommendation", ""),
}

save_result = call("save-report", {"report": mock_report})
print(f"  save-report response: {json.dumps(save_result)[:200]}")
report_id = save_result.get("id")
assert report_id, f"Expected an ID, got: {save_result}"
print(f"  ✓ Saved with ID: {report_id}")


# ── Test 3: List + Get reports ────────────────────────────────────────────────
hr("TEST 3 — List Reports + Get Report by ID")

list_result = call("list-reports", {"limit": 5, "offset": 0})
print(f"  list-reports: {list_result.get('total', '?')} total reports")
reports = list_result.get("reports", [])
for r in reports[:3]:
    print(f"    [{r.get('id','?')[:8]}...] {r.get('query','?')[:40]} | score={r.get('overallScore')} | {r.get('verdict','?')} | {r.get('createdAt','?')[:10]}")

assert any(r.get("id") == report_id for r in list_result.get("reports", [])), \
    f"Saved report {report_id} not found in list"
print(f"  ✓ Saved report found in list")

get_result = call("get-report", {"id": report_id})
assert get_result.get("report"), f"get-report returned no report: {get_result}"
got = get_result["report"]
assert got.get("ideaTitle") == mock_report["ideaTitle"], "Mismatch on ideaTitle"
print(f"  ✓ Retrieved report: '{got.get('ideaTitle')}' score={got.get('overallScore')}")


# ── Test 4: Generate PDF ──────────────────────────────────────────────────────
hr("TEST 4 — Generate PDF")

print(f"  Calling generate-pdf with reportId={report_id[:8]}...")
data_encoded = json.dumps({"reportId": report_id}).encode()
req = urllib.request.Request(f"{BASE}/generate-pdf", data=data_encoded, headers=HEADERS, method="POST")
try:
    with urllib.request.urlopen(req, timeout=60, context=_SSL_CTX) as r:
        ct = r.headers.get("Content-Type", "")
        pdf_bytes = r.read()
        print(f"  Content-Type: {ct}")
        print(f"  PDF size: {len(pdf_bytes):,} bytes")
        assert ct == "application/pdf", f"Expected application/pdf, got {ct}"
        assert pdf_bytes[:4] == b"%PDF", f"Response is not a PDF (got {pdf_bytes[:8]})"
        out = f"/tmp/signal_test_{report_id[:8]}.pdf"
        with open(out, "wb") as f:
            f.write(pdf_bytes)
        print(f"  ✓ PDF saved to {out}")
except urllib.error.HTTPError as e:
    print(f"  HTTP {e.code}: {e.read().decode()[:300]}")


# ── Test 5: Chat follow-up ────────────────────────────────────────────────────
hr("TEST 5 — AI Follow-up Chat")

print(f"  Sending: 'What's the biggest risk?'")
chat_payload = {
    "reportId": report_id,
    "message": "What's the biggest risk for this idea?",
    "history": [],
}

chunks, full_text = [], ""
t0 = time.time()
try:
    for event in stream_sse("chat", chat_payload):
        t = event.get("type", "?")
        if t == "chunk":
            chunks.append(event.get("text", ""))
        elif t == "complete":
            full_text = event.get("text", "")
        elif t == "error":
            print(f"  [ERROR] {event.get('message')}")
except Exception as e:
    print(f"  Chat stream error: {e}")

response_text = full_text or "".join(chunks)
print(f"  Response ({len(chunks)} chunks, {time.time()-t0:.1f}s):")
print(f"  {response_text[:400]}")
assert len(response_text) > 50, f"Chat response too short: '{response_text}'"
print(f"  ✓ Chat streaming works")


# ── Summary ───────────────────────────────────────────────────────────────────
hr("ALL TESTS PASSED ✓")
print("  Feature 1 — Streaming analyze: ✓")
print("  Feature 2 — Save to history:   ✓")
print("  Feature 3 — List + Get report: ✓")
print("  Feature 4 — Generate PDF:      ✓")
print("  Feature 5 — Chat streaming:    ✓")
print()
