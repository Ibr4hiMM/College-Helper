import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getProfile, signUpSchema } from "./profile";

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
  level: "early",
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
  it("requires a study level", () =>
    expect(messages({ level: undefined })).toContain("levelRequired"));
  it("rejects an unknown study level", () =>
    expect(messages({ level: "year9" })).toContain("levelRequired"));
  it("rejects a bad email", () =>
    expect(messages({ email: "nope" })).toContain("emailInvalid"));
});

// Just enough of the supabase query chain for getProfile.
const client = (data: unknown, error: unknown = null) =>
  ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data, error }) }) }) }) }) as unknown as SupabaseClient;
const row = (level: unknown) => ({
  level,
  university_id: "ksu",
  major_id: 1,
  majors: { name_ar: "علوم الحاسب", name_en: "Computer Science", universities: { name_ar: "جامعة الملك سعود", name_en: "King Saud University" } },
});

describe("getProfile", () => {
  it("returns names and a known level", async () => {
    expect(await getProfile(client(row("final")), "u1")).toMatchObject({ level: "final", university_id: "ksu", major_id: 1, major: { name_en: "Computer Science" } });
  });
  it("maps a missing or unknown level to null", async () => {
    expect((await getProfile(client(row(null)), "u1"))?.level).toBeNull();
    expect((await getProfile(client(row("year9")), "u1"))?.level).toBeNull();
  });
  it("returns null when no profile row exists, and throws on query errors", async () => {
    expect(await getProfile(client(null), "u1")).toBeNull();
    await expect(getProfile(client(null, new Error("db down")), "u1")).rejects.toThrow("db down");
  });
});
