import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

/** Landing for every auth email link (signup confirm, password reset): PKCE `code` or `token_hash`. */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const { searchParams } = url;
  // Resolve against our origin and keep only same-origin paths, so `//x` or `/\x` cannot redirect off-site.
  const target = new URL(searchParams.get("next") ?? "/chat", url.origin);
  const next = target.origin === url.origin ? `${target.pathname}${target.search}` : "/chat";

  const supabase = await createClient();
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : token_hash && type
      ? await supabase.auth.verifyOtp({ type, token_hash })
      : { error: true };

  redirect(error ? "/auth/error" : next);
}
