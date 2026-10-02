---
version: 1
slug: "app-chat-page-tsx"
primary_target: "app/chat/page.tsx"
related_targets: ["app/auth/sign-up/page.tsx","app/auth/login/page.tsx"]
---

## Scope
The chat screen (`/chat`) and the auth surfaces (`/auth/sign-up`, `/auth/login`, plus forgot/update/error, which inherit the cover). Mode: **Operate**. The student completes a task: sign up with university + major, then ask questions and read long answers.

## Audience and task
Saudi university students, Arabic-first, on laptops for long sessions and phones for quick questions. The task: ask, then read a tailored answer, many times per session. Key states: empty, writing (streaming), stopped, error and retry, assistant unavailable.

## Chosen direction
The Answer Booklet (كراسة الإجابة), the assigned roll, kept by the user. Memorable moment: the composer is literally the next ruled line of the booklet, and when the agent finishes, a red tick draws itself in the margin.

## Unresolved
Final product name (working: مساعد الجامعة / College Helper). The landing page is out of scope (slice 5).

## Direction contract
THESIS: Every conversation is an exam answer booklet. The student writes the question on the next ruled line (س١), the agent writes the answer (ج), and the red margin carries the marks: question number, time, what the agent did. It refuses the chat-bubble thread and the floating centered text box.

OWN-WORLD: Booklet inks only:
- cool paper white, light-blue ruling, double red margin rule, ballpoint-blue for the student's writing, print-black for printed text, a spot blue-ink for printed labels;
- deep cover green for the booklet cover, which frames the sheet and owns the auth pages;
- dark mode is carbon copy: navy-black sheet, dim ruling, pale ink.

Square corners, 1px printed cell borders and form-box tables. Readex Pro for print, Noto Naskh Arabic / Literata for answer reading text, Aref Ruqaa (red pen) for margin marks only. The ruling is the baseline grid: line-height equals the rule pitch.

STORY: The student opens a booklet that already carries their university and major on its printed header, writes a question on the next line, watches the answer get written below it with marks appearing in the margin, and keeps going page after page.

FIRST VIEWPORT:
- Chat: cover-green field with a slim running head (booklet mark + name, then language, theme and logout as printed text controls).
- Below it, a centered paper sheet (about 48rem; full-bleed on phones) topped by a printed form-header table (university, major, date, question count).
- Then the ruled body, with the double red margin rule on the inline-start side.
- Empty state: a printed "instructions" box and three suggested questions set as exam questions.
- The composer is the last ruled line «س{n}» with the caret on it, and a red double-framed «اسأل» stamp at the inline-end.
- Auth: the full-bleed cover. Booklet mark and name, a monumental title («كراسة جديدة» / «افتح كراستك»), printed instructions, and a white cover label panel whose bordered rows are the real form fields.

FORM: The Answer Booklet, position 7 on the ordered grounded list, seed key b56a9408. Raises carried:
- Ink discipline (from Datamatics).
- A bilateral margin invariant (from Labanotation).
- Chrome deleted: controls are the form's own marks (from Metro tiles).
- Ruling is the baseline grid (from Crouwel).
- Fixed personal furniture: number and time per question (from Character goods).

Signature interaction: the red margin tick strokes itself in when an answer completes. While writing, a red pen caret blinks where the agent writes, and Stop lives in that answer's margin, never where Ask was.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
