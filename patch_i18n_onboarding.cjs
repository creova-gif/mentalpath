const fs = require('fs');

const enPath = 'src/i18n/locales/en.json';
const frPath = 'src/i18n/locales/fr.json';

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

en.onboarding = {
  leftPanel: {
    title: {
      line1: "Built for ",
      line2: "every",
      line3: "regulated health professional."
    },
    description: "Note templates, receipt formats, outcome measures, and College standards configured automatically for your profession. PHIPA-compliant from minute one.",
    testimonial: "\"Switched from TherapyNotes in an afternoon. The culturally-adapted intake templates alone saved me two weeks of work — and I'm finally PHIPA-compliant.\"",
    author: "Dr. Abena Osei-Mensah, RP",
    authorRole: "Registered Psychotherapist · Toronto, ON",
    badges: {
      phipa: "PHIPA compliant",
      servers: "Canadian servers",
      trial: "7-day free trial"
    }
  },
  step1: {
    title: "Create your account",
    subtitle: "Free for 7 days. No credit card required.",
    fullName: "Full name",
    fullNamePlaceholder: "Dr. Jane Smith",
    workEmail: "Work email",
    workEmailPlaceholder: "you@practice.ca",
    password: "Password",
    passwordPlaceholder: "At least 8 characters",
    passwordHint: "Use 8+ characters, a number, and a symbol",
    continue: "Continue →",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in"
  },
  step2: {
    title: "What's your profession?",
    subtitle: "MentalPath configures note templates, receipt formats, outcome measures, and College compliance automatically.",
    configuresFor: "MentalPath will configure for {{profession}}:",
    noteFormats: "Note formats:",
    outcomeMeasures: "Outcome measures:",
    billing: "Billing:",
    hst: "HST:",
    continue: "Continue →",
    back: "← Back"
  },
  step3: {
    title: "Your practice details",
    subtitle: "This appears on invoices and receipts sent to your clients.",
    practiceName: "Practice / clinic name",
    practiceNamePlaceholder: "Smith Psychotherapy & Wellness",
    practiceNameHint: "Leave blank to use your full name",
    credentials: "Credentials",
    credentialsPlaceholder: "RP, PhD",
    registrationNum: "Registration #",
    registrationPlaceholder: "CRPO-004821",
    college: "Regulatory college",
    province: "Province",
    sessionRate: "Default session rate",
    sessionRatePlaceholder: "$140",
    continue: "Continue →",
    back: "← Back"
  },
  step4: {
    title: "Choose your plan",
    subtitle: "Both plans include a 7-day free trial. Cancel anytime.",
    solo: "Solo practitioner",
    soloPrice: "$49",
    soloPeriod: "/mo",
    soloDesc: "Unlimited clients, all features, 1 clinician",
    group: "Group practice",
    groupPrice: "$79",
    groupPeriod: "/clinician",
    groupDesc: "Multi-clinician, shared scheduling, owner dashboard",
    trialNotice: "Your 7-day free trial starts today. You will not be charged until your trial ends. Cancel anytime from your settings.",
    startTrial: "Start free trial →",
    back: "← Back"
  },
  step5: {
    title: "Add your first client",
    subtitle: "Optional — you can skip this and add clients from your dashboard.",
    firstName: "First name",
    lastName: "Last name",
    email: "Email (for portal invite)",
    intakeTemplate: "Intake template",
    completeSetup: "Complete setup →",
    skip: "Skip and go to dashboard"
  }
};

fr.onboarding = {
  leftPanel: {
    title: {
      line1: "Conçu pour ",
      line2: "chaque",
      line3: "professionnel de la santé réglementé."
    },
    description: "Modèles de notes, formats de reçus, mesures de résultats et normes des Ordres configurés automatiquement pour votre profession. Conforme LPRPS dès la première minute.",
    testimonial: "\"J'ai quitté TherapyNotes en un après-midi. Les modèles d'admission adaptés culturellement m'ont fait gagner deux semaines de travail — et je suis enfin conforme à la LPRPS.\"",
    author: "Dre Abena Osei-Mensah, PA",
    authorRole: "Psychothérapeute autorisée · Toronto, ON",
    badges: {
      phipa: "Conforme LPRPS",
      servers: "Serveurs canadiens",
      trial: "Essai gratuit 7 jours"
    }
  },
  step1: {
    title: "Créez votre compte",
    subtitle: "Gratuit pendant 7 jours. Aucune carte de crédit requise.",
    fullName: "Nom complet",
    fullNamePlaceholder: "Dre Jeanne Tremblay",
    workEmail: "Courriel professionnel",
    workEmailPlaceholder: "vous@pratique.ca",
    password: "Mot de passe",
    passwordPlaceholder: "Au moins 8 caractères",
    passwordHint: "Utilisez 8+ caractères, un chiffre et un symbole",
    continue: "Continuer →",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signIn: "Se connecter"
  },
  step2: {
    title: "Quelle est votre profession ?",
    subtitle: "MentalPath configure automatiquement les modèles de notes, les formats de reçus, les mesures de résultats et la conformité à votre Ordre.",
    configuresFor: "MentalPath configurera pour {{profession}} :",
    noteFormats: "Formats de notes :",
    outcomeMeasures: "Mesures de résultats :",
    billing: "Facturation :",
    hst: "TVH/TPS :",
    continue: "Continuer →",
    back: "← Retour"
  },
  step3: {
    title: "Détails de votre pratique",
    subtitle: "Ces informations apparaîtront sur les factures et les reçus envoyés à vos clients.",
    practiceName: "Nom de la pratique / clinique",
    practiceNamePlaceholder: "Psychothérapie & Bien-être Tremblay",
    practiceNameHint: "Laissez vide pour utiliser votre nom complet",
    credentials: "Titres de compétences",
    credentialsPlaceholder: "PA, Ph.D.",
    registrationNum: "Numéro d'inscription",
    registrationPlaceholder: "CRPO-004821",
    college: "Ordre professionnel",
    province: "Province",
    sessionRate: "Tarif de séance par défaut",
    sessionRatePlaceholder: "140 $",
    continue: "Continuer →",
    back: "← Retour"
  },
  step4: {
    title: "Choisissez votre forfait",
    subtitle: "Les deux forfaits incluent un essai gratuit de 7 jours. Annulez à tout moment.",
    solo: "Praticien solo",
    soloPrice: "49 $",
    soloPeriod: "/mois",
    soloDesc: "Clients illimités, toutes les fonctionnalités, 1 clinicien",
    group: "Cabinet de groupe",
    groupPrice: "79 $",
    groupPeriod: "/clinicien",
    groupDesc: "Multi-cliniciens, planification partagée, tableau de bord propriétaire",
    trialNotice: "Votre essai gratuit de 7 jours commence aujourd'hui. Vous ne serez pas facturé avant la fin de l'essai. Annulez à tout moment dans vos paramètres.",
    startTrial: "Démarrer l'essai gratuit →",
    back: "← Retour"
  },
  step5: {
    title: "Ajoutez votre premier client",
    subtitle: "Optionnel — vous pouvez ignorer cette étape et ajouter des clients depuis votre tableau de bord.",
    firstName: "Prénom",
    lastName: "Nom de famille",
    email: "Courriel (pour l'invitation au portail)",
    intakeTemplate: "Modèle d'admission",
    completeSetup: "Terminer la configuration →",
    skip: "Ignorer et aller au tableau de bord"
  }
};

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
