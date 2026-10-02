"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { coverControl } from "@/components/header";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const t = useTranslations("common");

  const logout = async () => {
    await createClient().auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <button type="button" onClick={logout} className={coverControl}>
      {t("logout")}
    </button>
  );
}
