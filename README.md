# College Helper · مساعد الجامعة

An AI study companion for Saudi university students. Students sign up with their university and major; an agent (Claude) answers questions, helps with research and projects, and tailors every answer to that program. Arabic-first (RTL) with English, light and dark.

The interface is an exam answer booklet: each question goes on the next ruled line, the answer is written beneath it, and the red margin carries the marks.

## Stack

Next.js 16 (App Router) · Supabase (Auth, Postgres) · Vercel AI SDK v7 + Anthropic · next-intl · Tailwind v3

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

Database migrations live in `supabase/migrations/` and are applied in order.

Supabase settings this app expects:
- **Auth → Providers → Email:** "Confirm email" off for v1 (the free mailer is rate-limited).
- **Auth → URL Configuration:** add `http://localhost:3000/**` (and the production URL) to Redirect URLs so password-reset links reach `/auth/confirm`.

## Checks

```bash
npm run lint
npm test        # vitest
npm run e2e     # Playwright: sign up → chat → log out → log in
npm run build
```

## Roadmap

1. Sign-up with university + major, streaming agent chat, ar/en, light/dark ← this slice
2. Curriculum RAG with citations (pgvector)
3. Saved conversations
4. Image and PDF uploads
5. Landing page and polish
