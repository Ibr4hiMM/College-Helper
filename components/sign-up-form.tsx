"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { AuthPanel, Field, FormError, PanelNote, SelectField, SubmitButton, linkClass } from "@/components/field";
import { authErrorKey } from "@/lib/auth-error";
import { signUpSchema } from "@/lib/profile";
import { createClient } from "@/lib/supabase/client";

type Named = { name_ar: string; name_en: string };
export type University = Named & { id: string };
export type Major = Named & { id: number; university_id: string };

export function SignUpForm({
  universities,
  majors,
}: {
  universities: University[];
  majors: Major[];
}) {
  const t = useTranslations("signUp");
  const c = useTranslations("common");
  const e = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const [universityId, setUniversityId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const name = (n: Named) => (locale === "ar" ? n.name_ar : n.name_en);
  const filtered = majors.filter((m) => m.university_id === universityId);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = new FormData(ev.currentTarget);
    const majorRaw = String(form.get("major_id") ?? "");
    const parsed = signUpSchema(majors).safeParse({
      email: String(form.get("email")),
      password: String(form.get("password")),
      repeat: String(form.get("repeat")),
      university_id: String(form.get("university_id") ?? ""),
      major_id: majorRaw ? Number(majorRaw) : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    const { email, password, university_id, major_id } = parsed.data;
    setLoading(true);
    setError(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { university_id, major_id },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/chat`,
      },
    });
    if (error) {
      setError(authErrorKey(error));
      setLoading(false);
      return;
    }
    // No session means email confirmation is on: ask the user to confirm.
    if (!data.session) {
      setNeedsConfirm(true);
      return;
    }
    router.push("/chat");
    router.refresh();
  };

  if (needsConfirm)
    return (
      <AuthPanel title={t("successTitle")} description={t("successBody")}>
        <PanelNote>
          <Link href="/auth/login" className={linkClass}>
            {t("login")}
          </Link>
        </PanelNote>
      </AuthPanel>
    );

  return (
    <AuthPanel
      title={t("title")}
      description={t("description")}
      caption={t("caption")}
      notes={{ title: t("notesTitle"), items: [t("notes.one"), t("notes.two"), t("notes.three")] }}
    >
      <form onSubmit={onSubmit} noValidate>
        <SelectField
          id="university_id"
          name="university_id"
          label={t("university")}
          aria-required
          value={universityId}
          onChange={(ev) => setUniversityId(ev.target.value)}
        >
          <option value="">{t("chooseUniversity")}</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {name(u)}
            </option>
          ))}
        </SelectField>
        <SelectField
          key={universityId}
          id="major_id"
          name="major_id"
          label={t("major")}
          aria-required
          disabled={!universityId}
          defaultValue=""
        >
          <option value="">{universityId ? t("chooseMajor") : t("chooseUniversityFirst")}</option>
          {filtered.map((m) => (
            <option key={m.id} value={m.id}>
              {name(m)}
            </option>
          ))}
        </SelectField>
        <Field id="email" name="email" type="email" label={c("email")} autoComplete="email" required />
        <Field id="password" name="password" type="password" label={c("password")} hint={t("passwordHint")} autoComplete="new-password" required />
        <Field id="repeat" name="repeat" type="password" label={t("repeatPassword")} autoComplete="new-password" required />
        {error && <FormError>{e(error)}</FormError>}
        <SubmitButton disabled={loading}>{loading ? t("submitting") : t("submit")}</SubmitButton>
      </form>
      <PanelNote>
        {t("hasAccount")}{" "}
        <Link href="/auth/login" className={linkClass}>
          {t("login")}
        </Link>
      </PanelNote>
    </AuthPanel>
  );
}
