import { projectId } from '/utils/supabase/info';
import { authHeaders } from '@/utils/supabase/client';

const API = `https://${projectId}.supabase.co/functions/v1/make-server-4d1a502d`;

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error ?? 'Request failed'), { code: data.code });
  return data as T;
}

/** Redirects to Stripe Checkout for the Solo plan. */
export async function startCheckout(): Promise<void> {
  const { url } = await post<{ url: string }>('/billing/checkout-session');
  window.location.assign(url);
}

/** Redirects to the Stripe Customer Portal (card, invoices, cancellation). */
export async function openBillingPortal(): Promise<void> {
  const { url } = await post<{ url: string }>('/billing/portal-session');
  window.location.assign(url);
}

/** Downloads all of the clinician's data as JSON. */
export async function downloadAccountExport(): Promise<void> {
  const res = await fetch(`${API}/account/export`, { headers: await authHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Export failed');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mentalpath-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function closeAccount(): Promise<void> {
  await post('/account/delete', { confirm: 'DELETE' });
}
