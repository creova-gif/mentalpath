// Minimal Stripe REST client (form-encoded), avoiding a heavy SDK in the Edge runtime.
type Params = Record<string, string | number | boolean | undefined | null>;

export async function stripeRequest<T = Record<string, unknown>>(path: string, params: Params): Promise<T> {
  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) body.append(k, String(v));
  }
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Stripe-Version": "2025-08-27.basil",
    },
    body,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Stripe error:", data?.error?.type, data?.error?.code);
    throw new Error(data?.error?.message ?? `Stripe request failed (${res.status})`);
  }
  return data as T;
}
