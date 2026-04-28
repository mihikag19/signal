# Signal

**AI-powered market intelligence that validates startup ideas using real community data.**

Signal scrapes 20+ platforms simultaneously, analyzes hundreds of real conversations with AI, and produces a structured intelligence report — complete with demand scoring, competitor mapping, revenue modeling, and proof quotes from real people. One idea in, full market picture out.

---

## How It Works

```
Input an idea → Scrape 20+ platforms in parallel → AI analyzes everything → Full report
```

**Example:** You type "AI tutoring for K-12 students"

Signal fans out across Hacker News, GitHub, Stack Overflow, Dev.to, Product Hunt, YouTube, App Store reviews, Google Trends, npm download stats, Y Combinator's portfolio, and more. It collects every relevant post, comment, repo, review, and discussion — then feeds it all to Claude for structured analysis.

30 seconds later, you have:
- **Demand scores** from three different lenses
- **Competitor landscape** with real weaknesses pulled from user complaints
- **Revenue model** recommendation backed by willingness-to-pay signals
- **Target personas** extracted from who's actually talking about the problem
- **Proof quotes** from real people across real platforms
- **A confidence score** telling you how much to trust the analysis

---

## The Three Scoring Lenses

### Attention Value Score
*Is now the right moment?*

| Metric | What it measures |
|--------|-----------------|
| **Velocity** | How fast is conversation growing? Accelerating = opportunity |
| **Density** | How concentrated is discussion? Clustered = targetable niche |
| **Novelty** | New emerging topic or stale complaint? New = less competition |

### VC Signal Score
*Is this investable?*

Market size · Timing · Defensibility · Exit potential · Monetization signal

### Founder Signal Score
*Is this buildable?*

Pain intensity · Build feasibility · User urgency · Willingness to pay

---

## Data Sources

Signal pulls from 20+ platforms using parallel edge functions with graceful degradation — if any source fails or times out, the rest continue.

| Category | Sources |
|----------|---------|
| **Developer communities** | Hacker News, GitHub (repos + issues + stars), Stack Overflow, Dev.to, Lobsters |
| **Startup ecosystem** | Product Hunt, Indie Hackers, Y Combinator companies |
| **Package registries** | npm download stats, PyPI stats |
| **Search & trends** | Google Autocomplete, Google Trends, Wikipedia pageviews |
| **App reviews** | App Store (iTunes), Chrome Web Store |
| **Content platforms** | YouTube, Medium, Substack |
| **Community platforms** | Reddit (pending API approval), Lemmy |
| **Business intelligence** | Crunchbase, Wellfound (AngelList), G2, Trustpilot |

All sources are called in parallel with a 15-second timeout. Results are merged with source labels and passed as a unified dataset to the analysis engine.

---

## Analysis Engine

The AI doesn't just score — it produces a full intelligence report:

- **Competitor Map** — 3-5 existing products with traction estimates and weaknesses sourced from real user complaints
- **Revenue Model** — recommended monetization approach with price sensitivity analysis and proof quotes about willingness to pay
- **Target Personas** — 2-3 distinct user profiles extracted from the data, with pain points and platform preferences
- **Sentiment Analysis** — positive/negative/neutral breakdown with trend direction (is frustration growing or are existing solutions improving?)
- **Build Recommendations** — top features to start with, best initial audience, best channels to reach them, and biggest risk
- **Confidence Score** — how much data was found, from how many sources, how specific was it. Low data = low confidence, flagged honestly
- **Data Coverage Report** — exactly which sources returned data and how many items from each

---

## Features

- **Real-time streaming** — watch the analysis build token by token instead of waiting behind a loading screen
- **Validation history** — every search is saved. Revisit past validations and compare ideas side by side
- **PDF export** — one-click download of the full intelligence report
- **AI follow-up chat** — ask questions about your results ("What's the biggest risk?" "Who should I target first?") and get answers grounded in the scraped data
- **Shareable links** — send your validation report to co-founders or investors

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│           (TypeScript + Tailwind + Zustand)              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                   signalApi.ts                           │
│         (API layer — parallel fan-out, merging,          │
│          streaming, history, chat)                       │
└──────────────────────┬──────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────┐
   │  Scrapers  │ │ Analyze │ │ Services │
   │  (20+ edge │ │ (Claude │ │ (save,   │
   │  functions)│ │  API +  │ │  history,│
   │            │ │  SSE    │ │  PDF,    │
   │  HN, GH,  │ │  stream)│ │  chat)   │
   │  SO, npm,  │ │         │ │          │
   │  YC, etc.  │ │         │ │          │
   └────────────┘ └─────────┘ └──────────┘
          │            │            │
          └────────────┼────────────┘
                       ▼
          ┌─────────────────────────┐
          │   Supabase (Postgres   │
          │   + Edge Functions +   │
          │   Storage)             │
          └─────────────────────────┘
```

### Key Design Decisions

**Parallel fan-out with graceful degradation.** All 20+ scrapers fire simultaneously using `Promise.allSettled`. Each has a 15-second timeout. If a source fails — blocked by Cloudflare, rate limited, API down — the rest continue. The analysis adapts to whatever data is available.

**Three-tier source execution.** Tier 1 (always fast: HN, GitHub, SO) returns first and guarantees a baseline. Tier 2 and 3 sources fill in as they complete. The UI shows progress in real time.

**Streaming analysis.** The Claude API call uses SSE to stream the response. Scores appear as soon as they're parsed — users see results building instead of staring at a spinner.

**Strict TypeScript.** `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`. All 25+ response types are defined in `src/types/index.ts`. The mapping layer between Claude's output and the UI is fully typed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TypeScript, Tailwind CSS, Zustand |
| **Backend** | Supabase Edge Functions (Deno) |
| **AI** | Claude API (Anthropic) — analysis + chat |
| **Database** | Supabase Postgres |
| **APIs** | 20+ external APIs (GitHub, HN Algolia, Stack Exchange, npm registry, iTunes, Wikipedia, YouTube, Google, and more) |

---

## Running Locally

```bash
# Clone
git clone https://github.com/mihikag19/signal.git
cd signal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, ANTHROPIC_API_KEY

# Start dev server
npm run dev
```

### Edge Function Development

```bash
# Serve functions locally (requires Docker)
supabase functions serve --env-file .env

# Deploy to production
supabase functions deploy --project-ref mrjjszpaxuyzlkbzsmqs
```

---

## Project Context

Built at USC's Iovine and Young Academy as part of the Innovation Quest program. Won the IYA hackathon as a prototype, then rebuilt from scratch with a full scraping pipeline, AI analysis engine, and 20+ data sources.

The Attention Value Score — measuring velocity, density, and novelty of community conversations — is an original scoring framework for quantifying market timing.

---

## License

MIT
