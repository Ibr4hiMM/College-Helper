import { expect, it } from "vitest";
import ar from "../messages/ar.json";
import en from "../messages/en.json";

const keys = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

it("ar and en have identical key sets", () => {
  expect(keys(ar).sort()).toEqual(keys(en).sort());
});

it("no message is empty", () => {
  for (const m of [...Object.values(flat(ar)), ...Object.values(flat(en))])
    expect(m.trim()).not.toBe("");
});

function flat(o: object, p = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(o).flatMap(([k, v]) =>
      typeof v === "object" ? Object.entries(flat(v, `${p}${k}.`)) : [[p + k, v]],
    ),
  );
}
