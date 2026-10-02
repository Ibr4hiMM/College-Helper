import { anthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, safeValidateUIMessages, stepCountIs, streamText, tool } from "ai";

import { longestText, recentMessages } from "@/lib/history";
import { getProfile } from "@/lib/profile";
import { curriculumInput, embedQuery, searchCurriculum, toToolResult } from "@/lib/rag";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/system-prompt";

// ponytail: history lives in the client until slice 3, so cap what one request can carry;
// a per-user daily cap is the real spend limit and lands before launch.
const MAX_BODY_BYTES = 256_000;
const MAX_MESSAGES = 20;
const MAX_TEXT_CHARS = 16_000;
// Steps cap the loop, not parallel calls within a step; this caps embeddings and retrieved text per request.
const MAX_SEARCHES = 4;
const MAX_STEPS = 4;
const FINAL_STEP = "You have no searches left for this question. Write your answer now from what you found, without calling any tool.";

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return fail("unauthorized", 401);

  if (!process.env.ANTHROPIC_API_KEY) return fail("assistant_unavailable", 503);

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) return fail("too_large", 413);
  const raw = await req.text();
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return fail("too_large", 413);

  let body: { messages?: unknown } | null = null;
  try {
    body = JSON.parse(raw);
  } catch {}
  const parsed = await safeValidateUIMessages({ messages: body?.messages });
  if (!parsed.success) return fail("bad_request", 400);
  const messages = recentMessages(parsed.data, MAX_MESSAGES);
  if (messages.length === 0) return fail("bad_request", 400);
  if (longestText(messages) > MAX_TEXT_CHARS) return fail("too_large", 413);

  const profile = await getProfile(supabase, data.user.id);
  if (!profile) return fail("no_profile", 409);

  // Curriculum search needs embeddings; without the key the agent answers from general knowledge.
  const curriculum = !!process.env.OPENAI_API_KEY;
  let searches = 0;
  const tools = curriculum
    ? {
        searchCurriculum: tool({
          description: "Search this student's own university and major curriculum (courses, content, prerequisites, study plan, regulations).",
          inputSchema: curriculumInput,
          execute: async ({ query }) => {
            if (++searches > MAX_SEARCHES) throw new Error("curriculum_search_limit");
            try {
              // Scope comes from the server-side profile; the model only chooses the query.
              const scope = { supabase, embed: embedQuery, universityId: profile.university_id, majorId: profile.major_id };
              return toToolResult(await searchCurriculum(scope, query));
            } catch (err) {
              // Log the cause here; the model and the client only ever see this fixed text.
              console.error("curriculum search failed", err);
              throw new Error("curriculum_search_unavailable");
            }
          },
        }),
      }
    : undefined;

  const system = buildSystemPrompt(profile, { curriculum });
  const result = streamText({
    model: anthropic("claude-sonnet-5-5"),
    system,
    messages: await convertToModelMessages(messages),
    tools,
    // Room to search and refine, then the last step is told to write so a turn doesn't end on a tool call.
    // ponytail: an instruction, not a guarantee. toolChoice "none" would be one, but @ai-sdk/anthropic sends it
    // by dropping the tool list, which a history holding tool_use blocks may not survive.
    stopWhen: stepCountIs(MAX_STEPS),
    prepareStep: ({ stepNumber }) =>
      stepNumber === MAX_STEPS - 1 ? { instructions: `${system}\n${FINAL_STEP}` } : {},
    maxOutputTokens: 2048,
    abortSignal: req.signal,
  });
  // Never forward provider error text; a rejected key means the service isn't set up.
  return result.toUIMessageStreamResponse({
    onError: (err) =>
      APICallError.isInstance(err) && (err.statusCode === 401 || err.statusCode === 403)
        ? "assistant_unavailable"
        : "assistant_error",
  });
}
