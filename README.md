# College Helper · مساعد الجامعة

An AI study companion for Saudi university students. Students sign up with their university and major; an agent (Claude) answers questions, helps with research and projects, and tailors every answer to that program. Arabic-first (RTL) with English, light and dark.

The interface is an exam answer booklet: each question goes on the next ruled line, the answer is written beneath it, and the red margin carries the marks.

## Stack

Next.js 16 (App Router) · Supabase (Auth, Postgres, pgvector) · Vercel AI SDK v7 + Anthropic + OpenAI embeddings · next-intl · Tailwind v3

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev                  # http://localhost:3000
```

| Variable | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys (`sk-ant-…`) |
| `OPENAI_API_KEY` | platform.openai.com → API keys. Turns on curriculum search; without it the agent answers from general knowledge |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret. Only for `npm run ingest`, never used by the app |

Database migrations live in `supabase/migrations/` and are applied in order.

### Curriculum

The agent searches only the student's own university and major (plus university-wide entries). Curriculum is loaded from JSONL, one entry per course and language:

```json
{"university":"ksu","major":"computer-science","course_code":"CSC 111","title":"…","lang":"ar","content":"…","source":"KSU study plan 2026"}
```

`university` and `major` are the slugs in the `universities` and `majors` tables (`major: null` applies to the whole university). A `source` starting with `DEMO` is shown and cited as sample data.

```bash
npm run ingest -- supabase/seed/curriculum-demo.jsonl --dry-run   # checks slugs and chunking
npm run ingest -- supabase/seed/curriculum-demo.jsonl             # embeds and inserts; re-running skips stored chunks
```

Supabase settings this app expects:
- **Auth → Providers → Email:** "Confirm email" off for v1 (the free mailer is rate-limited).
- **Auth → URL Configuration:** add `http://localhost:3000/**` (and the production URL) to Redirect URLs so password-reset links reach `/auth/confirm`.

## Checks

```bash
npm run lint
npm test        # vitest
npm run e2e     # Playwright with mock Claude + embeddings; the curriculum-hit test also needs SUPABASE_SECRET_KEY
npm run build
```

## Roadmap

1. Sign-up with university + major, streaming agent chat, ar/en, light/dark
2. Curriculum RAG with citations (pgvector) ← this slice
3. Saved conversations
4. Image and PDF uploads
5. Landing page and polish
