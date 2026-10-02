export type Source = { course_code: string; title: string; source: string; demo: boolean };
type Part = { type: string; state?: string; output?: unknown };

const isSource = (r: unknown): r is Source => {
  const s = r as Source;
  return typeof s?.course_code === "string" && typeof s.title === "string" && typeof s.source === "string" && typeof s.demo === "boolean";
};

/** What an answer's curriculum searches leave in the booklet: the margin mark, the writing line, the footnote. */
export function curriculumMarks(parts: Part[]) {
  const calls = parts.filter((p) => p.type === "tool-searchCurriculum");
  const sources: Source[] = [];
  for (const call of calls) {
    if (call.state !== "output-available") continue;
    const results = (call.output as { results?: unknown })?.results;
    for (const r of Array.isArray(results) ? results : []) {
      // A course's Arabic and English entries are one source.
      if (!isSource(r) || sources.some((s) => s.course_code === r.course_code)) continue;
      sources.push({ course_code: r.course_code, title: r.title, source: r.source, demo: r.demo });
    }
  }
  return {
    used: calls.length > 0,
    searching: calls.some((c) => c.state === "input-streaming" || c.state === "input-available"),
    failed: calls.some((c) => c.state === "output-error"),
    sources,
  };
}
