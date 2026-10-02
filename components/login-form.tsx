"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthPanel, Field, FormError, PanelNote, SubmitButton, linkClass } from "@/components/field";
import { authErrorKey } from "@/lib/auth-error";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const t = useTranslations("login");
  const c = useTranslations("common");
  const e = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = new FormData(ev.currentTarget);
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (error) {
      setError(authErrorKey(error));
      setLoading(false);
      return;
    }
    router.push("/chat");
    router.refresh();
  };

  return (
    <AuthPanel
      title={t("title")}
      description={t("description")}
      caption={t("caption")}
      notes={{ title: t("notesTitle"), items: [t("notes.one"), t("notes.two")] }}
    >
      <form onSubmit={onSubmit}>
        <Field id="email" name="email" type="email" label={c("email")} autoComplete="email" required />
        <Field id="password" name="password" type="password" label={c("password")} autoComplete="current-password" required />
        {error && <FormError>{e(error)}</FormError>}
        <SubmitButton disabled={loading}>{loading ? t("submitting") : t("submit")}</SubmitButton>
      </form>
      <PanelNote>
        <Link href="/auth/forgot-password" className={linkClass}>
          {t("forgot")}
        </Link>
        <span className="mx-2 text-spot/60" aria-hidden>·</span>
        {t("noAccount")}{" "}
        <Link href="/auth/sign-up" className={linkClass}>
          {t("signUp")}
        </Link>
      </PanelNote>
    </AuthPanel>
  );
}
