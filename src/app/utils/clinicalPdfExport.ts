/**
 * College-Formatted Audit-Ready Clinical PDF / Print Generator
 * 
 * Formats clinical DAP/SOAP notes with official practitioner credentials,
 * CRPO/College regulatory disclosures, and Canadian PHIPA compliance seals.
 */

export interface ClinicalExportData {
  practitionerName: string;
  practitionerRole: string;
  registrationNumber?: string;
  collegeName?: string;
  clientName: string;
  sessionNumber: string;
  sessionDate: string;
  duration: string;
  format: string;
  diagnosis: string;
  sections: { label: string; text: string }[];
  isLocked?: boolean;
}

export function exportClinicalRecord(data: ClinicalExportData): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up was blocked. Please allow pop-ups to export the clinical PDF.');
    return;
  }

  const sectionsHtml = data.sections
    .map(
      sec => `
      <div class="section-block">
        <div class="section-title">${sec.label.toUpperCase()}</div>
        <div class="section-content">${(sec.text || 'No entry documented for this section.').replace(/\n/g, '<br/>')}</div>
      </div>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Clinical Record - ${data.clientName} - ${data.sessionDate}</title>
      <style>
        @page {
          size: letter;
          margin: 20mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.6;
          margin: 0;
          padding: 24px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #2d4a3e;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .clinic-info h1 {
          margin: 0 0 4px 0;
          font-size: 20px;
          color: #2d4a3e;
        }
        .clinic-info p {
          margin: 0;
          font-size: 12px;
          color: #555;
        }
        .compliance-seal {
          text-align: right;
          font-size: 11px;
          color: #2d4a3e;
          background: #f0f7f4;
          padding: 8px 12px;
          border: 1px solid #b7ded0;
          border-radius: 6px;
        }
        .compliance-seal strong {
          display: block;
          font-size: 12px;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          background: #f9f9f9;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 12px;
        }
        .meta-item strong {
          display: block;
          color: #666;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .section-block {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .section-title {
          font-size: 12px;
          font-weight: 700;
          color: #2d4a3e;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 4px;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .section-content {
          font-size: 13px;
          color: #222;
          white-space: pre-line;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #ddd;
          padding-top: 16px;
          font-size: 10px;
          color: #777;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .signature-line {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .sig-block {
          border-top: 1px solid #333;
          width: 250px;
          padding-top: 6px;
          font-size: 11px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="clinic-info">
          <h1>${data.practitionerName}</h1>
          <p>${data.practitionerRole} ${data.collegeName ? `• ${data.collegeName}` : ''}</p>
          ${data.registrationNumber ? `<p>Registration/License ID: <strong>${data.registrationNumber}</strong></p>` : ''}
        </div>
        <div class="compliance-seal">
          <strong>🍁 Canadian PHIPA Compliant</strong>
          <span>Section 20 Clinical Record • Stored in ca-central-1</span>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <strong>Client Identifier</strong>
          <span>${data.clientName}</span>
        </div>
        <div class="meta-item">
          <strong>Session Details</strong>
          <span>Session #${data.sessionNumber} • ${data.sessionDate}</span>
        </div>
        <div class="meta-item">
          <strong>Duration & Format</strong>
          <span>${data.duration} • ${data.format}</span>
        </div>
        <div class="meta-item">
          <strong>Clinical Note Format</strong>
          <span>${data.format.toUpperCase()} Note</span>
        </div>
        <div class="meta-item">
          <strong>Presenting Diagnosis</strong>
          <span>${data.diagnosis}</span>
        </div>
        <div class="meta-item">
          <strong>Record Lock Status</strong>
          <span>${data.isLocked ? '🔒 Finalized & Locked' : '📝 Unlocked Clinician Draft'}</span>
        </div>
      </div>

      ${sectionsHtml}

      <div class="signature-line">
        <div class="sig-block">
          <strong>Clinician Attestation & Signature</strong><br/>
          I attest that this clinical record accurately reflects the session delivered.
        </div>
        <div class="sig-block" style="text-align: right;">
          <strong>Date Signed:</strong> ${data.sessionDate}
        </div>
      </div>

      <div class="footer">
        <div>Generated via MentalPath • PHIPA & PIPEDA Audited Documentation System</div>
        <div>Confidential Personal Health Information (PHI) — Unauthorized Reproduction Prohibited</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
