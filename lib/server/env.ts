/** Server-only settings, set in Netlify. Never prefixed VITE_, so they never reach the browser bundle. */
export interface ServerEnv {
  supabaseUrl: string;
  supabaseSecretKey: string;
  /** Null until the email settings are complete; alerts are then only logged. */
  email: { apiKey: string; from: string; alertTo: string } | null;
}

const SUPABASE_URL_PATTERN = /^https:\/\/[a-z0-9]+\.supabase\.co$/;

/**
 * Null when the database settings are missing, so a deploy without them does
 * nothing instead of failing. Error messages name the setting, never its value.
 */
export function readServerEnv(
  env: Readonly<Record<string, string | undefined>>
): ServerEnv | null {
  const supabaseUrl = env.SUPABASE_URL?.trim();
  const supabaseSecretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!supabaseUrl || !supabaseSecretKey) return null;
  if (!SUPABASE_URL_PATTERN.test(supabaseUrl)) {
    throw new Error(
      'SUPABASE_URL must look like https://<project-ref>.supabase.co'
    );
  }
  const apiKey = env.EMAIL_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim();
  const alertTo = env.ALERT_EMAIL?.trim();
  return {
    supabaseUrl,
    supabaseSecretKey,
    email: apiKey && from && alertTo ? { apiKey, from, alertTo } : null,
  };
}
