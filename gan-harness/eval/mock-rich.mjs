// Inspection-only mock of the Anthropic Messages stream: realistic markdown answers (sample content, never shipped).
import http from "node:http";

const AR = (major) =>
  `تخصصك هو **${major}**، وهذه ثلاث أفكار أساسية تبدأ بها:\n\n1. **هياكل البيانات**: المصفوفات والقوائم المترابطة والأشجار، ومتى تختار كلًّا منها.\n2. **الخوارزميات**: الفرز والبحث، وكيف تقيس التعقيد الزمني بصيغة O(n).\n3. **البرمجة الكائنية**: الأصناف والوراثة وتعدد الأشكال.\n\n### خطوة تالية\nحل مسألتين يوميًا من المستوى السهل، ثم انتقل إلى المتوسط بعد أسبوعين.`;
const EN = (major) =>
  `Your major is **${major}**. Here are three core ideas to master first:\n\n1. **Data structures**: arrays, linked lists and trees, and when to pick each.\n2. **Algorithms**: sorting and searching, and how to reason about O(n) time.\n3. **Object-oriented design**: classes, inheritance and polymorphism.\n\n### Next step\nSolve two easy problems a day, then move to medium after two weeks.`;

http
  .createServer((req, res) => {
    let b = "";
    req.on("data", (c) => (b += c));
    req.on("end", () => {
      if (!req.url.includes("/messages")) return res.writeHead(404).end();
      const j = JSON.parse(b || "{}");
      const sys = typeof j.system === "string" ? j.system : (j.system || []).map((s) => s.text).join("\n");
      const last = JSON.stringify((j.messages || []).at(-1) || "");
      if (last.includes("AUTHFAIL")) {
        res.writeHead(401, { "content-type": "application/json" });
        return res.end(JSON.stringify({ type: "error", error: { type: "authentication_error", message: "invalid x-api-key" } }));
      }
      const m = sys.match(/studies (.+?) \((.+?)\)\./);
      const decoded = last.replace(/\\u[0-9a-f]{4}/gi, (x) => String.fromCharCode(parseInt(x.slice(2), 16)));
      const text = /[؀-ۿ]/.test(decoded) ? AR(m?.[2] ?? "") : EN(m?.[1] ?? "");
      res.writeHead(200, { "content-type": "text/event-stream" });
      const ev = (t, d) => res.write(`event: ${t}\ndata: ${JSON.stringify({ type: t, ...d })}\n\n`);
      ev("message_start", { message: { id: "msg_1", type: "message", role: "assistant", model: "x", content: [], stop_reason: null, usage: { input_tokens: 1, output_tokens: 1 } } });
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
    });
  })
  .listen(4010, () => console.log("mock-rich up on 4010"));
