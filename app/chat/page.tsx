import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Chat } from "@/components/chat";
import { getProfile } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

export default async function ChatPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/login");

  const profile = await getProfile(supabase, data.user.id);
  if (!profile) redirect("/auth/login");

  const ar = (await getLocale()) === "ar";
  const pick = (n: { name_ar: string; name_en: string }) =>
    ar ? n.name_ar : n.name_en;
  return <Chat university={pick(profile.university)} major={pick(profile.major)} level={profile.level} />;
}
