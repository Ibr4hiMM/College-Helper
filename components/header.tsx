import { useTranslations } from "next-intl";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";

/** The booklet glyph: a sheet with its double red margin rule and three lines. Mirrors with the script. */
export function BookletMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={`rtl:-scale-x-100 ${className ?? ""}`}>
      <rect x="5.75" y="3.75" width="20.5" height="24.5" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 4v24M12.5 4v24" stroke="hsl(var(--pen))" strokeWidth="1" />
      <path d="M15.5 11h7M15.5 16h7M15.5 21h4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/** Running head printed on the cover: mark and name, then the printed controls. */
export function Header({ children }: { children?: React.ReactNode }) {
  const t = useTranslations("app");
  return (
    <header className="on-cover flex h-14 shrink-0 items-center justify-between gap-3 px-3 text-cover-ink sm:px-8">
      <Link href="/" aria-label={t("name")} className="flex items-center gap-2.5 whitespace-nowrap px-1 text-[1.0625rem] font-semibold">
        <BookletMark className="size-7 shrink-0" />
        <span className="hidden min-[380px]:inline">{t("name")}</span>
      </Link>
      <nav className="flex shrink-0 items-center">
        <LocaleSwitcher />
        <ThemeSwitcher />
        {children}
      </nav>
    </header>
  );
}

/** Printed text control on the cover. */
export const coverControl =
  "inline-flex h-10 items-center gap-1.5 px-2.5 text-sm text-cover-ink underline-offset-4 transition-colors hover:bg-cover-ink/10 sm:px-3";
