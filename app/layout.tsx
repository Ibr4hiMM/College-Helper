import type { Metadata } from "next";
import { Aref_Ruqaa, Literata, Noto_Naskh_Arabic, Readex_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Print face for both scripts; Literata/Naskh for answer reading; Ruqaa only for red-pen margin marks.
const readex = Readex_Pro({
  subsets: ["arabic", "latin"],
  variable: "--f-readex",
  display: "swap",
});
const literata = Literata({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-literata",
  display: "swap",
});
const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--f-naskh",
  display: "swap",
});
const ruqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["700"],
  variable: "--f-ruqaa",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("app");
  return { title: t("name"), description: t("description") };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={`${readex.variable} ${literata.variable} ${naskh.variable} ${ruqaa.variable}`}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
