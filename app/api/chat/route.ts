import { anthropic } from "@ai-sdk/anthropic";
import { APICallError, convertToModelMessages, safeValidateUIMessages, streamText } from "ai";

import { longestText, recentMessages } from "@/lib/history";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";
import { buildSystemPrompt } from "@/lib/system-prompt";

// ponytail: history lives in the client until slice 3, so cap what one request can carry;
// a per-user daily cap is the real spend limit and lands before launch.
const MAX_BODY_BYTES = 256_000;
const MAX_MESSAGES = 20;
const MAX_TEXT_CHARS = 16_000;

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

  const result = streamText({
    model: anthropic("claude-sonnet-5-5"),
    system: buildSystemPrompt(profile),
    messages: await convertToModelMessages(messages),
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
