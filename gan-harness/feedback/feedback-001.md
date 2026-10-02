# Evaluation: Iteration 001

**Mode achieved:** real Chromium driven by Playwright scripts via Bash (`gan-harness/eval/*.mjs`), against http://localhost:3000. The Playwright MCP was not available.
**Streaming caveat:** the configured `ANTHROPIC_API_KEY` is rejected by Anthropic (401 `invalid x-api-key`; the value is 31 chars and starts `apikey_`, not `sk-ant-`). I verified streaming, stop, error and retry through the real app using a local mock Anthropic server (`ANTHROPIC_BASE_URL`, `gan-harness/eval/mock-anthropic.mjs`). The mock echoes the profile major from the system prompt. Real-provider output was not seen. The dev server was restored to normal config afterwards.

## Scores
| Axis | Score | Reason |
|---|---|---|
| Design (25%) | 6.5 | Palette, serif and one accent are on-brief and both themes are designed, but there are Arabic bidi/placeholder defects, a cramped 360 px header and low input-border contrast |
| Originality (15%) | 6.0 | Restrained and starter-free, with a nice ruled suggestion list, but otherwise a plain minimal layout with a text-only wordmark |
| Craft (25%) | 6.5 | Small, clean code and a correct 401 and `getUser` check, but the e2e spec is broken for real-key runs, the double-click bug, the hydration warning and no server input cap |
| Functionality (35%) | 7.5 | Signup, filtered majors, login, logout, streaming, stop, retry, locale, theme and edge cases mostly work; double-click on Send kills the reply |

**Weighted total: 6.8**

Verdict: FAIL (threshold 7.0). No hard-fail cap applied.

## Hard fails
1. build / lint / test: PASS. Build succeeded, lint clean, vitest 12/12.
2. Signup requires a university and major: PASS. Empty gives "choose your university"; a foreign major injected via DOM gives the localized `majorMismatch`; a real signup lands on `/chat`.
3. Logout then login lands on `/chat`: PASS. A wrong password gives a localized error.
4. Logged out `/chat` redirects to `/auth/login`, and `POST /api/chat` returns 401 JSON: PASS.
5. Reply streams with a valid key / localized notice with an empty key: the notice is PASS in ar and en with no crash. Streaming is PASS via the mock. Against the real provider it is UNVERIFIED, because the supplied key is invalid. The app shows the generic localized error plus retry for it. This is an environment problem, so no cap was applied.
6. Locale toggle: PASS. `<html lang dir>` switches (ar/rtl, en/ltr) and persists via cookie. The only English in ar mode is the deliberate "English" switch label and the key names Enter/Shift+Enter.
7. Theme persists, no flash: PASS. Reload keeps `dark`, and there are no html class mutations after first paint.
8. Logical-CSS grep: PASS. Zero hits.
9. Secrets: PASS. No `.env.local` value appears in any file outside `.env.local`, and `git check-ignore .env.local` returns it. `.env.example` is clean.

e2e is not a listed hard-fail, but `npm run e2e` FAILS as shipped with a real key (see Critical 1).

## Critical issues
1. `e2e/signup-chat.spec.ts`: `hasKey` reads `process.env`, which Playwright does not load from `.env.local`. Result: `npm run e2e` takes the no-key branch and fails. `getByRole("alert")` also matches Next's `#__next-route-announcer__` (strict-mode violation). Fix: load `.env.local` via `process.loadEnvFile` in the config, and scope the alert to `main [role=alert]`. With `ANTHROPIC_API_KEY` exported against the mock, both tests pass.
2. `components/chat.tsx`: double-clicking Send aborts the reply. The Send button is swapped for the Stop button in the same spot, so the second click lands on Stop. Reproduced: 1 request, 0 assistant articles, composer re-enabled. Fix: keep the Send button mounted while streaming (disabled), put Stop in a different slot, or ignore a Stop click within about 300 ms of send.
3. Key issue (user action): `.env.local` `ANTHROPIC_API_KEY` is not a valid Anthropic key. Replace it with an `sk-ant-...` key and re-run the e2e. Also show a distinct localized "assistant misconfigured" message instead of a generic error on a 401 from the provider.

## Major issues
1. Arabic composer placeholder: it is mis-ordered by the bidi algorithm (renders "...لسطر جديد .اكتب سؤالك. Enter للإرسال، وShift+Enter") and left-aligned in an RTL page. Fix in `messages/ar.json` and `chat.tsx`: shorten it to "اكتب سؤالك" and move the shortcut hint into a small `<p dir="rtl">` below the composer. Do not put Latin key names inside the placeholder.
2. 360 px chat header: the wordmark wraps to 2 lines ("مساعد / الجامعة"), the context line is truncated to "جامعة الملك ع...", and the composer's placeholder is clipped to 2 half-lines. Fix in `components/header.tsx`: use `whitespace-nowrap` on the wordmark and drop the wordmark to an icon or short mark under 400 px. Put the context line on its own full-width row. Give the textarea `min-h-11`, and use a short placeholder.
3. `app/api/chat/route.ts`: no cap on message count or length. A 3000-char message is accepted (fine), but there is no limit, so unauthenticated-after-login abuse can burn tokens. Fix: reject a body over about 32 KB, or more than about 40 messages, with 413 or 400.
4. Input borders: `--border` against `--background` is 1.44:1 in light and 1.61:1 in dark. Form-control boundaries need 3:1 (WCAG 1.4.11). Fix: use a darker `--input-border` token for the select, input and textarea, and keep the hairline `--border` for rules.
5. `LocaleSwitcher`: `aria-label="اللغة"` replaces the visible text "English", which violates label-in-name (WCAG 2.5.3). Fix: drop the aria-label, or make it include the visible text.

## Minor issues
1. Hydration mismatch warning in the console on `/auth/login` in dev (an `<input>` attribute mismatch). Find the mismatching attribute and remove it.
2. Messages are lost on reload and on page navigation (history is a later slice; the empty state returns, which is acceptable for now).
3. The wordmark is plain text, with no mark or colophon. The header has no identity element, so "tasteful header" is only partly met.
4. The disabled Send button at 50% opacity is barely visible in light mode.
5. Mismatch/validation errors show only the first zod issue.
6. The sign-up page left-hugs a narrow column with a large dead area, and the native `<select>` chevrons are default-styled.

## Verified working
Signup with a filtered major list (KAU: Accounting / Computer Science / Industrial Engineering, and the per-university lists differ). The reply to "What is my major?" and "ما هو تخصصي؟" names the correct major in the matching language (mock). Streaming is incremental, the composer is disabled while streaming, and Stop keeps the partial text. An error shows the localized message plus retry. Empty and whitespace messages are not sent, Shift+Enter inserts a newline, rapid triple-Enter sends exactly 1 request, and the 3000-char mixed message works. `<script>` text is rendered inert. No horizontal scroll at 360 px on chat, sign-up or login. Focus rings are visible (2px accent) on every tab stop. Contrast for text pairs passes AA in both themes (fg 15+, muted 6.7/8.7, button 8.3). Locale change keeps the open conversation.

## Fix list, priority order
1. `e2e/signup-chat.spec.ts` and `playwright.config.ts`: load `.env.local`, scope the alert selector. Expected: `npm run e2e` is green with a valid key.
2. `components/chat.tsx`: the Send to Stop swap must not abort on a double-click. Expected: 1 request and a full reply after a double-click.
3. Replace the Anthropic key in `.env.local` with a valid one, and add a distinct localized message for provider auth errors.
4. `messages/ar.json` and `components/chat.tsx`: fix the Arabic placeholder bidi and alignment.
5. `components/header.tsx` and `chat.tsx`: fix the 360 px header wrap and the clipped composer.
6. `app/api/chat/route.ts`: cap the body size and message count.
7. `components/ui/input.tsx` and `app/globals.css`: input-border token at 3:1 or more.
8. `components/locale-switcher.tsx`: label-in-name.

## Screenshots (`gan-harness/screenshots/iter-001-*.png`)
signup-{ar,en}-{light,dark}, signup-360, chat-{ar,en}-{light,dark}, chat-empty-{ar,en}-{light,dark}, chat-360, chat-streaming-ar-light, chat-stopped-ar, chat-error-ar, chat-nokey-ar, chat-long-mixed-ar, chat-3000char-en, login-ar-light.
