import { openai } from "@ai-sdk/openai";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embed } from "ai";
import { z } from "zod";

// 1536 dimensions, matching curriculum_chunks.embedding; handles Arabic and English.
export const EMBEDDING_MODEL = "text-embedding-3-small";
// ponytail: one fixed cosine-similarity floor; tune it once real curriculum and real questions exist.
const MIN_SIMILARITY = 0.25;

export type CurriculumHit = { course_code: string; title: string; content: string; source: string; similarity: number };
export type Embed = (text: string) => Promise<number[]>;

/** The tool's whole input: the model chooses what to look up, never whose curriculum. */
export const curriculumInput = z.object({
  query: z.string().trim().min(2).max(300).describe("What to look up in the student's curriculum, in the student's language"),
});

export const embedQuery: Embed = async (value) =>
  (await embed({ model: openai.embeddingModel(EMBEDDING_MODEL), value })).embedding;

/**
 * Nearest curriculum chunks for the student's own university and major (plus university-wide chunks).
 * `universityId` and `majorId` must come from the server-side profile.
 */
export async function searchCurriculum(
  { supabase, embed, universityId, majorId }: { supabase: SupabaseClient; embed: Embed; universityId: string; majorId: number },
  query: string,
  count = 6,
): Promise<CurriculumHit[]> {
  const { data, error } = await supabase.rpc("match_curriculum", {
    query_embedding: await embed(query),
    p_university_id: universityId,
    p_major_id: majorId,
    match_count: count,
  });
  if (error) throw error;
  const hits = (data ?? []) as CurriculumHit[];
  // Scores only, never the query: the evidence for tuning MIN_SIMILARITY on real data.
  console.info("curriculum search", { top: hits.map((h) => Number(h.similarity.toFixed(3))) });
  return hits.filter((h) => h.similarity >= MIN_SIMILARITY);
}

/** What the model and the margin see: citation fields per excerpt, with demo sources flagged. */
export function toToolResult(hits: CurriculumHit[]) {
  return {
    results: hits.map((h) => ({
      course_code: h.course_code,
      title: h.title,
      excerpt: h.content,
      source: h.source,
      demo: h.source.startsWith("DEMO"),
    })),
  };
}
