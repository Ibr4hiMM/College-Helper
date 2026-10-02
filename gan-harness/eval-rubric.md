# Slice 1 evaluation rubric

Score each axis 0–10. **Weighted total = 0.25·Design + 0.15·Originality + 0.25·Craft + 0.35·Functionality.** It passes at ≥ 7.0. **Any hard-fail caps the total at 5.0.**

## Hard fails (check every one; list each failure explicitly)
1. `npm run build`, `npm run lint` or `npm test` fails.
2. Signing up without a university or major is possible, or a successful signup does not land on `/chat`.
3. Logout followed by login doesn't land on `/chat`.
4. Logged out, `/chat` doesn't redirect to `/auth/login`, or `POST /api/chat` returns anything other than 401.
5. With a valid `ANTHROPIC_API_KEY`, no assistant reply streams in. With an empty key, the UI crashes instead of showing the localized notice.
6. The ar/en toggle doesn't switch `<html lang dir>` or doesn't persist across reload, or any visible English string remains in Arabic mode.
7. Light/dark doesn't persist, or flashes on reload.
8. `grep -rnE '\b(ml|mr|pl|pr|left|right)-[0-9a-z]|text-(left|right)' app components` returns any hits.
9. A secret value appears in any tracked file, or `.env.local` isn't gitignored.

## Design (25%)
- Is it clearly "calm academic": paper/ink palette, serif headings, a single accent, hairline structure?
- Visual hierarchy, rhythm and spacing are consistent across auth pages and chat.
- Arabic typography: correct fonts load, comfortable line-height, no letter-spacing, and the layout is truly mirrored (nav, composer, user-message alignment).
- Both themes are designed, not merely inverted. AA contrast holds everywhere.

## Originality (15%)
- Penalize hard: shadcn default look, gradients, purple, emoji, sparkle icons, generic three-card layouts, centered hero templates, and starter leftovers (Supabase/Next logos, tutorial text, "Deploy to Vercel").
- Reward deliberate details: the typeset assistant prose, a considered empty state with major-specific suggestions, and a tasteful header.

## Craft (25%)
- Code: minimal files, no dead starter code, no speculative abstractions, typed, with clear server/client boundaries.
- Security: auth is checked in the route with `getUser()`, the API returns 401 rather than a redirect, there are no secrets on the client, and errors are localized without leaking internals.
- Tests are meaningful: profile validation including a cross-university major, ar/en key parity, the system prompt, and the e2e flow.
- Keyboard: Enter sends, Shift+Enter adds a newline, focus rings are visible, inputs have labels. At 360 px wide nothing scrolls horizontally.

## Functionality (35%)
Drive a real browser through `@playwright/test`, or a Playwright script run via Bash, against http://localhost:3000. Save screenshots to `gan-harness/screenshots/iter-NNN-*.png`, covering at least ar-light, ar-dark, en-light and en-dark of sign-up and chat.
- Signup with a university and the filtered major list works, an invalid pairing shows a localized error, and login and logout work.
- The chat streams a reply. "What is my major?" is answered correctly from the profile in both languages. Stop works, and so do the error state and retry.
- Locale and theme toggles work and persist.
- Edge cases: an empty message can't be sent, a very long message works, rapid double-submit causes no duplicate request, and Arabic plus English mixed text renders correctly.

## Feedback format (`gan-harness/feedback/feedback-NNN.md`)
- Scores per axis with a one-line reason each, then `**Weighted total: X.X**` on its own line.
- Hard-fail list, saying pass or fail for each.
- A numbered list of concrete fixes in priority order, each naming the file and the expected behavior.
