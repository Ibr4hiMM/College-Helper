# College-Helper: Slice 1 spec (auth, profile and streaming agent chat, ar/en, light/dark)

The approved slice of a 5-slice MVP. Later slices are RAG, history, uploads and polish. **Build only slice 1.**

## Product
An AI study companion for Saudi university students. At signup the student picks their university and major, and the agent tailors every answer to that profile. In later slices it will search that major's curriculum.

## Already in place (do not redo)
- Next.js 16.3 App Router from the official `with-supabase` starter. Auth uses cookies through `@supabase/ssr`; `proxy.ts` calls `lib/supabase/proxy.ts`. Tailwind v3, shadcn/ui primitives in `components/ui`, and `next-themes` are installed.
- Supabase project `gcjtgmlvqkbrzizbdddl` is live, and `.env.local` holds the URL and publishable key. `ANTHROPIC_API_KEY` may be empty; the user is pasting it in.
- Migration `supabase/migrations/0001_init.sql` is already applied:
  - `universities(id text slug, name_ar, name_en)` and `majors(id bigint, university_id, slug, name_ar, name_en)` are public-readable. There are 3 universities with 3 majors each.
  - `profiles(id uuid = auth.uid(), university_id, major_id)` is readable only by its owner. The trigger `handle_new_user` creates the row from `signUp({ options: { data: { university_id, major_id } } })`.
  - A composite FK ensures the major belongs to the chosen university. Missing or mismatched metadata makes signUp fail, and the error must be shown localized.
- Email confirmation is OFF, so `signUp` returns a session right away and the user goes straight to `/chat`.

## Must build
1. **Strip the starter.** Delete `components/tutorial/*`, `hero.tsx`, `deploy-button.tsx`, `next-logo.tsx`, `supabase-logo.tsx`, `env-var-warning.tsx` and their usages. Rename the `app/protected` route to `app/chat`. Update every redirect to `/protected`, including the one in `emailRedirectTo` and in `app/auth/confirm/route.ts`.
2. **i18n:**
   - `next-intl` with **no locale routing**. The locale comes from a `NEXT_LOCALE` cookie and defaults to `ar`.
   - Files: `i18n/request.ts`, `messages/ar.json`, `messages/en.json`, the plugin in `next.config.ts`, and `components/locale-switcher.tsx`.
   - `<html lang dir>`: `ar` means `rtl`, `en` means `ltr`.
   - Every user-visible string goes through translations, including auth errors.
   - Use only logical CSS: `ms-`/`me-`/`ps-`/`pe-`/`start-`/`end-`/`text-start`/`text-end`. Never use `ml-`, `mr-`, `pl-`, `pr-`, `left-`, `right-`, `text-left` or `text-right` in `app/` or `components/`.
3. **Sign-up:**
   - `app/auth/sign-up/page.tsx` loads universities and majors on the server and passes them to `components/sign-up-form.tsx`.
   - The form has two native `<select>` elements: first the university, then a major list filtered to that university. Both are required.
   - Names show in the active locale.
   - Validate with zod in `lib/profile.ts` (add `zod` if it's missing). The schema is email, password of at least 8 characters, matching repeat, a university id and a major id that belongs to it.
   - Call `signUp` with `options.data = { university_id, major_id }`, then `router.push('/chat')`.
4. **Login and logout:** keep the starter's flows, translate them, and send a successful login to `/chat`.
5. **Auth guard:**
   - Unauthenticated page requests redirect to `/auth/login` (the starter does this already).
   - Unauthenticated `/api/*` requests must get a **401 JSON response, not a redirect**. Change `lib/supabase/proxy.ts` accordingly, and re-check inside the route handler with `supabase.auth.getUser()`.
6. **Chat:**
   - `app/chat/page.tsx` is a server component. It loads the profile joined with university and major names and renders `components/chat.tsx`, a client component using `useChat` from `@ai-sdk/react`.
   - `app/api/chat/route.ts`:
     - `streamText` from `ai` with `anthropic('claude-sonnet-5-5')` from `@ai-sdk/anthropic`.
     - `maxOutputTokens: 2048`.
     - The system prompt is built by `lib/system-prompt.ts` from the profile: university and major names, answer in the user's language, study and research helper, honest when unsure.
     - Return the UI message stream response.
   - **AI SDK is v7.** Confirm the exact API names (`useChat` transport, `convertToModelMessages`, the stream response helper, `maxOutputTokens`) from the installed `node_modules/ai` and `@ai-sdk/react` type definitions or docs. Do not guess from older versions.
   - If `ANTHROPIC_API_KEY` is missing, the route returns 503 with a clear message and the UI shows a localized "assistant unavailable" notice. It must not crash.
   - UI:
     - The message list shows tokens streaming in.
     - A textarea composer: Enter sends, Shift+Enter adds a newline. It's disabled while streaming and has a stop button.
     - An empty state with 3 suggestion prompts tailored to the major.
     - A header showing the university · major, the locale switcher, the theme switcher and logout.
     - A localized error state with retry.
7. **Theme:** light, dark and system via `next-themes`, persisted with no flash.
8. **Tests:**
   - `vitest`, with `npm test` running `vitest run`.
   - `lib/profile.test.ts` covers the validation, including a major from another university.
   - `lib/messages.test.ts` checks that ar and en have identical key sets.
   - `lib/system-prompt.test.ts`.
   - `@playwright/test` with `e2e/signup-chat.spec.ts`: sign up as a unique `e2e+<timestamp>@example.com`, land on `/chat`, send "What is my major?", and assert that a non-empty assistant reply appears. Skip the reply assertion when `ANTHROPIC_API_KEY` is empty. Also log out, log back in and land on `/chat`.
   - Script `npm run e2e`.
9. **`.env.example`** lists every variable. Never commit real values.

## Design direction: "Calm academic" (hard requirement: must not look AI-generated)
- **Mood:** a well-made university library tool. Quiet, typographic, confident. Think a printed journal, not a SaaS dashboard.
- **Light mode:** warm paper background (a near-white with a slight warm tint, not pure #fff), deep ink text, hairline rules instead of heavy cards or shadows.
- **Dark mode:** deep blue-black ink background, not pure #000 and not gray-800 slate, with soft paper-colored text.
- **Accent:** ONE restrained accent, such as an oxidized green or a deep academic red, used sparingly for focus, links and the send button.
- **Type:** serif headings and body sans, loaded with `next/font`.
  - Latin: Source Serif 4 for headings, IBM Plex Sans for body.
  - Arabic: Noto Naskh Arabic for headings, IBM Plex Sans Arabic for body.
  - Arabic text needs a larger line-height and no letter-spacing.
- **Tokens:** CSS variables on `:root` and `.dark` in `app/globals.css`. Replace the shadcn default palette entirely.
- **Banned:** gradients, glassmorphism, emoji as decoration, purple/indigo, gratuitous rounded-2xl pill cards, centered hero-with-three-feature-cards layouts, and stock "AI sparkle" icons.
- **Messages:** user messages are a subtle tinted block aligned to the end. Assistant messages are full-width typeset prose with no bubble.
- **Accessibility:** WCAG AA contrast for every text/background pair in both themes, visible focus rings, labels on all inputs, and keyboard-operable everywhere.

## Rules
- Minimal dependencies. The only ones to add are `next-intl`, `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`, `zod`, `vitest`, `@vitest/coverage-v8` and `@playwright/test`.
- Fewest files, and no speculative abstractions or "for later" scaffolding.
- **Do NOT git commit.** The orchestrator commits after human approval (Gate 2).
- Never print or log secrets. Never read `.env.local` values into output.
- Leave the dev server running on port 3000 when done (`nohup npm run dev > gan-harness/dev.log 2>&1 &`), and write `gan-harness/generator-state.md` covering what was built, what's known to be missing, and how to run things.
- `npm run build`, `npm run lint` and `npm test` must pass.
