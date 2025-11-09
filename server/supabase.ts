import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set");
}

const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
if (!key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY must be set");
}

export const supabase = createClient(SUPABASE_URL, key, {
  auth: { persistSession: false },
});
