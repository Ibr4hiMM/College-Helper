// Mock of the Anthropic Messages SSE stream and the OpenAI embeddings endpoint for the hermetic e2e suite
// (sample content, never shipped). Port: E2E_MOCK_PORT (default 4011).
import http from "node:http";

const AR = (major) =>
  `تخصصك هو **${major}**، وهذه ثلاث أفكار أساسية تبدأ بها:\n\n1. **هياكل البيانات**: المصفوفات والقوائم المترابطة والأشجار، ومتى تختار كلًّا منها.\n2. **الخوارزميات**: الفرز والبحث، وكيف تقيس التعقيد الزمني بصيغة O(n).\n3. **البرمجة الكائنية**: الأصناف والوراثة وتعدد الأشكال.\n\n### خطوة تالية\nحل مسألتين يوميًا من المستوى السهل، ثم انتقل إلى المتوسط بعد أسبوعين.`;
const EN = (major) =>
  `Your major is **${major}**. Here are three core ideas to master first:\n\n1. **Data structures**: arrays, linked lists and trees, and when to pick each.\n2. **Algorithms**: sorting and searching, and how to reason about O(n) time.\n3. **Object-oriented design**: classes, inheritance and polymorphism.\n\n### Next step\nSolve two easy problems a day, then move to medium after two weeks.`;

// One-hot embeddings: "E2E-HIT" queries point where the e2e fixture rows sit, everything else is orthogonal to them.
const oneHot = (i) => Array.from({ length: 1536 }, (_, k) => (k === i ? 1 : 0));

const decode = (s) => s.replace(/\\u[0-9a-f]{4}/gi, (x) => String.fromCharCode(parseInt(x.slice(2), 16)));

function embeddings(j, res) {
  const input = [j.input].flat();
  if (input.some((t) => t.includes("EMBEDFAIL"))) {
    res.writeHead(500, { "content-type": "application/json" });
    return res.end(JSON.stringify({ error: { message: "mock embeddings exploded", type: "server_error" } }));
  }
  // SLOWEMBED holds the search open so a test can see the "searching" line.
  const delay = input.some((t) => t.includes("SLOWEMBED")) ? 1500 : 0;
  setTimeout(() => {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        object: "list",
        data: input.map((t, index) => ({ object: "embedding", index, embedding: oneHot(t.includes("E2E-HIT") ? 0 : 1) })),
        model: "text-embedding-3-small",
        usage: { prompt_tokens: 1, total_tokens: 1 },
      }),
    );
  }, delay);
}

http
  .createServer((req, res) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      if (req.url.includes("/embeddings")) return embeddings(JSON.parse(b || "{}"), res);
      if (!req.url.includes("/messages")) return res.writeHead(404).end();
      const j = JSON.parse(b || "{}");
      const sys = typeof j.system === "string" ? j.system : (j.system || []).map((s) => s.text).join("\n");
      const last = JSON.stringify((j.messages || []).at(-1) || "");
      if (last.includes("AUTHFAIL")) {
        res.writeHead(401, { "content-type": "application/json" });
        return res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }));
      }
      const m = sys.match(/studies (.+?) \((.+?)\)\./);
      const decoded = decode(last);
      // Curriculum flow: a CURRICULUM question gets a tool call; the tool result then gets an answer naming what came back.
      // LOOP keeps searching until the route's last-step instruction tells it to write.
      const all = decode(JSON.stringify(j.messages || []));
      const looping = all.includes("CURRICULUM LOOP") && !sys.includes("no searches left");
      const asksTool =
        j.tools?.some((t) => t.name === "searchCurriculum") && (looping || (decoded.includes("CURRICULUM") && !decoded.includes("tool_result")));
      let text = /[؀-ۿ]/.test(decoded) ? AR(m?.[2] ?? "") : EN(m?.[1] ?? "");
      if (decoded.includes("tool_result")) {
        const codes = [...new Set([...decoded.matchAll(/course_code\\*":\\*"([^"\\]+)/g)].map((x) => x[1]))];
        // The model must never see a raw provider error; say so loudly if it does.
        text = decoded.includes("exploded")
          ? "LEAKED provider error"
          : codes.length
            ? `From your curriculum: ${codes.join(", ")}. This course builds on the basics.`
            : "Nothing in your curriculum matched, so this is general knowledge.";
        if (all.includes("CURRICULUM LOOP")) text = `Final answer after ${all.split('"type":"tool_result"').length - 1} searches.`;
      }
      const start = () => {
      res.writeHead(200, { "content-type": "text/event-stream" });
      const ev = (t, d) => res.write(`event: ${t}\ndata: ${JSON.stringify({ type: t, ...d })}\n\n`);
      ev("message_start", { message: { id: "msg_1", type: "message", role: "assistant", model: "x", content: [], stop_reason: null, usage: { input_tokens: 1, output_tokens: 1 } } });
      if (asksTool) {
        const query = decoded.match(/"text":"([^"]*CURRICULUM[^"]*)"/)?.[1] ?? "CURRICULUM";
        ev("content_block_start", { index: 0, content_block: { type: "tool_use", id: "toolu_e2e", name: "searchCurriculum", input: {} } });
        ev("content_block_delta", { index: 0, delta: { type: "input_json_delta", partial_json: JSON.stringify({ query }) } });
        ev("content_block_stop", { index: 0 });
        ev("message_delta", { delta: { stop_reason: "tool_use" }, usage: { output_tokens: 5 } });
        ev("message_stop", {});
        return res.end();
      }
      ev("content_block_start", { index: 0, content_block: { type: "text", text: "" } });
      const parts = text.split(/(?<= )/);
      let i = 0;
      const iv = setInterval(() => {
        if (i >= parts.length) {
          clearInterval(iv);
          ev("content_block_stop", { index: 0 });
          ev("message_delta", { delta: { stop_reason: "end_turn" }, usage: { output_tokens: 5 } });
          ev("message_stop", {});
          return res.end();
        }
        ev("content_block_delta", { index: 0, delta: { type: "text_delta", text: parts[i++] } });
      }, 35);
      res.on("close", () => clearInterval(iv));
      };
      // SLOWSTART holds the first byte so a test can stop the answer before any text arrives.
      if (last.includes("SLOWSTART")) {
        const t = setTimeout(start, 1500);
        res.on("close", () => clearTimeout(t));
      } else start();
    });
  })
  .listen(Number(process.env.E2E_MOCK_PORT ?? 4011), () => console.log("mock-anthropic up"));
