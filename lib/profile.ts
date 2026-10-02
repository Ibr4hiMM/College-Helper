import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type MajorRef = { id: number; university_id: string };

// The five study levels the research supports telling apart (docs/research/saudi-students-by-level.md).
export const LEVELS = ["prep", "early", "upper", "final", "postgrad"] as const;
export type Level = (typeof LEVELS)[number];

// Messages are keys under `errors.*` in messages/*.json.
export const signUpSchema = (majors: MajorRef[]) =>
  z
    .object({
      email: z.email("emailInvalid"),
      password: z.string().min(8, "passwordShort"),
      repeat: z.string(),
      university_id: z.string().min(1, "universityRequired"),
      major_id: z.number("majorRequired"),
      level: z.enum(LEVELS, "levelRequired"),
    })
    .refine((v) => v.password === v.repeat, {
      path: ["repeat"],
      error: "passwordMismatch",
    })
    .refine(
      (v) =>
        majors.some(
          (m) => m.id === v.major_id && m.university_id === v.university_id,
        ),
      { path: ["major_id"], error: "majorMismatch" },
    );

type Names = { name_ar: string; name_en: string };
export type Profile = {
  // Ids scope curriculum search; they come from the DB row, never from the client or the model.
  university_id: string;
  major_id: number;
  university: Names;
  major: Names;
  // null for accounts created before levels existed.
  level: Level | null;
};

/** The user's profile with university and major names; null only when no row exists. */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  // Filter explicitly as well as relying on RLS; a query failure is an error, not "no profile".
  const { data, error } = await supabase
    .from("profiles")
    .select("level, university_id, major_id, majors(name_ar, name_en, universities(name_ar, name_en))")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  const major = data?.majors as unknown as
    | (Names & { universities: Names })
    | null
    | undefined;
  if (!major) return null;
  const { universities: university, ...names } = major;
  const level = LEVELS.find((l) => l === data?.level) ?? null;
  return { university_id: data!.university_id, major_id: data!.major_id, university, major: names, level };
}
