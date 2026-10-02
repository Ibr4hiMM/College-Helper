"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { coverControl } from "@/components/header";

const order = ["light", "dark", "system"] as const;
type Mode = (typeof order)[number];

/** Cycles light, dark, system. Theme is only known after mount (no SSR flash). */
export function ThemeSwitcher() {
  const t = useTranslations("common");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted && order.includes(theme as Mode) ? (theme as Mode) : null;
  const next = order[(order.indexOf(current ?? "system") + 1) % order.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={current ? `${t("themeLabel")}: ${t(`theme.${current}`)}` : t("themeLabel")}
      className={coverControl}
    >
      {current ? t(`theme.${current}`) : t("themeLabel")}
    </button>
  );
}
