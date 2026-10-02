// Sentence ends in both scripts: . ! ? and Arabic ؟ ؛ (the comma ، only breaks an over-long sentence, at a space).
const SENTENCE_END = /(?<=[.!?؟؛])\s+|\n\n/;

/**
 * Splits curriculum text into chunks of at most `max` characters for embedding. Chunks end at sentence
 * boundaries, never split a word (only a single token longer than `max` is hard-split), and start with
 * up to `overlap` characters of the previous chunk's closing sentences so context carries across.
 */
export function chunkText(text: string, { max = 1000, overlap = 150 } = {}): string[] {
  const clean = text
    .replace(/[ \t\r\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n\n")
    .replace(/(?<!\n)\n(?!\n)/g, " ")
    .trim();
  if (!clean) return [];
  if (clean.length <= max) return [clean];

  const sentences = clean.split(SENTENCE_END).flatMap((s) => fit(s.trim(), max)).filter(Boolean);
  const size = (parts: string[]) => parts.join(" ").length;
  const chunks: string[] = [];
  let current: string[] = [];
  for (const sentence of sentences) {
    if (current.length && size([...current, sentence]) > max) {
      chunks.push(current.join(" "));
      const tail: string[] = [];
      for (let i = current.length - 1; i >= 0 && size([current[i], ...tail]) <= overlap; i--) tail.unshift(current[i]);
      current = size([...tail, sentence]) <= max ? tail : [];
    }
    current.push(sentence);
  }
  if (current.length) chunks.push(current.join(" "));
  return chunks;
}

/** Pieces of one sentence that each fit in `max`, broken at spaces; only an over-long token is hard-split. */
function fit(sentence: string, max: number): string[] {
  if (sentence.length <= max) return [sentence];
  const out: string[] = [];
  let line = "";
  for (const word of sentence.split(" ")) {
    const pieces = word.length > max ? (word.match(new RegExp(`.{1,${max}}`, "gsu")) ?? []) : [word];
    for (const piece of pieces) {
      if (line && line.length + 1 + piece.length > max) {
        out.push(line);
        line = piece;
      } else line = line ? `${line} ${piece}` : piece;
    }
  }
  if (line) out.push(line);
  return out;
}
