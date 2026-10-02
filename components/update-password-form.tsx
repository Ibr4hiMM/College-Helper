"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AuthPanel, Field, FormError, SubmitButton } from "@/components/field";
import { authErrorKey } from "@/lib/auth-error";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const t = useTranslations("update");
  const e = useTranslations("errors");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const password = String(new FormData(ev.currentTarget).get("password"));
    setLoading(true);
    setError(null);
    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(authErrorKey(error));
      setLoading(false);
      return;
    }
    router.push("/chat");
    router.refresh();
  };

  return (
    <AuthPanel title={t("title")} description={t("description")}>
      <form onSubmit={onSubmit}>
        <Field id="password" name="password" type="password" label={t("newPassword")} autoComplete="new-password" minLength={8} required />
        {error && <FormError>{e(error)}</FormError>}
        <SubmitButton disabled={loading}>{loading ? t("submitting") : t("submit")}</SubmitButton>
      </form>
    </AuthPanel>
  );
}
