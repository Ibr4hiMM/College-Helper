import { SignUpForm } from "@/components/sign-up-form";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const [{ data: universities }, { data: majors }] = await Promise.all([
    supabase.from("universities").select("id, name_ar, name_en").order("name_en"),
    supabase.from("majors").select("id, university_id, name_ar, name_en").order("name_en"),
  ]);
  return <SignUpForm universities={universities ?? []} majors={majors ?? []} />;
}
