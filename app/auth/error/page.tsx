import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { AuthPanel, PanelNote, linkClass } from "@/components/field";

export default async function Page() {
  const t = await getTranslations("authError");
  return (
    <AuthPanel title={t("title")} description={t("body")}>
      <PanelNote>
        <Link href="/auth/login" className={linkClass}>
          {t("back")}
        </Link>
      </PanelNote>
    </AuthPanel>
  );
}
