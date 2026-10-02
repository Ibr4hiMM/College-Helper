import { expect, it } from "vitest";
import { LEVELS, type Level } from "./profile";
import { buildSystemPrompt } from "./system-prompt";

const base = {
  university: { name_ar: "جامعة الملك سعود", name_en: "King Saud University" },
  major: { name_ar: "علوم الحاسب", name_en: "Computer Science" },
};
const prompt = buildSystemPrompt({ ...base, level: null });
const at = (level: Level) => buildSystemPrompt({ ...base, level });

it("names the university and major in both languages", () => {
  for (const s of [
    "King Saud University",
    "جامعة الملك سعود",
    "Computer Science",
    "علوم الحاسب",
  ])
    expect(prompt).toContain(s);
});

it("asks for the user's language and honesty", () => {
  expect(prompt).toMatch(/language the student writes in/);
  expect(prompt).toMatch(/honest when you are unsure/);
});

it("keeps the line the e2e mock parses for the major", () => {
  expect(prompt).toMatch(/studies Computer Science \(علوم الحاسب\)\./);
});

it("adds no level guidance when the level is unknown", () => {
  expect(prompt).not.toMatch(/Study level:/);
});

it("gives every level its own guidance", () => {
  const blocks = LEVELS.map((l) => at(l));
  expect(new Set(blocks).size).toBe(LEVELS.length);
  for (const b of blocks) expect(b).toMatch(/Study level:/);
});

it("tailors the evidence-backed behaviours per level", () => {
  expect(at("prep")).toMatch(/English terms in parentheses/);
  expect(at("early")).toMatch(/check their understanding/);
  expect(at("upper")).toMatch(/needs a citation/);
  expect(at("final")).toMatch(/research mentor/);
  expect(at("postgrad")).toMatch(/Never draft thesis text/);
});

it("lets the student adjust tone, never the integrity limits", () => {
  expect(at("upper")).toMatch(/academic-integrity limits always apply/);
  expect(at("upper")).not.toMatch(/follow the student's lead/);
});
