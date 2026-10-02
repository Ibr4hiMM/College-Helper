import { describe, expect, it } from "vitest";
import { signUpSchema } from "./profile";

const majors = [
  { id: 1, university_id: "ksu" },
  { id: 4, university_id: "kau" },
];
const valid = {
  email: "a@example.com",
  password: "longenough",
  repeat: "longenough",
  university_id: "ksu",
  major_id: 1,
};
const messages = (input: object) => {
  const r = signUpSchema(majors).safeParse({ ...valid, ...input });
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe("signUpSchema", () => {
  it("accepts a valid signup", () => expect(messages({})).toEqual([]));
  it("rejects a major from another university", () =>
    expect(messages({ major_id: 4 })).toContain("majorMismatch"));
  it("rejects an unknown major id", () =>
    expect(messages({ major_id: 99 })).toContain("majorMismatch"));
  it("requires a university", () =>
    expect(messages({ university_id: "" })).toContain("universityRequired"));
  it("requires a major", () =>
    expect(messages({ major_id: undefined })).toContain("majorRequired"));
  it("rejects short passwords", () =>
    expect(messages({ password: "short", repeat: "short" })).toContain(
      "passwordShort",
    ));
  it("rejects mismatched repeat", () =>
    expect(messages({ repeat: "different1" })).toContain("passwordMismatch"));
  it("rejects a bad email", () =>
    expect(messages({ email: "nope" })).toContain("emailInvalid"));
});
