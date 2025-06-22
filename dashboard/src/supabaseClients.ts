// dashboard/src/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// For now, you can use import.meta.env for your env vars (set in .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);