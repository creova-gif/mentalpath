export type AccessClaims = {
  role?: string;
  sub?: string;
};

export type AiAuthDecision = { action: "reject" } | { action: "verify-user" };

/**
 * The public anon key must never be treated as a caller.
 * "verify-user" still requires supabase.auth.getUser. There is no demo user.
 */
export function decideAiAuth(claims: AccessClaims | null | undefined): AiAuthDecision {
  if (!claims || claims.role === "anon" || !claims.sub) {
    return { action: "reject" };
  }
  return { action: "verify-user" };
}

export function readJwtClaims(token: string): AccessClaims | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const pad = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = pad + "=".repeat((4 - (pad.length % 4)) % 4);
    const decoded = JSON.parse(atob(padded));
    if (!decoded || typeof decoded !== "object") return null;
    return {
      role: typeof decoded.role === "string" ? decoded.role : undefined,
      sub: typeof decoded.sub === "string" ? decoded.sub : undefined,
    };
  } catch {
    return null;
  }
}
