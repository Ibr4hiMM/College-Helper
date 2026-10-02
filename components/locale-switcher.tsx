"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { coverControl } from "@/components/header";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("common");
  const router = useRouter();
  const next = locale === "ar" ? "en" : "ar";

  const toggle = () => {
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  // The visible text is the accessible name; lang lets screen readers voice it correctly.
  return (
    <button type="button" onClick={toggle} lang={next} title={t("language")} className={coverControl}>
      {t("switchTo")}
    </button>
  );
}
