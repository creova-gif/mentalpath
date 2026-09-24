// Printable insurance receipt (what Canadian extended-health insurers ask
// for): provider, designation, College registration, client, date of
// service, amount paid, payment date, receipt number, tax status.
export interface ReceiptData {
  invoiceNumber: string;
  clientName: string;
  serviceDate: string;
  sessions: number;
  amount: number;
  paidAt: string | null;
  description: string | null;
  provider: { name: string; profession: string; college: string; registrationNumber: string; city: string; hstExempt: boolean };
}

export interface ReceiptLabels {
  title: string; provider: string; registration: string; client: string; serviceDate: string; service: string;
  sessions: string; amountPaid: string; paidOn: string; receiptNo: string; hstExempt: string; hstIncluded: string; signature: string;
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

export function renderReceiptHtml(r: ReceiptData, l: ReceiptLabels, locale = 'en-CA'): string {
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'CAD' }).format(r.amount);
  const paid = r.paidAt ? new Date(r.paidAt).toLocaleDateString(locale, { dateStyle: 'long' }) : '—';
  const service = new Date(`${r.serviceDate}T00:00:00`).toLocaleDateString(locale, { dateStyle: 'long' });
  const row = (k: string, v: string) => `<tr><th>${esc(k)}</th><td>${esc(v)}</td></tr>`;
  return `<!doctype html><html lang="${locale.slice(0, 2)}"><head><meta charset="utf-8"><title>${esc(l.title)} ${esc(r.invoiceNumber)}</title>
<style>body{font:14px/1.5 system-ui,sans-serif;color:#1a1a18;max-width:640px;margin:40px auto;padding:0 24px}
h1{font-size:20px;margin:0 0 4px}table{width:100%;border-collapse:collapse;margin:24px 0}th,td{text-align:left;padding:8px 0;border-bottom:1px solid #ddd;vertical-align:top}
th{width:40%;font-weight:500;color:#555}.sig{margin-top:48px;border-top:1px solid #1a1a18;width:260px;padding-top:4px;font-size:12px}
.note{font-size:12px;color:#555}@media print{body{margin:0}}</style></head><body>
<h1>${esc(l.title)}</h1><div>${esc(r.provider.name)}, ${esc(r.provider.profession)}</div><div class="note">${esc(r.provider.city)}</div>
<table>
${row(l.receiptNo, r.invoiceNumber)}
${row(l.provider, `${r.provider.name}, ${r.provider.profession}`)}
${row(l.registration, `${r.provider.college} #${r.provider.registrationNumber || '—'}`)}
${row(l.client, r.clientName)}
${row(l.serviceDate, service)}
${row(l.service, r.description || r.provider.profession)}
${row(l.sessions, String(r.sessions))}
${row(l.amountPaid, money)}
${row(l.paidOn, paid)}
</table>
<p class="note">${esc(r.provider.hstExempt ? l.hstExempt : l.hstIncluded)}</p>
<div class="sig">${esc(l.signature)}: ${esc(r.provider.name)}</div>
</body></html>`;
}
