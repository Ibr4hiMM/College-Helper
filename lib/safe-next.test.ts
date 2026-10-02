import { describe, expect, it } from "vitest";

import { safeNext } from "./safe-next";

const origin = "https://college-helper.test";

describe("safeNext", () => {
  it("keeps same-origin paths and their query", () => {
    expect(safeNext("/auth/update-password", origin)).toBe("/auth/update-password");
    expect(safeNext("/chat?x=1#frag", origin)).toBe("/chat?x=1");
  });

  it.each(["//evil.com", "/\\evil.com", "https://evil.com/chat", "javascript:alert(1)", "http://[bad"])(
    "falls back for %s",
    (next) => {
      expect(safeNext(next, origin)).toBe("/chat");
    },
  );

  it("falls back when next is missing", () => {
    expect(safeNext(null, origin)).toBe("/chat");
  });
});
