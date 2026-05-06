const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/components/pages/Billing.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Imports
content = content.replace(
  "import { InvoiceModal } from '../modals/InvoiceModal';",
  "import { InvoiceModal } from '../modals/InvoiceModal';\nimport { useTranslation } from 'react-i18next';"
);

// Billing component hook
content = content.replace(
  "export function Billing() {",
  "export function Billing() {\n  const { t } = useTranslation();"
);

// Alerts
content = content.replace(
  "alert(`T2125 summary for ${year} downloaded successfully!`);",
  "alert(t('billing.alerts.t2125Success', { year }));"
);
content = content.replace(
  "alert('Failed to export T2125 summary. Please try again.');",
  "alert(t('billing.alerts.t2125Fail'));"
);
content = content.replace(
  "alert('No paid invoices to export.');",
  "alert(t('billing.alerts.noInvoices'));"
);
content = content.replace(
  "alert('Failed to export receipts. Please try again.');",
  "alert(t('billing.alerts.receiptExportFail'));"
);

// SummaryBox
content = content.replace(
  "label={`Collected — ${currentMonth}`}",
  "label={t('billing.summary.collected', { month: currentMonth })}"
);
content = content.replace(
  'label="Outstanding"',
  'label={t(\'billing.summary.outstanding\')}'
);
content = content.replace(
  'label="YTD collected"',
  'label={t(\'billing.summary.ytd\')}'
);

// Invoices Header
content = content.replace(
  '<span className="text-sm font-medium text-[var(--ink)]">Invoices</span>',
  '<span className="text-sm font-medium text-[var(--ink)]">{t(\'billing.invoices.title\')}</span>'
);
content = content.replace(
  ">All</FilterButton>",
  ">{t('billing.invoices.filters.all')}</FilterButton>"
);
content = content.replace(
  ">Paid</FilterButton>",
  ">{t('billing.invoices.filters.paid')}</FilterButton>"
);
content = content.replace(
  ">Pending</FilterButton>",
  ">{t('billing.invoices.filters.pending')}</FilterButton>"
);
content = content.replace(
  ">Overdue</FilterButton>",
  ">{t('billing.invoices.filters.overdue')}</FilterButton>"
);

content = content.replace(
  '<span className="hidden sm:inline">New invoice</span>',
  '<span className="hidden sm:inline">{t(\'billing.invoices.new\')}</span>'
);
content = content.replace(
  '<span className="sm:hidden">New</span>',
  '<span className="sm:hidden">{t(\'billing.invoices.newMobile\')}</span>'
);

// Columns
content = content.replace(
  /Invoice #\s*<\/th>/,
  "{t('billing.invoices.columns.invoiceNum')}\n              </th>"
);
content = content.replace(
  /Client\s*<\/th>/,
  "{t('billing.invoices.columns.client')}\n              </th>"
);
content = content.replace(
  /Date\s*<\/th>/,
  "{t('billing.invoices.columns.date')}\n              </th>"
);
content = content.replace(
  /Sessions\s*<\/th>/,
  "{t('billing.invoices.columns.sessions')}\n              </th>"
);
content = content.replace(
  /Amount\s*<\/th>/,
  "{t('billing.invoices.columns.amount')}\n              </th>"
);
content = content.replace(
  /Status\s*<\/th>/,
  "{t('billing.invoices.columns.status')}\n              </th>"
);

// Rows
content = content.replace(
  "{invoice.sessions} session(s)",
  "{t('billing.invoices.sessionsCount', { count: invoice.sessions })}"
);
content = content.replace(
  "{invoice.status === 'paid' ? 'Receipt' : 'Send reminder'}",
  "{invoice.status === 'paid' ? t('billing.invoices.actionReceipt') : t('billing.invoices.actionReminder')}"
);

// Tax Prep
content = content.replace(
  "Tax prep — T2125 self-employment summary",
  "{t('billing.taxPrep.title')}"
);
content = content.replace(
  "MentalPath generates a year-end income summary formatted for Schedule T2125 (Statement of Business Activities).\n          Download at tax time — no accountant needed for the basics.",
  "{t('billing.taxPrep.description')}"
);
content = content.replace(
  "Export 2025 T2125 summary",
  "{t('billing.taxPrep.exportT2125', { year: '2025' })}"
);
content = content.replace(
  "{exportingZip ? 'Exporting…' : 'Download all receipts (CSV)'}",
  "{exportingZip ? t('billing.taxPrep.exporting') : t('billing.taxPrep.downloadReceipts')}"
);

// InvoiceStatus
content = content.replace(
  "function InvoiceStatus({ status }: { status: 'paid' | 'pending' | 'overdue' }) {",
  "function InvoiceStatus({ status }: { status: 'paid' | 'pending' | 'overdue' }) {\n  const { t } = useTranslation();"
);
content = content.replace(
  "{status.charAt(0).toUpperCase() + status.slice(1)}",
  "{t(`billing.invoices.filters.${status}`)}"
);

fs.writeFileSync(filePath, content);
console.log('Successfully patched Billing.tsx');
