import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { curriculumInput, searchCurriculum, toToolResult, type CurriculumHit } from "./rag.ts";

const hit = (over: Partial<CurriculumHit> = {}): CurriculumHit => ({
  course_code: "DEMO-101",
  title: "Demo course",
  content: "Variables and loops.",
  source: "DEMO seed",
  similarity: 0.8,
  ...over,
});

/** A fake client that records the RPC call. */
function fakeClient(rows: CurriculumHit[] | null, error: unknown = null) {
  const calls: { fn: string; args: Record<string, unknown> }[] = [];
  const client = { rpc: async (fn: string, args: Record<string, unknown>) => (calls.push({ fn, args }), { data: rows, error }) };
  return { client: client as unknown as SupabaseClient, calls };
}

describe("curriculumInput", () => {
  it("gives the model only a query: extra keys such as a university or major are stripped", () => {
    expect(curriculumInput.parse({ query: "prerequisites", university_id: "kau", major_id: 9 })).toEqual({ query: "prerequisites" });
  });
  it("rejects empty and oversized queries", () => {
    expect(curriculumInput.safeParse({ query: "" }).success).toBe(false);
    expect(curriculumInput.safeParse({ query: "x".repeat(301) }).success).toBe(false);
  });
});

describe("searchCurriculum", () => {
  it("scopes the search to the profile's university and major, and embeds only the query", async () => {
    const { client, calls } = fakeClient([hit()]);
    const embedded: string[] = [];
    const embed = async (text: string) => (embedded.push(text), [0.1, 0.2]);
    await searchCurriculum({ supabase: client, embed, universityId: "ksu", majorId: 1 }, "what are the prerequisites?");
    expect(embedded).toEqual(["what are the prerequisites?"]);
    expect(calls).toEqual([
      { fn: "match_curriculum", args: { query_embedding: [0.1, 0.2], p_university_id: "ksu", p_major_id: 1, match_count: 6 } },
    ]);
  });

  it("drops weak matches below the similarity floor", async () => {
    const { client } = fakeClient([hit({ similarity: 0.9 }), hit({ course_code: "DEMO-999", similarity: 0.05 })]);
    const hits = await searchCurriculum({ supabase: client, embed: async () => [0], universityId: "ksu", majorId: 1 }, "q?");
    expect(hits.map((h) => h.course_code)).toEqual(["DEMO-101"]);
  });

  it("throws when the RPC fails, so the tool reports an error instead of 'no results'", async () => {
    const { client } = fakeClient(null, new Error("rpc down"));
    await expect(searchCurriculum({ supabase: client, embed: async () => [0], universityId: "ksu", majorId: 1 }, "q?")).rejects.toThrow("rpc down");
  });
});

describe("toToolResult", () => {
  it("passes citation fields and flags demo sources", () => {
    expect(toToolResult([hit(), hit({ source: "KSU catalog 2026", course_code: "CSC 111" })])).toEqual({
      results: [
        { course_code: "DEMO-101", title: "Demo course", excerpt: "Variables and loops.", source: "DEMO seed", demo: true },
        { course_code: "CSC 111", title: "Demo course", excerpt: "Variables and loops.", source: "KSU catalog 2026", demo: false },
      ],
    });
  });
  it("says so when nothing matched", () => {
    expect(toToolResult([])).toEqual({ results: [] });
  });
});
