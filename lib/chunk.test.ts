import { describe, expect, it } from "vitest";

import { chunkText } from "./chunk.ts";

const words = (s: string) => s.split(/\s+/).filter(Boolean);

describe("chunkText", () => {
  it("returns nothing for empty or blank text", () => {
    expect(chunkText("")).toEqual([]);
    expect(chunkText("   \n\n ")).toEqual([]);
  });

  it("keeps short text as one chunk, with whitespace collapsed", () => {
    expect(chunkText("مقدمة   في البرمجة.\n\nالأسبوع الأول")).toEqual(["مقدمة في البرمجة.\n\nالأسبوع الأول"]);
  });

  it("breaks at Arabic and Latin sentence ends and stays under max", () => {
    const text = "ما هو المتغير؟ المتغير اسم لقيمة؛ يمكن تغييرها. Loops repeat code! الدوال تجمع الخطوات.";
    const chunks = chunkText(text, { max: 40, overlap: 0 });
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(40);
      expect(c).toMatch(/[.!?؟؛]$/);
    }
  });

  it("never splits a word", () => {
    const text = "الخوارزميات وهياكل البيانات والبرمجة الكائنية وقواعد البيانات ونظم التشغيل والشبكات الحاسوبية ".repeat(5);
    const source = new Set(words(text));
    for (const c of chunkText(text, { max: 60, overlap: 0 })) for (const w of words(c)) expect(source.has(w)).toBe(true);
  });

  it("carries the previous sentence into the next chunk as overlap", () => {
    const text = "الجملة الأولى هنا. الجملة الثانية هنا. الجملة الثالثة هنا. الجملة الرابعة هنا.";
    const [a, b] = chunkText(text, { max: 40, overlap: 20 });
    const lastOfA = a.split(/(?<=[.؟!؛])\s+/).at(-1)!;
    expect(b.startsWith(lastOfA)).toBe(true);
  });

  it("hard-splits a single token longer than max", () => {
    const chunks = chunkText("x".repeat(250), { max: 100, overlap: 0 });
    expect(chunks).toHaveLength(3);
    for (const c of chunks) expect(c.length).toBeLessThanOrEqual(100);
  });
});
