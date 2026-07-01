import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Yalnız SUNUCU tarafında kullanılır (service role — RLS'i bypass eder).
// Asla client bileşenlerine import etme.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
