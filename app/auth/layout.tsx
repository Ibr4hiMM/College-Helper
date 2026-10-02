import { useTranslations } from "next-intl";

import { BookletMark, Header } from "@/components/header";

/** Every auth route is the booklet's cover. */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("app");
  return (
    <div className="on-cover flex min-h-dvh flex-col bg-cover text-cover-ink">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:py-12">
        {children}
      </main>
      {/* The cover's printed colophon. */}
      <footer className="mx-auto flex w-full max-w-6xl items-center gap-3 border-t border-cover-ink/30 px-4 py-5 text-sm text-cover-soft sm:px-8">
        <BookletMark className="size-5 shrink-0" />
        <span>{t("colophon")}</span>
      </footer>
    </div>
  );
}
