const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src/i18n/locales/en.json');
const frPath = path.join(__dirname, 'src/i18n/locales/fr.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const frData = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Session Notes
const sessionNotesEn = {
  "summary": "{{dueCount}} notes due within 24hrs · {{completedCount}} completed notes",
  "newNote": "New session note",
  "dueTitle": "Due — complete within 24hrs",
  "writeNote": "Write note",
  "recentCompleted": "Recent completed notes",
  "locked": "Locked",
  "view": "View"
};

const sessionNotesFr = {
  "summary": "{{dueCount}} notes à faire sous 24h · {{completedCount}} notes terminées",
  "newNote": "Nouvelle note de session",
  "dueTitle": "À faire — compléter sous 24h",
  "writeNote": "Rédiger",
  "recentCompleted": "Notes terminées récentes",
  "locked": "Verrouillé",
  "view": "Voir"
};

// Billing
const billingEn = {
  "alerts": {
    "noInvoices": "No paid invoices to export.",
    "receiptExportFail": "Failed to export receipts. Please try again.",
    "t2125Success": "T2125 summary for {{year}} downloaded successfully!",
    "t2125Fail": "Failed to export T2125 summary. Please try again."
  },
  "summary": {
    "collected": "Collected — {{month}}",
    "outstanding": "Outstanding",
    "ytd": "YTD collected"
  },
  "invoices": {
    "title": "Invoices",
    "new": "New invoice",
    "newMobile": "New",
    "filters": {
      "all": "All",
      "paid": "Paid",
      "pending": "Pending",
      "overdue": "Overdue"
    },
    "columns": {
      "invoiceNum": "Invoice #",
      "client": "Client",
      "date": "Date",
      "sessions": "Sessions",
      "amount": "Amount",
      "status": "Status"
    },
    "sessionsCount": "{{count}} session(s)",
    "actionReceipt": "Receipt",
    "actionReminder": "Send reminder"
  },
  "taxPrep": {
    "title": "Tax prep — T2125 self-employment summary",
    "description": "MentalPath generates a year-end income summary formatted for Schedule T2125 (Statement of Business Activities). Download at tax time — no accountant needed for the basics.",
    "exportT2125": "Export {{year}} T2125 summary",
    "exporting": "Exporting…",
    "downloadReceipts": "Download all receipts (CSV)"
  }
};

const billingFr = {
  "alerts": {
    "noInvoices": "Aucune facture payée à exporter.",
    "receiptExportFail": "Échec de l'exportation des reçus. Veuillez réessayer.",
    "t2125Success": "Résumé T2125 pour {{year}} téléchargé avec succès !",
    "t2125Fail": "Échec de l'exportation du résumé T2125. Veuillez réessayer."
  },
  "summary": {
    "collected": "Encaissé — {{month}}",
    "outstanding": "En attente",
    "ytd": "Encaissé (depuis janvier)"
  },
  "invoices": {
    "title": "Factures",
    "new": "Nouvelle facture",
    "newMobile": "Nouveau",
    "filters": {
      "all": "Toutes",
      "paid": "Payé",
      "pending": "En attente",
      "overdue": "En retard"
    },
    "columns": {
      "invoiceNum": "Facture n°",
      "client": "Client",
      "date": "Date",
      "sessions": "Sessions",
      "amount": "Montant",
      "status": "Statut"
    },
    "sessionsCount": "{{count}} session(s)",
    "actionReceipt": "Reçu",
    "actionReminder": "Rappel"
  },
  "taxPrep": {
    "title": "Préparation des impôts — Résumé T2125 (travailleur autonome)",
    "description": "MentalPath génère un résumé de fin d'année formaté pour l'annexe T2125 (État des résultats des activités d'une entreprise). Téléchargez-le pendant la période des impôts — aucun comptable n'est nécessaire pour la base.",
    "exportT2125": "Exporter le résumé T2125 pour {{year}}",
    "exporting": "Exportation…",
    "downloadReceipts": "Télécharger tous les reçus (CSV)"
  }
};

enData.sessionNotes = sessionNotesEn;
frData.sessionNotes = sessionNotesFr;

enData.billing = billingEn;
frData.billing = billingFr;

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(frPath, JSON.stringify(frData, null, 2));

console.log('Successfully updated locales for SessionNotes and Billing');
