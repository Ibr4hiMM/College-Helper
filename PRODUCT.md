# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Saudi university students, Arabic-first and also working in English. They use it on laptops for long study and research sessions (library, dorm, late night) and on phones for quick questions between lectures, both about equally. Their job: understand course material, plan study, start and push research and course projects.

## Product Purpose
An AI study companion. A student signs up with their university and major. An agent then answers questions, helps with research and projects, and (in upcoming slices) searches that major's actual curriculum and the student's own uploaded files. Success: a student gets help that is specific to *their* program, not generic chatbot answers.

## Positioning
Grounded in the student's own university and major curriculum, which a general chatbot cannot claim. The user explicitly wants it to feel like **a new way of talking to an AI agent, not a ChatGPT clone**.

## Operating Context
- Signup collects university + major; the agent's context is scoped to that profile.
- Sessions alternate between quick Q&A and long working sessions (research, project planning).
- Curriculum data per university/major arrives later; v1 ships 3 sample universities (KSU, KAU, KFUPM) × 3 majors.

## Capabilities and Constraints
- Shipped (slice 1): email signup/login, profile-aware streaming agent chat (Claude), light/dark/system theme.
- Planned: curriculum RAG with citations (slice 2), conversation history (slice 3), image/PDF uploads (slice 4), landing page and polish (slice 5).
- Bilingual: Arabic (RTL, default) and English. Arabic is first-class, not a translation of an English layout.
- Must not look vibe-coded or AI-generated.
- Stack: Next.js 16 App Router, Tailwind v3, Supabase, Vercel AI SDK.

## Brand Commitments
- Working name: "College Helper" / «مساعد الجامعة» (chosen during the build, not yet confirmed as final by the user).
- No logo or brand assets exist yet.

## Evidence on Hand
No real curriculum, testimonials, usage numbers or partner universities yet. Do not fabricate any of these; demonstration content must be labeled as sample.

## Product Principles
1. Specific beats generic: always show which university and major the answer is for.
2. Arabic-first: design every layout in RTL first, then mirror.
3. A conversation with an agent, not a text box: make the agent's work (what it's doing, which sources it used) visible.
4. Calm under long sessions: comfortable reading for hours, in both themes.

## Accessibility & Inclusion
WCAG AA contrast in both themes, full keyboard operation, visible focus, labeled inputs, and correct bidi handling for mixed Arabic/English text.
