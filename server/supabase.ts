import 'dotenv/config';
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export function getSupabase(): SupabaseClient {
  const url = SUPABASE_URL;
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!url || !key) {
    const missing = [!url && "SUPABASE_URL", !key && "SUPABASE_SERVICE_ROLE_KEY/ANON_KEY"].filter(Boolean).join(", ");
    throw new Error(
      `Supabase configuration missing: ${missing}. Set env vars in Vercel project (Preview + Production).`,
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
