// Ingest curriculum JSONL into curriculum_chunks.
//   npm run ingest -- supabase/seed/curriculum-demo.jsonl            (needs SUPABASE_SECRET_KEY + OPENAI_API_KEY)
//   npm run ingest -- supabase/seed/curriculum-demo.jsonl --dry-run  (checks slugs and chunking only; public key)
// Reads .env.local. Re-running is safe: chunks already stored (same content hash) are skipped, and for every
// course and language in the file, older rows not in it are deleted. Courses absent from the file are left alone.
import { readFileSync } from "node:fs";

import { openai } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { embedMany } from "ai";

import { buildChunks, groupHashes, parseLines } from "../lib/ingest.ts";
import { EMBEDDING_MODEL } from "../lib/rag.ts";

try {
  process.loadEnvFile(".env.local");
} catch {}

const [file, flag] = process.argv.slice(2);
const dryRun = flag === "--dry-run";
const need = dryRun
  ? ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"]
  : ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SECRET_KEY", "OPENAI_API_KEY"];
if (!file) fail("usage: npm run ingest -- <file.jsonl> [--dry-run]");
for (const key of need) if (!process.env[key]) fail(`missing ${key}; add it to .env.local`);

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  (dryRun ? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : process.env.SUPABASE_SECRET_KEY)!,
  { auth: { persistSession: false } },
);

const [unis, majors] = await Promise.all([
  db.from("universities").select("id"),
  db.from("majors").select("id, university_id, slug"),
]);
if (unis.error || majors.error) fail(`could not read the catalog: ${(unis.error ?? majors.error)!.message}`);

const entries = parseLines(readFileSync(file, "utf8"));
const chunks = buildChunks(entries, { universities: unis.data!.map((u) => u.id), majors: majors.data! });
console.log(`${entries.length} entries -> ${chunks.length} chunks`);
if (dryRun) process.exit(0);

// Skip chunks already stored. 50 hashes (~3.4 KB) keep the URL filter well under gateway limits.
const known = new Set<string>();
for (let i = 0; i < chunks.length; i += 50) {
  const { data, error } = await db
    .from("curriculum_chunks")
    .select("content_hash")
    .in("content_hash", chunks.slice(i, i + 50).map((c) => c.content_hash));
  if (error) fail(error.message);
  for (const row of data) known.add(row.content_hash);
}
const fresh = chunks.filter((c) => !known.has(c.content_hash));

// Embed and store in slices (~30 KB of JSON per row); a failed run resumes where it stopped.
for (let i = 0; i < fresh.length; i += 100) {
  const slice = fresh.slice(i, i + 100);
  const { embeddings } = await embedMany({
    model: openai.embeddingModel(EMBEDDING_MODEL),
    values: slice.map((c) => c.embed_text),
    maxParallelCalls: 2,
  });
  // embed_text is not a column; undefined keys are dropped from the JSON body.
  const rows = slice.map((c, j) => ({ ...c, embed_text: undefined, embedding: embeddings[j] }));
  const { error } = await db.from("curriculum_chunks").upsert(rows, { onConflict: "content_hash", ignoreDuplicates: true });
  if (error) fail(error.message);
}

// Only after the new rows are in: retire each group's rows that the file no longer contains.
let stale = 0;
for (const g of groupHashes(chunks)) {
  let q = db
    .from("curriculum_chunks")
    .delete({ count: "exact" })
    .eq("university_id", g.university_id)
    .eq("course_code", g.course_code)
    .eq("lang", g.lang)
    .not("content_hash", "in", `(${g.hashes.join(",")})`);
  q = g.major_id === null ? q.is("major_id", null) : q.eq("major_id", g.major_id);
  const { count, error } = await q;
  if (error) fail(error.message);
  stale += count ?? 0;
}
console.log(`inserted ${fresh.length} chunks, ${known.size} already present, ${stale} stale removed`);

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}
