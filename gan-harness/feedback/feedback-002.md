# Evaluation: Iteration 002 (The Answer Booklet)

**Mode achieved:** real Chromium driven by Playwright scripts via Bash (`gan-harness/eval/iter2.mjs`, `iter2b.mjs`, `zoom.mjs`, `ar-left.mjs`), against the running dev server and the `mock-rich` provider. The Playwright MCP was not available. Real-provider output was not seen, because the key in `.env.local` is invalid.
**Build:** not run. `next build` shares `.next` with the running dev server, so I skipped it. The orchestrator must run it. Lint, vitest and e2e are green.

## Scores
| Axis | Score | Reason |
|---|---|---|
| Design (25%) | 7.5 | The booklet contract is delivered convincingly (cover green, ruled sheet, double margin rule, form header, red marks) and both themes are designed. Arabic answer text falls back to a system font and breaks word spacing, the university name truncates in the header, and the disabled stamp is faint |
| Originality (15%) | 8.5 | A genuinely own-world concept: the composer is the next numbered ruled line, Stop lives in the margin, there is a red tick and the cover label form. Nothing reads as AI-generic |
| Craft (25%) | 7.5 | All iteration-1 fixes verified, small typed code, 401 and `getUser` correct, body cap and message cap present. The Literata Fallback font-stack bug, a slice-after-cap that can begin with an assistant turn, and an unverified build hold it back |
| Functionality (35%) | 8.5 | Every flow verified in a real browser, including the double-click, Esc, stop-from-margin, unavailable and retry paths |

**Weighted total: 8.0**

Verdict: PASS (threshold 7.0). No hard-fail cap.

## Hard fails
1. build / lint / test: lint PASS, `npm test` PASS (12/12), `npm run e2e` PASS (2/2, reusing the server). **Build NOT RUN**: it would collide with the dev server's `.next`. Orchestrator to verify.
2. Signup requires a university and major: PASS. An empty form stays on `/auth/sign-up`. A foreign major injected into the DOM shows "هذا التخصص غير متاح في الجامعة المختارة." A valid signup lands on `/chat`. The filtered majors differ per university (kau, kfupm and ksu each have 3).
3. Logout then login lands on `/chat`: PASS (verified in ar-dark).
4. Logged-out `/chat` redirects to `/auth/login`, and `POST /api/chat` returns 401: PASS (e2e).
5. Reply streams, and the unavailable state does not crash: PASS via the mock (the key is invalid, so real-provider output is unverified). AUTHFAIL (401) maps to the localized "المساعد غير متاح حاليًا..." notice plus retry. A 500 shows the generic localized error, and retry then produces a full reply.
6. Locale: PASS. `<html lang dir>` switches (ar/rtl, en/ltr) and persists across reload via cookie. The only English in Arabic mode is the "English" switch label and the Enter / Shift+Enter key names in the hint. The reverse holds in English mode (the "العربية" label). Both are deliberate and are the same as accepted in iteration 1.
7. Theme persistence and flash: PASS. After clicking to dark and reloading, the class is `dark` with 0 class mutations after first paint. It survives a locale switch.
8. Logical-CSS grep: PASS (no hits).
9. Secrets and gitignore: PASS (`git check-ignore .env.local` prints `.env.local`).

## Iteration-1 fix verification
- e2e env loading and the alert selector: FIXED. The e2e is green and uses `main [role=alert]`.
- Double-click: FIXED. `dblclick` on Ask produced exactly 1 request and a full 326-character reply. Ask is disabled while streaming. Stop appears in the answer's margin ("أوقف") and is not at the Ask position.
- Stop from the margin: works. The partial text is kept, the "أُوقفت" label shows and the composer re-enables.
- Esc during streaming: works. The composer re-enables.
- Provider 401: FIXED, localized "unavailable" notice.
- Arabic placeholder: FIXED. It is now "اكتب سؤالك هنا", and the shortcut hint sits under the composer and is hidden under `sm`.
- 360 px: FIXED. No horizontal scroll on login, sign-up or chat (scrollWidth minus innerWidth is 0). The header is a 2x2 form table, and a long URL in a question wraps.
- 512 KB body cap (413) and the last 40 messages: present in `app/api/chat/route.ts` (code read; the 413 was not exercised over the wire).
- Form-control contrast: the select and input boxes are now 1px `spot/40` cell borders on a cover label panel. I did not measure the border-vs-fill ratio; the labels and text pass.
- Locale-switch label-in-name: the button name equals its visible text ("English").

## Contrast spot-checks (computed from the tokens)
Light: print 16.2, spot 6.5, ballpoint 8.6, pen (red, on paper) 4.75, spot on ruling 4.9, cover-ink on cover 7.4, cover-soft on cover 5.2.
Dark: print 15.2, spot 7.6, ballpoint 9.2, pen 7.4, spot on ruling 5.7, cover-ink on cover 12.0, cover-soft on cover 6.7.
All AA. Light-mode red pen is the thinnest margin at 4.75, which is fine for text but is used at 12px ("أُوقفت").

## Critical issues
None.

## Major issues
1. **Arabic answer text does not render in Noto Naskh Arabic.** `document.fonts` loaded only Readex, Literata (latin), "Literata Fallback" and Aref. The computed `font-family` is `Literata, "Literata Fallback", "Noto Naskh Arabic", ...`. next/font's auto-generated "Literata Fallback" is a `local()` face that maps to a system serif (Times New Roman and similar), and those have Arabic glyphs. It therefore wins before Naskh and renders the Arabic reading text in a system font, with visibly broken spacing after non-joining letters ("الخوار زميات", "المتر ابطة", "المستوى" with a gap). The primary language's main reading surface, an explicit contract element, is wrong. Screenshot: `iter-002-zoom-answer.png`. Fix in `tailwind.config.ts` and `app/globals.css`: under `html[lang="ar"]`, make `.font-read` use `var(--f-naskh)` first. Alternatively set `adjustFontFallback: false` on Literata, or put naskh before literata in the stack. Re-check `document.fonts` for "Noto Naskh Arabic".

## Minor issues
1. `components/chat.tsx`: the header-form university cell is `truncate`d at 1440 px ("King Fahd University of Petr...", "جامعة الملك فهد للبترول والمعا..."). It is the profile context the product is about. Let that cell wrap to 2 lines (drop `truncate`, keep the `title`), or widen the column.
2. The Ask stamp when disabled (empty composer, the default state) is a pale pink ghost in both themes; the affordance is weak. Keep the double frame at full ink and only dim the text or add `cursor-not-allowed`.
3. `route.ts`: `messages.slice(-40)` can begin with an assistant turn, which Anthropic rejects. Slice to the first user message after the cut.
4. The wordmark link is 36x28 px (below the 44 px touch target) on mobile.
5. The sign-up cover at desktop leaves about 300 px of dead green below the card. It is acceptable, but the card could vertically center.
6. Messages are lost on reload (history is a later slice).

## What improved
Every iteration-1 critical and major item is fixed and verified. The look is now clearly authored: it carries the contract's story (numbered questions, margin tick, the printed header form, Stop in the margin), and English renders beautifully in Literata. Contrast is strong and consistent in both themes.

## What regressed
The Arabic reading font (above) is new in this build. Nothing else regressed.

## Fix list, priority order
1. `app/layout.tsx`, `tailwind.config.ts`, `app/globals.css`: make Arabic answer text actually use Noto Naskh Arabic (Literata Fallback shadows it). Expected: `document.fonts` shows Noto Naskh Arabic loaded on `/chat` in ar, and words like "الخوارزميات" are joined.
2. `components/chat.tsx`: stop truncating the university cell in the form header.
3. `components/chat.tsx` and `app/globals.css`: strengthen the disabled `.stamp` affordance.
4. `app/api/chat/route.ts`: make the 40-message slice start on a user turn.
5. Run `npm run build` (not run here, see Hard fail 1).

## Screenshots (`gan-harness/screenshots/iter-002-*.png`)
signup-ar-light, signup-ar-dark, signup-en-light, signup-en-dark, signup-360, signup-mismatch-ar, signup-empty-ar, chat-empty-ar-light, chat-empty-ar-dark, chat-empty-en-dark, chat-writing-ar-light, chat-answer-ar-light, chat-answer-ar-dark, chat-answer-en-light, chat-stopped-ar-light, chat-unavailable-ar-light, chat-error-ar-light, chat-3000-ar-light, chat-empty-360, chat-answer-360, login-ar-dark, zoom-answer.
