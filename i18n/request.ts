import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  const cookie = (await cookies()).get("NEXT_LOCALE")?.value;
  const locale: Locale = cookie === "en" ? "en" : "ar";
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
