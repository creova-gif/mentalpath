import { toast } from 'sonner';
import type { TFunction } from 'i18next';
import type { UserProfile } from '@/app/context/UserContext';
import { renderReceiptHtml, type ReceiptLabels } from './receipt';
import { uiLocale } from './locale';

export interface ReceiptInvoice {
  invoiceNumber: string; clientName: string; date: string; sessions: number; amount: number; paidAt?: string | null;
}

/** Opens the printable insurance receipt for a paid invoice (generated locally; nothing is sent). */
export function printReceipt(invoice: ReceiptInvoice, user: UserProfile, t: TFunction): void {
  const html = renderReceiptHtml({
    invoiceNumber: invoice.invoiceNumber, clientName: invoice.clientName, serviceDate: invoice.date,
    sessions: invoice.sessions, amount: invoice.amount, paidAt: invoice.paidAt ?? null, description: null,
    provider: {
      name: user.name, profession: t(`common.professions.${user.profession}`, { defaultValue: user.profession }),
      college: user.collegeAbbr || user.college, registrationNumber: user.registrationNumber, city: user.city, hstExempt: user.hstExempt,
    },
  }, t('receipts.labels', { returnObjects: true }) as ReceiptLabels, uiLocale());
  const w = window.open('', '_blank');
  if (!w) { toast.error(t('receipts.popupBlocked')); return; }
  w.document.write(html);
  w.document.close();
  // Called from the opener: an inline <script> would be blocked by our CSP.
  w.focus();
  w.print();
}
