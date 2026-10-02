/** Maps a Supabase auth error to a key under `errors.*` (never shows raw text). */
export function authErrorKey(error: unknown): string {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  switch (code) {
    case "invalid_credentials":
      return "invalidCredentials";
    case "user_already_exists":
    case "email_exists":
      return "userExists";
    case "weak_password":
      return "weakPassword";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "rateLimited";
    case "email_address_invalid":
      return "emailInvalid";
    case "email_not_confirmed":
      return "emailNotConfirmed";
  }
  // The profile trigger rejecting a signup surfaces as a database error.
  if (message?.includes("Database error")) return "profileInvalid";
  return "generic";
}
