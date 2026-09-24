import { describe, expect, it } from 'vitest';
import { renderReceiptHtml, type ReceiptLabels } from '@/app/lib/receipt';

const labels = Object.fromEntries(['title', 'provider', 'registration', 'client', 'serviceDate', 'service', 'sessions', 'amountPaid', 'paidOn', 'receiptNo', 'hstExempt', 'hstIncluded', 'signature'].map(k => [k, k])) as unknown as ReceiptLabels;
const base = {
  invoiceNumber: 'INV-0007', clientName: 'Sam <b>Rivera</b>', serviceDate: '2026-09-15', sessions: 1, amount: 150, paidAt: '2026-09-16T12:00:00Z',
  description: null, provider: { name: 'Robin Tremblay', profession: 'Registered Psychotherapist', college: 'CRPO', registrationNumber: '12345', city: 'Toronto, ON', hstExempt: true },
};

describe('insurance receipt', () => {
  it('includes what insurers require and escapes user text', () => {
    const html = renderReceiptHtml(base, labels);
    for (const s of ['INV-0007', 'Robin Tremblay', 'CRPO #12345', 'Registered Psychotherapist', '$150.00', 'hstExempt']) expect(html).toContain(s);
    expect(html).toContain('Sam &lt;b&gt;Rivera&lt;/b&gt;');
    expect(html).not.toContain('<b>Rivera');
  });
  it('states tax status', () => {
    expect(renderReceiptHtml({ ...base, provider: { ...base.provider, hstExempt: false } }, labels)).toContain('hstIncluded');
  });
});
