/** A same-origin path from an untrusted `next` param, else the fallback; `//x`, `/\x` and absolute URLs never pass. */
export function safeNext(next: string | null, origin: string, fallback = "/chat"): string {
  try {
    const target = new URL(next ?? fallback, origin);
    return target.origin === origin ? `${target.pathname}${target.search}` : fallback;
  } catch {
    return fallback;
  }
}
