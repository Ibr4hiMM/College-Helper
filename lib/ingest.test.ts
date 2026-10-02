import { describe, expect, it } from "vitest";

import { buildChunks, groupHashes, parseLines } from "./ingest.ts";

const line = (over: object = {}) =>
  JSON.stringify({
    university: "ksu",
    major: "computer-science",
    course_code: "DEMO-CS-101",
    title: "Intro",
    lang: "en",
    content: "Variables. Loops.",
    source: "DEMO seed",
    ...over,
  });
const catalog = {
  universities: ["ksu", "kau"],
  majors: [
    { id: 1, university_id: "ksu", slug: "computer-science" },
    { id: 4, university_id: "kau", slug: "computer-science" },
  ],
};

describe("parseLines", () => {
  it("parses JSONL and skips blank lines", () => {
    expect(parseLines(`${line()}\n\n${line({ lang: "ar" })}\n`)).toHaveLength(2);
  });
  it("names the line number for bad JSON or a bad field", () => {
    expect(() => parseLines(`${line()}\n{oops`)).toThrow(/line 2/);
    expect(() => parseLines(line({ lang: "fr" }))).toThrow(/line 1/);
  });
});

describe("buildChunks", () => {
  it("resolves slugs to ids, and a null major means university-wide", () => {
    const [a] = buildChunks(parseLines(line()), catalog);
    const [b] = buildChunks(parseLines(line({ major: null })), catalog);
    expect(a).toMatchObject({ university_id: "ksu", major_id: 1, course_code: "DEMO-CS-101", lang: "en", source: "DEMO seed" });
    expect(b.major_id).toBeNull();
  });

  it("rejects an unknown university or a major from another university", () => {
    expect(() => buildChunks(parseLines(line({ university: "xyz" })), catalog)).toThrow(/unknown university "xyz"/);
    expect(() => buildChunks(parseLines(line({ university: "kau", major: "medicine" })), catalog)).toThrow(/unknown major "kau\/medicine"/);
  });

  it("hashes stably per scope and text, so re-ingesting dedupes", () => {
    const once = buildChunks(parseLines(line()), catalog);
    const again = buildChunks(parseLines(line()), catalog);
    const otherUni = buildChunks(parseLines(line({ university: "kau" })), catalog);
    expect(once[0].content_hash).toBe(again[0].content_hash);
    expect(once[0].content_hash).not.toBe(otherUni[0].content_hash);
  });

  it("changes the hash when the language, title or source changes, so corrected entries are re-stored", () => {
    const [base] = buildChunks(parseLines(line()), catalog);
    for (const over of [{ lang: "ar" }, { title: "Intro (revised)" }, { source: "KSU catalog 2026" }])
      expect(buildChunks(parseLines(line(over)), catalog)[0].content_hash).not.toBe(base.content_hash);
  });

  it("embeds the course code and title with the chunk for better retrieval", () => {
    const [c] = buildChunks(parseLines(line()), catalog);
    expect(c.embed_text).toBe("DEMO-CS-101 Intro\nVariables. Loops.");
    expect(c.content).toBe("Variables. Loops.");
  });
});

describe("groupHashes", () => {
  it("groups the file's chunks per course and language, so each group's older rows can be replaced", () => {
    const long = Array.from({ length: 40 }, (_, i) => `Sentence number ${i} about loops.`).join(" ");
    const chunks = buildChunks(parseLines([line({ content: long }), line({ lang: "ar" }), line({ major: null, course_code: "GUIDE" })].join("\n")), catalog);
    const groups = groupHashes(chunks);
    expect(groups.map(({ hashes, ...g }) => ({ ...g, n: hashes.length }))).toEqual([
      { university_id: "ksu", major_id: 1, course_code: "DEMO-CS-101", lang: "en", n: chunks.filter((c) => c.lang === "en" && c.major_id === 1).length },
      { university_id: "ksu", major_id: 1, course_code: "DEMO-CS-101", lang: "ar", n: 1 },
      { university_id: "ksu", major_id: null, course_code: "GUIDE", lang: "en", n: 1 },
    ]);
    expect(groups[0].hashes.length).toBeGreaterThan(1);
  });
});
