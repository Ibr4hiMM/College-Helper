import { createHash } from "node:crypto";

import { z } from "zod";

import { chunkText } from "./chunk.ts";

/** One curriculum entry per JSONL line. `major: null` applies to the whole university. */
const Entry = z.object({
  university: z.string().min(1),
  major: z.string().min(1).nullable(),
  course_code: z.string().min(1),
  title: z.string().min(1),
  lang: z.enum(["ar", "en"]),
  content: z.string().min(1),
  source: z.string().min(1),
});
export type Entry = z.infer<typeof Entry>;

export type Catalog = { universities: string[]; majors: { id: number; university_id: string; slug: string }[] };

export type ChunkRow = {
  university_id: string;
  major_id: number | null;
  course_code: string;
  title: string;
  lang: "ar" | "en";
  content: string;
  source: string;
  content_hash: string;
  embed_text: string; // what gets embedded; not stored
};

export function parseLines(text: string): Entry[] {
  return text.split("\n").flatMap((raw, i) => {
    if (!raw.trim()) return [];
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      throw new Error(`line ${i + 1}: not valid JSON`);
    }
    const parsed = Entry.safeParse(value);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`line ${i + 1}: ${issue.path.join(".") || "entry"}: ${issue.message}`);
    }
    return [parsed.data];
  });
}

/** Entries to chunk rows: slugs resolved against the DB catalog, text chunked, each chunk hashed for dedupe. */
export function buildChunks(entries: Entry[], catalog: Catalog): ChunkRow[] {
  return entries.flatMap((e) => {
    if (!catalog.universities.includes(e.university)) throw new Error(`unknown university "${e.university}"`);
    let majorId: number | null = null;
    if (e.major !== null) {
      const major = catalog.majors.find((m) => m.university_id === e.university && m.slug === e.major);
      if (!major) throw new Error(`unknown major "${e.university}/${e.major}"`);
      majorId = major.id;
    }
    return chunkText(e.content).map((content) => ({
      university_id: e.university,
      major_id: majorId,
      course_code: e.course_code,
      title: e.title,
      lang: e.lang,
      content,
      source: e.source,
      // Every stored field is hashed, so any correction yields new rows (and groupHashes retires the old ones).
      content_hash: createHash("sha256")
        .update([e.university, e.major ?? "*", e.course_code, e.lang, e.title, e.source, content].join("\u0000"))
        .digest("hex"),
      embed_text: `${e.course_code} ${e.title}\n${content}`,
    }));
  });
}

export type Group = Pick<ChunkRow, "university_id" | "major_id" | "course_code" | "lang"> & { hashes: string[] };

/** The file is the truth for each course and language it mentions: rows in a group outside `hashes` are stale. */
export function groupHashes(chunks: ChunkRow[]): Group[] {
  const groups = new Map<string, Group>();
  for (const { university_id, major_id, course_code, lang, content_hash } of chunks) {
    const key = [university_id, major_id, course_code, lang].join("\u0000");
    const group = groups.get(key) ?? { university_id, major_id, course_code, lang, hashes: [] };
    group.hashes.push(content_hash);
    groups.set(key, group);
  }
  return [...groups.values()];
}
