import { createClient, type SupabaseClient, type User } from "npm:@supabase/supabase-js@2";
import type { Context } from "npm:hono";

export function serviceClient(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
}

/** A client that acts AS the caller, so Postgres RLS (incl. the MFA rule) applies. */
export function userClient(accessToken: string): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Resolves the signed-in user from the bearer token (verified by GoTrue).
 * Returns a Response to send back if the caller is not authenticated.
 * The public anon key is never accepted as an identity.
 */
export async function requireUser(c: Context): Promise<{ user: User; token: string } | Response> {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return c.json({ error: "Unauthorized" }, 401);
  const token = header.slice("Bearer ".length);
  const { data: { user }, error } = await serviceClient().auth.getUser(token);
  if (error || !user) return c.json({ error: "Unauthorized" }, 401);
  return { user, token };
}
