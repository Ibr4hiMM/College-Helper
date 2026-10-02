// Import before the AI SDK: zod probes `new Function` when it builds its first object schema,
// and our CSP reports that probe as a violation even though zod catches it. Jitless skips the probe.
import { z } from "zod";

z.config({ jitless: true });
