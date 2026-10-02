import { expect, it } from "vitest";
import { buildSystemPrompt } from "./system-prompt";

const prompt = buildSystemPrompt({
  university: { name_ar: "جامعة الملك سعود", name_en: "King Saud University" },
  major: { name_ar: "علوم الحاسب", name_en: "Computer Science" },
});

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
