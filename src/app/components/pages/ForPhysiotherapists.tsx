import { ProfessionLanding, ProfessionConfig } from './ProfessionLanding';

const config: ProfessionConfig = {
  name: 'Physiotherapist',
  namePlural: 'physiotherapists',
  regBody: 'CPO (College of Physiotherapists of Ontario)',
  badge: 'Built for Canadian physiotherapists · PHIPA compliant',
  heroTitle: 'Focus on recovery.',
  heroTitleItalic: 'Not the paperwork.',
  heroSubtitle: 'Practice management built for Canadian physiotherapists. CPO-compliant notes, treatment plans, outcome measures, insurance receipts, and online booking — all PHIPA-compliant, all in one place.',
  accentStat: { number: '6h', label: 'per week spent on admin by the average solo physio' },
  problems: [
    {
      tag: 'Treatment plan chaos',
      title: 'Tracking progress across a course of care is fragmented',
      desc: 'A 12-session treatment plan spans weeks of appointments. Without structured tracking, it\'s impossible to see at a glance where a patient is in their recovery — or when you need to reassess.',
    },
    {
      tag: 'Outcome measure burden',
      title: 'DASH, Oswestry, NPRS — entered manually every time',
      desc: 'You\'re copying outcome scores into spreadsheets or paper forms and there\'s no trend chart to show the patient\'s progress. Insurers and Colleges increasingly require this documentation.',
    },
    {
      tag: 'PHIPA risk',
      title: 'US software doesn\'t meet Canadian requirements',
      desc: 'Many popular physio software tools store data on American servers. CPO standards require PHIPA compliance — which mandates Canadian data residency.',
    },
  ],
  features: [
    {
      title: 'Treatment Plan Management',
      desc: 'Create a treatment plan at intake, set goals and session count, and track progress visit by visit. Auto-prompt for reassessment at review dates.',
      icon: <><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
    },
    {
      title: 'Outcome Measures Library',
      desc: 'DASH, Oswestry, NPRS, PSFS, and more — auto-scored with trend charts. Send to clients digitally before sessions.',
      icon: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
    },
    {
      title: 'CPO-Compliant SOAP Notes',
      desc: 'Note templates built to CPO documentation standards. Draft with AI, review, and sign in under 5 minutes.',
      icon: <><path d="M12 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.37 2.63L14 7l-1.5 4.5L17 10l4.37-4.37a2.12 2.12 0 10-3-3z"/></>,
    },
    {
      title: 'Insurance Receipts + Booking',
      desc: 'Extended health benefit receipts for Blue Cross, Sun Life, and Manulife. Clients book online. CAD billing via Stripe.',
      icon: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    },
  ],
  testimonial: {
    quote: 'The treatment plan tracking changed my practice. I can see exactly where every patient is in their recovery without digging through paper files.',
    name: 'Sarah K., PT',
    title: 'Physiotherapist · Vancouver, BC',
  },
  college: 'CPO',
  collegeStandard: 'CPO-compliant records',
};

export function ForPhysiotherapists() {
  return <ProfessionLanding config={config} />;
}
