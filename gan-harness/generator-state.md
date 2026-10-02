# Generator State: Iteration 001

## What was built
Slice 1 per spec: starter stripped (`app/protected` is now `app/chat`), next-intl (cookie `NEXT_LOCALE`, default ar, html lang/dir), sign-up with server-loaded university and filtered major selects validated by zod (`lib/profile.ts`), login/logout/forgot/update-password (all localized), proxy returns 401 JSON for `/api/*` and redirects pages, streaming chat (`app/api/chat/route.ts` + `components/chat.tsx`), light/dark/system theme, "calm academic" tokens and fonts, vitest + Playwright.

## Files
- Config: `next.config.ts`, `tailwind.config.ts`, `app/globals.css`, `eslint.config.mjs` (ignores .next), `vitest.config.mts`, `playwright.config.ts`, `.env.example`
- i18n: `i18n/request.ts`, `messages/{ar,en}.json`, `components/locale-switcher.tsx`
- App: `app/layout.tsx`, `app/page.tsx` (redirects to /chat), `app/auth/*`, `app/chat/page.tsx`, `app/api/chat/route.ts`
- Components: `chat.tsx`, `header.tsx`, `field.tsx` (Label/Field/FormError/AuthPanel), `sign-up-form.tsx`, `login-form.tsx`, `forgot-password-form.tsx`, `update-password-form.tsx`, `logout-button.tsx`, `theme-switcher.tsx`, `ui/button.tsx`, `ui/input.tsx`
- Lib: `profile.ts` (zod schema + getProfile), `system-prompt.ts`, `auth-error.ts`, `supabase/proxy.ts`
- Tests: `lib/*.test.ts` (12 tests), `e2e/signup-chat.spec.ts`
- Removed: tutorial/hero/logos/deploy/env-warning, shadcn card/badge/checkbox/dropdown/label, OG images, `app/auth/sign-up-success` (now an in-form state), `cacheComponents`, radix checkbox/dropdown/label/slot and tailwindcss-animate deps.

## Decisions
- AI SDK v7 confirmed from type defs: `useChat()` posts to /api/chat by default, `sendMessage({text})`, `convertToModelMessages` is async, `toUIMessageStreamResponse`, `maxOutputTokens`.
- 503 body `{"error":"assistant_unavailable"}`; client matches it and shows the localized notice with retry. Stream errors are masked as `assistant_error`.
- Error text is never shown raw: Supabase errors map to `errors.*` keys (`lib/auth-error.ts`).
- Double-submit guarded by a ref (not just status). `/auth/confirm` `next` param restricted to same-site paths.
- Theme is a single cycle button (light, dark, system). No markdown library: assistant text is split into paragraphs.

## Known gaps
- Could NOT verify signup success, chat streaming, or the full e2e: Supabase answered `over_email_send_rate_limit` (429) for every signup in this session. The localized rate-limit error does display correctly. Re-run `npm run e2e` once the limit resets.
- Supabase rejects `@example.com` as an invalid email, so the e2e defaults to `@example.org` (override with `E2E_EMAIL_DOMAIN`). The spec's example.com address cannot work.
- ANTHROPIC_API_KEY is now set (count was 1 at the end), so the e2e asserts a real reply; the 503 path is code-only, untested in browser.
- Screenshots exist only for sign-up (`gan-harness/screenshots/iter-001-signup-*.png`), none for chat (needs a session).
- Dev mode shows the Next dev indicator in screenshots.

## Run
- `npm run dev` (port 3000, running now, log in `gan-harness/dev.log`), `npm run build`, `npm run lint`, `npm test`, `npm run e2e`
