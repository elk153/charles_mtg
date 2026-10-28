import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database.ts";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing VITE_SUPABASE_URL environment variable");
}

if (!supabasePublishableKey) {
  throw new Error("Missing VITE_SUPABASE_PUBLISHABLE_KEY environment variable");
}

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    flowType: "pkce",
    detectSessionInUrl: true,
  },
});