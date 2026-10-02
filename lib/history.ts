type Part = { type: string; text?: string };
type Turn = { role: string; parts: Part[] };

/**
 * Text-only user/assistant turns from the last `max` messages, opening on a user turn
 * (the provider rejects an assistant-first history). Client-sent roles like `system`
 * and non-text parts never reach the model. Empty means nothing usable was sent.
 */
export function recentMessages<T extends Turn>(messages: T[], max: number): T[] {
  const window = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ ...m, parts: m.parts.filter((p) => p.type === "text") }))
    .filter((m) => m.parts.length > 0)
    .slice(-max);
  const firstUser = window.findIndex((m) => m.role === "user");
  return firstUser === -1 ? [] : window.slice(firstUser);
}

/** Length of the longest text part, for the per-message cap. */
export const longestText = (messages: Turn[]) =>
  Math.max(0, ...messages.flatMap((m) => m.parts.map((p) => p.text?.length ?? 0)));
