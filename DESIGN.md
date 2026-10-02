---
name: College Helper / مساعد الجامعة
description: An exam answer booklet for Saudi university students, Arabic-first, where an AI agent writes the answers.
colors:
  paper: "hsl(210 20% 96%)"
  ruling: "hsl(214 50% 85%)"
  print: "hsl(220 12% 10%)"
  spot: "hsl(215 35% 37%)"
  ballpoint: "hsl(228 70% 39%)"
  pen: "hsl(4 63% 48%)"
  cover: "hsl(171 73% 20%)"
  cover-ink: "hsl(156 20% 94%)"
  cover-soft: "hsl(163 26% 77%)"
  carbon-paper: "hsl(222 45% 9%)"
  carbon-ruling: "hsl(221 38% 20%)"
  carbon-print: "hsl(219 33% 92%)"
  carbon-spot: "hsl(217 33% 68%)"
  carbon-ballpoint: "hsl(227 100% 81%)"
  carbon-pen: "hsl(5 100% 72%)"
  carbon-cover: "hsl(171 70% 11%)"
  carbon-cover-ink: "hsl(156 22% 91%)"
  carbon-cover-soft: "hsl(162 22% 65%)"
typography:
  display:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 8vw, 5.25rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: "4rem"
  title:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 600
    lineHeight: "2rem"
  body-read:
    fontFamily: "Literata, Noto Naskh Arabic, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: "2rem"
  body-write:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 500
    lineHeight: "2rem"
  mark:
    fontFamily: "Aref Ruqaa, Readex Pro, serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: "2rem"
  mark-latin:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "1.375rem"
    fontWeight: 600
    lineHeight: "2rem"
  label:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
  label-sm:
    fontFamily: "Readex Pro, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
rounded:
  none: "0px"
spacing:
  rule: "2rem"
  margin: "4.5rem"
  margin-phone: "3rem"
components:
  stamp:
    textColor: "{colors.pen}"
    rounded: "{rounded.none}"
    height: "2.5rem"
    padding: "0 1rem"
  cover-submit:
    backgroundColor: "{colors.cover}"
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.none}"
    height: "3.5rem"
    width: "100%"
  form-row-input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ballpoint}"
    typography: "{typography.body-write}"
    rounded: "{rounded.none}"
    height: "3rem"
    padding: "0 1rem"
  cover-control:
    textColor: "{colors.cover-ink}"
    rounded: "{rounded.none}"
    height: "2.5rem"
    padding: "0 0.75rem"
  sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.print}"
    rounded: "{rounded.none}"
    width: "50rem"
---

# Design System: College Helper / مساعد الجامعة

## Overview

**Creative North Star: "The Answer Booklet" (كراسة الإجابة)**

Every conversation is an exam answer booklet. A deep green cover frames a single sheet of cool paper. The sheet carries a printed form header with the student's university, major, date and question count. Below the header sits a light-blue ruled body with a double red margin rule on the inline-start side. The student writes questions in ballpoint blue on the next ruled line. The agent's answer is set in reading type below each question. The red margin holds the teacher's marks: the question number (س١ / Q1), the time, the answer mark (ج / A), and a tick that strokes itself in when the answer is done.

The system has no generic chrome. Every control is a mark the booklet would carry anyway: submit is a red double-framed stamp, the header controls are printed words on the cover, and form fields are bordered rows of a cover label. Density is calm and steady. Every line box on the sheet is one rule tall, so long sessions read like a filled-in page and never like a feed. The whole system is designed in RTL first and mirrors to LTR through logical properties, so the margin, the stamp and the booklet glyph all flip sides with `dir`.

The sheet rejects the chat-bubble thread and the floating, centered text box.

**Key Characteristics:**
- Nine inks and nothing else, in light and in carbon-copy dark.
- A 2rem ruling that is also the baseline grid.
- A double red margin rule on the inline-start side that flips with the script.
- Square corners, 1px printed cell borders, form-box tables.
- Four faces with fixed jobs: print, reading, red pen, and an italic Latin fallback for the pen.
- Arabic-Indic digits throughout Arabic pages.
- One signature motion: the margin tick drawing itself in.

## Colors

Booklet inks only. Values are HSL triplets on `:root` (light) and `.dark` (carbon copy), consumed as `hsl(var(--ink) / alpha)`.

### Primary
- **Teacher's Red Pen** (`pen` / `carbon-pen`): margin marks, the margin rule (at 60%), the stamp, the tick, the writing caret, Stop, errors. It is the only warm color, and it appears only in the margin, the stamp and error lines.

### Secondary
- **Ballpoint Blue** (`ballpoint` / `carbon-ballpoint`): everything the student writes (questions, field values, the composer), links, the caret, the selection tint (20%) and the focus ring on the sheet.
- **Cover Green** (`cover` / `carbon-cover`): the booklet cover. It is the page field behind the sheet, the whole auth surface, and the solid submit box on cover forms.

### Neutral
- **Cool Paper** (`paper` / `carbon-paper`): the sheet and the cover label panels.
- **Light-Blue Ruling** (`ruling` / `carbon-ruling`): the 1px rule lines, scrollbar thumb, and the inline-code tint (45%).
- **Print Black** (`print` / `carbon-print`): printed and answer text, and the 2px rule under the form header and the panel caption.
- **Spot Blue-Ink** (`spot` / `carbon-spot`): printed labels, hints, placeholders, list markers, blockquotes. At 40% it is the default border color for every cell edge.
- **Cover Ink** (`cover-ink` / `carbon-cover-ink`): text, borders (30-50%) and focus rings on the cover.
- **Cover Soft** (`cover-soft` / `carbon-cover-soft`): secondary text on the cover (descriptions, instructions, colophon).

### Named Rules
**The Ink Discipline Rule.** Only the nine booklet inks exist. Never add a hex value or a Tailwind palette color. Tints are alpha on an existing ink (`/0.4` borders, `/0.08` stamp hover, `/0.2` selection). They are never new hues.

**The Carbon Copy Rule.** Dark mode is a carbon copy of the same booklet: a navy-black sheet, dim ruling, pale ink, and a deeper cover. Every ink keeps its role and changes only its value. There are no dark-only colors.

**The Contrast Floor Rule.** Every text ink meets WCAG AA (4.5:1) on its own ground in both themes. Measured: print on paper is 16.2 light and 15.2 dark, spot is 6.5 and 7.6, ballpoint is 8.6 and 9.2, pen is 4.75 and 7.4. Cover-ink on cover is 7.4 and 12.0, and cover-soft is 5.2 and 6.7. Light pen is the tightest pair, so don't lighten it or put pen text at an alpha.

## Typography

**Print Font:** Readex Pro (Arabic + Latin), with system-ui
**Reading Font:** Literata (Latin) + Noto Naskh Arabic, with Georgia
**Pen Font:** Aref Ruqaa 700 (Arabic only), with Readex Pro. For Latin pen marks: Literata italic 600.

**Character:** Readex Pro is the booklet's printed form, Naskh and Literata are the answer you read for an hour, and Ruqaa is a teacher's hand in red. Each face has a fixed job, and none crosses into another face's job.

### Hierarchy
- **Display** (600, clamp(2.75rem, 8vw, 5.25rem), 1.05, -0.025em): the monumental cover titles (كراسة جديدة / افتح كراستك). Used on auth pages only.
- **Headline** (600, 1.875rem to 2.25rem at sm, two rules / 4rem): the empty-sheet title.
- **Title** (600, 1.1875rem, one rule): headings inside answers, set in print even inside reading text.
- **Body, reading** (400, 1.125rem, one rule): agent answers in print-black.
- **Body, writing** (500, 1.0625rem, one rule): student questions, the composer, and field values in ballpoint.
- **Mark** (Ruqaa 700, 1.375rem, one rule): margin marks س١ / ج in pen red.
- **Label** (500, 0.8125rem cover rows; 0.6875rem form-header cells): printed field labels in spot.
- **Meta** (0.75rem, one rule): margin time, Stop / Stopped, the keyboard hint.

### Named Rules
**The Literal Reading Stack Rule.** The reading stack uses literal family names (`"Literata", "Noto Naskh Arabic", Georgia, serif`), not the next/font CSS variables. Each next/font variable carries a Times-based "Fallback" face that has Arabic glyphs and would shadow Naskh. The tailwind config keeps a `ponytail:` comment that explains this. Don't "fix" the stack back to variables.

**The Pen Has No Latin Rule.** Ruqaa has no Latin glyphs. On `lang="en"` the pen role switches to Literata italic 600, which is still the teacher's red hand.

**The Unspaced Arabic Rule.** Arabic is never letter-spaced. `html[lang="ar"]` forces `letter-spacing: 0` everywhere, including the display tracking.

**The Arabic-Indic Digits Rule.** Arabic pages format every number, date and time with `ar-u-nu-arab` (Intl), and ordered lists use `arabic-indic` markers, so the digits match across marks, header cells and lists.

## Layout

**The Ruling Is The Baseline Rule.** The rule pitch `--rule` (2rem) is the line height of every line box on the sheet. Answer blocks are separated by exactly one rule. Headlines take two rules. The composer grows in whole rules, up to six. The `.ruled` background draws a 1px ruling line at the bottom of each 2rem band, and `background-attachment: local` keeps the ruling attached to the scrolling text.

**The Bilateral Margin Rule.** The margin column (`--margin`: 4.5rem, or 3rem below 640px) and the double red margin rule always sit on the inline-start side. They are built only with logical properties (`start-*`, `ps`/`pe`, `border-e`, `border-inline-start`, `margin-inline-start`), so they flip sides with `dir`. The margin never collapses, not even on phones. Never use physical `left`/`right`, `pl`/`pr` or `ml`/`mr` on the booklet.

Each entry is a two-column grid: the margin, then the body (`ps-5`, `pe-5` / `pe-8` at sm). The chat sheet is centered and at most 50rem wide (the direction contract said about 48rem, and the build ships 50rem). It sits on the cover field under a 3.5rem running head, and it runs full-bleed on phones. Auth pages use a 6xl container. At lg they become two columns: the title column, then a 28rem label panel.

Code blocks stay LTR inside RTL text, and every `kbd` uses `unicode-bidi: isolate`.

## Elevation & Depth

Almost flat. The only lift is the sheet resting on the cover.

### Shadow Vocabulary
- **Sheet** (`0 1px 2px rgb(0 0 0 / 0.22), 0 28px 56px -28px rgb(0 0 0 / 0.55)`): the paper sheet and the cover label panel, lying on the green cover. Nothing else is elevated.
- **Stamp double frame** (`inset 0 0 0 2px paper, inset 0 0 0 3px pen`, inside a 2px pen border): a printed double frame, not depth.
- **Ballpoint underline** (`0 2px 0 ballpoint`): the composer's focus line.

### Named Rules
**The One Lift Rule.** Only a sheet of paper casts a shadow. Content on the sheet stays flat, and structure comes from 1px printed borders.

## Shapes

Square corners everywhere (0px). Cells are drawn with 1px spot/40 borders. Tables and boxes use a 1px outline at -1px offset so adjacent cells share one line. Heavy 2px print-black rules close the form header and the panel caption. The margin rule is two 1px pen/60 lines, 5px apart. Lists use square bullets. Only strokes are rounded: the tick and the error X use round line caps.

## Components

### Stamp (submit on the sheet)
The booklet's own submit mark, sitting at the inline end of the composer line.
- **Shape:** square, 2.5rem tall, at least 4.5rem wide. A 2px pen border and an inset paper gap make a double frame.
- **Type:** print 600, 0.9375rem, pen red.
- **Hover:** pen at 8% fills the face. Transition: 200ms on opacity and background.
- **At rest (disabled):** the frame stays in full ink. Only the word dims, to pen at 60%. The cursor is not-allowed.

### Cover Submit
- The solid action box at the foot of a cover label panel: full width, 3.5rem tall, cover green with cover-ink 600 text. Hover goes to cover at 90%. While submitting it uses a progress cursor at 70% opacity.

### Inputs / Fields (cover form rows)
- **Style:** each field is one bordered row of the label panel. A printed spot label cell (8.5rem, divided by `border-e` at sm, stacked on phones) sits next to a transparent 3rem writing line in ballpoint 500. A hint sits below in spot xs.
- **Select:** the same row with `appearance: none` and a 1.75-stroke chevron at the inline end. The placeholder option stays in spot 400 until a value is chosen.
- **Focus:** the whole row gets a 2px inset ballpoint frame.
- **Error:** a full-width row with a pen X and the message in pen text (`role="alert"`).
- **Disabled:** spot text, not-allowed cursor.

### Form Header Table
- The printed header of the sheet: a `dl` of four cells (university, major, date, question count). It shows two columns on phones and `1.3fr 1.3fr 1fr auto` at sm. Cells use 1px spot/40 edges, with a 2px print rule under the table. Labels use spot 0.6875rem 500, and values use 0.9375rem 600 with tabular figures.

### Navigation (running head and cover controls)
- A 3.5rem running head on the cover: the booklet mark and name at the inline start, then printed text controls (language, theme, logout).
- Controls are plain words in cover-ink 0.875rem, 2.5rem tall. Hover adds a cover-ink/10 wash. The theme control cycles light, dark and auto. The language control is labeled in the target language and carries `lang`.
- **BookletMark:** a 32-unit glyph showing a sheet, its double red margin and three lines. It mirrors in RTL.

### Margin Marks
- Each question gets س{n} / Q{n} plus the time on the next rule. Each answer gets ج / A plus its state: Stop while the answer is being written, then Stopped or the tick. Errors get a pen X.
- **Writing:** a 2px pen caret blinks at the end of the last block of the answer (`aria-busy`). Stop lives in that answer's margin, never where Ask was.
- **Tick (signature motion):** a 24-unit check path, drawn with `stroke-dasharray: 24` from offset 24 to 0 over 0.55s `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Reduced motion:** the caret and the tick render static.

### Composer
- The composer is the last ruled line of the booklet: the margin mark for the next question, then a borderless textarea in ballpoint that sizes to its content (one to six rules), then the stamp. A spot keyboard hint sits on the next rule. It is hidden on phones.

### Answer Prose
- Reading face on the ruling. Blocks are separated by one rule. Lists use square bullets in spot (Arabic-Indic numbers in Arabic). Links are ballpoint and underlined at a 4px offset. Code is system mono on a ruling/45 tint. Pre and table use 1px spot/40 outlines on paper. Blockquotes have a spot inline-start border. `hr` is a centered 1px line one rule tall. Images are never rendered.

### Cover Instructions and Colophon
- On auth pages: a 1px cover-ink/50 box of numbered printed instructions (counters switch to Arabic-Indic in RTL), and a colophon footer with a cover-ink/30 top rule, the mark and one line in cover-soft.

## Do's and Don'ts

### Do:
- **Do** set every sheet line box to `leading-rule` (2rem) and separate blocks by whole rules.
- **Do** use only logical properties on the booklet, so the margin and the stamp flip with `dir`.
- **Do** put the student's words in ballpoint and the agent's answer in print, and keep red for the margin, the stamp and errors.
- **Do** format numbers with `ar-u-nu-arab` on Arabic pages.
- **Do** keep the stamp's frame at full ink when disabled, and dim only the word.
- **Do** give every animation a `prefers-reduced-motion: reduce` static state.
- **Do** show focus: a 2px ballpoint outline on the sheet, cover-ink on the cover, and a 2px inset frame on form rows.

### Don't:
- **Don't** introduce colors outside the nine inks, or dark-only colors.
- **Don't** round corners on cells, sheets, buttons or fields.
- **Don't** set chat bubbles or a floating centered input. The composer is a ruled line.
- **Don't** letter-space Arabic.
- **Don't** use Ruqaa outside margin marks, or for Latin text.
- **Don't** swap the reading stack back to next/font variables.
- **Don't** add shadows to anything except a sheet of paper.
