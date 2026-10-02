import { describe, expect, it } from "vitest";

import { curriculumMarks } from "./curriculum-marks.ts";

const result = (...results: object[]) => ({ type: "tool-searchCurriculum", state: "output-available", output: { results } });
const src = (course_code: string, over: object = {}) => ({ course_code, title: `${course_code} title`, excerpt: "x", source: "DEMO seed", demo: true, ...over });

describe("curriculumMarks", () => {
  it("is empty for a plain text answer", () => {
    expect(curriculumMarks([{ type: "text" }])).toEqual({ used: false, searching: false, failed: false, sources: [] });
  });

  it("is searching while the tool input streams or runs", () => {
    for (const state of ["input-streaming", "input-available"])
      expect(curriculumMarks([{ type: "tool-searchCurriculum", state }])).toMatchObject({ used: true, searching: true });
  });

  it("collects sources across searches, one per course (its Arabic and English entries count once), without excerpts", () => {
    const marks = curriculumMarks([result(src("CS-101"), src("CS-210")), { type: "text" }, result(src("CS-101"), src("CS-101", { title: "مقدمة" }))]);
    expect(marks.searching).toBe(false);
    expect(marks.sources).toEqual([
      { course_code: "CS-101", title: "CS-101 title", source: "DEMO seed", demo: true },
      { course_code: "CS-210", title: "CS-210 title", source: "DEMO seed", demo: true },
    ]);
  });

  it("marks a failed search and ignores malformed output", () => {
    expect(curriculumMarks([{ type: "tool-searchCurriculum", state: "output-error" }])).toMatchObject({ used: true, failed: true, sources: [] });
    expect(curriculumMarks([{ type: "tool-searchCurriculum", state: "output-available", output: { results: [{ course_code: 1 }] } }]).sources).toEqual([]);
  });

  it("ignores other tools", () => {
    expect(curriculumMarks([{ type: "tool-other", state: "input-available" }]).used).toBe(false);
  });
});
