import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client factory. Shared with the cuvetsmo main backend; reads
 * from public.foresight_* tables only.
 *
 * Env vars (set in Vercel project + .env.local for dev):
 *   NEXT_PUBLIC_SUPABASE_URL  — project URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY — legacy anon JWT (NOT the publishable key —
 *     edge functions with verify_jwt=true reject sb_publishable_* per memory
 *     reference_supabase-publishable-key-not-jwt)
 *
 * Returns null if env is missing — callers should fall back to the seed in
 * lib/markets-seed.ts so the public surface never breaks during config.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    cached = null;
    return null;
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
