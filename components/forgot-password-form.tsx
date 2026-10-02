"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthPanel, Field, FormError, PanelNote, SubmitButton, linkClass } from "@/components/field";
import { authErrorKey } from "@/lib/auth-error";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const t = useTranslations("forgot");
  const c = useTranslations("common");
  const e = useTranslations("errors");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const email = String(new FormData(ev.currentTarget).get("email"));
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/confirm?next=/auth/update-password`,
    });
    setLoading(false);
    if (error) setError(authErrorKey(error));
    else setSent(true);
  };

  const back = (
    <PanelNote>
      <Link href="/auth/login" className={linkClass}>
        {t("back")}
      </Link>
    </PanelNote>
  );

  if (sent)
    return (
      <AuthPanel title={t("sentTitle")} description={t("sentBody")}>
        {back}
      </AuthPanel>
    );

  return (
    <AuthPanel title={t("title")} description={t("description")}>
      <form onSubmit={onSubmit}>
        <Field id="email" name="email" type="email" label={c("email")} autoComplete="email" required />
        {error && <FormError>{e(error)}</FormError>}
        <SubmitButton disabled={loading}>{loading ? t("submitting") : t("submit")}</SubmitButton>
      </form>
      {back}
    </AuthPanel>
  );
}
